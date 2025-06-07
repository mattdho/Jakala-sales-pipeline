import { supabase, logActivity, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export const accountService = {
  async getAll(filters: any = {}) {
    try {
      let query = supabase
        .from('accounts')
        .select(`
          *,
          account_owner:users(*)
        `)
        .order('name', { ascending: true });

      if (filters.industry_groups?.length > 0) {
        query = query.in('industry_group', filters.industry_groups);
      }

      if (filters.account_owner_id) {
        query = query.eq('account_owner_id', filters.account_owner_id);
      }

      if (filters.search_query) {
        query = query.or(`name.ilike.%${filters.search_query}%,legal_name.ilike.%${filters.search_query}%,industry.ilike.%${filters.search_query}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          account_owner:users(*),
          opportunities(*),
          jobs(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching account:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async create(account: AccountInsert) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert(account)
        .select(`
          *,
          account_owner:users(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('account', data.id, 'created', account);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating account:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async update(id: string, updates: AccountUpdate) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          account_owner:users(*)
        `)
        .single();

      if (error) throw error;

      await logActivity('account', id, 'updated', updates);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating account:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity('account', id, 'deleted');
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error: handleSupabaseError(error) };
    }
  }
};