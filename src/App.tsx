import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, DollarSign, Filter, Download, Upload, 
  Settings, Search, Plus, Menu, Home, Save, BarChart3, 
  Briefcase, Eye, EyeOff
} from 'lucide-react';

// Import components
import MetricsCards from './components/MetricsCards';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import ClientLeadersView from './components/ClientLeadersView';
import DealModal from './components/DealModal';
import ClientLeaderModal from './components/ClientLeaderModal';
import FilterPanel from './components/FilterPanel';

// Import utilities
import { Deal, ClientLeader, DashboardData, ChartData, Metrics, DateRange } from './utils/types';
import { INDUSTRY_GROUPS, PIPELINE_STAGES } from './utils/constants';
import { generateMockData } from './utils/dataGenerator';
import { exportToCSV, importFromCSV, downloadCSVTemplate, backupData } from './utils/dataUtils';

const JakalaSalesDashboard: React.FC = () => {
  // State management
  const [data, setData] = useState<DashboardData>(() => {
    const savedData = localStorage.getItem('jakalaData');
    return savedData ? JSON.parse(savedData) : generateMockData();
  });
  
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedIndustryGroups, setSelectedIndustryGroups] = useState<string[]>([]);
  const [selectedClientLeaders, setSelectedClientLeaders] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [editingDeal, setEditingDeal] = useState<Deal | Partial<Deal> | null>(null);
  const [editingClientLeader, setEditingClientLeader] = useState<ClientLeader | Partial<ClientLeader> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [theme, setTheme] = useState('light');

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jakalaData', JSON.stringify(data));
  }, [data]);

  // Filtered data based on current filters
  const filteredDeals = useMemo(() => {
    let filtered = [...data.deals];
    
    if (selectedIndustryGroups.length > 0) {
      filtered = filtered.filter(deal => selectedIndustryGroups.includes(deal.industryGroup));
    }
    
    if (selectedClientLeaders.length > 0) {
      filtered = filtered.filter(deal => selectedClientLeaders.includes(deal.clientLeaderId));
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(deal => new Date(deal.createdDate) >= new Date(dateRange.start));
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(deal => new Date(deal.createdDate) <= new Date(dateRange.end));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(deal => 
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [data.deals, selectedIndustryGroups, selectedClientLeaders, dateRange, searchQuery]);

  // Calculate metrics
  const metrics: Metrics = useMemo(() => {
    const totalRevenue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealSize = filteredDeals.length > 0 ? totalRevenue / filteredDeals.length : 0;
    const wonDeals = filteredDeals.filter(deal => deal.stage === 'Closed Won');
    const lostDeals = filteredDeals.filter(deal => deal.stage === 'Closed Lost');
    const winRate = (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 || 0;
    const pipelineValue = filteredDeals
      .filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    
    return { totalRevenue, avgDealSize, winRate, pipelineValue, dealCount: filteredDeals.length };
  }, [filteredDeals]);

  // Chart data preparation
  const chartData: ChartData = useMemo(() => {
    const funnelData = PIPELINE_STAGES.map(stage => ({
      name: stage,
      value: filteredDeals.filter(deal => deal.stage === stage).length,
      fill: stage === 'Closed Won' ? '#10B981' : stage === 'Closed Lost' ? '#EF4444' : '#3B82F6'
    }));

    const revenueByGroup = Object.keys(INDUSTRY_GROUPS).map(group => ({
      name: group,
      revenue: filteredDeals
        .filter(deal => deal.industryGroup === group)
        .reduce((sum, deal) => sum + deal.value, 0)
    }));

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthDeals = filteredDeals.filter(deal => {
        const dealDate = new Date(deal.createdDate);
        return dealDate.getMonth() === date.getMonth() && dealDate.getFullYear() === date.getFullYear();
      });
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        deals: monthDeals.length,
        revenue: monthDeals.reduce((sum, deal) => sum + deal.value, 0)
      });
    }

    return { funnelData, revenueByGroup, monthlyData };
  }, [filteredDeals]);

  // CRUD Operations
  const addDeal = (newDeal: Partial<Deal>) => {
    const deal: Deal = {
      id: Math.max(...data.deals.map(d => d.id), 0) + 1,
      name: newDeal.name || '',
      value: newDeal.value || 0,
      stage: newDeal.stage || 'Lead',
      probability: newDeal.probability || 10,
      clientLeaderId: newDeal.clientLeaderId || data.clientLeaders[0]?.id || 1,
      industryGroup: newDeal.industryGroup || 'HSME',
      createdDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expectedCloseDate: newDeal.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: newDeal.notes || '',
      customFields: newDeal.customFields || {}
    };
    setData(prev => ({ ...prev, deals: [...prev.deals, deal] }));
  };

  const updateDeal = (dealId: number, updates: Partial<Deal>) => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(deal => 
        deal.id === dealId ? { ...deal, ...updates, lastActivity: new Date().toISOString() } : deal
      )
    }));
  };

  const deleteDeal = (dealId: number) => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.filter(deal => deal.id !== dealId)
    }));
  };

  const addClientLeader = (newLeader: Partial<ClientLeader>) => {
    const leader: ClientLeader = {
      id: Math.max(...data.clientLeaders.map(cl => cl.id), 0) + 1,
      name: newLeader.name || '',
      email: newLeader.email || '',
      groups: newLeader.groups || [],
      avatar: newLeader.avatar || '👤'
    };
    setData(prev => ({ ...prev, clientLeaders: [...prev.clientLeaders, leader] }));
  };

  const updateClientLeader = (leaderId: number, updates: Partial<ClientLeader>) => {
    setData(prev => ({
      ...prev,
      clientLeaders: prev.clientLeaders.map(leader => 
        leader.id === leaderId ? { ...leader, ...updates } : leader
      )
    }));
  };

  const deleteClientLeader = (leaderId: number) => {
    setData(prev => ({
      ...prev,
      clientLeaders: prev.clientLeaders.filter(leader => leader.id !== leaderId),
      deals: prev.deals.filter(deal => deal.clientLeaderId !== leaderId)
    }));
  };

  // Handle deal save
  const handleDealSave = (deal: Deal | Partial<Deal>) => {
    if (deal.id) {
      updateDeal(deal.id, deal);
    } else {
      addDeal(deal);
    }
  };

  // Handle client leader save
  const handleClientLeaderSave = (leader: ClientLeader | Partial<ClientLeader>) => {
    if (leader.id) {
      updateClientLeader(leader.id, leader);
    } else {
      addClientLeader(leader);
    }
  };

  // Import function
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const newDeals = importFromCSV(text, data);
          setData(prev => ({ ...prev, deals: [...prev.deals, ...newDeals] }));
          alert(`Successfully imported ${newDeals.length} deals!`);
        } catch (error) {
          alert('Error importing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearFilters = () => {
    setSelectedIndustryGroups([]);
    setSelectedClientLeaders([]);
    setDateRange({ start: '', end: '' });
    setSearchQuery('');
  };

  const renderTopPerformers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
      <div className="space-y-4">
        {data.clientLeaders
          .map(leader => {
            const leaderDeals = data.deals.filter(d => d.clientLeaderId === leader.id);
            const revenue = leaderDeals.reduce((sum, deal) => sum + deal.value, 0);
            return { ...leader, revenue };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map(leader => (
            <div key={leader.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">{leader.avatar}</span>
                <div>
                  <span className="text-sm font-medium text-gray-900">{leader.name}</span>
                  <div className="flex gap-1 mt-1">
                    {leader.groups.slice(0, 2).map(group => (
                      <span 
                        key={group} 
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS].color + '20', 
                          color: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS].color 
                        }}
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">${leader.revenue.toLocaleString()}</span>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jakala Sales Pipeline</h1>
                <p className="text-sm text-gray-600">Comprehensive sales dashboard and analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search deals..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showFilters ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              
              <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="h-5 w-5" />
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
              
              <button 
                onClick={() => exportToCSV(filteredDeals, data.clientLeaders)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setActiveView('settings')}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === 'settings' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-[calc(100vh-89px)] sticky top-[89px]">
            <nav className="p-4 space-y-2">
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                  activeView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Home className="h-4 w-4 mr-3" />
                Dashboard
              </button>
              
              <button 
                onClick={() => setActiveView('pipeline')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                  activeView === 'pipeline' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Pipeline
              </button>
              
              <button 
                onClick={() => setActiveView('clientLeaders')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                  activeView === 'clientLeaders' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 mr-3" />
                Client Leaders
              </button>
              
              <button 
                onClick={() => setActiveView('analytics')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                  activeView === 'analytics' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Analytics
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Industry Groups
                </h3>
                {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (selectedIndustryGroups.includes(key)) {
                        setSelectedIndustryGroups(selectedIndustryGroups.filter(g => g !== key));
                      } else {
                        setSelectedIndustryGroups([...selectedIndustryGroups, key]);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${
                      selectedIndustryGroups.includes(key) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="truncate">{key}</span>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }}></div>
                  </button>
                ))}
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <FilterPanel 
            showFilters={showFilters}
            clientLeaders={data.clientLeaders}
            selectedClientLeaders={selectedClientLeaders}
            dateRange={dateRange}
            onClientLeadersChange={setSelectedClientLeaders}
            onDateRangeChange={setDateRange}
            onClearFilters={clearFilters}
          />

          {/* Content based on active view */}
          {activeView === 'dashboard' && (
            <>
              <MetricsCards metrics={metrics} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Overview</h3>
                    <KanbanBoard 
                      deals={filteredDeals} 
                      clientLeaders={data.clientLeaders} 
                      onEditDeal={setEditingDeal} 
                    />
                  </div>
                </div>
                <div>
                  {renderTopPerformers()}
                </div>
              </div>
            </>
          )}

          {activeView === 'pipeline' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pipeline Management</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Kanban
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
              
              {viewMode === 'kanban' ? (
                <KanbanBoard 
                  deals={filteredDeals} 
                  clientLeaders={data.clientLeaders} 
                  onEditDeal={setEditingDeal} 
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deal</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Leader</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected Close</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDeals.map(deal => {
                        const leader = data.clientLeaders.find(cl => cl.id === deal.clientLeaderId);
                        return (
                          <tr 
                            key={deal.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setEditingDeal(deal)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{deal.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${deal.value.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                deal.stage === 'Closed Won' ? 'bg-green-100 text-green-700' :
                                deal.stage === 'Closed Lost' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {deal.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{leader?.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(deal.expectedCloseDate).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeView === 'clientLeaders' && (
            <ClientLeadersView 
              clientLeaders={data.clientLeaders}
              deals={data.deals}
              onEditClientLeader={setEditingClientLeader}
              onDeleteClientLeader={deleteClientLeader}
            />
          )}
          
          {activeView === 'analytics' && <Analytics chartData={chartData} />}

          {activeView === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings & Customization</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'light' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => backupData(data)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Backup Data
                    </button>
                    
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center w-fit cursor-pointer shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Data
                      <input 
                        type="file" 
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              try {
                                const restoredData = JSON.parse(e.target?.result as string);
                                setData(restoredData);
                                alert('Data restored successfully!');
                              } catch (error) {
                                alert('Error restoring data. Please check the file format.');
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                    
                    <button 
                      onClick={() => {
                        if (confirm('This will reset all data to default. Are you sure?')) {
                          setData(generateMockData());
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Reset to Default Data
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Import Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download this template to see the required format for importing deals via CSV.
                  </p>
                  <button 
                    onClick={downloadCSVTemplate}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Download CSV Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <DealModal 
        deal={editingDeal}
        clientLeaders={data.clientLeaders}
        onSave={handleDealSave}
        onClose={() => setEditingDeal(null)}
      />
      
      <ClientLeaderModal 
        clientLeader={editingClientLeader}
        onSave={handleClientLeaderSave}
        onClose={() => setEditingClientLeader(null)}
      />
    </div>
  );
};

export default JakalaSalesDashboard;