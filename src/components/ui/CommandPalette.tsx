import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, BarChart3, Users, Settings,
  FileText, Calendar, Filter, Download
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { exportService } from '../../services/exportService';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setOpportunityModalOpen,
    setJobModalOpen,
    setEditingOpportunity,
    setEditingJob
  } = useStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: 'new-opportunity',
      title: 'New Opportunity',
      subtitle: 'Create a new sales opportunity',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        setEditingOpportunity(null);
        setOpportunityModalOpen(true);
        setCommandPaletteOpen(false);
      },
      keywords: ['new', 'opportunity', 'create', 'add']
    },
    {
      id: 'new-job',
      title: 'New Job',
      subtitle: 'Create a new project job',
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        setEditingJob(null);
        setJobModalOpen(true);
        setCommandPaletteOpen(false);
      },
      keywords: ['new', 'job', 'project', 'create', 'add']
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      subtitle: 'Open analytics dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => {
        navigate('/analytics');
        setCommandPaletteOpen(false);
      },
      keywords: ['analytics', 'dashboard', 'metrics', 'reports']
    },
    {
      id: 'team',
      title: 'Team Management',
      subtitle: 'Manage team members and roles',
      icon: <Users className="h-4 w-4" />,
      action: () => {
        navigate('/team');
        setCommandPaletteOpen(false);
      },
      keywords: ['team', 'users', 'members', 'roles']
    },
    {
      id: 'calendar',
      title: 'Calendar View',
      subtitle: 'Switch to calendar view',
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        navigate('/calendar');
        setCommandPaletteOpen(false);
      },
      keywords: ['calendar', 'schedule', 'dates', 'timeline']
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Export pipeline data to CSV',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        exportService.exportPipelineCSV();
        setCommandPaletteOpen(false);
      },
      keywords: ['export', 'download', 'csv', 'data']
    }
  ];

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
    }
  }, [commandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                />
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                  ESC
                </kbd>
              </div>
              
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-gray-500">
                  No commands found.
                </Command.Empty>
                
                <Command.Group heading="Actions" className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {commands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={`${command.title} ${command.keywords.join(' ')}`}
                      onSelect={command.action}
                      className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3">
                        {command.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {command.title}
                        </div>
                        {command.subtitle && (
                          <div className="text-sm text-gray-500">
                            {command.subtitle}
                          </div>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};