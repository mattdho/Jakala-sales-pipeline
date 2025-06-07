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
    // Client Accounts Schema - Only Company Name Required
    this.schemas.set('clients', {
      name: 'Client Accounts',
      description: 'Import client account information with flexible field mapping',
      table: 'accounts',
      validationRules: [
        // Only company name is mandatory
        { field: 'name', type: 'required', message: 'Company name is required' },
        { field: 'name', type: 'length', value: { min: 2, max: 255 }, message: 'Company name must be between 2 and 255 characters' },
        // All other fields are optional with smart defaults
        { field: 'industry_group', type: 'enum', value: ['SMBA', 'HSNE', 'DXP', 'TLCG', 'NEW_BUSINESS', ''], message: 'Invalid industry group' }
      ],
      transformations: {
        // Primary field - use any name-related column
        name: (value: string) => this.extractCompanyName(value),
        // Auto-populate legal name if not provided
        legal_name: (value: string) => value?.trim() || '',
        // Auto-detect industry from company name if not provided
        industry: (value: string) => value?.trim() || '',
        // Auto-map industry group with intelligent detection
        industry_group: (value: string) => this.mapIndustryGroup(value || ''),
        // Default payment terms
        payment_terms: (value: string) => value?.trim() || 'Net 30',
        // Handle various address formats
        billing_address: (value: string) => value?.trim() || '',
        // Extract client short codes
        client_short: (value: string) => value?.trim().toUpperCase() || '',
        // Handle platform names
        platform_name: (value: string) => value?.trim() || ''
      },
      duplicateStrategy: 'skip',
      batchSize: 100
    });

    // Projects Schema - Flexible project import
    this.schemas.set('projects', {
      name: 'Project Jobs',
      description: 'Import project and job data with flexible relationship mapping',
      table: 'jobs',
      validationRules: [
        // Only project name and client are required
        { field: 'name', type: 'required', message: 'Project name is required' },
        { field: 'client_name', type: 'required', message: 'Client name is required' }
        // All other fields are optional with smart defaults
      ],
      transformations: {
        name: (value: string) => value?.trim(),
        client_name: (value: string) => value?.trim(),
        project_name: (value: string) => value?.trim(),
        unique_id: (value: string) => value?.trim() || this.generateUniqueId(),
        is_new_business: (value: string) => this.parseBoolean(value),
        start_quarter: (value: string) => this.parseQuarter(value),
        end_quarter: (value: string) => this.parseQuarter(value),
        client_short: (value: string) => value?.trim().toUpperCase() || '',
        project_short: (value: string) => value?.trim().toLowerCase() || ''
      },
      duplicateStrategy: 'skip',
      batchSize: 50
    });

    // Users Schema - Basic user requirements only
    this.schemas.set('users', {
      name: 'Team Members',
      description: 'Import user accounts with flexible role assignment',
      table: 'users',
      validationRules: [
        { field: 'email', type: 'required', message: 'Email is required' },
        { field: 'email', type: 'email', message: 'Invalid email format' },
        { field: 'name', type: 'required', message: 'Name is required' }
        // Role is optional with smart default
      ],
      transformations: {
        email: (value: string) => value?.toLowerCase().trim(),
        name: (value: string) => value?.trim(),
        role: (value: string) => value || 'client_leader',
        industry_groups: (value: string) => this.parseIndustryGroups(value)
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

    // Process each row with intelligent field mapping
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Account for header row
      let rowValid = true;

      // Enhanced transformations with auto-fill
      const transformedRow = this.enhancedTransformRow(row, schema, rowNumber);

      // Validate only the required fields
      for (const rule of schema.validationRules) {
        const value = transformedRow[rule.field];
        const isValid = this.validateField(value, rule);

        if (!isValid && rule.type === 'required') {
          // For required fields that are empty, try alternative field names
          const alternativeValue = this.findAlternativeFieldValue(row, rule.field);
          if (alternativeValue) {
            transformedRow[rule.field] = alternativeValue;
            warnings.push({
              row: rowNumber,
              field: rule.field,
              message: `Auto-mapped from alternative field`
            });
          } else {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message
            });
            rowValid = false;
          }
        }
      }

      // Auto-fill missing critical fields for client import
      if (schemaName === 'clients' && rowValid) {
        this.autoFillClientFields(transformedRow, warnings, rowNumber);
      }

      if (rowValid) validRows++;
    }

    const processingTime = Date.now() - startTime;

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Validation completed successfully. ${validRows} rows ready for import.`
        : `Found ${errors.length} validation errors that need attention.`,
      imported: 0,
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
    // If already a valid industry group, return it
    if (['SMBA', 'HSNE', 'DXP', 'TLCG', 'NEW_BUSINESS'].includes(code.toUpperCase())) {
      return code.toUpperCase();
    }

    const mapping: Record<string, string> = {
      'SMBA': 'SMBA',
      'HSNE': 'HSNE', 
      'DXP': 'DXP',
      'TLCG': 'TLCG',
      'NEW_BUSINESS': 'NEW_BUSINESS',
      'NEW_BIZ': 'NEW_BUSINESS'
    };
    
    // Try direct mapping first
    if (mapping[code.toUpperCase()]) {
      return mapping[code.toUpperCase()];
    }

    // Auto-detect based on code patterns
    const upperCode = code.toUpperCase();
    if (upperCode.includes('UNIV') || upperCode.includes('COLLEGE') || 
        upperCode.includes('EDU') || upperCode.includes('SCHOOL') || 
        upperCode.includes('SPORT') || upperCode.includes('NON-PROFIT')) {
      return 'HSNE';
    } else if (upperCode.includes('LUXURY') || upperCode.includes('TRAVEL') || 
               upperCode.includes('HOTEL') || upperCode.includes('FASHION') || 
               upperCode.includes('BEAUTY') || upperCode.includes('RETAIL')) {
      return 'TLCG';
    } else if (upperCode.includes('TECH') || upperCode.includes('SOFTWARE') || 
               upperCode.includes('DIGITAL') || upperCode.includes('DEV')) {
      return 'DXP';
    } else if (upperCode.includes('MFG') || upperCode.includes('MANUFACTURING') || 
               upperCode.includes('INDUSTRIAL') || upperCode.includes('SERVICE') || 
               upperCode.includes('B2B') || upperCode.includes('AGRICULTURE')) {
      return 'SMBA';
    }
    
    // Default for unknown/new clients
    return 'NEW_BUSINESS';
  }

  private extractIndustryFromName(name: string): string {
    if (!name) return 'Professional Services';
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('university') || lowerName.includes('college') || 
        lowerName.includes('school') || lowerName.includes('education')) {
      return 'Higher Education';
    } else if (lowerName.includes('bank') || lowerName.includes('financial') || 
               lowerName.includes('insurance') || lowerName.includes('credit')) {
      return 'Financial Services';
    } else if (lowerName.includes('health') || lowerName.includes('medical') || 
               lowerName.includes('hospital') || lowerName.includes('pharma')) {
      return 'Healthcare';
    } else if (lowerName.includes('tech') || lowerName.includes('software') || 
               lowerName.includes('digital') || lowerName.includes('data')) {
      return 'Technology';
    } else if (lowerName.includes('travel') || lowerName.includes('hotel') || 
               lowerName.includes('luxury') || lowerName.includes('resort')) {
      return 'Travel & Hospitality';
    } else if (lowerName.includes('manufacturing') || lowerName.includes('industrial') || 
               lowerName.includes('construction') || lowerName.includes('materials')) {
      return 'Manufacturing';
    } else if (lowerName.includes('retail') || lowerName.includes('fashion') || 
               lowerName.includes('beauty') || lowerName.includes('cosmetics')) {
      return 'Retail & Consumer';
    } else if (lowerName.includes('non-profit') || lowerName.includes('foundation') || 
               lowerName.includes('charity') || lowerName.includes('ngo')) {
      return 'Non-Profit';
    } else if (lowerName.includes('government') || lowerName.includes('state') || 
               lowerName.includes('federal') || lowerName.includes('municipal')) {
      return 'Government';
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
    if (!schema) return;

    let csvContent = '';
    let headers: string[] = [];
    let sampleData: string[] = [];

    if (schemaName === 'clients') {
      headers = [
        'name', // REQUIRED
        'legal_name', // Optional - will auto-fill from name
        'client_short', // Optional - for abbreviations
        'platform_name', // Optional - display name
        'industry', // Optional - will auto-detect
        'industry_group', // Optional - will auto-assign (SMBA/HSNE/DXP/TLCG/NEW_BUSINESS)
        'payment_terms', // Optional - defaults to Net 30
        'billing_address' // Optional
      ];
      sampleData = [
        'Acme Corporation', // Only this is required!
        'Acme Corp LLC', // Will auto-fill if empty
        'ACME', // Company abbreviation
        'ACME CORP', // Display name
        'Technology', // Will auto-detect if empty
        'DXP', // Will auto-assign if empty
        'Net 30', // Will default if empty
        '123 Main St, Anytown, ST 12345' // Optional
      ];
    } else if (schemaName === 'projects') {
      headers = [
        'name', // REQUIRED - Project name
        'client_name', // REQUIRED - Must match a client
        'unique_id', // Optional - will auto-generate
        'project_name', // Optional - project display name
        'client_short', // Optional - client abbreviation
        'project_short', // Optional - project abbreviation
        'is_new_business', // Optional - true/false
        'start_quarter', // Optional - Q1 2024 format
        'end_quarter' // Optional - Q2 2024 format
      ];
      sampleData = [
        'Website Redesign Project', // Required
        'Acme Corporation', // Required - must match client name
        'WEB2024-001', // Will auto-generate if empty
        'Acme Website Redesign', // Optional
        'ACME', // Optional
        'web-redesign', // Optional
        'false', // Optional
        'Q1 2024', // Optional
        'Q2 2024' // Optional
      ];
    } else {
      headers = ['email', 'name', 'role', 'industry_groups'];
      sampleData = ['john.doe@company.com', 'John Doe', 'client_leader', 'SMBA,DXP'];
    }

    // Create CSV with headers and sample data
    csvContent = headers.join(',') + '\n';
    csvContent += sampleData.join(',') + '\n';
    
    // Add helpful comments as additional rows
    if (schemaName === 'clients') {
      csvContent += '\n# NOTES:\n';
      csvContent += '# - Only "name" (company name) is required\n';
      csvContent += '# - All other fields will be auto-filled with intelligent defaults\n';
      csvContent += '# - Industry groups: SMBA, HSNE, DXP, TLCG, NEW_BUSINESS\n';
      csvContent += '# - Payment terms: Net 15, Net 30, Net 45, Net 60, Due on Receipt\n';
    } else if (schemaName === 'projects') {
      csvContent += '\n# NOTES:\n';
      csvContent += '# - Only "name" and "client_name" are required\n';
      csvContent += '# - client_name must exactly match an existing client\n';
      csvContent += '# - unique_id will be auto-generated if not provided\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schemaName}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Helper method to extract company name from various column formats
  private extractCompanyName(value: any): string {
    if (!value) return '';
    
    const str = String(value).trim();
    
    // Handle cases where company name might be in different formats
    if (str.includes(' - ') && str.length > 50) {
      // Likely a project name, extract company part
      return str.split(' - ')[0].trim();
    }
    
    return str;
  }

  // Helper method to generate unique ID if not provided
  private generateUniqueId(): string {
    return 'auto_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper method to parse industry groups from various formats
  private parseIndustryGroups(value: string): string[] {
    if (!value) return ['NEW_BUSINESS'];
    
    const groups = value.split(',').map(g => g.trim().toUpperCase());
    return groups.filter(g => ['SMBA', 'HSNE', 'DXP', 'TLCG', 'NEW_BUSINESS'].includes(g));
  }

  // Enhanced transformation with intelligent field mapping
  private enhancedTransformRow(row: any, schema: ImportSchema, rowNumber: number): any {
    const transformedRow = { ...row };

    // Apply schema transformations
    for (const [field, transformer] of Object.entries(schema.transformations)) {
      if (transformedRow[field] !== undefined) {
        try {
          transformedRow[field] = transformer(transformedRow[field]);
        } catch (error) {
          // Handle transformation errors gracefully
          transformedRow[field] = '';
        }
      }
    }

    return transformedRow;
  }

  // Find alternative field names for common variations
  private findAlternativeFieldValue(row: any, targetField: string): string | null {
    const fieldMappings: Record<string, string[]> = {
      'name': ['company_name', 'client_name', 'organization', 'account_name', 'business_name'],
      'legal_name': ['name', 'company_name', 'official_name', 'full_name'],
      'client_name': ['name', 'company_name', 'client', 'account'],
      'industry': ['sector', 'business_type', 'category', 'field'],
      'industry_group': ['group', 'division', 'segment', 'vertical']
    };

    const alternatives = fieldMappings[targetField] || [];
    
    for (const alt of alternatives) {
      if (row[alt] && String(row[alt]).trim()) {
        return String(row[alt]).trim();
      }
    }

    return null;
  }

  // Auto-fill missing client fields based on company name
  private autoFillClientFields(row: any, warnings: any[], rowNumber: number): void {
    const companyName = row.name || '';

    // Auto-fill legal name if missing
    if (!row.legal_name) {
      row.legal_name = companyName;
      warnings.push({
        row: rowNumber,
        field: 'legal_name',
        message: 'Auto-filled from company name'
      });
    }

    // Auto-detect industry if missing
    if (!row.industry) {
      row.industry = this.extractIndustryFromName(companyName);
      warnings.push({
        row: rowNumber,
        field: 'industry',
        message: 'Auto-detected from company name'
      });
    }

    // Auto-map industry group if missing or empty
    if (!row.industry_group || row.industry_group === '') {
      row.industry_group = this.mapIndustryGroup(row.client_short || companyName);
      warnings.push({
        row: rowNumber,
        field: 'industry_group',
        message: 'Auto-assigned based on analysis'
      });
    }

    // Ensure payment terms default
    if (!row.payment_terms) {
      row.payment_terms = 'Net 30';
    }
  }
}

export const enterpriseImportService = new EnterpriseImportService();