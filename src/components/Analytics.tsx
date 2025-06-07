import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { ChartData } from '../utils/types';

interface AnalyticsProps {
  chartData: ChartData;
}

const Analytics: React.FC<AnalyticsProps> = ({ chartData }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip 
              formatter={(value, name) => [`${value} deals`, name]}
              labelStyle={{ color: '#374151' }}
            />
            <Funnel dataKey="value" data={chartData.funnelData} isAnimationActive>
              <LabelList position="center" fill="#fff" style={{ fontSize: '14px', fontWeight: 'bold' }} />
              {chartData.funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Industry Group</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.revenueByGroup}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              style={{ fontSize: '12px' }}
              stroke="#6b7280"
            />
            <YAxis 
              style={{ fontSize: '12px' }}
              stroke="#6b7280"
              tickFormatter={(value) => `$${(value / 1000)}K`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="month" 
              style={{ fontSize: '12px' }}
              stroke="#6b7280"
            />
            <YAxis 
              yAxisId="left" 
              style={{ fontSize: '12px' }}
              stroke="#6b7280"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              style={{ fontSize: '12px' }}
              stroke="#6b7280"
              tickFormatter={(value) => `$${(value / 1000)}K`}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Deal Count'
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="deals" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              name="Deal Count"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;