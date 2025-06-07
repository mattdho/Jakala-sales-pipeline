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
import { INDUSTRY_GROUPS } from '../constants';
import { mockClients, mockJobs, mockOpportunities, teamMembers } from '../data/mockData';

const EnterpriseDashboard: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [activeModule, setActiveModule] = useState<'overview' | 'clients' | 'jobs' | 'import' | 'dashboard' | 'access'>('overview');

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

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Client Accounts</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add New Client
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClients.map(client => (
          <div key={client.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
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
              <div>Group: {client.industry_group}</div>
              <div>Terms: {client.payment_terms}</div>
              <div>Owner: {client.account_owner_id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create New Job
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockJobs.map(job => (
          <div key={job.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{job.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Code: {job.job_code}</p>
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{job.notes}</p>
              </div>
            </div>
          </div>
        ))}
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