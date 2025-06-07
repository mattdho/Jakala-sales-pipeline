import { ClientLeader, Deal, DashboardData } from './types';
import { PIPELINE_STAGES } from './constants';

export const generateMockData = (): DashboardData => {
  const clientLeaders: ClientLeader[] = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@jakala.com', groups: ['HSME', 'TLCE'], avatar: '👩‍💼' },
    { id: 2, name: 'Michael Chen', email: 'michael.c@jakala.com', groups: ['SBMA'], avatar: '👨‍💼' },
    { id: 3, name: 'Emma Rodriguez', email: 'emma.r@jakala.com', groups: ['TLCE', 'Global DXP'], avatar: '👩‍💻' },
    { id: 4, name: 'James Wilson', email: 'james.w@jakala.com', groups: ['DXPS'], avatar: '👨‍💻' },
    { id: 5, name: 'Maria Garcia', email: 'maria.g@jakala.com', groups: ['HSME'], avatar: '👩‍🏫' },
    { id: 6, name: 'David Kim', email: 'david.k@jakala.com', groups: ['SBMA', 'DXPS'], avatar: '👨‍🔧' },
    { id: 7, name: 'Lisa Anderson', email: 'lisa.a@jakala.com', groups: ['Global DXP'], avatar: '👩‍🚀' },
    { id: 8, name: 'Robert Taylor', email: 'robert.t@jakala.com', groups: ['HSME', 'SBMA'], avatar: '👨‍🎓' },
    { id: 9, name: 'Jennifer Martinez', email: 'jennifer.m@jakala.com', groups: ['TLCE'], avatar: '👩‍✈️' },
    { id: 10, name: 'Christopher Lee', email: 'chris.l@jakala.com', groups: ['DXPS', 'Global DXP'], avatar: '👨‍💻' },
    { id: 11, name: 'Amanda White', email: 'amanda.w@jakala.com', groups: ['HSME'], avatar: '👩‍🎤' },
    { id: 12, name: 'Daniel Brown', email: 'daniel.b@jakala.com', groups: ['SBMA'], avatar: '👨‍🌾' },
    { id: 13, name: 'Michelle Davis', email: 'michelle.d@jakala.com', groups: ['TLCE', 'HSME'], avatar: '👩‍🎨' },
    { id: 14, name: 'Kevin Miller', email: 'kevin.m@jakala.com', groups: ['Global DXP'], avatar: '👨‍🚀' },
    { id: 15, name: 'Rachel Thompson', email: 'rachel.t@jakala.com', groups: ['DXPS'], avatar: '👩‍💼' },
    { id: 16, name: 'Thomas Garcia', email: 'thomas.g@jakala.com', groups: ['SBMA', 'TLCE'], avatar: '👨‍🏭' },
    { id: 17, name: 'Laura Wilson', email: 'laura.w@jakala.com', groups: ['HSME', 'Global DXP'], avatar: '👩‍🏫' },
    { id: 18, name: 'Steven Martinez', email: 'steven.m@jakala.com', groups: ['TLCE'], avatar: '🧑‍✈️' }
  ];

  const companies = [
    'TechCorp Solutions', 'Global Manufacturing Inc', 'Luxury Hotels Group', 'University of Excellence',
    'Sports Media Network', 'Agricultural Innovations', 'E-Commerce Giants', 'Entertainment Studios',
    'Travel Adventures Ltd', 'Business Consulting Pro', 'DXP Solutions Inc', 'Media Productions',
    'Manufacturing Excellence', 'Cruise Line International', 'Higher Ed Consortium', 'Service Industries Corp'
  ];

  const deals: Deal[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 85; i++) {
    const clientLeader = clientLeaders[Math.floor(Math.random() * clientLeaders.length)];
    const stage = PIPELINE_STAGES[Math.floor(Math.random() * PIPELINE_STAGES.length)];
    const createdDays = Math.floor(Math.random() * 180);
    const lastActivityDays = Math.floor(Math.random() * 30);
    
    deals.push({
      id: i,
      name: `${companies[Math.floor(Math.random() * companies.length)]} - Project ${i}`,
      value: Math.floor(Math.random() * 500000) + 10000,
      stage: stage,
      probability: stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 : 
                   stage === 'Lead' ? 10 : stage === 'Qualified' ? 25 : 
                   stage === 'Proposal' ? 50 : stage === 'Negotiation' ? 75 : 0,
      clientLeaderId: clientLeader.id,
      industryGroup: clientLeader.groups[Math.floor(Math.random() * clientLeader.groups.length)],
      createdDate: new Date(today.getTime() - createdDays * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(today.getTime() - lastActivityDays * 24 * 60 * 60 * 1000).toISOString(),
      expectedCloseDate: new Date(today.getTime() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Initial contact made. Discussing requirements for ${stage.toLowerCase()} stage.`,
      customFields: {
        priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        source: ['Website', 'Referral', 'Cold Call', 'Event'][Math.floor(Math.random() * 4)],
        competitor: ['Competitor A', 'Competitor B', 'None'][Math.floor(Math.random() * 3)]
      }
    });
  }

  return { clientLeaders, deals };
};