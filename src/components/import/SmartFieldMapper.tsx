import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Check, X, AlertTriangle, Info, 
  Wand2, RotateCcw, Download, Upload
} from 'lucide-react';

interface FieldMapping {
  sourceField: string;
  targetField: string;
  confidence: number;
  required: boolean;
  suggested: boolean;
  status: 'mapped' | 'unmapped' | 'conflict' | 'auto-filled';
}

interface SmartFieldMapperProps {
  sourceHeaders: string[];
  targetSchema: {
    requiredFields: string[];
    optionalFields: string[];
    autoFillCapable: boolean;
  };
  onMappingComplete: (mappings: FieldMapping[]) => void;
  onCancel: () => void;
}

export const SmartFieldMapper: React.FC<SmartFieldMapperProps> = ({
  sourceHeaders,
  targetSchema,
  onMappingComplete,
  onCancel
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchValues, setBatchValues] = useState<Record<string, string>>({});

  // Smart field matching algorithm
  const generateSmartMappings = () => {
    const allTargetFields = [...targetSchema.requiredFields, ...targetSchema.optionalFields];
    const newMappings: FieldMapping[] = [];

    // Field name similarity scoring
    const calculateSimilarity = (source: string, target: string): number => {
      const sourceLower = source.toLowerCase().trim();
      const targetLower = target.toLowerCase().trim();
      
      // Exact match
      if (sourceLower === targetLower) return 1.0;
      
      // Contains match
      if (sourceLower.includes(targetLower) || targetLower.includes(sourceLower)) return 0.8;
      
      // Common variations for company name
      if (target === 'name') {
        const nameVariations = ['company', 'organization', 'business', 'client', 'account'];
        if (nameVariations.some(v => sourceLower.includes(v))) return 0.9;
      }
      
      // Common variations for legal name
      if (target === 'legal_name') {
        const legalVariations = ['legal', 'official', 'full_name', 'company_name'];
        if (legalVariations.some(v => sourceLower.includes(v))) return 0.7;
      }
      
      // Industry variations
      if (target === 'industry') {
        const industryVariations = ['sector', 'category', 'type', 'field'];
        if (industryVariations.some(v => sourceLower.includes(v))) return 0.6;
      }
      
      // Partial word matching
      const sourceWords = sourceLower.split(/[_\s-]+/);
      const targetWords = targetLower.split(/[_\s-]+/);
      const commonWords = sourceWords.filter(word => targetWords.includes(word));
      
      if (commonWords.length > 0) {
        return commonWords.length / Math.max(sourceWords.length, targetWords.length) * 0.5;
      }
      
      return 0;
    };

    // Generate mappings for each target field
    allTargetFields.forEach(targetField => {
      let bestMatch = { field: '', confidence: 0 };
      
      sourceHeaders.forEach(sourceField => {
        const confidence = calculateSimilarity(sourceField, targetField);
        if (confidence > bestMatch.confidence) {
          bestMatch = { field: sourceField, confidence };
        }
      });

      const isRequired = targetSchema.requiredFields.includes(targetField);
      
      if (bestMatch.confidence > 0.5 || isRequired) {
        newMappings.push({
          sourceField: bestMatch.field || '',
          targetField,
          confidence: bestMatch.confidence,
          required: isRequired,
          suggested: bestMatch.confidence > 0.7,
          status: bestMatch.confidence > 0.7 ? 'mapped' : 
                  bestMatch.field ? 'mapped' : 
                  targetSchema.autoFillCapable && !isRequired ? 'auto-filled' : 'unmapped'
        });
      }
    });

    setMappings(newMappings);
  };

  useEffect(() => {
    generateSmartMappings();
  }, [sourceHeaders, targetSchema]);

  const updateMapping = (targetField: string, sourceField: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.targetField === targetField 
        ? { ...mapping, sourceField, status: sourceField ? 'mapped' : 'unmapped' }
        : mapping
    ));
  };

  const applyBatchValue = (targetField: string, value: string) => {
    setBatchValues(prev => ({ ...prev, [targetField]: value }));
    updateMapping(targetField, '');
    setMappings(prev => prev.map(mapping => 
      mapping.targetField === targetField 
        ? { ...mapping, status: 'auto-filled' }
        : mapping
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped': return 'text-green-600 bg-green-50';
      case 'auto-filled': return 'text-blue-600 bg-blue-50';
      case 'unmapped': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped': return <Check className="h-4 w-4" />;
      case 'auto-filled': return <Wand2 className="h-4 w-4" />;
      case 'unmapped': return <X className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const canProceed = () => {
    const requiredMappings = mappings.filter(m => m.required);
    return requiredMappings.every(m => m.status === 'mapped' || m.status === 'auto-filled');
  };

  const handleComplete = () => {
    const finalMappings = mappings.map(mapping => ({
      ...mapping,
      batchValue: batchValues[mapping.targetField]
    }));
    onMappingComplete(finalMappings as any);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wand2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Field Mapping Assistant</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          AI-powered field mapping with {mappings.filter(m => m.suggested).length} automatic suggestions detected.
          Required fields can be mapped manually or auto-filled with batch values.
        </p>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Auto-mapped ({mappings.filter(m => m.status === 'mapped').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Auto-filled ({mappings.filter(m => m.status === 'auto-filled').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Needs attention ({mappings.filter(m => m.status === 'unmapped' && m.required).length})</span>
          </div>
        </div>
      </div>

      {/* Mapping Interface */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Field Mappings</h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAdvanced ? 'Simple View' : 'Advanced Options'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mappings.map((mapping, index) => (
            <motion.div
              key={mapping.targetField}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(mapping.status)}`}>
                    {getStatusIcon(mapping.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {mapping.targetField}
                      {mapping.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {mapping.required ? 'Required field' : 'Optional field'}
                      {mapping.confidence > 0 && ` • ${Math.round(mapping.confidence * 100)}% confidence`}
                    </p>
                  </div>
                </div>
                
                {mapping.suggested && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Wand2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Auto-suggested</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Source Field Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Map from source field:
                  </label>
                  <select
                    value={mapping.sourceField}
                    onChange={(e) => updateMapping(mapping.targetField, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select source field...</option>
                    {sourceHeaders.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Value Option */}
                {showAdvanced && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Or apply batch value:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Same value for all rows"
                        value={batchValues[mapping.targetField] || ''}
                        onChange={(e) => setBatchValues(prev => ({ ...prev, [mapping.targetField]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => applyBatchValue(mapping.targetField, batchValues[mapping.targetField] || '')}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview:
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    {mapping.status === 'auto-filled' && batchValues[mapping.targetField] ? (
                      <span className="text-blue-600">Batch: "{batchValues[mapping.targetField]}"</span>
                    ) : mapping.sourceField ? (
                      <span className="text-green-600">From: {mapping.sourceField}</span>
                    ) : mapping.status === 'auto-filled' ? (
                      <span className="text-blue-600">Auto-filled by AI</span>
                    ) : (
                      <span className="text-gray-400">Not mapped</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={generateSmartMappings}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Re-run Smart Mapping</span>
          </button>
          
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {canProceed() ? (
              <span className="text-green-600 flex items-center space-x-1">
                <Check className="h-4 w-4" />
                <span>Ready to proceed</span>
              </span>
            ) : (
              <span className="text-red-600 flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4" />
                <span>{mappings.filter(m => m.required && m.status === 'unmapped').length} required fields missing</span>
              </span>
            )}
          </div>
          
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
              canProceed()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Continue Import</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 