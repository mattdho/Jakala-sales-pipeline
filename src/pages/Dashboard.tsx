import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  useOpportunities,
  useJobs,
  useOpportunityMetrics,
  useJobMetrics
} from '../hooks/useSupabaseQuery';

import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { CommandPalette } from '../components/ui/CommandPalette';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { PipelineView } from '../components/pipeline/PipelineView';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OpportunityModal } from '../components/modals/OpportunityModal';
import { JobModal } from '../components/modals/JobModal';

const Dashboard: React.FC = () => {
  const {
    theme,
    sidebarOpen,
    filters,
    setOpportunityModalOpen,
    setEditingOpportunity,
    setJobModalOpen,
    setEditingJob,
    metrics,
    setMetrics
  } = useStore();

  useKeyboardShortcuts();

  const { data: opportunitiesData, isLoading: opportunitiesLoading, error: opportunitiesError } = useOpportunities(filters);
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useJobs(filters);
  const { data: opportunityMetrics } = useOpportunityMetrics();
  const { data: jobMetrics } = useJobMetrics();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleCreateOpportunity = () => {
    setEditingOpportunity(null);
    setOpportunityModalOpen(true);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setJobModalOpen(true);
  };

  const handleEditOpportunity = (opportunity: any) => {
    setEditingOpportunity(opportunity);
    setOpportunityModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  const combinedMetrics = {
    total_pipeline_value: (opportunityMetrics?.data?.total_pipeline_value || 0) + (jobMetrics?.data?.total_job_value || 0),
    weighted_pipeline_value: opportunityMetrics?.data?.weighted_pipeline_value || 0,
    active_opportunities: opportunityMetrics?.data?.total_opportunities || 0,
    active_jobs: jobMetrics?.data?.active_jobs || 0,
    win_rate: opportunityMetrics?.data?.win_rate || 0,
    avg_deal_size: opportunityMetrics?.data?.avg_deal_size || 0,
    conversion_rate: 75.0,
    pipeline_velocity: 45
  };

  useEffect(() => {
    setMetrics(combinedMetrics);
  }, [
    opportunityMetrics?.data?.total_pipeline_value,
    jobMetrics?.data?.total_job_value,
    opportunityMetrics?.data?.weighted_pipeline_value,
    opportunityMetrics?.data?.total_opportunities,
    jobMetrics?.data?.active_jobs,
    opportunityMetrics?.data?.win_rate,
    opportunityMetrics?.data?.avg_deal_size
  ]);

  const isLoading = opportunitiesLoading || jobsLoading;
  const hasError = opportunitiesError || jobsError;

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Loading Error</h2>
            <p className="text-gray-600 mb-4">
              {opportunitiesError?.error || jobsError?.error || 'Failed to load data'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />
      <CommandPalette />
      <OpportunityModal />
      <JobModal />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-6`}>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <MetricsGrid metrics={metrics || combinedMetrics} />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <PipelineView
                opportunities={opportunitiesData?.data || []}
                jobs={jobsData?.data || []}
                onCreateOpportunity={handleCreateOpportunity}
                onCreateJob={handleCreateJob}
                onEditOpportunity={handleEditOpportunity}
                onEditJob={handleEditJob}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
