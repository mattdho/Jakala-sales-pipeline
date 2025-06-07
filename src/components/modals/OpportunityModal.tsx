import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAccounts, useUsers, useCreateOpportunity, useUpdateOpportunity } from '../../hooks/useSupabaseQuery';
import { OPPORTUNITY_STAGES, INDUSTRY_GROUPS } from '../../constants';
import type { Database } from '../../types/database';

type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update'];

export const OpportunityModal: React.FC = () => {
  const { 
    isOpportunityModalOpen, 
    setOpportunityModalOpen, 
    editingOpportunity, 
    setEditingOpportunity 
  } = useStore();

  const [formData, setFormData] = useState<OpportunityInsert>({
    name: '',
    account_id: '',
    value: 0,
    stage: 'exploration',
    probability: 10,
    client_leader_id: null,
    expected_confirmation_date: null,
    notes: '',
    source: '',
    competitor: null,
    lost_reason: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data for dropdowns
  const { data: accountsData } = useAccounts();
  const { data: usersData } = useUsers({ role: 'client_leader' });

  // Mutations
  const createOpportunity = useCreateOpportunity();
  const updateOpportunity = useUpdateOpportunity();

  const accounts = accountsData?.data || [];
  const clientLeaders = usersData?.data || [];

  // Reset form when modal opens/closes or editing opportunity changes
  useEffect(() => {
    if (isOpportunityModalOpen) {
      if (editingOpportunity) {
        setFormData({
          name: editingOpportunity.name,
          account_id: editingOpportunity.account_id,
          value: editingOpportunity.value,
          stage: editingOpportunity.stage,
          probability: editingOpportunity.probability,
          client_leader_id: editingOpportunity.client_leader_id,
          expected_confirmation_date: editingOpportunity.expected_confirmation_date,
          notes: editingOpportunity.notes || '',
          source: editingOpportunity.source || '',
          competitor: editingOpportunity.competitor,
          lost_reason: editingOpportunity.lost_reason
        });
      } else {
        setFormData({
          name: '',
          account_id: '',
          value: 0,
          stage: 'exploration',
          probability: 10,
          client_leader_id: null,
          expected_confirmation_date: null,
          notes: '',
          source: '',
          competitor: null,
          lost_reason: null
        });
      }
      setErrors({});
    }
  }, [isOpportunityModalOpen, editingOpportunity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Opportunity name is required';
    }

    if (!formData.account_id) {
      newErrors.account_id = 'Account is required';
    }

    if (formData.value < 0) {
      newErrors.value = 'Value must be positive';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingOpportunity) {
        await updateOpportunity.mutateAsync({
          id: editingOpportunity.id,
          updates: formData as OpportunityUpdate
        });
      } else {
        await createOpportunity.mutateAsync(formData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleClose = () => {
    setOpportunityModalOpen(false);
    setEditingOpportunity(null);
    setFormData({
      name: '',
      account_id: '',
      value: 0,
      stage: 'exploration',
      probability: 10,
      client_leader_id: null,
      expected_confirmation_date: null,
      notes: '',
      source: '',
      competitor: null,
      lost_reason: null
    });
    setErrors({});
  };

  const handleStageChange = (stage: string) => {
    const probability = stage === 'closed_won' ? 100 : 
                      stage === 'closed_lost' ? 0 : 
                      stage === 'exploration' ? 10 : 
                      stage === 'ready_for_proposal' ? 50 : 10;
    
    setFormData(prev => ({ ...prev, stage: stage as any, probability }));
  };

  const isLoading = createOpportunity.isPending || updateOpportunity.isPending;

  return (
    <AnimatePresence>
      {isOpportunityModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opportunity Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter opportunity name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account *
                  </label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.account_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.account_id && <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Leader
                  </label>
                  <select
                    value={formData.client_leader_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_leader_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Client Leader</option>
                    {clientLeaders.map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {OPPORTUNITY_STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.probability ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.probability && <p className="mt-1 text-sm text-red-600">{errors.probability}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Confirmation Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_confirmation_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_confirmation_date: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Event">Event</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Add notes about this opportunity..."
                  />
                </div>

                {(formData.stage === 'closed_lost') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lost Reason
                    </label>
                    <select
                      value={formData.lost_reason || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lost_reason: e.target.value || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Reason</option>
                      <option value="Not Bid">Not Bid</option>
                      <option value="Price">Price</option>
                      <option value="Timeline">Timeline</option>
                      <option value="Competitor">Competitor</option>
                      <option value="Budget Cut">Budget Cut</option>
                      <option value="Project Cancelled">Project Cancelled</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingOpportunity ? 'Update' : 'Create'} Opportunity</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};