import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for development if environment variables aren't loading
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wnzulchcttsxbvidkpzt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduenVsY2hjdHRzeGJ2aWRrcHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMzE5MTEsImV4cCI6MjA1NzYwNzkxMX0.-a0eipWsr_vPK3aFP52XoGlda6n7nDvLpe3ijnrrBL4';

// Remove console logs to avoid exposing sensitive information
// console.log('Supabase URL:', SUPABASE_URL);
// console.log('Supabase Anon Key:', SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are missing.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
