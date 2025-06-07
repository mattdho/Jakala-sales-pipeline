import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, FilterState, ViewMode, PipelineMetrics, Opportunity, Job } from '../types';

interface AppState {
  // User & Auth
  user: User | null;
  setUser: (user: User | null) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Filters Drawer
  isFilterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;

  // Notifications Panel
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  
  // Modal State
  isOpportunityModalOpen: boolean;
  setOpportunityModalOpen: (open: boolean) => void;
  editingOpportunity: Opportunity | null;
  setEditingOpportunity: (opportunity: Opportunity | null) => void;
  
  isJobModalOpen: boolean;
  setJobModalOpen: (open: boolean) => void;
  editingJob: Job | null;
  setEditingJob: (job: Job | null) => void;
  
  // View State
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  
  // Metrics
  metrics: PipelineMetrics | null;
  setMetrics: (metrics: PipelineMetrics) => void;
  
  // Loading States
  loading: {
    opportunities: boolean;
    jobs: boolean;
    metrics: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

const initialFilters: FilterState = {
  client_leaders: [],
  industry_groups: [],
  stages: [],
  date_range: { start: '', end: '' },
  search_query: ''
};

const initialViewMode: ViewMode = {
  type: 'kanban',
  entity: 'both'
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User & Auth
      user: null,
      setUser: (user) => set({ user }),
      
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

      isFilterDrawerOpen: false,
      setFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),

      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (notificationsPanelOpen) => set({ notificationsPanelOpen }),
      
      // Modal State
      isOpportunityModalOpen: false,
      setOpportunityModalOpen: (isOpportunityModalOpen) => set({ isOpportunityModalOpen }),
      editingOpportunity: null,
      setEditingOpportunity: (editingOpportunity) => set({ editingOpportunity }),
      
      isJobModalOpen: false,
      setJobModalOpen: (isJobModalOpen) => set({ isJobModalOpen }),
      editingJob: null,
      setEditingJob: (editingJob) => set({ editingJob }),
      
      // View State
      viewMode: initialViewMode,
      setViewMode: (viewMode) => set({ viewMode }),
      
      // Filters
      filters: initialFilters,
      setFilters: (newFilters) => set({ 
        filters: { ...get().filters, ...newFilters } 
      }),
      clearFilters: () => set({ filters: initialFilters }),
      
      // Metrics
      metrics: null,
      setMetrics: (metrics) => set({ metrics }),
      
      // Loading States
      loading: {
        opportunities: false,
        jobs: false,
        metrics: false
      },
      setLoading: (key, value) => set({ 
        loading: { ...get().loading, [key]: value } 
      })
    }),
    {
      name: 'jakala-pipeline-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
        filters: state.filters
      })
    }
  )
);