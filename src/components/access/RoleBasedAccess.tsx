import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Eye, Edit, Trash2, Plus, 
  Crown, UserCheck, Building, Briefcase, Settings
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthContext } from '../auth/AuthProvider';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  industryGroups: string[];
  level: number;
  color: string;
  icon: React.ReactNode;
}

interface AccessRule {
  id: string;
  userId: string;
  roleId: string;
  industryGroups: string[];
  dataFilters: any;
  expiresAt?: string;
}

export const RoleBasedAccess: React.FC = () => {
  const { theme } = useStore();
  const { profile } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users' | 'audit'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Predefined roles based on organizational hierarchy
  const systemRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access across all industry groups and functions',
      permissions: ['*'],
      industryGroups: ['*'],
      level: 100,
      color: '#8B5CF6',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'industry_leader',
      name: 'Industry Group Leader',
      description: 'Full access to respective industry data and team management',
      permissions: [
        'opportunities:manage',
        'jobs:manage',
        'accounts:manage',
        'users:read',
        'reports:create',
        'dashboards:manage'
      ],
      industryGroups: [], // Set per user
      level: 80,
      color: '#3B82F6',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'account_director',
      name: 'Account Director',
      description: 'Team-specific data access and account management',
      permissions: [
        'opportunities:manage',
        'jobs:manage',
        'accounts:read',
        'accounts:update',
        'reports:read',
        'dashboards:read'
      ],
      industryGroups: [], // Set per user
      level: 60,
      color: '#10B981',
      icon: <Building className="h-5 w-5" />
    },
    {
      id: 'program_manager',
      name: 'Program Manager',
      description: 'Project-level access with limited account visibility',
      permissions: [
        'opportunities:read',
        'jobs:manage',
        'accounts:read',
        'reports:read'
      ],
      industryGroups: [], // Set per user
      level: 40,
      color: '#F59E0B',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: 'consultant',
      name: 'Senior Consultant',
      description: 'Read-only access to assigned projects and basic reporting',
      permissions: [
        'opportunities:read',
        'jobs:read',
        'accounts:read',
        'reports:read'
      ],
      industryGroups: [], // Set per user
      level: 20,
      color: '#6B7280',
      icon: <UserCheck className="h-5 w-5" />
    }
  ];

  const systemPermissions: Permission[] = [
    // Opportunities
    { id: 'opportunities:create', name: 'Create Opportunities', description: 'Create new sales opportunities', resource: 'opportunities', action: 'create' },
    { id: 'opportunities:read', name: 'View Opportunities', description: 'View opportunity data', resource: 'opportunities', action: 'read' },
    { id: 'opportunities:update', name: 'Update Opportunities', description: 'Modify opportunity information', resource: 'opportunities', action: 'update' },
    { id: 'opportunities:delete', name: 'Delete Opportunities', description: 'Remove opportunities from system', resource: 'opportunities', action: 'delete' },
    { id: 'opportunities:manage', name: 'Manage Opportunities', description: 'Full opportunity management', resource: 'opportunities', action: 'manage' },
    
    // Jobs
    { id: 'jobs:create', name: 'Create Jobs', description: 'Create new project jobs', resource: 'jobs', action: 'create' },
    { id: 'jobs:read', name: 'View Jobs', description: 'View job data', resource: 'jobs', action: 'read' },
    { id: 'jobs:update', name: 'Update Jobs', description: 'Modify job information', resource: 'jobs', action: 'update' },
    { id: 'jobs:delete', name: 'Delete Jobs', description: 'Remove jobs from system', resource: 'jobs', action: 'delete' },
    { id: 'jobs:manage', name: 'Manage Jobs', description: 'Full job management', resource: 'jobs', action: 'manage' },
    
    // Accounts
    { id: 'accounts:create', name: 'Create Accounts', description: 'Create new client accounts', resource: 'accounts', action: 'create' },
    { id: 'accounts:read', name: 'View Accounts', description: 'View account data', resource: 'accounts', action: 'read' },
    { id: 'accounts:update', name: 'Update Accounts', description: 'Modify account information', resource: 'accounts', action: 'update' },
    { id: 'accounts:delete', name: 'Delete Accounts', description: 'Remove accounts from system', resource: 'accounts', action: 'delete' },
    { id: 'accounts:manage', name: 'Manage Accounts', description: 'Full account management', resource: 'accounts', action: 'manage' },
    
    // Users
    { id: 'users:create', name: 'Create Users', description: 'Add new team members', resource: 'users', action: 'create' },
    { id: 'users:read', name: 'View Users', description: 'View team member data', resource: 'users', action: 'read' },
    { id: 'users:update', name: 'Update Users', description: 'Modify user information', resource: 'users', action: 'update' },
    { id: 'users:delete', name: 'Delete Users', description: 'Remove users from system', resource: 'users', action: 'delete' },
    { id: 'users:manage', name: 'Manage Users', description: 'Full user management', resource: 'users', action: 'manage' },
    
    // Reports & Dashboards
    { id: 'reports:create', name: 'Create Reports', description: 'Generate custom reports', resource: 'reports', action: 'create' },
    { id: 'reports:read', name: 'View Reports', description: 'Access existing reports', resource: 'reports', action: 'read' },
    { id: 'dashboards:create', name: 'Create Dashboards', description: 'Build custom dashboards', resource: 'dashboards', action: 'create' },
    { id: 'dashboards:read', name: 'View Dashboards', description: 'Access dashboards', resource: 'dashboards', action: 'read' },
    { id: 'dashboards:manage', name: 'Manage Dashboards', description: 'Full dashboard management', resource: 'dashboards', action: 'manage' },
    
    // Data Import
    { id: 'import:execute', name: 'Execute Imports', description: 'Run data import processes', resource: 'import', action: 'create' },
    { id: 'export:execute', name: 'Execute Exports', description: 'Export system data', resource: 'export', action: 'create' }
  ];

  // Industry group structure
  const industryGroups = [
    {
      id: 'SMBA',
      name: 'Services, Manufacturing, B2B, Agriculture',
      leader: 'Amanda Konopko',
      team: ['Danielle Bathelemy', 'Liliana Zbirciog', 'Olga Kashchenko', 'Jeremiah Bowden']
    },
    {
      id: 'HSNE',
      name: 'Higher Education, Non-Profit, Sports, Entertainment',
      leader: 'Mandee Englert',
      team: ['Lindsay Dehm', 'Lindsey Presley', 'Bruce Clingan', 'Tom Jones']
    },
    {
      id: 'DXP',
      name: 'DXP Build and Support',
      leader: 'Alex Arnaut',
      team: ['Chris Miller', 'Chaney Moore']
    },
    {
      id: 'TLCG',
      name: 'Travel, Luxury & Consumer Goods',
      leader: 'Daniel Bafico',
      team: ['Esteban Biancchi']
    },
    {
      id: 'NEW_BIZ',
      name: 'New Business Acquisition',
      leader: 'Business Development',
      team: ['Derry Backenkeller', 'Matt Rissmiller', 'Chaney Moore']
    }
  ];

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Super admin has all permissions
    if (profile.role === 'admin') return true;
    
    // Check role-based permissions
    const userRole = systemRoles.find(role => role.id === profile.role);
    if (!userRole) return false;
    
    // Wildcard permission
    if (userRole.permissions.includes('*')) return true;
    
    // Specific permission or manage permission for resource
    const [resource, action] = permission.split(':');
    return userRole.permissions.includes(permission) || 
           userRole.permissions.includes(`${resource}:manage`);
  };

  const getAccessLevel = (userId: string): string => {
    // This would typically come from the database
    // For demo purposes, using profile data
    if (profile?.id === userId) {
      const role = systemRoles.find(r => r.id === profile.role);
      return role?.name || 'Unknown';
    }
    return 'Unknown';
  };

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Roles & Permissions
        </h3>
        {hasPermission('users:manage') && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemRoles.map(role => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedRole(role)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: role.color + '20', color: role.color }}
              >
                {role.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Level {role.level}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {role.description}
            </p>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Key Permissions
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map(permission => (
                  <span 
                    key={permission}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {permission === '*' ? 'All' : permission.split(':')[0]}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Role Details Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: selectedRole.color + '20', color: selectedRole.color }}
                  >
                    {selectedRole.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedRole.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Access Level {selectedRole.level}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedRole.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRole.permissions.map(permissionId => {
                    if (permissionId === '*') {
                      return (
                        <div key="all" className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            All Permissions
                          </span>
                        </div>
                      );
                    }
                    
                    const permission = systemPermissions.find(p => p.id === permissionId);
                    if (!permission) return null;
                    
                    return (
                      <div key={permission.id} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {permission.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasPermission('users:manage') && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Edit Role
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Assign to Users
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        System Permissions
      </h3>

      {Object.entries(
        systemPermissions.reduce((acc, permission) => {
          if (!acc[permission.resource]) acc[permission.resource] = [];
          acc[permission.resource].push(permission);
          return acc;
        }, {} as Record<string, Permission[]>)
      ).map(([resource, permissions]) => (
        <div key={resource} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 capitalize">
            {resource} Permissions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map(permission => (
              <div key={permission.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    permission.action === 'create' ? 'bg-green-500' :
                    permission.action === 'read' ? 'bg-blue-500' :
                    permission.action === 'update' ? 'bg-yellow-500' :
                    permission.action === 'delete' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {permission.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {permission.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Access Management
        </h3>
        {hasPermission('users:create') && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Invite User</span>
          </button>
        )}
      </div>

      {/* Industry Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {industryGroups.map(group => (
          <div key={group.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">{group.id}</h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {group.team.length + 1} members
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{group.name}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{group.leader}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                  Leader
                </span>
              </div>
              
              {group.team.map(member => (
                <div key={member} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{member}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {getAccessLevel(member)}
                    </span>
                    {hasPermission('users:update') && (
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                        <Settings className="h-3 w-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Access Audit Trail
      </h3>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">Recent Access Events</h4>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[
            { user: 'Amanda Konopko', action: 'Accessed SMBA dashboard', time: '2 minutes ago', type: 'access' },
            { user: 'System', action: 'Role permissions updated for Mandee Englert', time: '1 hour ago', type: 'admin' },
            { user: 'Daniel Bafico', action: 'Exported TLCG client data', time: '3 hours ago', type: 'export' },
            { user: 'Chris Miller', action: 'Failed login attempt', time: '5 hours ago', type: 'security' },
            { user: 'System', action: 'Bulk data import completed', time: '1 day ago', type: 'import' }
          ].map((event, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'access' ? 'bg-green-500' :
                    event.type === 'admin' ? 'bg-blue-500' :
                    event.type === 'export' ? 'bg-yellow-500' :
                    event.type === 'security' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{event.user}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{event.action}</div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{event.time}</span>
              </div>
            </div>
          ))}
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
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Control</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage roles, permissions, and user access across the organization
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'roles', name: 'Roles', icon: Shield },
                { id: 'permissions', name: 'Permissions', icon: Settings },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'audit', name: 'Audit Trail', icon: Eye }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          {activeTab === 'roles' && renderRolesTab()}
          {activeTab === 'permissions' && renderPermissionsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'audit' && renderAuditTab()}
        </div>
      </div>
    </div>
  );
};