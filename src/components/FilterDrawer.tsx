import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useUsers } from '../hooks/useSupabaseQuery';
import { OPPORTUNITY_STAGES, JOB_STAGES, INDUSTRY_GROUPS } from '../constants';
import type { FilterState } from '../types';

export const FilterDrawer: React.FC = () => {
  const {
    isFilterDrawerOpen,
    setFilterDrawerOpen,
    filters,
    setFilters,
    clearFilters,
  } = useStore();

  const { data: clientLeadersData } = useUsers({ role: 'client_leader' });
  const clientLeaders = clientLeadersData?.data || [];

  const allStages = [...OPPORTUNITY_STAGES, ...JOB_STAGES];

  const toggleArrayValue = (
    key: keyof Pick<FilterState, 'client_leaders' | 'industry_groups' | 'stages'>,
    value: string
  ) => {
    const current = (filters as any)[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [key]: updated } as Partial<FilterState>);
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setFilters({ date_range: { ...filters.date_range, [field]: value } });
  };

  return (
    <AnimatePresence>
      {isFilterDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-gray-900 w-80 max-w-full h-full p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search_query}
                  onChange={(e) => setFilters({ search_query: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Leaders</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {clientLeaders.map((user: any) => (
                    <label key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-blue-600"
                        checked={filters.client_leaders.includes(user.id)}
                        onChange={() => toggleArrayValue('client_leaders', user.id)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {user.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry Groups</h3>
                <div className="space-y-1">
                  {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-blue-600"
                        checked={filters.industry_groups.includes(key)}
                        onChange={() => toggleArrayValue('industry_groups', key)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {group.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stages</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {allStages.map((stage) => (
                    <label key={stage.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-blue-600"
                        checked={filters.stages.includes(stage.id)}
                        onChange={() => toggleArrayValue('stages', stage.id)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {stage.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.date_range.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    value={filters.date_range.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
