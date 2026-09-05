import { supabase, isSupabaseConfigured } from './supabase';

// Liga/desliga os logs de diagnóstico no console (prefixo [ebran-sync]).
const DEBUG = true;
function log(...args: unknown[]) { if (DEBUG) console.log('[ebran-sync]', ...args); }
function warn(...args: unknown[]) { if (DEBUG) console.warn('[ebran-sync]', ...args); }

export function cloudEnabled(userId?: string): userId is string {
  return isSupabaseConfigured && !!supabase && !!userId;
}

/** Lê o bloco JSON de uma área (key) da conta do usuário. */
export async function pullState<T>(userId: string, key: string): Promise<T | null> {
  log(`pull "${key}" …`);
  const { data, error } = await supabase!
    .from('app_state')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle();
  if (error) {
    warn(`pull "${key}" FALHOU:`, error.message, error);
    return null;
  }
  log(`pull "${key}" ok →`, data?.value ? 'tem dados' : 'vazio');
  return (data?.value ?? null) as T | null;
}

/** Grava (substitui) o bloco JSON de uma área na conta do usuário. */
export async function pushState(userId: string, key: string, value: unknown): Promise<boolean> {
  log(`push "${key}" …`);
  const { error } = await supabase!
    .from('app_state')
    .upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' },
    );
  if (error) {
    warn(`push "${key}" FALHOU:`, error.message, error);
    return false;
  }
  log(`push "${key}" ok`);
  return true;
}
