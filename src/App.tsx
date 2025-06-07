import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AuthProvider } from './components/auth/AuthProvider';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Jobs from './pages/Jobs';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Accounts from './pages/Accounts';
import Documents from './pages/Documents';
import SettingsPage from './pages/Settings';
import DataImport from './pages/DataImport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/team" element={<Team />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/data-import" element={<DataImport />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;