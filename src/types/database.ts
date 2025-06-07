export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'industry_leader' | 'account_owner' | 'client_leader' | 'admin';
          avatar: string | null;
          industry_groups: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'industry_leader' | 'account_owner' | 'client_leader' | 'admin';
          avatar?: string | null;
          industry_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'industry_leader' | 'account_owner' | 'client_leader' | 'admin';
          avatar?: string | null;
          industry_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          name: string;
          legal_name: string;
          billing_address: string | null;
          payment_terms: string;
          industry: string;
          industry_group: string;
          account_owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name: string;
          billing_address?: string | null;
          payment_terms?: string;
          industry: string;
          industry_group: string;
          account_owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          legal_name?: string;
          billing_address?: string | null;
          payment_terms?: string;
          industry?: string;
          industry_group?: string;
          account_owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          name: string;
          account_id: string;
          value: number;
          stage: 'exploration' | 'ready_for_proposal' | 'closed_won' | 'closed_lost';
          probability: number;
          client_leader_id: string | null;
          expected_confirmation_date: string | null;
          created_at: string;
          updated_at: string;
          notes: string;
          source: string;
          competitor: string | null;
          lost_reason: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          account_id: string;
          value?: number;
          stage?: 'exploration' | 'ready_for_proposal' | 'closed_won' | 'closed_lost';
          probability?: number;
          client_leader_id?: string | null;
          expected_confirmation_date?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          source?: string;
          competitor?: string | null;
          lost_reason?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          account_id?: string;
          value?: number;
          stage?: 'exploration' | 'ready_for_proposal' | 'closed_won' | 'closed_lost';
          probability?: number;
          client_leader_id?: string | null;
          expected_confirmation_date?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          source?: string;
          competitor?: string | null;
          lost_reason?: string | null;
        };
      };
      jobs: {
        Row: {
          id: string;
          job_code: string;
          name: string;
          opportunity_id: string | null;
          account_id: string;
          value: number;
          stage: 'proposal_preparation' | 'proposal_sent' | 'final_negotiation' | 'backlog' | 'closed' | 'lost';
          project_status: 'to_be_started' | 'ongoing' | 'finished' | 'closed';
          client_leader_id: string | null;
          expected_confirmation_date: string | null;
          project_start_date: string | null;
          project_end_date: string | null;
          created_at: string;
          updated_at: string;
          notes: string;
          priority: 'low' | 'medium' | 'high';
          lost_reason: string | null;
          auto_closed: boolean;
        };
        Insert: {
          id?: string;
          job_code?: string;
          name: string;
          opportunity_id?: string | null;
          account_id: string;
          value?: number;
          stage?: 'proposal_preparation' | 'proposal_sent' | 'final_negotiation' | 'backlog' | 'closed' | 'lost';
          project_status?: 'to_be_started' | 'ongoing' | 'finished' | 'closed';
          client_leader_id?: string | null;
          expected_confirmation_date?: string | null;
          project_start_date?: string | null;
          project_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          priority?: 'low' | 'medium' | 'high';
          lost_reason?: string | null;
          auto_closed?: boolean;
        };
        Update: {
          id?: string;
          job_code?: string;
          name?: string;
          opportunity_id?: string | null;
          account_id?: string;
          value?: number;
          stage?: 'proposal_preparation' | 'proposal_sent' | 'final_negotiation' | 'backlog' | 'closed' | 'lost';
          project_status?: 'to_be_started' | 'ongoing' | 'finished' | 'closed';
          client_leader_id?: string | null;
          expected_confirmation_date?: string | null;
          project_start_date?: string | null;
          project_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          priority?: 'low' | 'medium' | 'high';
          lost_reason?: string | null;
          auto_closed?: boolean;
        };
      };
      documents: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          type: 'nda' | 'rfp' | 'contract' | 'proposal' | 'msa' | 'po' | 'other';
          file_path: string;
          file_size: number;
          uploaded_by: string | null;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          name: string;
          type: 'nda' | 'rfp' | 'contract' | 'proposal' | 'msa' | 'po' | 'other';
          file_path: string;
          file_size: number;
          uploaded_by?: string | null;
          version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          name?: string;
          type?: 'nda' | 'rfp' | 'contract' | 'proposal' | 'msa' | 'po' | 'other';
          file_path?: string;
          file_size?: number;
          uploaded_by?: string | null;
          version?: number;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          details: any;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          action: string;
          details?: any;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          details?: any;
          user_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'industry_leader' | 'account_owner' | 'client_leader' | 'admin';
      opportunity_stage: 'exploration' | 'ready_for_proposal' | 'closed_won' | 'closed_lost';
      job_stage: 'proposal_preparation' | 'proposal_sent' | 'final_negotiation' | 'backlog' | 'closed' | 'lost';
      project_status: 'to_be_started' | 'ongoing' | 'finished' | 'closed';
      priority_level: 'low' | 'medium' | 'high';
      document_type: 'nda' | 'rfp' | 'contract' | 'proposal' | 'msa' | 'po' | 'other';
    };
  };
}