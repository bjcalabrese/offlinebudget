// Supabase client with environment-based configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Check if we're running locally
const isLocal = import.meta.env.VITE_LOCAL_SUPABASE === 'true' || 
               (import.meta.env.MODE === 'development' && 
                import.meta.env.VITE_SUPABASE_URL?.includes('localhost'));

const SUPABASE_URL = isLocal 
  ? (import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321")
  : "https://vpmeqoesvaixucailbxw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = isLocal
  ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE5NTcxNDUyMDB9.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE")
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbWVxb2VzdmFpeHVjYWlsYnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDE3NjMsImV4cCI6MjA3MzcxNzc2M30.QG4Gri8T1wo0D6UxNOqVz9Y46andD5c2gRoUC5rozp8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});