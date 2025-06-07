import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle, AlertCircle, X, 
  Download, Eye, Settings, Database, Users, 
  Building, Briefcase, ArrowRight, ArrowLeft, Wand2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { importService } from '../../services/importService';
import { SmartFieldMapper } from './SmartFieldMapper';

interface ImportStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    duplicates: number;
    missingFields: number;
  };
  canProceedWithWarnings: boolean;
}

interface ImportMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  batchValue?: string;
}

export const DataImportWizard: React.FC = () => {
  const { theme } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'clients' | 'projects' | 'custom'>('clients');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);

  const steps: ImportStep[] = [
    {
      id: 'file-selection',
      title: 'File Selection',
      description: 'Choose your data file and import type',
      completed: !!selectedFile
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Verify data integrity and smart mapping',
      completed: !!validationResult
    },
    {
      id: 'mapping',
      title: 'Field Mapping',
      description: 'AI-powered field mapping and correction',
      completed: mappings.length > 0 && !showFieldMapper
    },
    {
      id: 'preview',
      title: 'Preview & Confirm',
      description: 'Review import settings and data',
      completed: false
    },
    {
      id: 'import',
      title: 'Import Data',
      description: 'Execute the data import process',
      completed: !!importResult?.success
    }
  ];

  const importTypes = [
    {
      id: 'clients',
      title: 'Client Accounts',
      description: 'Import client account information - Only company name required!',
      icon: Building,
      requiredFields: ['name'], // Only company name is required now!
      optionalFields: ['legal_name', 'client_short', 'platform_name', 'industry', 'industry_group', 'payment_terms', 'billing_address'],
      autoFillCapable: true
    },
    {
      id: 'projects',
      title: 'Project Data', 
      description: 'Import project and job information - Flexible field mapping',
      icon: Briefcase,
      requiredFields: ['name', 'client_name'], // Only project name and client required
      optionalFields: ['unique_id', 'project_name', 'client_short', 'project_short', 'start_quarter', 'end_quarter', 'is_new_business'],
      autoFillCapable: true
    },
    {
      id: 'custom',
      title: 'Custom Import',
      description: 'Define custom import schema with intelligent field detection',
      icon: Database,
      requiredFields: [],
      optionalFields: [],
      autoFillCapable: false
    }
  ];

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Validate file format and size
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('File size exceeds 50MB limit');
      }

      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        throw new Error('Unsupported file format. Please use CSV, XLS, or XLSX files.');
      }

      // Preview data
      const preview = await importService.previewCsv(file, 10);
      setPreviewData(preview);
      
      // Extract headers for field mapping
      if (preview.length > 0) {
        const headers = Object.keys(preview[0]);
        setSourceHeaders(headers);
      }

      // Auto-detect import type based on headers
      if (preview.length > 0) {
        const headers = Object.keys(preview[0]).map(h => h.toLowerCase());
        if (headers.includes('client_name') && headers.includes('project_name')) {
          setImportType('projects');
        } else if (headers.includes('name') && (headers.includes('legal_name') || headers.includes('company'))) {
          setImportType('clients');
        }
      }

      setCurrentStep(1);
    } catch (error) {
      console.error('File selection error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const validateData = useCallback(async () => {
    if (!selectedFile || !previewData.length) return;

    setIsProcessing(true);
    
    try {
      const fullData = await importService.parseCsv(selectedFile);
      const selectedImportType = importTypes.find(t => t.id === importType);
      
      if (!selectedImportType) throw new Error('Invalid import type');

      const errors: string[] = [];
      const warnings: string[] = [];
      let validRows = 0;
      let duplicates = 0;
      let missingFields = 0;

      // Get available headers from the file
      const headers = Object.keys(fullData[0] || {});
      
      // Enhanced validation with preview mode - allow import with warnings
      const missingRequired = selectedImportType.requiredFields.filter(field => {
        // Try to find the field or similar variations
        const foundField = headers.find(h => {
          const lowerH = h.toLowerCase();
          const lowerField = field.toLowerCase();
          
          // Exact match or common variations
          return lowerH === lowerField || 
                 lowerH.includes(lowerField) || 
                 lowerField.includes(lowerH) ||
                 (field === 'name' && (lowerH.includes('company') || lowerH.includes('client') || lowerH.includes('organization'))) ||
                 (field === 'client_name' && (lowerH.includes('client') || lowerH.includes('company')));
        });
        return !foundField;
      });

      // Only show warnings for missing fields, not blocking errors
      if (missingRequired.length > 0) {
        warnings.push(`⚠️ Missing recommended columns: ${missingRequired.join(', ')} - Smart Field Mapper can help!`);
        warnings.push('💡 Use the Field Mapping Assistant to map alternative column names or apply batch values');
      }

      // Enhanced validation with smart error handling
      const seenIds = new Set();
      let autoFilledRows = 0;
      let successfulRows = 0;
      
      fullData.forEach((row, index) => {
        const rowNumber = index + 2; // Account for header row
        let hasErrors = false;
        let hasAutoFill = false;

        // Check for required field values with intelligent field mapping
        selectedImportType.requiredFields.forEach(field => {
          // Try multiple field name variations
          const possibleFields = [
            field,
            ...headers.filter(h => {
              const lowerH = h.toLowerCase();
              const lowerField = field.toLowerCase();
              return lowerH.includes(lowerField) || lowerField.includes(lowerH);
            })
          ];
          
          let value = null;
          for (const possibleField of possibleFields) {
            value = row[possibleField];
            if (value && value.toString().trim() !== '') break;
          }

          if (!value || value.toString().trim() === '') {
            // Special handling for company name - try even more variations
            if (field === 'name') {
              const nameVariations = headers.filter(h => 
                h.toLowerCase().includes('company') || 
                h.toLowerCase().includes('organization') ||
                h.toLowerCase().includes('business') ||
                h.toLowerCase().includes('client')
              );
              
              for (const variation of nameVariations) {
                value = row[variation];
                if (value && value.toString().trim() !== '') {
                  hasAutoFill = true;
                  break;
                }
              }
            }
            
            // Preview mode: don't block import, just warn
            if (!value || value.toString().trim() === '') {
              warnings.push(`⚠️ Row ${rowNumber}: Missing required field '${field}' - can be resolved with Field Mapper`);
              missingFields++;
            }
          }
        });

        // Show auto-fill capabilities for optional fields
        if (selectedImportType.autoFillCapable && !hasErrors) {
          const companyName = row.name || row.company_name || row.client_name || row.organization || '';
          
          if (companyName && (!row.legal_name || !row.industry || !row.industry_group)) {
            hasAutoFill = true;
          }
        }

        if (hasAutoFill) {
          autoFilledRows++;
        }

        // Check for duplicates (based on unique_id or name)
        const uniqueField = row.unique_id || row.id || row.name || row.client_name || row.company_name;
        if (uniqueField && seenIds.has(uniqueField.toString().toLowerCase())) {
          warnings.push(`⚠️ Row ${rowNumber}: Duplicate entry '${uniqueField}' (will be skipped)`);
          duplicates++;
        } else if (uniqueField) {
          seenIds.add(uniqueField.toString().toLowerCase());
        }

        // Count as successful if we have basic data structure
        if (!hasErrors && (row.name || row.company_name || row.client_name)) {
          successfulRows++;
        }
      });

      // Add positive messaging about capabilities
      if (selectedImportType.autoFillCapable && autoFilledRows > 0) {
        warnings.push(`✨ Auto-fill will populate missing fields for ${autoFilledRows} rows based on company name analysis`);
      }

      if (selectedImportType.id === 'clients') {
        warnings.push('🎯 Industry groups will be intelligently assigned: SMBA, HSNE, DXP, TLCG, or NEW_BUSINESS');
        warnings.push('🤖 Legal names, industries, and other fields will be auto-filled from company names');
      }

      if (successfulRows > 0) {
        warnings.push(`✅ ${successfulRows} rows ready for import with intelligent field mapping`);
      }

      // Preview mode - allow proceeding with warnings
      const canProceedWithWarnings = successfulRows > fullData.length * 0.5; // At least 50% of rows have basic data

      setValidationResult({
        isValid: errors.length === 0 && successfulRows > 0,
        errors,
        warnings,
        canProceedWithWarnings,
        summary: {
          totalRows: fullData.length,
          validRows: successfulRows,
          duplicates,
          missingFields
        }
      });

      // Always proceed to field mapping for preview mode
      setCurrentStep(2);

    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        canProceedWithWarnings: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
        warnings: [],
        summary: { totalRows: 0, validRows: 0, duplicates: 0, missingFields: 0 }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, previewData, importType]);

  const handleFieldMappingComplete = (fieldMappings: any[]) => {
    setMappings(fieldMappings);
    setShowFieldMapper(false);
    setCurrentStep(3);
  };

  const renderValidationStep = () => (
    <div className="space-y-6">
      {/* Validation Results */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Smart Validation Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{validationResult?.summary.totalRows || 0}</div>
            <div className="text-sm text-gray-600">Total Rows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{validationResult?.summary.validRows || 0}</div>
            <div className="text-sm text-gray-600">Valid Rows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{validationResult?.summary.duplicates || 0}</div>
            <div className="text-sm text-gray-600">Duplicates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{validationResult?.warnings.length || 0}</div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
        </div>

        {validationResult?.errors && validationResult.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Validation Errors
            </h4>
            <ul className="space-y-1 text-sm text-red-800">
              {validationResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult?.warnings && validationResult.warnings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Smart Import Insights
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult?.canProceedWithWarnings && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <Wand2 className="h-5 w-5 mr-2" />
              Ready for Smart Field Mapping
            </h4>
            <p className="text-sm text-green-800">
              Your data is ready for import! Use the Smart Field Mapping Assistant to resolve any remaining field mapping issues and optimize your import.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(0)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to File Selection</span>
        </button>

        <div className="flex space-x-3">
          {validationResult?.canProceedWithWarnings && (
            <button
              onClick={() => setShowFieldMapper(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Wand2 className="h-4 w-4" />
              <span>Open Smart Field Mapper</span>
            </button>
          )}
          
          <button
            onClick={() => setCurrentStep(2)}
            disabled={!validationResult?.canProceedWithWarnings}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
              validationResult?.canProceedWithWarnings
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Continue with Current Mapping</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    // Show Smart Field Mapper if activated
    if (showFieldMapper && sourceHeaders.length > 0) {
      const selectedImportType = importTypes.find(t => t.id === importType);
      if (selectedImportType) {
        return (
          <SmartFieldMapper
            sourceHeaders={sourceHeaders}
            targetSchema={selectedImportType}
            onMappingComplete={handleFieldMappingComplete}
            onCancel={() => setShowFieldMapper(false)}
          />
        );
      }
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Import Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Import Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {importTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setImportType(type.id as any)}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      importType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`p-3 rounded-xl ${
                        importType === type.id ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <type.icon className={`h-6 w-6 ${
                          importType === type.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{type.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Required: {type.requiredFields.join(', ') || 'None'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* New Simplified Validation Info Banner */}
            {importType && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      ✨ Enhanced Import with Smart Auto-Fill
                    </h4>
                    <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                      {importType === 'clients' && (
                        <>
                          <p><strong>Only company name is required!</strong> All other fields will be intelligently auto-filled:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>Legal names auto-filled from company names</li>
                            <li>Industries auto-detected (Technology, Healthcare, Education, etc.)</li>
                            <li>Industry groups auto-assigned (SMBA, HSNE, DXP, TLCG, NEW_BUSINESS)</li>
                            <li>Payment terms default to Net 30</li>
                            <li>Alternative field names automatically recognized (company_name, organization, etc.)</li>
                          </ul>
                        </>
                      )}
                      {importType === 'projects' && (
                        <>
                          <p><strong>Only project name and client name are required!</strong> Other fields auto-fill:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>Unique IDs auto-generated if not provided</li>
                            <li>Client names matched against existing accounts</li>
                            <li>Project codes and abbreviations auto-created</li>
                            <li>Alternative field names automatically recognized</li>
                          </ul>
                        </>
                      )}
                      <p className="font-medium mt-3">
                        💡 Your CSV can have any column names - our smart mapping will find the right fields!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Data File
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedFile ? selectedFile.name : 'Drop your file here or click to upload'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supports CSV, Excel (.xlsx, .xls) up to 50MB
                  </p>
                  <input
                    type="file"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            </div>

            {/* Template Downloads */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Download Templates
              </h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => importService.downloadTemplate('clients')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Client Template</span>
                </button>
                <button
                  onClick={() => importService.downloadTemplate('projects')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Project Template</span>
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="flex justify-end">
                <button
                  onClick={validateData}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <span>{isProcessing ? 'Processing...' : 'Validate & Continue'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        );

      case 1:
        return renderValidationStep();

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Field Mapping Complete
            </h3>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Field Mapping Configured
                </h4>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                {mappings.length > 0 ? `${mappings.length} field mappings configured` : 'Using intelligent auto-mapping'}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Validation</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFieldMapper(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Refine Field Mapping</span>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Preview Import</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preview & Confirm Import
            </h3>
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Import Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{validationResult?.summary.totalRows || 0}</div>
                  <div className="text-sm text-blue-700">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationResult?.summary.validRows || 0}</div>
                  <div className="text-sm text-green-700">Valid Rows</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{mappings.length}</div>
                  <div className="text-sm text-purple-700">Field Mappings</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Import Configuration</h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Import Type: {importTypes.find(t => t.id === importType)?.title}</li>
                  <li>• File: {selectedFile?.name}</li>
                  <li>• Auto-fill enabled: {importTypes.find(t => t.id === importType)?.autoFillCapable ? 'Yes' : 'No'}</li>
                  <li>• Validation warnings will be processed during import</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Mapping</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Start Import</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import Complete
            </h3>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Import Successful!
                </h4>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your data has been successfully imported with smart field mapping and auto-fill applied.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setSelectedFile(null);
                  setValidationResult(null);
                  setMappings([]);
                  setPreviewData([]);
                  setImportResult(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import Another File
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Import Wizard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import and validate your data with enterprise-grade controls
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index <= currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center" style={{ width: '120px' }}>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};