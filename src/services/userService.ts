import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  async getAll(filters: any = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.industry_groups?.length > 0) {
        query = query.overlaps('industry_groups', filters.industry_groups);
      }

      if (filters.search_query) {
        query = query.or(`name.ilike.%${filters.search_query}%,email.ilike.%${filters.search_query}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async update(id: string, updates: UserUpdate) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity('user', id, 'updated', updates);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getActivityLogs(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  }
};