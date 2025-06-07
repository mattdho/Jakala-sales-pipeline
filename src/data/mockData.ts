// Mock data for Enterprise functionality based on real Jakala data
import { Account, Opportunity, Job } from '../types';

// Real client data from clients_rows.csv
export const mockClients: Account[] = [
  {
    id: '02b99224-ccaa-4f5a-8722-6822dae83c09',
    name: 'Quaker Houghton',
    legal_name: 'Quaker Houghton',
    billing_address: '901 E Hector St, Conshohocken, PA 19428',
    payment_terms: 'Net 30',
    industry: 'Manufacturing',
    industry_group: 'SMBA',
    account_owner_id: 'amanda-konopko',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  },
  {
    id: '0cb60f6c-6f0a-4107-a0bf-1ca90c8a0e65',
    name: 'Arizona State University',
    legal_name: 'Arizona State University',
    billing_address: '300 E University Dr, Tempe, AZ 85281',
    payment_terms: 'Net 45',
    industry: 'Higher Education',
    industry_group: 'HSNE',
    account_owner_id: 'mandee-englert',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  },
  {
    id: '16aeb90b-87a7-47c0-8c4f-47544c48efdc',
    name: 'ABB',
    legal_name: 'ABB Inc.',
    billing_address: '305 Gregson Dr, Cary, NC 27511',
    payment_terms: 'Net 30',
    industry: 'Industrial Automation',
    industry_group: 'SMBA',
    account_owner_id: 'amanda-konopko',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  },
  {
    id: '4457e9c3-6d0e-4d03-9560-6bb2d8faeb70',
    name: 'Yale University',
    legal_name: 'Yale University',
    billing_address: '149 Elm St, New Haven, CT 06511',
    payment_terms: 'Net 45',
    industry: 'Higher Education',
    industry_group: 'HSNE',
    account_owner_id: 'mandee-englert',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  },
  {
    id: '4ebfbbdd-c519-4b15-98fe-2a15a11d03a1',
    name: 'Estee Lauder',
    legal_name: 'The Estée Lauder Companies Inc.',
    billing_address: '767 5th Ave, New York, NY 10153',
    payment_terms: 'Net 30',
    industry: 'Beauty & Cosmetics',
    industry_group: 'TLCG',
    account_owner_id: 'daniel-bafico',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  },
  {
    id: '5c01bdb3-ef1f-45d3-92bf-e330dccdc6d9',
    name: 'B&B Hotels',
    legal_name: 'B&B Hotels America',
    billing_address: '1200 Brickell Ave, Miami, FL 33131',
    payment_terms: 'Net 30',
    industry: 'Travel & Hospitality',
    industry_group: 'TLCG',
    account_owner_id: 'daniel-bafico',
    created_at: '2025-05-22T17:51:21.242854Z',
    updated_at: '2025-05-22T17:51:21.242854Z'
  }
];

// Real project data from projects_rows.csv
export const mockJobs: Job[] = [
  {
    id: '0d0f70bb-24d2-4abf-888b-542550ff79d7',
    job_code: 'qhs2d300',
    name: 'Quaker Houghton - Stages 2-6 Design & Dev - Q325 - Q326 - 300',
    opportunity_id: '02b99224-ccaa-4f5a-8722-6822dae83c09-opp',
    account_id: '02b99224-ccaa-4f5a-8722-6822dae83c09',
    value: 450000,
    stage: 'backlog',
    project_status: 'ongoing',
    client_leader_id: 'amanda-konopko',
    expected_confirmation_date: '2025-03-15',
    project_start_date: '2025-07-01',
    project_end_date: '2025-12-31',
    created_at: '2025-05-08T19:55:23.690162Z',
    updated_at: '2025-05-08T19:55:23.690162Z',
    notes: 'Multi-phase digital transformation project including UX/UI design and full-stack development.',
    priority: 'high',
    auto_closed: false
  },
  {
    id: '786cd69f-726c-4a2e-a2b8-4ae745d66d8b',
    job_code: 'NDMSBWEBSI1068',
    name: 'University of Notre Dame - Mendoza School of Business - Website Redesign and CMS Consolidation Q325-Q326',
    opportunity_id: '786cd69f-726c-4a2e-a2b8-4ae745d66d8b-opp',
    account_id: '65c0fcaf-ff2c-4f64-8a7e-5ecd3871186a',
    value: 180000,
    stage: 'proposal_sent',
    project_status: 'to_be_started',
    client_leader_id: 'mandee-englert',
    expected_confirmation_date: '2025-08-15',
    project_start_date: '2025-07-01',
    project_end_date: '2025-12-31',
    created_at: '2025-06-03T21:42:23.671964Z',
    updated_at: '2025-06-03T21:42:23.671964Z',
    notes: 'Comprehensive website redesign with CMS consolidation for the business school.',
    priority: 'medium',
    auto_closed: false
  },
  {
    id: '5d9ff7db-e03e-4d42-800a-32f9148b3ae2',
    job_code: 'ctdmp2318',
    name: 'CertainTeed - MyEdge Phase 2 - Q124 - Q325 - 318',
    opportunity_id: '5d9ff7db-e03e-4d42-800a-32f9148b3ae2-opp',
    account_id: '75e7f637-3c59-46a3-8052-009df1d5ac09',
    value: 320000,
    stage: 'backlog',
    project_status: 'ongoing',
    client_leader_id: 'alex-arnaut',
    expected_confirmation_date: '2025-01-15',
    project_start_date: '2025-01-01',
    project_end_date: '2025-07-31',
    created_at: '2025-05-08T20:21:28.604137Z',
    updated_at: '2025-05-08T20:21:28.604137Z',
    notes: 'Phase 2 development of the MyEdge platform with enhanced features.',
    priority: 'high',
    auto_closed: false
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '02b99224-ccaa-4f5a-8722-6822dae83c09-opp',
    name: 'Quaker Houghton Digital Transformation',
    account_id: '02b99224-ccaa-4f5a-8722-6822dae83c09',
    value: 450000,
    stage: 'closed_won',
    probability: 100,
    client_leader_id: 'amanda-konopko',
    expected_confirmation_date: '2025-03-15',
    created_at: '2025-02-01T00:00:00.000Z',
    updated_at: '2025-03-15T00:00:00.000Z',
    notes: 'Multi-phase digital transformation initiative focusing on modern web technologies.',
    source: 'Referral',
    competitor: 'Accenture'
  },
  {
    id: '786cd69f-726c-4a2e-a2b8-4ae745d66d8b-opp',
    name: 'Notre Dame Business School Website',
    account_id: '65c0fcaf-ff2c-4f64-8a7e-5ecd3871186a',
    value: 180000,
    stage: 'ready_for_proposal',
    probability: 75,
    client_leader_id: 'mandee-englert',
    expected_confirmation_date: '2025-08-15',
    created_at: '2025-06-01T00:00:00.000Z',
    updated_at: '2025-06-03T21:42:23.671964Z',
    notes: 'Website redesign and CMS consolidation for the Mendoza School of Business.',
    source: 'Direct Outreach'
  },
  {
    id: '3b551516-a191-45ee-abe7-af9859e84545-opp',
    name: 'Alnylam Digital Ecosystem RFI',
    account_id: 'd236cb2e-1d04-4154-8a9d-0dfef76d0fc4',
    value: 850000,
    stage: 'exploration',
    probability: 25,
    client_leader_id: 'derry-backenkeller',
    expected_confirmation_date: '2025-12-01',
    created_at: '2025-05-22T14:59:31.550475Z',
    updated_at: '2025-05-22T14:59:31.550475Z',
    notes: 'Large-scale digital ecosystem transformation for pharmaceutical operations.',
    source: 'RFI Response'
  }
];

// Team structure based on actual Jakala organizational chart
export const teamMembers = {
  SMBA: {
    leader: 'Amanda Konopko',
    team: [
      { name: 'Danielle Bathelemy', role: 'Account Director' },
      { name: 'Liliana Zbirciog', role: 'Program Manager' },
      { name: 'Olga Kashchenko', role: 'Associate Program Manager' },
      { name: 'Jeremiah Bowden', role: 'Senior Consultant' }
    ]
  },
  HSNE: {
    leader: 'Mandee Englert',
    team: [
      { name: 'Lindsay Dehm', role: 'Account Director' },
      { name: 'Lindsey Presley', role: 'Account Director' },
      { name: 'Bruce Clingan', role: 'Associate Program Manager' },
      { name: 'Tom Jones', role: 'Senior Project Manager' }
    ]
  },
  DXP: {
    leader: 'Alex Arnaut',
    team: [
      { name: 'Chris Miller', role: 'Account Director' },
      { name: 'Chaney Moore', role: 'Director of Client Success' }
    ]
  },
  TLCG: {
    leader: 'Daniel Bafico',
    team: [
      { name: 'Esteban Biancchi', role: 'Account Director' }
    ]
  },
  NEW_BUSINESS: {
    leader: 'Business Development',
    team: [
      { name: 'Derry Backenkeller', role: 'Client Leader / BDR' },
      { name: 'Matt Rissmiller', role: 'Client Leader / BDR' },
      { name: 'Chaney Moore', role: 'Client Leader / BDR' }
    ]
  }
}; 