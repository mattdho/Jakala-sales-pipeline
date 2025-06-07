import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Upload, Settings, Users, Shield, 
  BarChart3, FileText, Download, AlertCircle,
  CheckCircle, Clock, TrendingUp, Building2,
  Briefcase, Target, Calendar, Activity
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { DataImportWizard } from '../components/import/DataImportWizard';
import { DashboardBuilder } from '../components/dashboard/DashboardBuilder';
import { RoleBasedAccess } from '../components/access/RoleBasedAccess';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Tooltip, IconTooltip } from '../components/ui/Tooltip';
import { KanbanListToggle } from '../components/ui/KanbanListToggle';
import { INDUSTRY_GROUPS, JOB_STAGES } from '../constants';
import { mockClients, mockJobs, mockOpportunities, teamMembers } from '../data/mockData';

interface EnterpriseDashboardProps {
  defaultModule?: 'overview' | 'clients' | 'jobs' | 'import' | 'dashboard' | 'access';
  filterIndustry?: 'SMBA' | 'HSNE' | 'DXP' | 'TLCG' | 'NEW_BUSINESS';
}

const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({ 
  defaultModule = 'overview', 
  filterIndustry 
}) => {
  const { sidebarOpen, theme } = useStore();
  const [activeModule, setActiveModule] = useState<'overview' | 'clients' | 'jobs' | 'import' | 'dashboard' | 'access'>(defaultModule);
  const [currentIndustryFilter, setCurrentIndustryFilter] = useState<string | null>(filterIndustry || null);
  const [jobView, setJobView] = useState<'kanban' | 'list'>('list');
  const [jobFilters, setJobFilters] = useState<any>({});
  const [jobSort, setJobSort] = useState<any>({});

  // Set the active module and industry filter when props change
  useEffect(() => {
    setActiveModule(defaultModule);
    setCurrentIndustryFilter(filterIndustry || null);
  }, [defaultModule, filterIndustry]);

  const modules = [
    {
      id: 'overview',
      name: 'Overview',
      description: 'Enterprise performance dashboard',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'clients',
      name: 'Client Accounts',
      description: 'Manage client relationships & accounts',
      icon: Building2,
      color: 'green'
    },
    {
      id: 'jobs',
      name: 'Job Management',
      description: 'Track projects and deliverables',
      icon: Briefcase,
      color: 'purple'
    },
    {
      id: 'import',
      name: 'Data Import',
      description: 'Advanced file import with validation',
      icon: Upload,
      color: 'orange'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Builder',
      description: 'Create custom reporting dashboards',
      icon: Settings,
      color: 'indigo'
    },
    {
      id: 'access',
      name: 'Access Control',
      description: 'Role-based permissions management',
      icon: Shield,
      color: 'red'
    }
  ];

  const systemStats = [
    {
      title: 'Total Pipeline Value',
      value: '$2,847,000',
      change: '+12.5%',
      trend: 'up',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Active Projects',
      value: mockJobs.length.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: Briefcase,
      color: 'green'
    },
    {
      title: 'Client Accounts',
      value: mockClients.length.toString(),
      change: '+15.2%',
      trend: 'up',
      icon: Building2,
      color: 'purple'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'emerald'
    }
  ];

  const recentActivity = [
    {
      type: 'job',
      message: 'Quaker Houghton project moved to Backlog',
      user: 'Amanda Konopko',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      type: 'client',
      message: 'New client account created: Yale University',
      user: 'Mandee Englert',
      time: '15 minutes ago',
      status: 'info'
    },
    {
      type: 'access',
      message: 'User permissions updated for TLCG team',
      user: 'Daniel Bafico',
      time: '1 hour ago',
      status: 'warning'
    },
    {
      type: 'job',
      message: 'Notre Dame proposal submitted',
      user: 'Mandee Englert',
      time: '2 hours ago',
      status: 'success'
    },
    {
      type: 'system',
      message: 'Automated backup completed',
      user: 'System',
      time: '4 hours ago',
      status: 'info'
    }
  ];

  const industryGroups = Object.entries(INDUSTRY_GROUPS).map(([key, group]) => ({
    id: key,
    name: key,
    fullName: group.name,
    leader: group.leader,
    members: teamMembers[key as keyof typeof teamMembers]?.team.length || 0,
    records: mockClients.filter(client => client.industry_group === key).length + 
             mockJobs.filter(job => mockClients.find(client => client.id === job.account_id)?.industry_group === key).length,
    color: group.color
  }));

  const renderOverview = () => (
    <div className="space-y-8">
      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
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
              <div className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  stat.trend === 'down' ? 'rotate-180' : 
                  stat.trend === 'stable' ? 'rotate-90' : ''
                }`} />
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

      {/* Industry Groups Overview */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Industry Group Performance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {industryGroups.map(group => (
            <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {group.records} records
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{group.fullName}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Leader: {group.leader}</span>
                <span className="text-gray-600 dark:text-gray-400">{group.members} members</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  activity.status === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{activity.user}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveModule('clients')}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium text-green-900 dark:text-green-100">Manage Clients</div>
                <div className="text-sm text-green-700 dark:text-green-300">View and edit client accounts</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveModule('jobs')}
              className="w-full flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-purple-900 dark:text-purple-100">Manage Jobs</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Track project progress</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveModule('import')}
              className="w-full flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="font-medium text-orange-900 dark:text-orange-100">Import Data</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Upload CSV, Excel, or Google Sheets</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveModule('dashboard')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-blue-900 dark:text-blue-100">Create Dashboard</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Build custom reporting views</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => {
    // Filter clients by industry if specified
    const filteredClients = currentIndustryFilter 
      ? mockClients.filter(client => client.industry_group === currentIndustryFilter)
      : mockClients;

    const industryInfo = currentIndustryFilter ? INDUSTRY_GROUPS[currentIndustryFilter as keyof typeof INDUSTRY_GROUPS] : null;

    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {currentIndustryFilter && (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <button 
              onClick={() => setCurrentIndustryFilter(null)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              All Industries
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{currentIndustryFilter}</span>
          </nav>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentIndustryFilter ? `${currentIndustryFilter} Clients` : 'Client Accounts'}
            </h2>
            {industryInfo && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {industryInfo.name} • Leader: {industryInfo.leader}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {currentIndustryFilter && (
              <button 
                onClick={() => setCurrentIndustryFilter(null)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Industries
              </button>
            )}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add New Client
            </button>
          </div>
        </div>

        {/* Industry Filter Tabs */}
        {!currentIndustryFilter && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCurrentIndustryFilter(null)}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              All ({mockClients.length})
            </button>
            {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => {
              const count = mockClients.filter(client => client.industry_group === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentIndustryFilter(key)}
                  className="px-3 py-1 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  style={{ 
                    backgroundColor: `${group.color}20`,
                    color: group.color 
                  }}
                >
                  {key} ({count})
                </button>
              );
            })}
          </div>
        )}
        
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No clients found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentIndustryFilter 
                ? `No clients in the ${currentIndustryFilter} industry group.`
                : 'No clients have been added yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <motion.div 
                key={client.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{client.industry}</p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: INDUSTRY_GROUPS[client.industry_group as keyof typeof INDUSTRY_GROUPS]?.color || '#6B7280' }}
                  />
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Group:</span>
                    <span className="font-medium">{client.industry_group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terms:</span>
                    <span>{client.payment_terms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <span>{client.account_owner_id}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderJobs = () => {
    // Filter jobs by industry if specified
    const filteredJobs = currentIndustryFilter 
      ? mockJobs.filter(job => {
          const client = mockClients.find(client => client.id === job.account_id);
          return client?.industry_group === currentIndustryFilter;
        })
      : mockJobs;

    const industryInfo = currentIndustryFilter ? INDUSTRY_GROUPS[currentIndustryFilter as keyof typeof INDUSTRY_GROUPS] : null;

    // Filter options for the toggle component
    const filterOptions = [
      {
        field: 'priority',
        label: 'Priority',
        options: [
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ]
      },
      {
        field: 'project_status',
        label: 'Status',
        options: [
          { value: 'to_be_started', label: 'To Be Started' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'finished', label: 'Finished' }
        ]
      }
    ];

    if (!currentIndustryFilter) {
      filterOptions.push({
        field: 'industry_group',
        label: 'Industry',
        options: Object.keys(INDUSTRY_GROUPS).map(key => ({
          value: key,
          label: key
        }))
      });
    }

    // Breadcrumb items
    const breadcrumbItems = [];
    if (currentIndustryFilter) {
      breadcrumbItems.push({
        label: 'All Industries',
        onClick: () => setCurrentIndustryFilter(null)
      });
      breadcrumbItems.push({
        label: currentIndustryFilter,
        current: true
      });
    }

    const renderKanbanBoard = () => {
      // Create kanban columns based on job stages
      const kanbanColumns = JOB_STAGES.map(stage => ({
        id: stage.id,
        title: stage.name,
        color: stage.color,
        jobs: filteredJobs.filter(job => job.stage === stage.id)
      }));

      return (
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {kanbanColumns.map(column => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {column.jobs.length}
                  </span>
                </div>
                <Tooltip content={`Add new ${column.title.toLowerCase()} job`}>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    +
                  </button>
                </Tooltip>
              </div>

              {/* Column Jobs */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {column.jobs.map((job, index) => {
                  const client = mockClients.find(client => client.id === job.account_id);
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {job.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {job.job_code} • {client?.name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            ${job.value.toLocaleString()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.priority === 'high' ? 'bg-red-100 text-red-700' :
                            job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {job.priority}
                          </span>
                        </div>

                        {client && (
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: INDUSTRY_GROUPS[client.industry_group as keyof typeof INDUSTRY_GROUPS]?.color }}
                            />
                            <span className="text-xs text-gray-500">{client.industry_group}</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-400 line-clamp-2">
                          {job.notes}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {column.jobs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No {column.title.toLowerCase()} jobs</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderListView = () => (
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentIndustryFilter 
                ? `No jobs in the ${currentIndustryFilter} industry group.`
                : 'No jobs have been created yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map(job => {
              const client = mockClients.find(client => client.id === job.account_id);
              return (
                <motion.div 
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {job.name.length > 60 ? `${job.name.substring(0, 60)}...` : job.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Code: {job.job_code} • Client: {client?.name}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      job.stage === 'backlog' ? 'bg-green-100 text-green-800' :
                      job.stage === 'proposal_sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.stage.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Value:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${job.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{job.project_status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className={`font-medium ${
                        job.priority === 'high' ? 'text-red-600' :
                        job.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {job.priority.toUpperCase()}
                      </span>
                    </div>
                    {client && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                        <span className="font-medium" style={{ color: INDUSTRY_GROUPS[client.industry_group as keyof typeof INDUSTRY_GROUPS]?.color }}>
                          {client.industry_group}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="line-clamp-2">{job.notes}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentIndustryFilter ? `${currentIndustryFilter} Jobs` : 'Job Management'}
            </h2>
            {industryInfo && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {industryInfo.name} • Leader: {industryInfo.leader}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {currentIndustryFilter && (
              <button 
                onClick={() => setCurrentIndustryFilter(null)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Industries
              </button>
            )}
            <Tooltip content="Create a new job">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create New Job
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Kanban/List Toggle with Filters */}
        <KanbanListToggle
          view={jobView}
          onViewChange={setJobView}
          onFilterChange={setJobFilters}
          onSortChange={setJobSort}
          data={filteredJobs}
          columns={JOB_STAGES.map(stage => ({ id: stage.id, title: stage.name, color: stage.color }))}
          filterOptions={filterOptions}
        />

        {/* Industry Filter Tabs */}
        {!currentIndustryFilter && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentIndustryFilter(null)}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              All ({mockJobs.length})
            </button>
            {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => {
              const count = mockJobs.filter(job => {
                const client = mockClients.find(client => client.id === job.account_id);
                return client?.industry_group === key;
              }).length;
              return (
                <Tooltip key={key} content={`View ${group.name} jobs`}>
                  <button
                    onClick={() => setCurrentIndustryFilter(key)}
                    className="px-3 py-1 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    style={{ 
                      backgroundColor: `${group.color}20`,
                      color: group.color 
                    }}
                  >
                    {key} ({count})
                  </button>
                </Tooltip>
              );
            })}
          </div>
        )}
        
        {/* Job Views */}
        <motion.div
          key={jobView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {jobView === 'kanban' ? renderKanbanBoard() : renderListView()}
        </motion.div>
      </div>
    );
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Operations</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive pipeline and client management
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                {modules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id as any)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                      activeModule === module.id
                        ? `bg-${module.color}-600 text-white`
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {module.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Module Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeModule === 'overview' && renderOverview()}
                {activeModule === 'clients' && renderClients()}
                {activeModule === 'jobs' && renderJobs()}
                {activeModule === 'import' && <DataImportWizard />}
                {activeModule === 'dashboard' && <DashboardBuilder />}
                {activeModule === 'access' && <RoleBasedAccess />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseDashboard; 