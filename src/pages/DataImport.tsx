import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Download, FileText, AlertCircle, CheckCircle, 
  X, Database, Users, Briefcase, Filter, Eye, Trash2
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { importService } from '../services/importService';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
  duplicates: number;
}

const DataImport: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'clients' | 'projects'>('clients');
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        handlePreview(file);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handlePreview(file);
    }
  };

  const handlePreview = async (file: File) => {
    try {
      const preview = await importService.previewCsv(file, 5);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      alert('Error reading file. Please ensure it\'s a valid CSV.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      let result: ImportResult;
      
      if (importType === 'clients') {
        result = await importService.importClients(selectedFile);
      } else {
        result = await importService.importProjects(selectedFile);
      }
      
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duplicates: 0
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (type: 'clients' | 'projects') => {
    importService.downloadTemplate(type);
  };

  const clearImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportResult(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-6`}>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Import</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Import client accounts and project data from CSV files
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => downloadTemplate('clients')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Client Template</span>
                </button>
                <button
                  onClick={() => downloadTemplate('projects')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Project Template</span>
                </button>
              </div>
            </div>

            {/* Import Type Selection */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Import Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setImportType('clients')}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    importType === 'clients'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      importType === 'clients' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Users className={`h-6 w-6 ${
                        importType === 'clients' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Client Accounts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Import client account information and company details
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setImportType('projects')}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    importType === 'projects'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      importType === 'projects' ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Briefcase className={`h-6 w-6 ${
                        importType === 'projects' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Project Jobs</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Import project data and job information
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload CSV File
              </h3>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedFile ? selectedFile.name : 'Drop your CSV file here or click to upload'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supports CSV files up to 10MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".csv"
                  />
                  <div className="flex items-center justify-center space-x-3">
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                    {selectedFile && (
                      <button
                        onClick={clearImport}
                        className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Database className="h-4 w-4" />
                      <span>{importing ? 'Importing...' : 'Import Data'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {showPreview && previewData.length > 0 && (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Data Preview (First 5 rows)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {Object.keys(previewData[0] || {}).map((header) => (
                          <th key={header} className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-gray-700 dark:text-gray-300">
                              {String(value).substring(0, 50)}
                              {String(value).length > 50 ? '...' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 ${
                importResult.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start space-x-3">
                  {importResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      importResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                    }`}>
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {importResult.message}
                    </p>
                    
                    {importResult.success && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {importResult.imported}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">
                            Records Imported
                          </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {importResult.duplicates}
                          </div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300">
                            Duplicates Skipped
                          </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {importResult.errors.length}
                          </div>
                          <div className="text-sm text-red-700 dark:text-red-300">
                            Errors
                          </div>
                        </div>
                      </div>
                    )}

                    {importResult.errors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Errors:</h4>
                        <ul className="space-y-1">
                          {importResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-sm text-red-600 dark:text-red-400">
                              • {error}
                            </li>
                          ))}
                          {importResult.errors.length > 5 && (
                            <li className="text-sm text-gray-600 dark:text-gray-400">
                              ... and {importResult.errors.length - 5} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setImportResult(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Industry Structure Information */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Industry Structure & Team Organization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'SMBA',
                    fullName: 'Services, Manufacturing, B2B, Agriculture',
                    leader: 'Amanda Konopko',
                    team: ['Danielle Bathelemy', 'Liliana Zbirciog', 'Olga Kashchenko', 'Jeremiah Bowden']
                  },
                  {
                    name: 'HSNE',
                    fullName: 'Higher Education, Non-Profit, Sports, Entertainment',
                    leader: 'Mandee Englert',
                    team: ['Lindsay Dehm', 'Lindsey Presley', 'Bruce Clingan', 'Tom Jones']
                  },
                  {
                    name: 'DXP',
                    fullName: 'DXP Build and Support',
                    leader: 'Alex Arnaut',
                    team: ['Chris Miller', 'Chaney Moore']
                  },
                  {
                    name: 'TLCG',
                    fullName: 'Travel, Luxury & Consumer Goods',
                    leader: 'Daniel Bafico',
                    team: ['Esteban Biancchi']
                  },
                  {
                    name: 'New Business',
                    fullName: 'New Business Acquisition',
                    leader: 'Business Development',
                    team: ['Derry Backenkeller', 'Matt Rissmiller', 'Chaney Moore']
                  }
                ].map((group) => (
                  <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{group.fullName}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Leader:</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{group.leader}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Team:</span>
                        <ul className="text-sm text-gray-700 dark:text-gray-300">
                          {group.team.map((member) => (
                            <li key={member}>• {member}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DataImport;