import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, MoreHorizontal } from 'lucide-react';
import { OPPORTUNITY_STAGES, JOB_STAGES, INDUSTRY_GROUPS } from '../../constants';
import type { Opportunity, Job } from '../../types';

interface KanbanViewProps {
  opportunities: Opportunity[];
  jobs: Job[];
  onCreateOpportunity: () => void;
  onCreateJob: () => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onEditJob: (job: Job) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  opportunities,
  jobs,
  onCreateOpportunity,
  onCreateJob,
  onEditOpportunity,
  onEditJob
}) => {
  const renderOpportunityCard = (opportunity: Opportunity) => {
    const stage = OPPORTUNITY_STAGES.find(s => s.id === opportunity.stage);
    const industryGroup = INDUSTRY_GROUPS[opportunity.account_id as keyof typeof INDUSTRY_GROUPS];
    
    return (
      <motion.div
        key={opportunity.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group"
        onClick={() => onEditOpportunity(opportunity)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
              {opportunity.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {opportunity.account_id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: industryGroup?.color || '#6B7280' }}
            />
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${opportunity.value.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {opportunity.probability}%
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Close: {new Date(opportunity.expected_confirmation_date).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium`}
              style={{ 
                backgroundColor: stage?.color + '20', 
                color: stage?.color 
              }}
            >
              {stage?.name}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderJobCard = (job: Job) => {
    const stage = JOB_STAGES.find(s => s.id === job.stage);
    const industryGroup = INDUSTRY_GROUPS[job.account_id as keyof typeof INDUSTRY_GROUPS];
    
    return (
      <motion.div
        key={job.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group"
        onClick={() => onEditJob(job)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
              {job.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {job.job_code}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: industryGroup?.color || '#6B7280' }}
            />
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${job.value.toLocaleString()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium`}
              style={{ 
                backgroundColor: stage?.color + '20', 
                color: stage?.color 
              }}
            >
              {stage?.name}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Start: {job.project_start_date ? new Date(job.project_start_date).toLocaleDateString() : 'TBD'}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                job.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {job.priority}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Opportunities Pipeline */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Opportunities Pipeline
          </h2>
          <button
            onClick={onCreateOpportunity}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Opportunity</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OPPORTUNITY_STAGES.map((stage) => {
            const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id);
            const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
            
            return (
              <div key={stage.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {stage.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {stageOpportunities.length}
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
                
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  ${stageValue.toLocaleString()}
                </div>
                
                <div className="space-y-3 min-h-[200px]">
                  {stageOpportunities.map(renderOpportunityCard)}
                  
                  <button
                    onClick={onCreateOpportunity}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Opportunity</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Arrow */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
          <span className="text-sm font-medium">Auto-creates Job when Ready for Proposal</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Jobs Pipeline */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Jobs Pipeline
          </h2>
          <button
            onClick={onCreateJob}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Job</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {JOB_STAGES.map((stage) => {
            const stageJobs = jobs.filter(job => job.stage === stage.id);
            const stageValue = stageJobs.reduce((sum, job) => sum + job.value, 0);
            
            return (
              <div key={stage.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {stage.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {stageJobs.length}
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
                
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  ${stageValue.toLocaleString()}
                </div>
                
                <div className="space-y-3 min-h-[200px]">
                  {stageJobs.map(renderJobCard)}
                  
                  <button
                    onClick={onCreateJob}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Job</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};