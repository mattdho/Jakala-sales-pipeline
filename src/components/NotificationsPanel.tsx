import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { userService } from '../services/userService';
import { supabase, subscribeToActivityLogs } from '../lib/supabase';
import type { ActivityLog } from '../types';

export const NotificationsPanel: React.FC = () => {
  const {
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    user
  } = useStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await userService.getActivityLogs(user.id);
      if (data) setLogs(data);
      setLoading(false);
    };
    if (notificationsPanelOpen) {
      fetchLogs();
    }
  }, [notificationsPanelOpen, user]);

  useEffect(() => {
    if (!notificationsPanelOpen || !user) return;

    const channel = subscribeToActivityLogs(user.id, (payload) => {
      setLogs((prev) => [payload.new as ActivityLog, ...prev]);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notificationsPanelOpen, user]);

  return (
    <AnimatePresence>
      {notificationsPanelOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setNotificationsPanelOpen(false)}
        >
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-gray-900 w-80 max-w-full h-full p-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              <button
                onClick={() => setNotificationsPanelOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : logs.length > 0 ? (
              <ul className="space-y-4">
                {logs.map((log) => (
                  <li key={log.id} className="text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium capitalize">{log.action}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No notifications</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
