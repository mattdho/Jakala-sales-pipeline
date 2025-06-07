import { Deal, ClientLeader, DashboardData } from './types';

export const exportToCSV = (deals: Deal[], clientLeaders: ClientLeader[]) => {
  const csvContent = [
    ['Deal Name', 'Value', 'Stage', 'Client Leader', 'Industry Group', 'Created Date', 'Expected Close Date', 'Probability', 'Notes'],
    ...deals.map(deal => {
      const leader = clientLeaders.find(cl => cl.id === deal.clientLeaderId);
      return [
        deal.name,
        deal.value,
        deal.stage,
        leader?.name || '',
        deal.industryGroup,
        new Date(deal.createdDate).toLocaleDateString(),
        new Date(deal.expectedCloseDate).toLocaleDateString(),
        deal.probability,
        deal.notes
      ];
    })
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jakala_pipeline_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

export const importFromCSV = (text: string, existingData: DashboardData): Deal[] => {
  const rows = text.split('\n').map(row => row.split(','));
  const headers = rows[0];
  
  const newDeals = rows.slice(1).map((row, index) => {
    if (row.length < headers.length) return null;
    
    return {
      id: Math.max(...existingData.deals.map(d => d.id)) + index + 1,
      name: row[0],
      value: parseFloat(row[1]) || 0,
      stage: row[2],
      clientLeaderId: existingData.clientLeaders.find(cl => cl.name === row[3])?.id || existingData.clientLeaders[0].id,
      industryGroup: row[4],
      createdDate: new Date(row[5]).toISOString(),
      expectedCloseDate: new Date(row[6]).toISOString(),
      probability: parseInt(row[7]) || 0,
      notes: row[8] || '',
      lastActivity: new Date().toISOString(),
      customFields: {}
    };
  }).filter(Boolean) as Deal[];
  
  return newDeals;
};

export const downloadCSVTemplate = () => {
  const template = 'Deal Name,Value,Stage,Client Leader,Industry Group,Created Date,Expected Close Date,Probability,Notes\n' +
                   'Example Deal,50000,Lead,Sarah Johnson,HSME,2024-01-01,2024-03-01,10,Initial contact made';
  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jakala_import_template.csv';
  a.click();
};

export const backupData = (data: DashboardData) => {
  const backupData = JSON.stringify(data, null, 2);
  const blob = new Blob([backupData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jakala_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};