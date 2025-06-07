import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'number' | 'date' | 'enum' | 'length' | 'pattern';
  value?: any;
  message: string;
}

interface ImportSchema {
  name: string;
  description: string;
  table: string;
  validationRules: ValidationRule[];
  transformations: Record<string, (value: any) => any>;
  duplicateStrategy: 'skip' | 'update' | 'error';
  batchSize: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  warnings: Array<{ row: number; field?: string; message: string }>;
  summary: {
    totalRows: number;
    validRows: number;
    duplicates: number;
    processingTime: number;
  };
}

export class EnterpriseImportService {
  private schemas: Map<string, ImportSchema> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  private initializeSchemas() {
    // Client Accounts Schema
    this.schemas.set('clients', {
      name: 'Client Accounts',
      description: 'Import client account information with full validation',
      table: 'accounts',
      validationRules: [
        { field: 'name', type: 'required', message: 'Account name is required' },
        { field: 'legal_name', type: 'required', message: 'Legal name is required' },
        { field: 'industry', type: 'required', message: 'Industry is required' },
        { field: 'industry_group', type: 'enum', value: ['FSI', 'Consumer', 'TMT', 'Services', 'Industrial', 'Pharma', 'Government'], message: 'Invalid industry group' },
        { field: 'payment_terms', type: 'enum', value: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'], message: 'Invalid payment terms' },
        { field: 'name', type: 'length', value: { min: 2, max: 255 }, message: 'Name must be between 2 and 255 characters' }
      ],
      transformations: {
        name: (value: string) => value?.trim(),
        legal_name: (value: string) => value?.trim(),
        industry: (value: string) => value?.trim(),
        industry_group: (value: string) => this.mapIndustryGroup(value),
        payment_terms: (value: string) => value || 'Net 30'
      },
      duplicateStrategy: 'skip',
      batchSize: 100
    });

    // Projects Schema
    this.schemas.set('projects', {
      name: 'Project Jobs',
      description: 'Import project and job data with relationship validation',
      table: 'jobs',
      validationRules: [
        { field: 'name', type: 'required', message: 'Project name is required' },
        { field: 'client_name', type: 'required', message: 'Client name is required' },
        { field: 'unique_id', type: 'required', message: 'Unique ID is required' },
        { field: 'is_new_business', type: 'enum', value: ['true', 'false', '1', '0', 'yes', 'no'], message: 'Invalid boolean value for new business flag' }
      ],
      transformations: {
        name: (value: string) => value?.trim(),
        client_name: (value: string) => value?.trim(),
        is_new_business: (value: string) => this.parseBoolean(value),
        start_quarter: (value: string) => this.parseQuarter(value),
        end_quarter: (value: string) => this.parseQuarter(value)
      },
      duplicateStrategy: 'skip',
      batchSize: 50
    });

    // Users Schema
    this.schemas.set('users', {
      name: 'Team Members',
      description: 'Import user accounts with role and permission validation',
      table: 'users',
      validationRules: [
        { field: 'email', type: 'required', message: 'Email is required' },
        { field: 'email', type: 'email', message: 'Invalid email format' },
        { field: 'name', type: 'required', message: 'Name is required' },
        { field: 'role', type: 'enum', value: ['industry_leader', 'account_owner', 'client_leader', 'admin'], message: 'Invalid role' }
      ],
      transformations: {
        email: (value: string) => value?.toLowerCase().trim(),
        name: (value: string) => value?.trim(),
        role: (value: string) => value || 'client_leader'
      },
      duplicateStrategy: 'update',
      batchSize: 25
    });
  }

  async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // File size validation (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }

    // File type validation
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      errors.push('Unsupported file format. Please use CSV, XLS, or XLSX files.');
    }

    // UTF-8 encoding check (basic)
    try {
      const sample = await this.readFileSample(file, 1024);
      // Check for common non-UTF-8 byte sequences
      if (sample.includes('\uFFFD')) {
        errors.push('File encoding issue detected. Please ensure the file is saved in UTF-8 format.');
      }
    } catch (error) {
      errors.push('Unable to read file content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateData(data: any[], schemaName: string): Promise<ImportResult> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const startTime = Date.now();
    const errors: ImportResult['errors'] = [];
    const warnings: ImportResult['warnings'] = [];
    let validRows = 0;
    let duplicates = 0;

    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Account for header row
      let rowValid = true;

      // Apply transformations
      const transformedRow = { ...row };
      for (const [field, transformer] of Object.entries(schema.transformations)) {
        if (transformedRow[field] !== undefined) {
          try {
            transformedRow[field] = transformer(transformedRow[field]);
          } catch (error) {
            warnings.push({
              row: rowNumber,
              field,
              message: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }
      }

      // Validate against rules
      for (const rule of schema.validationRules) {
        const value = transformedRow[rule.field];
        const isValid = this.validateField(value, rule);

        if (!isValid) {
          errors.push({
            row: rowNumber,
            field: rule.field,
            message: rule.message
          });
          rowValid = false;
        }
      }

      // Check for duplicates (simplified - would use database lookup in production)
      if (rowValid && this.isDuplicate(transformedRow, schema)) {
        duplicates++;
        if (schema.duplicateStrategy === 'error') {
          errors.push({
            row: rowNumber,
            message: 'Duplicate record detected'
          });
          rowValid = false;
        } else {
          warnings.push({
            row: rowNumber,
            message: `Duplicate record will be ${schema.duplicateStrategy === 'skip' ? 'skipped' : 'updated'}`
          });
        }
      }

      if (rowValid) validRows++;
    }

    const processingTime = Date.now() - startTime;

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Validation completed successfully. ${validRows} rows ready for import.`
        : `Validation failed with ${errors.length} errors.`,
      imported: 0, // Will be set during actual import
      updated: 0,
      skipped: duplicates,
      errors,
      warnings,
      summary: {
        totalRows: data.length,
        validRows,
        duplicates,
        processingTime
      }
    };
  }

  async executeImport(data: any[], schemaName: string): Promise<ImportResult> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const startTime = Date.now();
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult['errors'] = [];

    try {
      // Process in batches
      for (let i = 0; i < data.length; i += schema.batchSize) {
        const batch = data.slice(i, i + schema.batchSize);
        const batchResult = await this.processBatch(batch, schema, i);
        
        imported += batchResult.imported;
        updated += batchResult.updated;
        skipped += batchResult.skipped;
        errors.push(...batchResult.errors);
      }

      // Log the import activity
      await logActivity('system', 'import', `${schemaName}_import_completed`, {
        imported,
        updated,
        skipped,
        errors: errors.length,
        schema: schemaName
      });

      const processingTime = Date.now() - startTime;

      return {
        success: errors.length < data.length / 2, // Success if less than 50% errors
        message: `Import completed. ${imported} records imported, ${updated} updated, ${skipped} skipped.`,
        imported,
        updated,
        skipped,
        errors,
        warnings: [],
        summary: {
          totalRows: data.length,
          validRows: imported + updated,
          duplicates: skipped,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }],
        warnings: [],
        summary: {
          totalRows: data.length,
          validRows: 0,
          duplicates: 0,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private async processBatch(batch: any[], schema: ImportSchema, offset: number) {
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: ImportResult['errors'] = [];

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = offset + i + 2; // Account for header and offset

      try {
        // Transform the row
        const transformedRow = this.transformRow(row, schema);

        // Handle different import strategies
        if (schema.table === 'accounts') {
          const result = await this.importAccount(transformedRow, schema.duplicateStrategy);
          if (result.action === 'imported') imported++;
          else if (result.action === 'updated') updated++;
          else if (result.action === 'skipped') skipped++;
        } else if (schema.table === 'jobs') {
          const result = await this.importJob(transformedRow, schema.duplicateStrategy);
          if (result.action === 'imported') imported++;
          else if (result.action === 'updated') updated++;
          else if (result.action === 'skipped') skipped++;
        } else if (schema.table === 'users') {
          const result = await this.importUser(transformedRow, schema.duplicateStrategy);
          if (result.action === 'imported') imported++;
          else if (result.action === 'updated') updated++;
          else if (result.action === 'skipped') skipped++;
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { imported, updated, skipped, errors };
  }

  private async importAccount(data: any, duplicateStrategy: string) {
    // Check for existing account
    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('name', data.name)
      .single();

    if (existing) {
      if (duplicateStrategy === 'skip') {
        return { action: 'skipped' };
      } else if (duplicateStrategy === 'update') {
        await supabase
          .from('accounts')
          .update(data)
          .eq('id', existing.id);
        return { action: 'updated' };
      }
    }

    // Create new account
    const { error } = await supabase
      .from('accounts')
      .insert(data);

    if (error) throw error;
    return { action: 'imported' };
  }

  private async importJob(data: any, duplicateStrategy: string) {
    // Find or create account first
    let accountId = null;
    if (data.client_name) {
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', data.client_name)
        .single();

      if (account) {
        accountId = account.id;
      } else {
        // Create account if it doesn't exist
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({
            name: data.client_name,
            legal_name: data.client_name,
            industry: this.extractIndustryFromName(data.client_name),
            industry_group: this.mapIndustryGroup(data.client_short || ''),
            billing_address: '',
            payment_terms: 'Net 30'
          })
          .select('id')
          .single();

        if (accountError) throw accountError;
        accountId = newAccount.id;
      }
    }

    const jobData = {
      name: data.project_name || data.name,
      account_id: accountId,
      value: 0,
      stage: data.is_new_business ? 'proposal_preparation' : 'backlog',
      project_status: 'to_be_started',
      project_start_date: data.start_quarter,
      project_end_date: data.end_quarter,
      notes: `Imported from CSV. Original ID: ${data.unique_id || data.id || ''}`,
      priority: 'medium'
    };

    // Check for duplicates
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('name', jobData.name)
      .eq('account_id', accountId)
      .single();

    if (existing) {
      if (duplicateStrategy === 'skip') {
        return { action: 'skipped' };
      } else if (duplicateStrategy === 'update') {
        await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', existing.id);
        return { action: 'updated' };
      }
    }

    const { error } = await supabase
      .from('jobs')
      .insert(jobData);

    if (error) throw error;
    return { action: 'imported' };
  }

  private async importUser(data: any, duplicateStrategy: string) {
    // Check for existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existing) {
      if (duplicateStrategy === 'skip') {
        return { action: 'skipped' };
      } else if (duplicateStrategy === 'update') {
        await supabase
          .from('users')
          .update(data)
          .eq('id', existing.id);
        return { action: 'updated' };
      }
    }

    // Create new user (would typically involve auth.users creation)
    const { error } = await supabase
      .from('users')
      .insert(data);

    if (error) throw error;
    return { action: 'imported' };
  }

  private validateField(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      
      case 'number':
        return !value || !isNaN(Number(value));
      
      case 'enum':
        return !value || (rule.value as any[]).includes(value);
      
      case 'length':
        if (!value) return true;
        const length = String(value).length;
        const { min, max } = rule.value as { min: number; max: number };
        return length >= min && length <= max;
      
      case 'pattern':
        return !value || new RegExp(rule.value as string).test(value);
      
      default:
        return true;
    }
  }

  private transformRow(row: any, schema: ImportSchema): any {
    const transformed = { ...row };
    
    for (const [field, transformer] of Object.entries(schema.transformations)) {
      if (transformed[field] !== undefined) {
        transformed[field] = transformer(transformed[field]);
      }
    }
    
    return transformed;
  }

  private isDuplicate(row: any, schema: ImportSchema): boolean {
    // Simplified duplicate check - in production would query database
    return false;
  }

  private mapIndustryGroup(code: string): string {
    const mapping: Record<string, string> = {
      'SMBA': 'Services',
      'HSNE': 'HSME',
      'DXP': 'Services',
      'TLCG': 'Consumer',
      'NEW_BIZ': 'Services'
    };
    
    return mapping[code.toUpperCase()] || 'Services';
  }

  private extractIndustryFromName(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('university') || lowerName.includes('college')) {
      return 'Higher Education';
    } else if (lowerName.includes('bank') || lowerName.includes('financial')) {
      return 'Financial Services';
    } else if (lowerName.includes('health') || lowerName.includes('medical')) {
      return 'Healthcare';
    } else if (lowerName.includes('tech') || lowerName.includes('software')) {
      return 'Technology';
    } else {
      return 'Professional Services';
    }
  }

  private parseBoolean(value: string): boolean {
    if (!value) return false;
    const lower = value.toLowerCase();
    return ['true', '1', 'yes', 'y'].includes(lower);
  }

  private parseQuarter(quarter: string): string | null {
    if (!quarter || ['New Biz Opp', 'Opportunity', 'Exploration'].includes(quarter)) {
      return null;
    }

    try {
      const match = quarter.match(/Q(\d)(\d{2})/);
      if (match) {
        const q = parseInt(match[1]);
        const year = 2000 + parseInt(match[2]);
        const month = (q - 1) * 3 + 1;
        return new Date(year, month - 1, 1).toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Failed to parse quarter:', quarter);
    }
    
    return null;
  }

  private async readFileSample(file: File, bytes: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file.slice(0, bytes));
    });
  }

  // Public API methods
  async previewFile(file: File, maxRows: number = 10): Promise<any[]> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1, maxRows + 1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async parseFullFile(file: File): Promise<any[]> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  getAvailableSchemas(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.schemas.entries()).map(([id, schema]) => ({
      id,
      name: schema.name,
      description: schema.description
    }));
  }

  downloadTemplate(schemaName: string): void {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    let csvContent = '';
    let filename = '';

    if (schemaName === 'clients') {
      csvContent = [
        'name,legal_name,industry,industry_group,billing_address,payment_terms',
        'Example Corp,Example Corporation Inc,Technology,TMT,"123 Main St, City, State 12345",Net 30',
        'Sample University,Sample University,Higher Education,HSME,"456 College Ave, City, State 67890",Net 45'
      ].join('\n');
      filename = 'client_import_template.csv';
    } else if (schemaName === 'projects') {
      csvContent = [
        'client_name,project_name,client_short,project_short,unique_id,start_quarter,end_quarter,is_new_business',
        'Example Corp,Website Redesign,EXCORP,WR,EXCORPWR001,Q125,Q225,false',
        'Sample University,CMS Migration,SAMPU,CM,SAMPUCM002,Q225,Q325,true'
      ].join('\n');
      filename = 'project_import_template.csv';
    } else if (schemaName === 'users') {
      csvContent = [
        'name,email,role,industry_groups',
        'John Doe,john.doe@company.com,client_leader,"[""TMT"", ""Services""]"',
        'Jane Smith,jane.smith@company.com,account_owner,"[""Consumer""]"'
      ].join('\n');
      filename = 'users_import_template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const enterpriseImportService = new EnterpriseImportService();