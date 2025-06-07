import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';
import { enterpriseImportService } from './enterpriseImportService';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
  duplicates: number;
}

// Industry group mapping based on the provided data structure
const INDUSTRY_GROUP_MAPPING: Record<string, string> = {
  'SMBA': 'Services',
  'HSNE': 'HSME', // Map to existing HSME group
  'DXP': 'Services', // Map DXP to Services
  'TLCG': 'Consumer', // Map to Consumer
  'NEW_BIZ': 'Services'
};

// Team member to industry group mapping
const TEAM_INDUSTRY_MAPPING: Record<string, string[]> = {
  'Amanda Konopko': ['Services'],
  'Danielle Bathelemy': ['Services'],
  'Liliana Zbirciog': ['Services'],
  'Olga Kashchenko': ['Services'],
  'Jeremiah Bowden': ['Services'],
  'Mandee Englert': ['HSME'],
  'Lindsay Dehm': ['HSME'],
  'Lindsey Presley': ['HSME'],
  'Bruce Clingan': ['HSME'],
  'Tom Jones': ['HSME'],
  'Alex Arnaut': ['Services'],
  'Chris Miller': ['Services'],
  'Chaney Moore': ['Services'],
  'Daniel Bafico': ['Consumer'],
  'Esteban Biancchi': ['Consumer'],
  'Derry Backenkeller': ['Services'],
  'Matt Rissmiller': ['Services']
};

export const importService = {
  // Parse CSV file and return preview data
  async previewCsv(file: File, maxRows: number = 5): Promise<any[]> {
    return enterpriseImportService.previewFile(file, maxRows);
  },

  // Parse full CSV file
  async parseCsv(file: File): Promise<any[]> {
    return enterpriseImportService.parseFullFile(file);
  },

  // Import client accounts from CSV
  async importClients(file: File): Promise<ImportResult> {
    try {
      const data = await this.parseCsv(file);
      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];

      for (const row of data) {
        try {
          // Map CSV fields to account structure
          const accountData = {
            name: row.name || row.client_name || '',
            legal_name: row.name || row.client_name || '',
            industry: this.extractIndustryFromName(row.name || row.client_name || ''),
            industry_group: this.mapToIndustryGroup(row.platform_name || row.client_short || ''),
            billing_address: '',
            payment_terms: 'Net 30'
          };

          // Validate required fields
          if (!accountData.name) {
            errors.push(`Row ${data.indexOf(row) + 2}: Missing account name`);
            continue;
          }

          // Check for duplicates
          const { data: existing } = await supabase
            .from('accounts')
            .select('id')
            .eq('name', accountData.name)
            .single();

          if (existing) {
            duplicates++;
            continue;
          }

          // Insert account
          const { error } = await supabase
            .from('accounts')
            .insert(accountData);

          if (error) {
            errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
          } else {
            imported++;
          }
        } catch (error) {
          errors.push(`Row ${data.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logActivity('system', 'import', 'clients_imported', { 
        imported, 
        duplicates, 
        errors: errors.length 
      });

      return {
        success: errors.length < data.length / 2, // Success if less than 50% errors
        message: `Import completed. ${imported} accounts imported, ${duplicates} duplicates skipped.`,
        imported,
        duplicates,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        duplicates: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  // Import project jobs from CSV
  async importProjects(file: File): Promise<ImportResult> {
    try {
      const data = await this.parseCsv(file);
      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];

      for (const row of data) {
        try {
          // Find or create account first
          let accountId = null;
          if (row.client_name) {
            const { data: account } = await supabase
              .from('accounts')
              .select('id')
              .eq('name', row.client_name)
              .single();

            if (account) {
              accountId = account.id;
            } else {
              // Create account if it doesn't exist
              const { data: newAccount, error: accountError } = await supabase
                .from('accounts')
                .insert({
                  name: row.client_name,
                  legal_name: row.client_name,
                  industry: this.extractIndustryFromName(row.client_name),
                  industry_group: this.mapToIndustryGroup(row.client_short || ''),
                  billing_address: '',
                  payment_terms: 'Net 30'
                })
                .select('id')
                .single();

              if (accountError) {
                errors.push(`Row ${data.indexOf(row) + 2}: Failed to create account - ${accountError.message}`);
                continue;
              }
              accountId = newAccount.id;
            }
          }

          // Map CSV fields to job structure
          const jobData = {
            name: row.project_name || '',
            account_id: accountId,
            value: 0, // Default value, can be updated later
            stage: row.is_new_business === 'true' ? 'proposal_preparation' : 'backlog',
            project_status: 'to_be_started',
            client_leader_id: null, // Will need to be mapped separately
            project_start_date: this.parseQuarterToDate(row.start_quarter),
            project_end_date: this.parseQuarterToDate(row.end_quarter),
            notes: `Imported from CSV. Original ID: ${row.unique_id || row.id || ''}`,
            priority: 'medium'
          };

          // Validate required fields
          if (!jobData.name) {
            errors.push(`Row ${data.indexOf(row) + 2}: Missing project name`);
            continue;
          }

          if (!accountId) {
            errors.push(`Row ${data.indexOf(row) + 2}: Missing or invalid account`);
            continue;
          }

          // Check for duplicates by name and account
          const { data: existing } = await supabase
            .from('jobs')
            .select('id')
            .eq('name', jobData.name)
            .eq('account_id', accountId)
            .single();

          if (existing) {
            duplicates++;
            continue;
          }

          // Insert job
          const { error } = await supabase
            .from('jobs')
            .insert(jobData);

          if (error) {
            errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
          } else {
            imported++;
          }
        } catch (error) {
          errors.push(`Row ${data.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logActivity('system', 'import', 'projects_imported', { 
        imported, 
        duplicates, 
        errors: errors.length 
      });

      return {
        success: errors.length < data.length / 2,
        message: `Import completed. ${imported} projects imported, ${duplicates} duplicates skipped.`,
        imported,
        duplicates,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        duplicates: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  // Helper function to extract industry from company name
  extractIndustryFromName(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('university') || lowerName.includes('college') || lowerName.includes('school')) {
      return 'Higher Education';
    } else if (lowerName.includes('bank') || lowerName.includes('financial')) {
      return 'Financial Services';
    } else if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('pharma')) {
      return 'Healthcare';
    } else if (lowerName.includes('tech') || lowerName.includes('software') || lowerName.includes('digital')) {
      return 'Technology';
    } else if (lowerName.includes('manufacturing') || lowerName.includes('industrial')) {
      return 'Manufacturing';
    } else {
      return 'Professional Services';
    }
  },

  // Helper function to map client codes to industry groups
  mapToIndustryGroup(clientCode: string): string {
    // Map based on the industry structure provided
    const code = clientCode.toUpperCase();
    
    // Check if it's a known industry group code
    if (INDUSTRY_GROUP_MAPPING[code]) {
      return INDUSTRY_GROUP_MAPPING[code];
    }
    
    // Default mapping based on common patterns
    if (code.includes('UNIV') || code.includes('COLLEGE') || code.includes('EDU')) {
      return 'HSME';
    } else if (code.includes('BANK') || code.includes('FIN')) {
      return 'FSI';
    } else if (code.includes('TECH') || code.includes('DXP')) {
      return 'TMT';
    } else {
      return 'Services'; // Default fallback
    }
  },

  // Helper function to parse quarter strings to dates
  parseQuarterToDate(quarter: string): string | null {
    if (!quarter || quarter === 'New Biz Opp' || quarter === 'Opportunity' || quarter === 'Exploration') {
      return null;
    }

    try {
      // Parse formats like "Q325", "Q124", etc.
      const match = quarter.match(/Q(\d)(\d{2})/);
      if (match) {
        const q = parseInt(match[1]);
        const year = 2000 + parseInt(match[2]);
        
        // Convert quarter to month
        const month = (q - 1) * 3 + 1; // Q1=Jan, Q2=Apr, Q3=Jul, Q4=Oct
        return new Date(year, month - 1, 1).toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Failed to parse quarter:', quarter);
    }
    
    return null;
  },

  // Download CSV templates
  downloadTemplate(type: 'clients' | 'projects') {
    return enterpriseImportService.downloadTemplate(type);
  }
};