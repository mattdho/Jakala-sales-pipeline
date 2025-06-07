export interface User {
  id: string;
  email: string;
  name: string;
  role: 'industry_leader' | 'account_owner' | 'client_leader' | 'admin';
  avatar?: string;
  industry_groups: string[];
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  legal_name: string;
  billing_address: string;
  payment_terms: string;
  industry: string;
  industry_group: string;
  account_owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  name: string;
  account_id: string;
  value: number;
  stage: 'exploration' | 'ready_for_proposal' | 'closed_won' | 'closed_lost';
  probability: number;
  client_leader_id: string;
  expected_confirmation_date: string;
  created_at: string;
  updated_at: string;
  notes: string;
  source: string;
  competitor?: string;
  lost_reason?: string;
}

export interface Job {
  id: string;
  job_code: string;
  name: string;
  opportunity_id: string;
  account_id: string;
  value: number;
  stage: 'proposal_preparation' | 'proposal_sent' | 'final_negotiation' | 'backlog' | 'closed' | 'lost';
  project_status: 'to_be_started' | 'ongoing' | 'finished' | 'closed';
  client_leader_id: string;
  expected_confirmation_date: string;
  project_start_date?: string;
  project_end_date?: string;
  created_at: string;
  updated_at: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  lost_reason?: string;
  auto_closed: boolean;
}

export interface Document {
  id: string;
  job_id: string;
  name: string;
  type: 'nda' | 'rfp' | 'contract' | 'proposal' | 'msa' | 'po' | 'other';
  file_path: string;
  file_size: number;
  uploaded_by: string;
  version: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: 'opportunity' | 'job';
  entity_id: string;
  action: string;
  details: Record<string, any>;
  user_id: string;
  created_at: string;
}

export interface PipelineMetrics {
  total_pipeline_value: number;
  weighted_pipeline_value: number;
  active_opportunities: number;
  active_jobs: number;
  win_rate: number;
  avg_deal_size: number;
  conversion_rate: number;
  pipeline_velocity: number;
}

export interface IndustryGroup {
  id: string;
  name: string;
  color: string;
  industries: string[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterState {
  client_leaders: string[];
  industry_groups: string[];
  stages: string[];
  date_range: DateRange;
  search_query: string;
}

export interface ViewMode {
  type: 'kanban' | 'timeline' | 'calendar' | 'list';
  entity: 'opportunities' | 'jobs' | 'both';
}