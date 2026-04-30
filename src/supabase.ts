import { createClient } from '@supabase/supabase-js';

// Check for environment variables first, then fallback to localStorage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('SUPABASE_LOCAL_URL');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_LOCAL_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing in environment. Using fallbacks or awaiting manual setup.');
}

// Ensure the URL is valid to avoid "Invalid path" errors on initial load
const finalUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
