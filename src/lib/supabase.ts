import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co' &&
  !!supabaseAnonKey;

// Cliente sem o generic <Database>: o database.types.ts escrito à mão está
// desalinhado do schema real, então as queries de dados usam tipagem solta
// (auth continua tipado normalmente). Regenerar os tipos é uma limpeza futura.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
