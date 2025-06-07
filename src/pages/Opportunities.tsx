import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Target, 
  DollarSign, Calendar, User, Edit, Trash2, Eye,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { OpportunityModal } from '../components/modals/OpportunityModal';
import { OPPORTUNITY_STAGES, INDUSTRY_GROUPS } from '../constants';

const Opportunities: React.FC = () => {
  const { sidebarOpen, theme, setOpportunityModalOpen, setEditingOpportunity } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: opportunitiesData, isLoading } = useOpportunities({
    search_query: searchQuery,
    stage: selectedStage || undefined,
    industry_groups: selectedIndustryGroup ? [selectedIndustryGroup] : []
  });
  const deleteOpportunity = useDeleteOpportunity();

  const opportunities = opportunitiesData?.data || [];

  const handleCreateOpportunity = () => {
    setEditingOpportunity(null);
    setOpportunityModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: any) => {
    setEditingOpportunity(opportunity);
    setOpportunityModalOpen(true);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  const getStageColor = (stage: string) => {
    const stageConfig = OPPORTUNITY_STAGES.find(s => s.id === stage);
    return stageConfig?.color || '#6B7280';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <motion.div
          key={opportunity.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {opportunity.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {opportunity.account?.name}
                </p>
              </div>
            </div>
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${opportunity.value.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {opportunity.probability}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getStageColor(opportunity.stage) + '20', 
                  color: getStageColor(opportunity.stage) 
                }}
              >
                {OPPORTUNITY_STAGES.find(s => s.id === opportunity.stage)?.name}
              </span>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(opportunity.expected_confirmation_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{opportunity.client_leader?.name || 'Unassigned'}</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${opportunity.probability}%`,
                  backgroundColor: getStageColor(opportunity.stage)
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditOpportunity(opportunity)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDeleteOpportunity(opportunity.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(opportunity.created_at).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Opportunity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Probability
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Client Leader
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Expected Close
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {opportunities.map((opportunity) => (
              <tr key={opportunity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{opportunity.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{opportunity.account?.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${opportunity.value.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getStageColor(opportunity.stage) + '20', 
                      color: getStageColor(opportunity.stage) 
                    }}
                  >
                    {OPPORTUNITY_STAGES.find(s => s.id === opportunity.stage)?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${opportunity.probability}%`,
                          backgroundColor: getStageColor(opportunity.stage)
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {opportunity.probability}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {opportunity.client_leader?.name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(opportunity.expected_confirmation_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditOpportunity(opportunity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />
      <OpportunityModal />

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Opportunities</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your sales opportunities and pipeline
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    List
                  </button>
                </div>
                <button
                  onClick={handleCreateOpportunity}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Opportunity</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Total Opportunities', 
                  value: opportunities.length, 
                  icon: Target, 
                  color: 'blue',
                  change: '+12%'
                },
                { 
                  title: 'Total Value', 
                  value: `$${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}`, 
                  icon: DollarSign, 
                  color: 'green',
                  change: '+8%'
                },
                { 
                  title: 'Avg Deal Size', 
                  value: opportunities.length > 0 ? `$${Math.round(opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length).toLocaleString()}` : '$0', 
                  icon: TrendingUp, 
                  color: 'purple',
                  change: '+5%'
                },
                { 
                  title: 'Close This Month', 
                  value: opportunities.filter(opp => new Date(opp.expected_confirmation_date).getMonth() === new Date().getMonth()).length, 
                  icon: Calendar, 
                  color: 'orange',
                  change: '+15%'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <ArrowRight className="h-4 w-4 mr-1 rotate-[-45deg]" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Stages</option>
                  {OPPORTUNITY_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>

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

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No opportunities found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first opportunity.
                </p>
                <button
                  onClick={handleCreateOpportunity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Opportunity
                </button>
              </div>
            ) : (
              viewMode === 'grid' ? renderGridView() : renderListView()
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Opportunities;