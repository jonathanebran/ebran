import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Ponte que sincroniza a preferência de tema com a conta do usuário (Supabase),
 * para o tema ser o mesmo em todos os dispositivos.
 *
 * - Ao logar: baixa o tema da nuvem e aplica. Se a nuvem ainda não tem tema,
 *   sobe o tema local atual (migração).
 * - Ao trocar o tema: grava na nuvem.
 *
 * Sem Supabase configurado ou deslogado, não faz nada (o app segue local).
 */
export function ThemeSync() {
  const { user } = useAuth();
  const { themeId, glassOpacity, setTheme, setGlassOpacity } = useTheme();
  const hydratedRef = useRef(false);
  const lastSyncedRef = useRef<string>('');

  // Baixa (ou migra) o tema ao logar.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase!
        .from('profiles')
        .select('theme_id, glass_opacity')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;

      if (data && data.theme_id) {
        // Nuvem manda: aplica o tema salvo na conta.
        setTheme(data.theme_id);
        if (typeof data.glass_opacity === 'number') setGlassOpacity(data.glass_opacity);
        lastSyncedRef.current = `${data.theme_id}|${data.glass_opacity}`;
      } else {
        // Primeira vez: sobe o tema local atual para a nuvem.
        await supabase!
          .from('profiles')
          .upsert({ id: user.id, theme_id: themeId, glass_opacity: glassOpacity });
        lastSyncedRef.current = `${themeId}|${glassOpacity}`;
      }
      hydratedRef.current = true;
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Grava na nuvem quando o usuário troca o tema (depois de já ter hidratado).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user || !hydratedRef.current) return;
    const key = `${themeId}|${glassOpacity}`;
    if (key === lastSyncedRef.current) return;
    lastSyncedRef.current = key;
    void supabase
      .from('profiles')
      .upsert({ id: user.id, theme_id: themeId, glass_opacity: glassOpacity });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, glassOpacity]);

  return null;
}
