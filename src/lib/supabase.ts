import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

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
  const fileExt = file.name.split('.').pop();
  const fileName = `${jobId}/${documentType}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
    
  if (error) throw error;
  return data;
};

export const getDocumentUrl = (path: string) => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
    
  return data.publicUrl;
};