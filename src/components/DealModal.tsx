import React from 'react';
import { X } from 'lucide-react';
import { Deal, ClientLeader } from '../utils/types';
import { PIPELINE_STAGES, INDUSTRY_GROUPS } from '../utils/constants';

interface DealModalProps {
  deal: Deal | Partial<Deal> | null;
  clientLeaders: ClientLeader[];
  onSave: (deal: Deal | Partial<Deal>) => void;
  onClose: () => void;
}

const DealModal: React.FC<DealModalProps> = ({ deal, clientLeaders, onSave, onClose }) => {
  const [editingDeal, setEditingDeal] = React.useState<Deal | Partial<Deal>>(deal || {});

  React.useEffect(() => {
    setEditingDeal(deal || {});
  }, [deal]);

  if (!deal) return null;

  const handleSave = () => {
    onSave(editingDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingDeal.id ? 'Edit Deal' : 'New Deal'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deal Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editingDeal.name || ''}
              onChange={(e) => setEditingDeal({ ...editingDeal, name: e.target.value })}
              placeholder="Enter deal name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value ($)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.value || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, value: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.stage || 'Lead'}
                onChange={(e) => {
                  const stage = e.target.value;
                  const probability = stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 : 
                                   stage === 'Lead' ? 10 : stage === 'Qualified' ? 25 : 
                                   stage === 'Proposal' ? 50 : stage === 'Negotiation' ? 75 : 0;
                  setEditingDeal({ ...editingDeal, stage, probability });
                }}
              >
                {PIPELINE_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Leader</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.clientLeaderId || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, clientLeaderId: parseInt(e.target.value) })}
              >
                <option value="">Select Client Leader</option>
                {clientLeaders.map(leader => (
                  <option key={leader.id} value={leader.id}>{leader.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry Group</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.industryGroup || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, industryGroup: e.target.value })}
              >
                {Object.keys(INDUSTRY_GROUPS).map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.expectedCloseDate ? editingDeal.expectedCloseDate.split('T')[0] : ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, expectedCloseDate: new Date(e.target.value).toISOString() })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Probability (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.probability || 0}
                onChange={(e) => setEditingDeal({ ...editingDeal, probability: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={editingDeal.notes || ''}
              onChange={(e) => setEditingDeal({ ...editingDeal, notes: e.target.value })}
              placeholder="Add notes about this deal..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.customFields?.priority || 'Medium'}
                onChange={(e) => setEditingDeal({ 
                  ...editingDeal, 
                  customFields: { ...editingDeal.customFields, priority: e.target.value }
                })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editingDeal.customFields?.source || 'Website'}
                onChange={(e) => setEditingDeal({ 
                  ...editingDeal, 
                  customFields: { ...editingDeal.customFields, source: e.target.value }
                })}
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Event">Event</option>
              </select>
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
            {editingDeal.id ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealModal;