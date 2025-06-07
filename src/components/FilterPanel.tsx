import React from 'react';
import { X } from 'lucide-react';
import { ClientLeader, DateRange } from '../utils/types';

interface FilterPanelProps {
  showFilters: boolean;
  clientLeaders: ClientLeader[];
  selectedClientLeaders: number[];
  dateRange: DateRange;
  onClientLeadersChange: (leaders: number[]) => void;
  onDateRangeChange: (range: DateRange) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  showFilters,
  clientLeaders,
  selectedClientLeaders,
  dateRange,
  onClientLeadersChange,
  onDateRangeChange,
  onClearFilters
}) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client Leaders</label>
          <select 
            multiple
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            value={selectedClientLeaders.map(id => id.toString())}
            onChange={(e) => onClientLeadersChange(Array.from(e.target.selectedOptions, option => parseInt(option.value)))}
          >
            {clientLeaders.map(leader => (
              <option key={leader.id} value={leader.id}>{leader.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input 
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input 
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
          />
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={onClearFilters}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;