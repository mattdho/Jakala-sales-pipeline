import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, LineChart, Table, Filter, 
  Download, Save, Plus, Settings, Trash2, Copy,
  Calendar, Users, Building, Briefcase, ArrowRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'bar' | 'line' | 'pie' | 'table';
  dataSource: 'opportunities' | 'jobs' | 'accounts' | 'users';
  dimensions: string[];
  measures: string[];
  filters: any[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

export const ReportBuilder: React.FC = () => {
  const { theme } = useStore();
  const [activeReport, setActiveReport] = useState<ReportConfig | null>(null);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportion of a whole' },
    { id: 'table', name: 'Data Table', icon: Table, description: 'Display detailed data in rows and columns' }
  ];

  const dataSources = [
    { id: 'opportunities', name: 'Opportunities', icon: Building, description: 'Sales pipeline data' },
    { id: 'jobs', name: 'Jobs', icon: Briefcase, description: 'Project execution data' },
    { id: 'accounts', name: 'Accounts', icon: Building, description: 'Client account information' },
    { id: 'users', name: 'Users', icon: Users, description: 'Team member data' }
  ];

  const dimensions = {
    opportunities: [
      { id: 'stage', name: 'Stage' },
      { id: 'client_leader_id', name: 'Client Leader' },
      { id: 'account_id', name: 'Account' },
      { id: 'created_at', name: 'Creation Date' },
      { id: 'expected_confirmation_date', name: 'Expected Close Date' }
    ],
    jobs: [
      { id: 'stage', name: 'Stage' },
      { id: 'project_status', name: 'Project Status' },
      { id: 'priority', name: 'Priority' },
      { id: 'client_leader_id', name: 'Client Leader' },
      { id: 'account_id', name: 'Account' },
      { id: 'project_start_date', name: 'Start Date' },
      { id: 'project_end_date', name: 'End Date' }
    ],
    accounts: [
      { id: 'industry', name: 'Industry' },
      { id: 'industry_group', name: 'Industry Group' },
      { id: 'account_owner_id', name: 'Account Owner' },
      { id: 'created_at', name: 'Creation Date' }
    ],
    users: [
      { id: 'role', name: 'Role' },
      { id: 'industry_groups', name: 'Industry Groups' },
      { id: 'created_at', name: 'Creation Date' }
    ]
  };

  const measures = {
    opportunities: [
      { id: 'count', name: 'Count' },
      { id: 'value', name: 'Value' },
      { id: 'probability', name: 'Probability' },
      { id: 'weighted_value', name: 'Weighted Value' }
    ],
    jobs: [
      { id: 'count', name: 'Count' },
      { id: 'value', name: 'Value' }
    ],
    accounts: [
      { id: 'count', name: 'Count' }
    ],
    users: [
      { id: 'count', name: 'Count' }
    ]
  };

  const createNewReport = () => {
    const newReport: ReportConfig = {
      id: `report_${Date.now()}`,
      name: 'New Report',
      description: '',
      type: 'bar',
      dataSource: 'opportunities',
      dimensions: [],
      measures: ['count'],
      filters: []
    };
    
    setActiveReport(newReport);
    setIsEditing(true);
  };

  const saveReport = () => {
    if (!activeReport) return;
    
    const reportIndex = savedReports.findIndex(r => r.id === activeReport.id);
    if (reportIndex >= 0) {
      // Update existing report
      const updatedReports = [...savedReports];
      updatedReports[reportIndex] = activeReport;
      setSavedReports(updatedReports);
    } else {
      // Add new report
      setSavedReports([...savedReports, activeReport]);
    }
    
    setIsEditing(false);
  };

  const duplicateReport = (report: ReportConfig) => {
    const duplicatedReport = {
      ...report,
      id: `report_${Date.now()}`,
      name: `${report.name} (Copy)`,
    };
    
    setSavedReports([...savedReports, duplicatedReport]);
  };

  const deleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(r => r.id !== reportId));
    if (activeReport?.id === reportId) {
      setActiveReport(null);
      setIsEditing(false);
    }
  };

  const renderReportPreview = () => {
    if (!activeReport) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeReport.name || 'Untitled Report'}
            </h3>
            {activeReport.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeReport.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {activeReport.type === 'bar' && <BarChart3 className="h-12 w-12 text-gray-400" />}
          {activeReport.type === 'line' && <LineChart className="h-12 w-12 text-gray-400" />}
          {activeReport.type === 'pie' && <PieChart className="h-12 w-12 text-gray-400" />}
          {activeReport.type === 'table' && <Table className="h-12 w-12 text-gray-400" />}
          <span className="ml-3 text-gray-500">Report Preview</span>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Data Source:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">
                {activeReport.dataSource}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Chart Type:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">
                {activeReport.type}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {activeReport.dimensions.length > 0 
                  ? activeReport.dimensions.join(', ') 
                  : 'None'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Measures:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {activeReport.measures.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportEditor = () => {
    if (!activeReport) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Report Configuration
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Name
              </label>
              <input
                type="text"
                value={activeReport.name}
                onChange={(e) => setActiveReport({ ...activeReport, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={activeReport.description}
                onChange={(e) => setActiveReport({ ...activeReport, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Optional description"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chart Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {chartTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveReport({ ...activeReport, type: type.id as any })}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    activeReport.type === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <type.icon className={`h-5 w-5 ${
                      activeReport.type === type.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      activeReport.type === type.id
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {type.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Source
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {dataSources.map(source => (
                <button
                  key={source.id}
                  onClick={() => setActiveReport({ 
                    ...activeReport, 
                    dataSource: source.id as any,
                    dimensions: [],
                    measures: ['count']
                  })}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    activeReport.dataSource === source.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <source.icon className={`h-5 w-5 ${
                      activeReport.dataSource === source.id
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      activeReport.dataSource === source.id
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {source.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {source.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dimensions
              </label>
              <select
                multiple
                value={activeReport.dimensions}
                onChange={(e) => setActiveReport({
                  ...activeReport,
                  dimensions: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-32"
              >
                {dimensions[activeReport.dataSource]?.map(dim => (
                  <option key={dim.id} value={dim.id}>{dim.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Measures
              </label>
              <select
                multiple
                value={activeReport.measures}
                onChange={(e) => setActiveReport({
                  ...activeReport,
                  measures: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-32"
              >
                {measures[activeReport.dataSource]?.map(measure => (
                  <option key={measure.id} value={measure.id}>{measure.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filters
            </label>
            <div className="p-4 border border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
              <div className="flex items-center justify-center">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Add Filter</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2 inline-block" />
              Save Report
            </button>
          </div>
        </div>
      </div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Builder</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create custom reports and visualizations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={createNewReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Saved Reports Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Saved Reports
              </h3>
              
              {savedReports.length > 0 ? (
                <div className="space-y-3">
                  {savedReports.map(report => (
                    <div
                      key={report.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        activeReport?.id === report.id && !isEditing
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => {
                        setActiveReport(report);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {report.type === 'bar' && <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                          {report.type === 'line' && <LineChart className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                          {report.type === 'pie' && <PieChart className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                          {report.type === 'table' && <Table className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                          <span className="font-medium text-gray-900 dark:text-white">{report.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReport(report);
                              setIsEditing(true);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Settings className="h-3 w-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateReport(report);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Copy className="h-3 w-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(report.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="capitalize">{report.dataSource}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No saved reports yet
                  </p>
                  <button
                    onClick={createNewReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeReport ? (
              isEditing ? renderReportEditor() : renderReportPreview()
            ) : (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Report Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create a new report or select an existing one to get started
                </p>
                <button
                  onClick={createNewReport}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};