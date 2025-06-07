export const OPPORTUNITY_STAGES = [
  { id: 'exploration', name: 'Exploration', color: '#3B82F6' },
  { id: 'ready_for_proposal', name: 'Ready for Proposal', color: '#F59E0B' },
  { id: 'closed_won', name: 'Closed Won', color: '#10B981' },
  { id: 'closed_lost', name: 'Closed Lost', color: '#EF4444' }
] as const;

export const JOB_STAGES = [
  { id: 'proposal_preparation', name: 'Proposal Preparation', color: '#8B5CF6' },
  { id: 'proposal_sent', name: 'Proposal Sent', color: '#3B82F6' },
  { id: 'final_negotiation', name: 'Final Negotiation', color: '#F59E0B' },
  { id: 'backlog', name: 'Backlog', color: '#10B981' },
  { id: 'closed', name: 'Closed', color: '#6B7280' },
  { id: 'lost', name: 'Lost', color: '#EF4444' }
] as const;

export const PROJECT_STATUSES = [
  { id: 'to_be_started', name: 'To Be Started', color: '#6B7280' },
  { id: 'ongoing', name: 'On-Going', color: '#3B82F6' },
  { id: 'finished', name: 'Finished', color: '#10B981' },
  { id: 'closed', name: 'Closed', color: '#374151' }
] as const;

export const INDUSTRY_GROUPS = {
  'FSI': {
    name: 'Financial Services & Insurance',
    color: '#3B82F6',
    industries: ['Banks & Financial Services', 'Insurance & Real Estate']
  },
  'Consumer': {
    name: 'Consumer',
    color: '#10B981',
    industries: [
      'Consumer Durables', 'FMCG & Grocery Retail', 'Fashion', 'Luxury',
      'Travel & Leisure', 'Bars, Restaurants & Food Delivery', 'Sport',
      'Beauty', 'Design & Furniture', 'Licensed & Premium Accessories'
    ]
  },
  'TMT': {
    name: 'TMT & Energy',
    color: '#F59E0B',
    industries: [
      'Telecommunication Services & IT', 'Media & Entertainment',
      'Energy, Petrol & Utilities'
    ]
  },
  'Services': {
    name: 'Services',
    color: '#8B5CF6',
    industries: [
      'Commercial & Professional Services', 'Mobility, Transportation & Infrastructure',
      'Education', 'Non-Profit'
    ]
  },
  'Industrial': {
    name: 'Industrial & Automotive',
    color: '#EF4444',
    industries: ['Automotive', 'Capital Goods']
  },
  'Pharma': {
    name: 'Pharma & Lifesciences',
    color: '#06B6D4',
    industries: [
      'Pharma', 'Consumer Health', 'MedTech', 'Private Healthcare'
    ]
  },
  'Government': {
    name: 'Government & Public Sector',
    color: '#84CC16',
    industries: ['Government & Public Sector']
  }
} as const;

export const DOCUMENT_TYPES = [
  { id: 'nda', name: 'NDA', icon: '🔒' },
  { id: 'rfp', name: 'RFP', icon: '📋' },
  { id: 'contract', name: 'Contract', icon: '📄' },
  { id: 'proposal', name: 'Proposal', icon: '📊' },
  { id: 'msa', name: 'MSA', icon: '🤝' },
  { id: 'po', name: 'Purchase Order', icon: '💰' },
  { id: 'other', name: 'Other', icon: '📁' }
] as const;

export const USER_ROLES = [
  { id: 'industry_leader', name: 'Industry Leader' },
  { id: 'account_owner', name: 'Account Owner' },
  { id: 'client_leader', name: 'Client Leader' },
  { id: 'admin', name: 'Admin' }
] as const;

export const PRIORITY_LEVELS = [
  { id: 'low', name: 'Low', color: '#10B981' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'high', name: 'High', color: '#EF4444' }
] as const;

export const LOST_REASONS = [
  'Not Bid',
  'Price',
  'Timeline',
  'Competitor',
  'Budget Cut',
  'Project Cancelled',
  'Other'
] as const;

export const KEYBOARD_SHORTCUTS = {
  COMMAND_PALETTE: 'cmd+k',
  NEW_OPPORTUNITY: 'cmd+shift+o',
  NEW_JOB: 'cmd+shift+j',
  SEARCH: 'cmd+/',
  TOGGLE_THEME: 'cmd+shift+t',
  SAVE: 'cmd+s',
  ESCAPE: 'escape'
} as const;