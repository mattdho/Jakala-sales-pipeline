import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Briefcase, 
  DollarSign, Calendar, User, Edit, Trash2, Eye,
  Clock, ArrowRight, Code
} from 'lucide-react';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { JobModal } from '../components/modals/JobModal';
import { JOB_STAGES, PROJECT_STATUSES, PRIORITY_LEVELS } from '../constants';

const Jobs: React.FC = () => {
  const { sidebarOpen, theme, setJobModalOpen, setEditingJob } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: jobsData, isLoading } = useJobs({
    search_query: searchQuery,
    stage: selectedStage || undefined,
    project_status: selectedStatus || undefined,
    priority: selectedPriority || undefined
  });
  const deleteJob = useDeleteJob();

  const jobs = jobsData?.data || [];

  const handleCreateJob = () => {
    setEditingJob(null);
    setJobModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const getStageColor = (stage: string) => {
    const stageConfig = JOB_STAGES.find(s => s.id === stage);
    return stageConfig?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.id === status);
    return statusConfig?.color || '#6B7280';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.id === priority);
    return priorityConfig?.color || '#6B7280';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {job.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Code className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {job.job_code}
                  </p>
                </div>
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
                ${job.value.toLocaleString()}
              </span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getPriorityColor(job.priority) + '20', 
                  color: getPriorityColor(job.priority) 
                }}
              >
                {PRIORITY_LEVELS.find(p => p.id === job.priority)?.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getStageColor(job.stage) + '20', 
                  color: getStageColor(job.stage) 
                }}
              >
                {JOB_STAGES.find(s => s.id === job.stage)?.name}
              </span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getStatusColor(job.project_status) + '20', 
                  color: getStatusColor(job.project_status) 
                }}
              >
                {PROJECT_STATUSES.find(s => s.id === job.project_status)?.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{job.client_leader?.name || 'Unassigned'}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {job.project_start_date 
                  ? `Start: ${new Date(job.project_start_date).toLocaleDateString()}`
                  : 'Start: TBD'
                }
              </span>
            </div>

            {job.project_end_date && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>End: {new Date(job.project_end_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditJob(job)}
                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDeleteJob(job.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(job.created_at).toLocaleDateString()}
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
                Job
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Client Leader
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{job.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{job.job_code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${job.value.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getStageColor(job.stage) + '20', 
                      color: getStageColor(job.stage) 
                    }}
                  >
                    {JOB_STAGES.find(s => s.id === job.stage)?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getStatusColor(job.project_status) + '20', 
                      color: getStatusColor(job.project_status) 
                    }}
                  >
                    {PROJECT_STATUSES.find(s => s.id === job.project_status)?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getPriorityColor(job.priority) + '20', 
                      color: getPriorityColor(job.priority) 
                    }}
                  >
                    {PRIORITY_LEVELS.find(p => p.id === job.priority)?.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {job.client_leader?.name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <div>
                      Start: {job.project_start_date ? new Date(job.project_start_date).toLocaleDateString() : 'TBD'}
                    </div>
                    {job.project_end_date && (
                      <div>
                        End: {new Date(job.project_end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
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
      <JobModal />

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage project jobs and execution
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    List
                  </button>
                </div>
                <button
                  onClick={handleCreateJob}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Job</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Total Jobs', 
                  value: jobs.length, 
                  icon: Briefcase, 
                  color: 'purple',
                  change: '+18%'
                },
                { 
                  title: 'Total Value', 
                  value: `$${jobs.reduce((sum, job) => sum + job.value, 0).toLocaleString()}`, 
                  icon: DollarSign, 
                  color: 'green',
                  change: '+12%'
                },
                { 
                  title: 'Active Jobs', 
                  value: jobs.filter(job => !['closed', 'lost'].includes(job.stage)).length, 
                  icon: Clock, 
                  color: 'blue',
                  change: '+25%'
                },
                { 
                  title: 'High Priority', 
                  value: jobs.filter(job => job.priority === 'high').length, 
                  icon: Calendar, 
                  color: 'red',
                  change: '+8%'
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Stages</option>
                  {JOB_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_LEVELS.map((priority) => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first job.
                </p>
                <button
                  onClick={handleCreateJob}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Job
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

export default Jobs;