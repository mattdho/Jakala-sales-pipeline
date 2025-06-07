import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Target, Briefcase, TrendingUp, 
  Clock, Users, Award, AlertCircle 
} from 'lucide-react';
import type { PipelineMetrics } from '../../types';

interface MetricsGridProps {
  metrics: PipelineMetrics;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const metricCards: MetricCard[] = [
    {
      id: 'pipeline-value',
      title: 'Total Pipeline Value',
      value: `$${metrics.total_pipeline_value.toLocaleString()}`,
      change: 12.5,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'blue',
      description: 'Total value of all active opportunities and jobs'
    },
    {
      id: 'weighted-value',
      title: 'Weighted Pipeline',
      value: `$${metrics.weighted_pipeline_value.toLocaleString()}`,
      change: 8.3,
      icon: <Target className="h-6 w-6" />,
      color: 'green',
      description: 'Pipeline value weighted by probability'
    },
    {
      id: 'active-opportunities',
      title: 'Active Opportunities',
      value: metrics.active_opportunities,
      change: -2.1,
      icon: <Briefcase className="h-6 w-6" />,
      color: 'purple',
      description: 'Opportunities in exploration or ready for proposal'
    },
    {
      id: 'active-jobs',
      title: 'Active Jobs',
      value: metrics.active_jobs,
      change: 15.7,
      icon: <Clock className="h-6 w-6" />,
      color: 'orange',
      description: 'Jobs in proposal, negotiation, or backlog'
    },
    {
      id: 'win-rate',
      title: 'Win Rate',
      value: `${metrics.win_rate.toFixed(1)}%`,
      change: 3.2,
      icon: <Award className="h-6 w-6" />,
      color: 'emerald',
      description: 'Percentage of closed opportunities won'
    },
    {
      id: 'avg-deal-size',
      title: 'Avg Deal Size',
      value: `$${metrics.avg_deal_size.toLocaleString()}`,
      change: -5.4,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'indigo',
      description: 'Average value of all deals'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: `${metrics.conversion_rate.toFixed(1)}%`,
      change: 7.8,
      icon: <Users className="h-6 w-6" />,
      color: 'pink',
      description: 'Rate of opportunities converting to jobs'
    },
    {
      id: 'pipeline-velocity',
      title: 'Pipeline Velocity',
      value: `${metrics.pipeline_velocity.toFixed(0)} days`,
      change: -12.3,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'red',
      description: 'Average time from opportunity to close'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses(metric.color)}`}>
              {metric.icon}
            </div>
            {metric.change !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                metric.change > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  metric.change < 0 ? 'rotate-180' : ''
                }`} />
                {Math.abs(metric.change)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {metric.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};