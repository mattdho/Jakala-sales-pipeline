import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Building, 
  MapPin, Phone, Mail, Edit, Trash2, Eye, Users
} from 'lucide-react';
import { useAccounts, useCreateAccount, useUpdateAccount } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { INDUSTRY_GROUPS } from '../constants';

interface AccountModalProps {
  account: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ account, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(account || {
    name: '',
    legal_name: '',
    billing_address: '',
    payment_terms: 'Net 30',
    industry: '',
    industry_group: '',
    account_owner_id: null
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {account ? 'Edit Account' : 'Create New Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.legal_name}
                onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry Group *
              </label>
              <select
                required
                value={formData.industry_group}
                onChange={(e) => setFormData(prev => ({ ...prev, industry_group: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Industry Group</option>
                {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                  <option key={key} value={key}>{group.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry *
              </label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Billing Address
              </label>
              <textarea
                rows={3}
                value={formData.billing_address}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter billing address..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {account ? 'Update' : 'Create'} Account
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Accounts: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const { data: accountsData, isLoading } = useAccounts({
    search_query: searchQuery,
    industry_groups: selectedIndustryGroup ? [selectedIndustryGroup] : []
  });
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const accounts = accountsData?.data || [];

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (data: any) => {
    try {
      if (editingAccount) {
        await updateAccount.mutateAsync({ id: editingAccount.id, updates: data });
      } else {
        await createAccount.mutateAsync(data);
      }
      setIsModalOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
    }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage client accounts and relationships
                </p>
              </div>
              <button
                onClick={handleCreateAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Account</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <select
                  value={selectedIndustryGroup}
                  onChange={(e) => setSelectedIndustryGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Industry Groups</option>
                  {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                    <option key={key} value={key}>{group.name}</option>
                  ))}
                </select>

                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20`}>
                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {account.legal_name}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: INDUSTRY_GROUPS[account.industry_group as keyof typeof INDUSTRY_GROUPS]?.color || '#6B7280' }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {account.industry_group}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{account.industry}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{account.payment_terms}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(account.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!isLoading && accounts.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No accounts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first account.
                </p>
                <button
                  onClick={handleCreateAccount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AccountModal
        account={editingAccount}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
};

export default Accounts;