import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, User, 
  Mail, Shield, Edit, Trash2, UserPlus, Crown,
  Briefcase, Users as UsersIcon, Settings
} from 'lucide-react';
import { useUsers, useUpdateUser } from '../hooks/useSupabaseQuery';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { INDUSTRY_GROUPS, USER_ROLES } from '../constants';

interface UserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(user || {
    name: '',
    email: '',
    role: 'client_leader',
    industry_groups: [],
    avatar: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleIndustryGroup = (groupKey: string) => {
    setFormData(prev => ({
      ...prev,
      industry_groups: prev.industry_groups.includes(groupKey)
        ? prev.industry_groups.filter((g: string) => g !== groupKey)
        : [...prev.industry_groups, groupKey]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user ? 'Edit Team Member' : 'Invite Team Member'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                {USER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {user ? 'Update' : 'Invite'} Member
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Team: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: usersData, isLoading } = useUsers({
    search_query: searchQuery,
    role: selectedRole || undefined
  });
  const updateUser = useUpdateUser();

  const users = usersData?.data || [];

  const handleInviteUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (data: any) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, updates: data });
      }
      // Note: Creating new users would typically be handled through invitation system
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'industry_leader': return <Shield className="h-4 w-4" />;
      case 'account_owner': return <Briefcase className="h-4 w-4" />;
      case 'client_leader': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'industry_leader': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'account_owner': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'client_leader': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage team members and their access permissions
                </p>
              </div>
              <button
                onClick={handleInviteUser}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Member</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Members', value: users.length, icon: UsersIcon, color: 'blue' },
                { title: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Crown, color: 'purple' },
                { title: 'Client Leaders', value: users.filter(u => u.role === 'client_leader').length, icon: User, color: 'green' },
                { title: 'Industry Leaders', value: users.filter(u => u.role === 'industry_leader').length, icon: Shield, color: 'orange' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Roles</option>
                  {USER_ROLES.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Industry Groups
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.avatar || user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span>{USER_ROLES.find(r => r.id === user.role)?.name}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.industry_groups?.map((group: string) => (
                              <span 
                                key={group}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS]?.color + '20', 
                                  color: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS]?.color 
                                }}
                              >
                                {group}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <Settings className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!isLoading && users.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No team members found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by inviting your first team member.
                </p>
                <button
                  onClick={handleInviteUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Invite Member
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <UserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default Team;