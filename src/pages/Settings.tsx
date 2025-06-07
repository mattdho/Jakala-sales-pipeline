import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, Palette, Globe, 
  Save, Eye, EyeOff, Camera, Mail, Phone
} from 'lucide-react';
import { useAuthContext } from '../components/auth/AuthProvider';
import { useUpdateUser } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { INDUSTRY_GROUPS, USER_ROLES } from '../constants';

const Settings: React.FC = () => {
  const { sidebarOpen, theme, setTheme } = useStore();
  const { profile, refreshProfile } = useAuthContext();
  const updateUser = useUpdateUser();

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    avatar: profile?.avatar || '',
    industry_groups: profile?.industry_groups || [],
    notifications: {
      email: true,
      push: true,
      opportunities: true,
      jobs: true,
      documents: true
    },
    preferences: {
      theme: theme,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Palette }
  ];

  const handleSave = async () => {
    try {
      if (profile) {
        await updateUser.mutateAsync({
          id: profile.id,
          updates: {
            name: formData.name,
            avatar: formData.avatar,
            industry_groups: formData.industry_groups
          }
        });
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const toggleIndustryGroup = (groupKey: string) => {
    setFormData(prev => ({
      ...prev,
      industry_groups: prev.industry_groups.includes(groupKey)
        ? prev.industry_groups.filter(g => g !== groupKey)
        : [...prev.industry_groups, groupKey]
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {formData.avatar || formData.name.charAt(0)}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use an emoji or upload a custom avatar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <input
            type="text"
            value={USER_ROLES.find(r => r.id === profile?.role)?.name || profile?.role}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avatar Emoji
          </label>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., 👩‍💼"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Industry Groups Access
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
            <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={formData.industry_groups.includes(key)}
                onChange={() => toggleIndustryGroup(key)}
                className="rounded border-gray-300 focus:ring-blue-500"
                disabled={profile?.role !== 'admin'} // Only admins can change their own groups
              />
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{key}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{group.name}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'opportunities', label: 'Opportunity Updates', description: 'Get notified about opportunity changes' },
            { key: 'jobs', label: 'Job Updates', description: 'Get notified about job status changes' },
            { key: 'documents', label: 'Document Updates', description: 'Get notified when documents are uploaded' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{setting.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications[setting.key as keyof typeof formData.notifications]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [setting.key]: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Password</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last changed 30 days ago</div>
              </div>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Active Sessions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage your active sessions</div>
              </div>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                View Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={formData.preferences.theme}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: e.target.value }
                }));
                setTheme(e.target.value as 'light' | 'dark');
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={formData.preferences.language}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, language: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.preferences.timezone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, timezone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={formData.preferences.dateFormat}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, dateFormat: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={updateUser.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{updateUser.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  {activeTab === 'profile' && renderProfileTab()}
                  {activeTab === 'notifications' && renderNotificationsTab()}
                  {activeTab === 'security' && renderSecurityTab()}
                  {activeTab === 'preferences' && renderPreferencesTab()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;