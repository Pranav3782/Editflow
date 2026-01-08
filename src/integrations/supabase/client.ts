
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase environment variables. Check your .env file.',
        '\nRequired keys:',
        '\n- VITE_SUPABASE_URL',
        '\n- VITE_SUPABASE_ANON_KEY'
    );
}

// Fallback to prevent app crash if variables are missing
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
