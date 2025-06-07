import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Briefcase, Users, BarChart3, Calendar, 
  FileText, Settings, ChevronRight, Target
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { INDUSTRY_GROUPS } from '../../constants';

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { sidebarOpen, viewMode, setViewMode, filters, setFilters } = useStore();
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['main']);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'main',
      name: 'Main',
      icon: <Home className="h-5 w-5" />,
      children: [
        { id: 'dashboard', name: 'Dashboard', icon: <Home className="h-4 w-4" /> },
        { id: 'opportunities', name: 'Opportunities', icon: <Target className="h-4 w-4" />, badge: 12 },
        { id: 'jobs', name: 'Jobs', icon: <Briefcase className="h-4 w-4" />, badge: 8 },
        { id: 'calendar', name: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
        { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> }
      ]
    },
    {
      id: 'management',
      name: 'Management',
      icon: <Users className="h-5 w-5" />,
      children: [
        { id: 'accounts', name: 'Accounts', icon: <Users className="h-4 w-4" /> },
        { id: 'team', name: 'Team', icon: <Users className="h-4 w-4" /> },
        { id: 'documents', name: 'Documents', icon: <FileText className="h-4 w-4" /> }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleIndustryFilter = (industryId: string) => {
    const current = filters.industry_groups;
    const updated = current.includes(industryId)
      ? current.filter(id => id !== industryId)
      : [...current, industryId];
    setFilters({ industry_groups: updated });
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 z-30 overflow-y-auto"
        >
          <nav className="p-4 space-y-6">
            {/* Navigation Items */}
            {sidebarItems.map((group) => (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {group.icon}
                    <span>{group.name}</span>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedGroups.includes(group.id) ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {expandedGroups.includes(group.id) && group.children && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-2 space-y-1 overflow-hidden"
                    >
                      {group.children.map((item) => (
                        <Link
                          to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                          key={item.id}
                          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Industry Groups Filter */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Industry Groups
              </h3>
              <div className="space-y-1">
                {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => toggleIndustryFilter(key)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                      filters.industry_groups.includes(key)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate">{key}</span>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: group.color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Selector */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                View Mode
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['kanban', 'timeline', 'calendar', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode({ ...viewMode, type: mode as any })}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                      viewMode.type === mode
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};