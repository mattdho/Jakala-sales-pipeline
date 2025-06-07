import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Save, Eye, Settings, Filter, BarChart3, 
  PieChart, LineChart, Table, Calendar, Users,
  DragDropContext, Droppable, Draggable
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'filter';
  title: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  filters: any[];
  permissions: string[];
  isPublic: boolean;
}

export const DashboardBuilder: React.FC = () => {
  const { theme } = useStore();
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<DashboardConfig | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const widgetTypes = [
    { id: 'metric', name: 'Metric Card', icon: BarChart3, description: 'Display key performance indicators' },
    { id: 'chart', name: 'Chart', icon: PieChart, description: 'Visualize data with various chart types' },
    { id: 'table', name: 'Data Table', icon: Table, description: 'Show detailed data in table format' },
    { id: 'filter', name: 'Filter Panel', icon: Filter, description: 'Add interactive filters' }
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'area', name: 'Area Chart', icon: BarChart3 }
  ];

  const createNewDashboard = () => {
    const newDashboard: DashboardConfig = {
      id: `dashboard_${Date.now()}`,
      name: 'New Dashboard',
      description: 'Custom dashboard',
      widgets: [],
      filters: [],
      permissions: ['admin'],
      isPublic: false
    };
    setDashboards(prev => [...prev, newDashboard]);
    setActiveDashboard(newDashboard);
    setIsBuilderMode(true);
  };

  const addWidget = (type: string) => {
    if (!activeDashboard) return;

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type: type as any,
      title: `New ${type}`,
      config: getDefaultConfig(type),
      position: { x: 0, y: 0, w: 4, h: 3 }
    };

    setActiveDashboard(prev => prev ? {
      ...prev,
      widgets: [...prev.widgets, newWidget]
    } : null);
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'metric':
        return {
          dataSource: 'opportunities',
          metric: 'count',
          title: 'Total Opportunities',
          format: 'number'
        };
      case 'chart':
        return {
          chartType: 'bar',
          dataSource: 'opportunities',
          xAxis: 'stage',
          yAxis: 'value',
          aggregation: 'sum'
        };
      case 'table':
        return {
          dataSource: 'opportunities',
          columns: ['name', 'value', 'stage', 'client_leader'],
          pageSize: 10
        };
      case 'filter':
        return {
          filterType: 'dropdown',
          field: 'stage',
          label: 'Stage Filter'
        };
      default:
        return {};
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const isSelected = selectedWidget === widget.id;
    
    return (
      <motion.div
        key={widget.id}
        layout
        className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border-2 transition-all duration-200 p-4 ${
          isSelected 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={() => setSelectedWidget(widget.id)}
        style={{
          gridColumn: `span ${widget.position.w}`,
          gridRow: `span ${widget.position.h}`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
          {isBuilderMode && (
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <Settings className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
        
        <div className="h-full">
          {widget.type === 'metric' && (
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sample Metric</div>
            </div>
          )}
          
          {widget.type === 'chart' && (
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart Preview</span>
            </div>
          )}
          
          {widget.type === 'table' && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          )}
          
          {widget.type === 'filter' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {widget.config.label}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <option>All Options</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Builder</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and customize interactive dashboards
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBuilderMode(!isBuilderMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isBuilderMode
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isBuilderMode ? <Eye className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {isBuilderMode ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={createNewDashboard}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Dashboard</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widget Palette */}
          {isBuilderMode && (
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Widget Library
                </h3>
                <div className="space-y-3">
                  {widgetTypes.map(widget => (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <widget.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {widget.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {widget.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedWidget && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Widget Settings
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Widget title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Source
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white">
                          <option value="opportunities">Opportunities</option>
                          <option value="jobs">Jobs</option>
                          <option value="accounts">Accounts</option>
                          <option value="users">Users</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dashboard Canvas */}
          <div className={isBuilderMode ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {activeDashboard ? (
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {activeDashboard.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {activeDashboard.description}
                      </p>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Save Dashboard</span>
                    </button>
                  </div>

                  {activeDashboard.widgets.length > 0 ? (
                    <div className="grid grid-cols-12 gap-4 auto-rows-min">
                      {activeDashboard.widgets.map(renderWidget)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Empty Dashboard
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Add widgets from the library to get started
                      </p>
                      {!isBuilderMode && (
                        <button
                          onClick={() => setIsBuilderMode(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Building
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Dashboard Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create a new dashboard or select an existing one to get started
                </p>
                <button
                  onClick={createNewDashboard}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};