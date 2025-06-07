import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ClientLeader, Deal } from '../utils/types';
import { INDUSTRY_GROUPS } from '../utils/constants';

interface ClientLeadersViewProps {
  clientLeaders: ClientLeader[];
  deals: Deal[];
  onEditClientLeader: (leader: ClientLeader | Partial<ClientLeader>) => void;
  onDeleteClientLeader: (leaderId: number) => void;
}

const ClientLeadersView: React.FC<ClientLeadersViewProps> = ({ 
  clientLeaders, 
  deals, 
  onEditClientLeader, 
  onDeleteClientLeader 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Client Leaders</h2>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            onClick={() => onEditClientLeader({ groups: [] })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client Leader
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Groups
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Active Deals
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pipeline Value
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientLeaders.map(leader => {
              const leaderDeals = deals.filter(deal => deal.clientLeaderId === leader.id);
              const pipelineValue = leaderDeals.reduce((sum, deal) => sum + deal.value, 0);
              
              return (
                <tr key={leader.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{leader.avatar}</div>
                      <div className="text-sm font-medium text-gray-900">{leader.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {leader.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 flex-wrap">
                      {leader.groups.map(group => (
                        <span 
                          key={group} 
                          className="px-2 py-1 text-xs rounded-full font-medium"
                          style={{ 
                            backgroundColor: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS].color + '20', 
                            color: INDUSTRY_GROUPS[group as keyof typeof INDUSTRY_GROUPS].color 
                          }}
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {leaderDeals.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${pipelineValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-4 p-1 hover:bg-blue-50 rounded transition-colors"
                      onClick={() => onEditClientLeader(leader)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      onClick={() => {
                        if (confirm(`Delete ${leader.name}? This will also remove all their deals.`)) {
                          onDeleteClientLeader(leader.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientLeadersView;