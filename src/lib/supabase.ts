import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: userData.name,
          role: userData.role || 'client_leader',
          industry_groups: userData.industry_groups || []
        });
        
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
};

export const getCurrentUserProfile = async () => {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { profile: null, error: 'No authenticated user' };
    
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return { profile, error };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { profile: null, error };
  }
};

// Real-time subscriptions
export const subscribeToOpportunities = (callback: (payload: any) => void) => {
  return supabase
    .channel('opportunities')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'opportunities' }, 
      callback
    )
    .subscribe();
};

export const subscribeToJobs = (callback: (payload: any) => void) => {
  return supabase
    .channel('jobs')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'jobs' }, 
      callback
    )
    .subscribe();
};

// File upload helpers
export const uploadDocument = async (file: File, jobId: string, documentType: string) => {
  try {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${jobId}/${user.id}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);
      
    if (error) throw error;
    
    // Create document record
    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        job_id: jobId,
        name: file.name,
        type: documentType as any,
        file_path: data.path,
        file_size: file.size,
        uploaded_by: user.id
      })
      .select()
      .single();
      
    if (docError) throw docError;
    
    await logActivity('job', jobId, 'document_uploaded', { 
      document_name: file.name, 
      document_type: documentType 
    });
    
    return { data: docRecord, error: null };
  } catch (error) {
    console.error('Upload document error:', error);
    return { data: null, error };
  }
};

export const getDocumentUrl = (path: string) => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
    
  return data.publicUrl;
};

export const downloadDocument = async (path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Download document error:', error);
    return { data: null, error };
  }
};

// Activity logging
export const logActivity = async (
  entityType: string,
  entityId: string,
  action: string,
  details: any = {}
) => {
  try {
    const { user } = await getCurrentUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        action,
        details,
        user_id: user.id
      });
      
    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// Error handling helper
export const handleSupabaseError = (error: any) => {
  if (error?.code === 'PGRST301') {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (error?.code === 'PGRST116') {
    return 'Record not found.';
  }
  if (error?.code === '23505') {
    return 'A record with this information already exists.';
  }
  if (error?.code === '23503') {
    return 'Cannot delete this record because it is referenced by other data.';
  }
  
  return error?.message || 'An unexpected error occurred.';
};