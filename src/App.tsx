import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AuthProvider } from './components/auth/AuthProvider';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import Opportunities from './pages/Opportunities';
import Jobs from './pages/Jobs';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Accounts from './pages/Accounts';
import Documents from './pages/Documents';
import SettingsPage from './pages/Settings';
import DataImport from './pages/DataImport';
import DataImportEnterprise from './pages/DataImportEnterprise';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Enterprise Dashboard as primary interface with deep linking support */}
          <Route path="/" element={<EnterpriseDashboard />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          
          {/* Deep linking routes for industry-specific views */}
          <Route path="/enterprise/overview" element={<EnterpriseDashboard defaultModule="overview" />} />
          <Route path="/enterprise/clients" element={<EnterpriseDashboard defaultModule="clients" />} />
          <Route path="/enterprise/jobs" element={<EnterpriseDashboard defaultModule="jobs" />} />
          <Route path="/enterprise/import" element={<EnterpriseDashboard defaultModule="import" />} />
          <Route path="/enterprise/dashboard" element={<EnterpriseDashboard defaultModule="dashboard" />} />
          <Route path="/enterprise/access" element={<EnterpriseDashboard defaultModule="access" />} />
          
          {/* Industry-specific deep links */}
          <Route path="/enterprise/smba" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="SMBA" />} />
          <Route path="/enterprise/smba/clients" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="SMBA" />} />
          <Route path="/enterprise/smba/jobs" element={<EnterpriseDashboard defaultModule="jobs" filterIndustry="SMBA" />} />
          <Route path="/enterprise/smba/overview" element={<EnterpriseDashboard defaultModule="overview" filterIndustry="SMBA" />} />
          
          <Route path="/enterprise/hsne" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="HSNE" />} />
          <Route path="/enterprise/hsne/clients" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="HSNE" />} />
          <Route path="/enterprise/hsne/jobs" element={<EnterpriseDashboard defaultModule="jobs" filterIndustry="HSNE" />} />
          <Route path="/enterprise/hsne/overview" element={<EnterpriseDashboard defaultModule="overview" filterIndustry="HSNE" />} />
          
          <Route path="/enterprise/dxp" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="DXP" />} />
          <Route path="/enterprise/dxp/clients" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="DXP" />} />
          <Route path="/enterprise/dxp/jobs" element={<EnterpriseDashboard defaultModule="jobs" filterIndustry="DXP" />} />
          <Route path="/enterprise/dxp/overview" element={<EnterpriseDashboard defaultModule="overview" filterIndustry="DXP" />} />
          
          <Route path="/enterprise/tlcg" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="TLCG" />} />
          <Route path="/enterprise/tlcg/clients" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="TLCG" />} />
          <Route path="/enterprise/tlcg/jobs" element={<EnterpriseDashboard defaultModule="jobs" filterIndustry="TLCG" />} />
          <Route path="/enterprise/tlcg/overview" element={<EnterpriseDashboard defaultModule="overview" filterIndustry="TLCG" />} />
          
          <Route path="/enterprise/new-business" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="NEW_BUSINESS" />} />
          <Route path="/enterprise/new-business/clients" element={<EnterpriseDashboard defaultModule="clients" filterIndustry="NEW_BUSINESS" />} />
          <Route path="/enterprise/new-business/jobs" element={<EnterpriseDashboard defaultModule="jobs" filterIndustry="NEW_BUSINESS" />} />
          <Route path="/enterprise/new-business/overview" element={<EnterpriseDashboard defaultModule="overview" filterIndustry="NEW_BUSINESS" />} />
          
          {/* Legacy dashboard accessible via /legacy */}
          <Route path="/legacy" element={<Dashboard />} />
          <Route path="/legacy-enterprise" element={<DataImportEnterprise />} />
          
          {/* Standard operational routes - these now redirect to enterprise versions */}
          <Route path="/opportunities" element={<EnterpriseDashboard defaultModule="jobs" />} />
          <Route path="/jobs" element={<EnterpriseDashboard defaultModule="jobs" />} />
          <Route path="/accounts" element={<EnterpriseDashboard defaultModule="clients" />} />
          
          {/* Standalone pages that remain separate */}
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/team" element={<Team />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/data-import" element={<DataImport />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;