import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export const jobService = {
  async getAll(filters: any = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*),
          opportunity:opportunities(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.client_leader_id) {
        query = query.eq('client_leader_id', filters.client_leader_id);
      }

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      if (filters.project_status) {
        query = query.eq('project_status', filters.project_status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.industry_groups?.length > 0) {
        query = query.in('accounts.industry_group', filters.industry_groups);
      }

      if (filters.search_query) {
        query = query.or(`name.ilike.%${filters.search_query}%,job_code.ilike.%${filters.search_query}%,notes.ilike.%${filters.search_query}%`);
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
      console.error('Error fetching jobs:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*),
          opportunity:opportunities(*),
          documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching job:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async create(job: JobInsert) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*),
          opportunity:opportunities(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('job', data.id, 'created', job);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating job:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async update(id: string, updates: JobUpdate) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          account:accounts(*),
          client_leader:users(*),
          opportunity:opportunities(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('job', id, 'updated', updates);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating job:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity('job', id, 'deleted');
      return { error: null };
    } catch (error) {
      console.error('Error deleting job:', error);
      return { error: handleSupabaseError(error) };
    }
  },

  async getMetrics() {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*');

      if (error) throw error;

      const total = jobs.length;
      const totalValue = jobs.reduce((sum, job) => sum + job.value, 0);
      const activeJobs = jobs.filter(job => !['closed', 'lost'].includes(job.stage));
      const completedJobs = jobs.filter(job => job.project_status === 'finished');

      return {
        data: {
          total_jobs: total,
          active_jobs: activeJobs.length,
          completed_jobs: completedJobs.length,
          total_job_value: totalValue,
          avg_job_size: total > 0 ? totalValue / total : 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching job metrics:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getDocuments(jobId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          uploaded_by:users(name, email)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching job documents:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  }
};