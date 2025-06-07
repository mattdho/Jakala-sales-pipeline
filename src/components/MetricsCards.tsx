import React from 'react';
import { DollarSign, Briefcase, Target, TrendingUp } from 'lucide-react';
import { Metrics } from '../utils/types';

interface MetricsCardsProps {
  metrics: Metrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">${metrics.pipelineValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Weighted by probability</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Deals</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.dealCount}</p>
            <p className="text-xs text-gray-500 mt-1">Across all stages</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <Briefcase className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Closed deals only</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Deal Size</p>
            <p className="text-2xl font-bold text-gray-900">${metrics.avgDealSize.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Current pipeline</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;