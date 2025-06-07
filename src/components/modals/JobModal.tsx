import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAccounts, useUsers, useOpportunities, useCreateJob, useUpdateJob } from '../../hooks/useSupabaseQuery';
import { JOB_STAGES, PROJECT_STATUSES, PRIORITY_LEVELS } from '../../constants';
import type { Database } from '../../types/database';

type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export const JobModal: React.FC = () => {
  const { 
    isJobModalOpen, 
    setJobModalOpen, 
    editingJob, 
    setEditingJob 
  } = useStore();

  const [formData, setFormData] = useState<JobInsert>({
    name: '',
    opportunity_id: null,
    account_id: '',
    value: 0,
    stage: 'proposal_preparation',
    project_status: 'to_be_started',
    client_leader_id: null,
    expected_confirmation_date: null,
    project_start_date: null,
    project_end_date: null,
    notes: '',
    priority: 'medium',
    lost_reason: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data for dropdowns
  const { data: accountsData } = useAccounts();
  const { data: usersData } = useUsers({ role: 'client_leader' });
  const { data: opportunitiesData } = useOpportunities();

  // Mutations
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const accounts = accountsData?.data || [];
  const clientLeaders = usersData?.data || [];
  const opportunities = opportunitiesData?.data || [];

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (isJobModalOpen) {
      if (editingJob) {
        setFormData({
          name: editingJob.name,
          opportunity_id: editingJob.opportunity_id,
          account_id: editingJob.account_id,
          value: editingJob.value,
          stage: editingJob.stage,
          project_status: editingJob.project_status,
          client_leader_id: editingJob.client_leader_id,
          expected_confirmation_date: editingJob.expected_confirmation_date,
          project_start_date: editingJob.project_start_date,
          project_end_date: editingJob.project_end_date,
          notes: editingJob.notes || '',
          priority: editingJob.priority,
          lost_reason: editingJob.lost_reason
        });
      } else {
        setFormData({
          name: '',
          opportunity_id: null,
          account_id: '',
          value: 0,
          stage: 'proposal_preparation',
          project_status: 'to_be_started',
          client_leader_id: null,
          expected_confirmation_date: null,
          project_start_date: null,
          project_end_date: null,
          notes: '',
          priority: 'medium',
          lost_reason: null
        });
      }
      setErrors({});
    }
  }, [isJobModalOpen, editingJob]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Job name is required';
    }

    if (!formData.account_id) {
      newErrors.account_id = 'Account is required';
    }

    if (formData.value < 0) {
      newErrors.value = 'Value must be positive';
    }

    if (formData.project_start_date && formData.project_end_date) {
      if (new Date(formData.project_start_date) > new Date(formData.project_end_date)) {
        newErrors.project_end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingJob) {
        await updateJob.mutateAsync({
          id: editingJob.id,
          updates: formData as JobUpdate
        });
      } else {
        await createJob.mutateAsync(formData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleClose = () => {
    setJobModalOpen(false);
    setEditingJob(null);
    setFormData({
      name: '',
      opportunity_id: null,
      account_id: '',
      value: 0,
      stage: 'proposal_preparation',
      project_status: 'to_be_started',
      client_leader_id: null,
      expected_confirmation_date: null,
      project_start_date: null,
      project_end_date: null,
      notes: '',
      priority: 'medium',
      lost_reason: null
    });
    setErrors({});
  };

  const handleOpportunityChange = (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      setFormData(prev => ({
        ...prev,
        opportunity_id: opportunityId || null,
        account_id: opportunity.account_id,
        value: opportunity.value,
        client_leader_id: opportunity.client_leader_id,
        expected_confirmation_date: opportunity.expected_confirmation_date,
        name: prev.name || `${opportunity.name} - Project`
      }));
    } else {
      setFormData(prev => ({ ...prev, opportunity_id: null }));
    }
  };

  const isLoading = createJob.isPending || updateJob.isPending;

  return (
    <AnimatePresence>
      {isJobModalOpen && (
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
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingJob ? 'Edit Job' : 'Create New Job'}
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
                    Job Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter job name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Opportunity
                  </label>
                  <select
                    value={formData.opportunity_id || ''}
                    onChange={(e) => handleOpportunityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Opportunity (Optional)</option>
                    {opportunities.map((opportunity) => (
                      <option key={opportunity.id} value={opportunity.id}>
                        {opportunity.name}
                      </option>
                    ))}
                  </select>
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
                    Job Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {JOB_STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Status
                  </label>
                  <select
                    value={formData.project_status}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {PRIORITY_LEVELS.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
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
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.project_start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_start_date: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project End Date
                  </label>
                  <input
                    type="date"
                    value={formData.project_end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_end_date: e.target.value || null }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.project_end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.project_end_date && <p className="mt-1 text-sm text-red-600">{errors.project_end_date}</p>}
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
                    placeholder="Add notes about this job..."
                  />
                </div>

                {(formData.stage === 'lost') && (
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingJob ? 'Update' : 'Create'} Job</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};