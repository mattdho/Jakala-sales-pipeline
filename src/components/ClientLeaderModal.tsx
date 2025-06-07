import React from 'react';
import { X } from 'lucide-react';
import { ClientLeader } from '../utils/types';
import { INDUSTRY_GROUPS } from '../utils/constants';

interface ClientLeaderModalProps {
  clientLeader: ClientLeader | Partial<ClientLeader> | null;
  onSave: (leader: ClientLeader | Partial<ClientLeader>) => void;
  onClose: () => void;
}

const ClientLeaderModal: React.FC<ClientLeaderModalProps> = ({ clientLeader, onSave, onClose }) => {
  const [editingLeader, setEditingLeader] = React.useState<ClientLeader | Partial<ClientLeader>>(clientLeader || {});

  React.useEffect(() => {
    setEditingLeader(clientLeader || {});
  }, [clientLeader]);

  if (!clientLeader) return null;

  const handleSave = () => {
    onSave(editingLeader);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingLeader.id ? 'Edit Client Leader' : 'New Client Leader'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editingLeader.name || ''}
              onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editingLeader.email || ''}
              onChange={(e) => setEditingLeader({ ...editingLeader, email: e.target.value })}
              placeholder="email@jakala.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Emoji</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editingLeader.avatar || ''}
              onChange={(e) => setEditingLeader({ ...editingLeader, avatar: e.target.value })}
              placeholder="e.g., 👩‍💼"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Industry Groups</label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(INDUSTRY_GROUPS).map(([key, group]) => (
                <label key={key} className="flex items-start">
                  <input 
                    type="checkbox" 
                    className="mt-1 mr-3 rounded border-gray-300 focus:ring-blue-500"
                    checked={editingLeader.groups?.includes(key) || false}
                    onChange={(e) => {
                      const groups = editingLeader.groups || [];
                      if (e.target.checked) {
                        setEditingLeader({ ...editingLeader, groups: [...groups, key] });
                      } else {
                        setEditingLeader({ ...editingLeader, groups: groups.filter(g => g !== key) });
                      }
                    }}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{key}</div>
                    <div className="text-xs text-gray-600">{group.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            onClick={handleSave}
          >
            {editingLeader.id ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLeaderModal;