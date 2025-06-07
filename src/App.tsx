import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/ui/CommandPalette';
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { DualPipelineView } from './components/pipeline/DualPipelineView';

// Mock data for development
const mockMetrics = {
  total_pipeline_value: 2450000,
  weighted_pipeline_value: 1680000,
  active_opportunities: 24,
  active_jobs: 18,
  win_rate: 68.5,
  avg_deal_size: 125000,
  conversion_rate: 75.0,
  pipeline_velocity: 45
};

const mockOpportunities = [
  {
    id: '1',
    name: 'TechCorp Digital Transformation',
    account_id: 'FSI',
    value: 450000,
    stage: 'exploration' as const,
    probability: 25,
    client_leader_id: '1',
    expected_confirmation_date: '2024-03-15',
    created_at: '2024-01-15',
    updated_at: '2024-01-20',
    notes: 'Initial discovery meeting scheduled',
    source: 'referral',
    competitor: 'Accenture'
  },
  {
    id: '2',
    name: 'RetailCorp E-commerce Platform',
    account_id: 'Consumer',
    value: 320000,
    stage: 'ready_for_proposal' as const,
    probability: 60,
    client_leader_id: '2',
    expected_confirmation_date: '2024-02-28',
    created_at: '2024-01-10',
    updated_at: '2024-01-25',
    notes: 'RFP received, proposal in progress',
    source: 'website'
  }
];

const mockJobs = [
  {
    id: '1',
    job_code: 'TCH2024001',
    name: 'TechCorp Digital Transformation - Phase 1',
    opportunity_id: '2',
    account_id: 'Consumer',
    value: 320000,
    stage: 'proposal_sent' as const,
    project_status: 'to_be_started' as const,
    client_leader_id: '2',
    expected_confirmation_date: '2024-02-28',
    project_start_date: '2024-03-01',
    project_end_date: '2024-08-31',
    created_at: '2024-01-25',
    updated_at: '2024-01-26',
    notes: 'Proposal submitted, awaiting client feedback',
    priority: 'high' as const,
    auto_closed: false
  }
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const { theme, sidebarOpen } = useStore();
  
  useKeyboardShortcuts();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleCreateOpportunity = () => {
    console.log('Create opportunity');
  };

  const handleCreateJob = () => {
    console.log('Create job');
  };

  const handleEditOpportunity = (opportunity: any) => {
    console.log('Edit opportunity:', opportunity);
  };

  const handleEditJob = (job: any) => {
    console.log('Edit job:', job);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />
      <CommandPalette />
      
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      } pt-6`}>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MetricsGrid metrics={mockMetrics} />
            
            <DualPipelineView
              opportunities={mockOpportunities}
              jobs={mockJobs}
              onCreateOpportunity={handleCreateOpportunity}
              onCreateJob={handleCreateJob}
              onEditOpportunity={handleEditOpportunity}
              onEditJob={handleEditJob}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;