import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, List, Filter, Search, SortAsc, 
  Calendar, User, Building, ArrowUpDown, Eye
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface KanbanListToggleProps {
  view: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: any) => void;
  data: any[];
  columns?: { id: string; title: string; color: string }[];
  filterOptions?: { field: string; label: string; options: any[] }[];
}

export const KanbanListToggle: React.FC<KanbanListToggleProps> = ({
  view,
  onViewChange,
  onFilterChange,
  onSortChange,
  data,
  columns = [],
  filterOptions = []
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Persist filters and sort in localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('kanban-filters');
    const savedSort = localStorage.getItem('kanban-sort');
    
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setActiveFilters(filters);
      onFilterChange(filters);
    }
    
    if (savedSort) {
      const sort = JSON.parse(savedSort);
      setSortBy(sort.field);
      setSortOrder(sort.order);
      onSortChange(sort);
    }
  }, []);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...activeFilters, [field]: value };
    if (!value) {
      delete newFilters[field];
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
    localStorage.setItem('kanban-filters', JSON.stringify(newFilters));
  };

  const handleSortChange = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    const sortConfig = { field, order: newOrder };
    onSortChange(sortConfig);
    localStorage.setItem('kanban-sort', JSON.stringify(sortConfig));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setSortBy('');
    setSortOrder('asc');
    onFilterChange({});
    onSortChange({});
    localStorage.removeItem('kanban-filters');
    localStorage.removeItem('kanban-sort');
  };

  const activeFilterCount = Object.keys(activeFilters).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Tooltip content="Kanban Board View">
              <button
                onClick={() => onViewChange('kanban')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  view === 'kanban'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-sm font-medium">Board</span>
              </button>
            </Tooltip>
            
            <Tooltip content="List View">
              <button
                onClick={() => onViewChange('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  view === 'list'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </Tooltip>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Filter Count */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400"
            >
              <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
              <button
                onClick={clearAllFilters}
                className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* Filter Toggle */}
          <Tooltip content="Advanced Filters">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 rounded-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {activeFilterCount}
                </motion.div>
              )}
            </button>
          </Tooltip>

          {/* View Options */}
          <Tooltip content="View Options">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quick Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort by
                </label>
                <div className="space-y-1">
                  {[
                    { field: 'value', label: 'Value' },
                    { field: 'created_at', label: 'Date Created' },
                    { field: 'stage', label: 'Stage' },
                    { field: 'priority', label: 'Priority' }
                  ].map(option => (
                    <button
                      key={option.field}
                      onClick={() => handleSortChange(option.field)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                        sortBy === option.field
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.field && (
                        <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Filter Options */}
              {filterOptions.map(filter => (
                <div key={filter.field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {filter.label}
                  </label>
                  <select
                    value={activeFilters[filter.field] || ''}
                    onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Data Insights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Stats
                </label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Filtered:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.length} {/* This would be the filtered count */}
                    </span>
                  </div>
                  {view === 'kanban' && columns.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      {columns.map(column => (
                        <div key={column.id} className="flex justify-between text-xs">
                          <span className="text-gray-500">{column.title}:</span>
                          <span className="font-medium">
                            {data.filter(item => item.stage === column.id).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 