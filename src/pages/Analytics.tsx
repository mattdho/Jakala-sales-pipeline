import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, 
  Users, Calendar, BarChart3, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { useOpportunityMetrics, useJobMetrics, useOpportunities, useJobs } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { INDUSTRY_GROUPS } from '../constants';

const Analytics: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const { data: opportunityMetrics } = useOpportunityMetrics();
  const { data: jobMetrics } = useJobMetrics();
  const { data: opportunitiesData } = useOpportunities();
  const { data: jobsData } = useJobs();

  const opportunities = opportunitiesData?.data || [];
  const jobs = jobsData?.data || [];

  // Calculate analytics data
  const totalPipelineValue = (opportunityMetrics?.data?.total_pipeline_value || 0) + (jobMetrics?.data?.total_job_value || 0);
  const weightedPipelineValue = opportunityMetrics?.data?.weighted_pipeline_value || 0;
  const winRate = opportunityMetrics?.data?.win_rate || 0;
  const avgDealSize = opportunityMetrics?.data?.avg_deal_size || 0;

  // Industry group performance
  const industryPerformance = Object.entries(INDUSTRY_GROUPS).map(([key, group]) => {
    const groupOpps = opportunities.filter(opp => opp.account_id === key); // This would need proper account linking
    const groupJobs = jobs.filter(job => job.account_id === key);
    const totalValue = [...groupOpps, ...groupJobs].reduce((sum, item) => sum + item.value, 0);
    
    return {
      name: key,
      value: totalValue,
      count: groupOpps.length + groupJobs.length,
      color: group.color
    };
  });

  // Monthly trend data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' });
    const monthOpps = opportunities.filter(opp => 
      new Date(opp.created_at).getMonth() === i
    );
    const monthJobs = jobs.filter(job => 
      new Date(job.created_at).getMonth() === i
    );
    
    return {
      month,
      opportunities: monthOpps.length,
      jobs: monthJobs.length,
      revenue: [...monthOpps, ...monthJobs].reduce((sum, item) => sum + item.value, 0)
    };
  });

  // Funnel data
  const funnelData = [
    { name: 'Exploration', value: opportunities.filter(o => o.stage === 'exploration').length, fill: '#3B82F6' },
    { name: 'Ready for Proposal', value: opportunities.filter(o => o.stage === 'ready_for_proposal').length, fill: '#F59E0B' },
    { name: 'Closed Won', value: opportunities.filter(o => o.stage === 'closed_won').length, fill: '#10B981' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive pipeline performance insights
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Pipeline Value',
                  value: `$${totalPipelineValue.toLocaleString()}`,
                  change: '+12.5%',
                  trend: 'up',
                  icon: DollarSign,
                  color: 'blue'
                },
                {
                  title: 'Weighted Pipeline',
                  value: `$${weightedPipelineValue.toLocaleString()}`,
                  change: '+8.3%',
                  trend: 'up',
                  icon: Target,
                  color: 'green'
                },
                {
                  title: 'Win Rate',
                  value: `${winRate.toFixed(1)}%`,
                  change: '+3.2%',
                  trend: 'up',
                  icon: TrendingUp,
                  color: 'purple'
                },
                {
                  title: 'Avg Deal Size',
                  value: `$${avgDealSize.toLocaleString()}`,
                  change: '-5.4%',
                  trend: 'down',
                  icon: BarChart3,
                  color: 'orange'
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-900/20`}>
                      <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipeline Funnel */}
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Pipeline Funnel
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="#fff" style={{ fontSize: '14px', fontWeight: 'bold' }} />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>

              {/* Industry Performance */}
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Industry Group Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                    <RechartsPieChart dataKey="value" data={industryPerformance} cx="50%" cy="50%" outerRadius={80}>
                      {industryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Trends */}
              <div className="lg:col-span-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Monthly Pipeline Trends
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : name === 'opportunities' ? 'Opportunities' : 'Jobs'
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="opportunities"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Opportunities"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="jobs"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      name="Jobs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Industry Group Performance Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Industry Group</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Total Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Deal Count</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Deal Size</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryPerformance.map((group, index) => (
                      <tr key={group.name} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          ${group.value.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {group.count}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          ${group.count > 0 ? Math.round(group.value / group.count).toLocaleString() : '0'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${Math.min((group.value / Math.max(...industryPerformance.map(g => g.value))) * 100, 100)}%`,
                                  backgroundColor: group.color 
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {Math.round((group.value / Math.max(...industryPerformance.map(g => g.value))) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;