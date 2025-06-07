import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Upload, Settings, Users, Shield, 
  BarChart3, FileText, Download, AlertCircle,
  CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { DataImportWizard } from '../components/import/DataImportWizard';
import { DashboardBuilder } from '../components/dashboard/DashboardBuilder';
import { RoleBasedAccess } from '../components/access/RoleBasedAccess';

const DataImportEnterprise: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [activeModule, setActiveModule] = useState<'overview' | 'import' | 'dashboard' | 'access'>('overview');

  const modules = [
    {
      id: 'overview',
      name: 'System Overview',
      description: 'Enterprise data management dashboard',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'import',
      name: 'Data Import',
      description: 'Advanced file import with validation',
      icon: Upload,
      color: 'green'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Builder',
      description: 'Create custom reporting dashboards',
      icon: Settings,
      color: 'purple'
    },
    {
      id: 'access',
      name: 'Access Control',
      description: 'Role-based permissions management',
      icon: Shield,
      color: 'orange'
    }
  ];

  const systemStats = [
    {
      title: 'Total Records',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Database,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '156',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Import Success Rate',
      value: '99.2%',
      change: '+0.8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '0.0%',
      trend: 'stable',
      icon: Clock,
      color: 'purple'
    }
  ];

  const recentActivity = [
    {
      type: 'import',
      message: 'Client data import completed successfully',
      user: 'Amanda Konopko',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      type: 'dashboard',
      message: 'New SMBA performance dashboard created',
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
      type: 'import',
      message: 'Project data validation completed',
      user: 'Alex Arnaut',
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

  const industryGroups = [
    {
      name: 'SMBA',
      fullName: 'Services, Manufacturing, B2B, Agriculture',
      leader: 'Amanda Konopko',
      members: 5,
      records: 847,
      color: '#3B82F6'
    },
    {
      name: 'HSNE',
      fullName: 'Higher Education, Non-Profit, Sports, Entertainment',
      leader: 'Mandee Englert',
      members: 4,
      records: 623,
      color: '#10B981'
    },
    {
      name: 'DXP',
      fullName: 'DXP Build and Support',
      leader: 'Alex Arnaut',
      members: 2,
      records: 312,
      color: '#8B5CF6'
    },
    {
      name: 'TLCG',
      fullName: 'Travel, Luxury & Consumer Goods',
      leader: 'Daniel Bafico',
      members: 2,
      records: 456,
      color: '#F59E0B'
    },
    {
      name: 'New Business',
      fullName: 'New Business Acquisition',
      leader: 'Business Development',
      members: 3,
      records: 189,
      color: '#EF4444'
    }
  ];

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
            <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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

      {/* Recent Activity */}
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
              onClick={() => setActiveModule('import')}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium text-green-900 dark:text-green-100">Import Data</div>
                <div className="text-sm text-green-700 dark:text-green-300">Upload CSV, Excel, or Google Sheets</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveModule('dashboard')}
              className="w-full flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-purple-900 dark:text-purple-100">Create Dashboard</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Build custom reporting views</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveModule('access')}
              className="w-full flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="font-medium text-orange-900 dark:text-orange-100">Manage Access</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Configure roles and permissions</div>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-blue-900 dark:text-blue-100">Export Reports</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Download data in various formats</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">Database</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">API Services</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">Storage</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">Authentication</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
          </div>
        </div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Data Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Advanced data import, dashboard configuration, and access control
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveModule('overview')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeModule === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveModule('import')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeModule === 'import'
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Import
                </button>
                <button
                  onClick={() => setActiveModule('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeModule === 'dashboard'
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dashboards
                </button>
                <button
                  onClick={() => setActiveModule('access')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeModule === 'access'
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Access
                </button>
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

export default DataImportEnterprise;