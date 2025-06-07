import React from 'react';
import { Plus } from 'lucide-react';
import { Deal, ClientLeader } from '../utils/types';
import { PIPELINE_STAGES, INDUSTRY_GROUPS } from '../utils/constants';

interface KanbanBoardProps {
  deals: Deal[];
  clientLeaders: ClientLeader[];
  onEditDeal: (deal: Deal | Partial<Deal>) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ deals, clientLeaders, onEditDeal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {PIPELINE_STAGES.map(stage => {
        const stageDeals = deals.filter(deal => deal.stage === stage);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        
        return (
          <div key={stage} className="bg-gray-50 rounded-xl p-4 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{stage}</h3>
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                {stageDeals.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 font-medium">
              ${stageValue.toLocaleString()}
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stageDeals.map(deal => {
                const leader = clientLeaders.find(cl => cl.id === deal.clientLeaderId);
                const groupColor = INDUSTRY_GROUPS[deal.industryGroup as keyof typeof INDUSTRY_GROUPS]?.color || '#3B82F6';
                
                return (
                  <div 
                    key={deal.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    onClick={() => onEditDeal(deal)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 leading-tight">{deal.name}</h4>
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-1"
                        style={{ backgroundColor: groupColor }}
                        title={deal.industryGroup}
                      />
                    </div>
                    
                    <p className="text-lg font-semibold text-gray-900 mb-3">
                      ${deal.value.toLocaleString()}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm mr-2">{leader?.avatar}</span>
                        <span className="text-xs text-gray-600 truncate">
                          {leader?.name}
                        </span>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        deal.customFields?.priority === 'High' ? 'bg-red-100 text-red-700' :
                        deal.customFields?.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {deal.customFields?.priority || 'Low'}
                      </span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        <span>{deal.probability}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              onClick={() => onEditDeal({ stage, industryGroup: 'HSME' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;