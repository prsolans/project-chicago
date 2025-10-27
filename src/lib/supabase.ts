/**
 * Supabase client configuration
 * Provides typed client for database operations
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Typed Supabase client for database operations
 * Includes all tables, views, and functions defined in the schema
 */
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false, // Single user app, no auth needed
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'hellofriend-web',
      },
    },
  }
);

/**
 * Check if Supabase is configured and reachable
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('phrases').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

/**
 * Export type for use in components
 */
export type SupabaseClient = typeof supabase;
