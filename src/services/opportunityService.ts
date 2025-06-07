import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update'];

export const opportunityService = {
  async getAll(filters: any = {}) {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.client_leader_id) {
        query = query.eq('client_leader_id', filters.client_leader_id);
      }

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      if (filters.industry_groups?.length > 0) {
        query = query.in('accounts.industry_group', filters.industry_groups);
      }

      if (filters.search_query) {
        query = query.or(`name.ilike.%${filters.search_query}%,notes.ilike.%${filters.search_query}%`);
      }

      if (filters.date_range?.start) {
        query = query.gte('created_at', filters.date_range.start);
      }

      if (filters.date_range?.end) {
        query = query.lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*),
          jobs(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async create(opportunity: OpportunityInsert) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunity)
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('opportunity', data.id, 'created', opportunity);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async update(id: string, updates: OpportunityUpdate) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('opportunity', id, 'updated', updates);
      
      // Auto-create job if stage changed to ready_for_proposal
      if (updates.stage === 'ready_for_proposal') {
        await this.createJobFromOpportunity(data);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity('opportunity', id, 'deleted');
      return { error: null };
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      return { error: handleSupabaseError(error) };
    }
  },

  async createJobFromOpportunity(opportunity: Opportunity) {
    try {
      const jobData = {
        name: `${opportunity.name} - Project`,
        opportunity_id: opportunity.id,
        account_id: opportunity.account_id,
        value: opportunity.value,
        client_leader_id: opportunity.client_leader_id,
        expected_confirmation_date: opportunity.expected_confirmation_date,
        notes: `Auto-created from opportunity: ${opportunity.name}`
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      await logActivity('opportunity', opportunity.id, 'job_created', { job_id: data.id });
      return { data, error: null };
    } catch (error) {
      console.error('Error creating job from opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getMetrics() {
    try {
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*');

      if (error) throw error;

      const total = opportunities.length;
      const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
      const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
      const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed_won');
      const lostOpportunities = opportunities.filter(opp => opp.stage === 'closed_lost');
      const winRate = (wonOpportunities.length + lostOpportunities.length) > 0 
        ? (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100 
        : 0;

      return {
        data: {
          total_opportunities: total,
          total_pipeline_value: totalValue,
          weighted_pipeline_value: weightedValue,
          win_rate: winRate,
          avg_deal_size: total > 0 ? totalValue / total : 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching opportunity metrics:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  }
};