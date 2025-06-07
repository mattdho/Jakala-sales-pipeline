import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Users, Plus, Filter, Search
} from 'lucide-react';
import { useOpportunities, useJobs } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';

const Calendar: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: opportunitiesData } = useOpportunities();
  const { data: jobsData } = useJobs();

  const opportunities = opportunitiesData?.data || [];
  const jobs = jobsData?.data || [];

  // Combine opportunities and jobs into events
  const events = [
    ...opportunities.map(opp => ({
      id: opp.id,
      title: opp.name,
      date: opp.expected_confirmation_date,
      type: 'opportunity' as const,
      value: opp.value,
      stage: opp.stage,
      color: '#3B82F6'
    })),
    ...jobs.map(job => ({
      id: job.id,
      title: job.name,
      date: job.expected_confirmation_date || job.project_start_date,
      type: 'job' as const,
      value: job.value,
      stage: job.stage,
      color: '#8B5CF6'
    }))
  ].filter(event => event.date);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-32 border-r border-b border-gray-200 dark:border-gray-700" />;
            }

            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`h-32 border-r border-b border-gray-200 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {day.getDate()}
                  {isToday && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full inline-block ml-1" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventsList = () => {
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
    
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedDate 
            ? `Events for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
            : 'Select a date to view events'
          }
        </h3>
        
        {selectedEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedEvents.map(event => (
              <div
                key={event.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.type === 'opportunity' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Expected: {new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Value: ${event.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Stage: {event.stage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedDate ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No events scheduled for this date</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Click on a date to view events</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-6`}>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage your pipeline timeline
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-1">
                  {['month', 'week', 'day'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                        viewMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>New Event</span>
                </button>
              </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderMonthView()}
              </div>
              <div className="lg:col-span-1">
                {renderEventsList()}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Opportunities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Jobs</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;