import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getCurrentUserProfile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const { profile: userProfile, error: profileError } = await getCurrentUserProfile();
          if (profileError) {
            setError(profileError.toString());
          } else {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { profile: userProfile, error: profileError } = await getCurrentUserProfile();
          if (profileError) {
            setError(profileError.toString());
          } else {
            setProfile(userProfile);
            setError(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const { profile: userProfile, error: profileError } = await getCurrentUserProfile();
      if (profileError) {
        setError(profileError.toString());
      } else {
        setProfile(userProfile);
        setError(null);
      }
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    refreshProfile
  };
};