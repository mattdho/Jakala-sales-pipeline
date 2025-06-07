import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getCurrentUserProfile, handleSupabaseError } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

// Helper function to create a timeout promise
const createTimeoutPromise = (timeoutMs: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Authentication timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
};

// Helper function to wrap async operations with timeout
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs)
  ]) as Promise<T>;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wrap the authentication calls with a 10-second timeout
        const { user: currentUser } = await withTimeout(getCurrentUser(), 10000);
        setUser(currentUser);
        
        if (currentUser) {
          const { profile: userProfile, error: profileError } = await withTimeout(
            getCurrentUserProfile(), 
            10000
          );
          
          if (profileError) {
            setError(handleSupabaseError(profileError));
          } else {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        
        if (err instanceof Error && err.message.includes('timeout')) {
          setError('Authentication is taking longer than expected. Please refresh the page or clear your browser data.');
        } else {
          setError(err instanceof Error ? err.message : 'Authentication error');
        }
        
        // Clear potentially corrupted session data
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error clearing session:', signOutError);
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with timeout protection
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const { profile: userProfile, error: profileError } = await withTimeout(
              getCurrentUserProfile(),
              8000 // Slightly shorter timeout for state changes
            );
            
            if (profileError) {
              setError(handleSupabaseError(profileError));
            } else {
              setProfile(userProfile);
              setError(null);
            }
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          
          if (err instanceof Error && err.message.includes('timeout')) {
            setError('Session update timed out. Please refresh the page.');
          } else {
            setError(err instanceof Error ? err.message : 'Session error');
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const { profile: userProfile, error: profileError } = await withTimeout(
          getCurrentUserProfile(),
          8000
        );
        
        if (profileError) {
          setError(handleSupabaseError(profileError));
        } else {
          setProfile(userProfile);
          setError(null);
        }
      } catch (err) {
        console.error('Profile refresh error:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh profile');
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