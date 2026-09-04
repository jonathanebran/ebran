import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudEnabled, pullState, pushState } from '../lib/cloudState';

/**
 * Sincroniza um bloco de estado (`value`) com a conta do usuário, na área `key`.
 *
 * - Ao logar: baixa o bloco da nuvem e aplica com `applyRemote`. Se a nuvem
 *   ainda não tem nada, sobe o valor local atual (migração).
 * - Depois de hidratar: toda mudança de `value` é gravada na nuvem.
 *
 * `hydrated` é ESTADO (não ref): quando a hidratação termina, o efeito de
 * escrita reavalia e grava o valor atual — evitando a corrida em que uma
 * mudança feita durante o carregamento nunca era enviada.
 *
 * Sem Supabase ou deslogado, não faz nada (o app segue local).
 */
export function useCloudBlob<T>(
  key: string,
  value: T,
  applyRemote: (remote: T) => void,
) {
  const { user } = useAuth();
  const userId = user?.id;
  const [hydrated, setHydrated] = useState(false);
  // Guarda a última coisa gravada/lida para não reenviar igual.
  const lastRef = useRef<string>('');

  // Baixa (ou migra) ao logar.
  useEffect(() => {
    if (!cloudEnabled(userId)) return;
    let cancelled = false;
    setHydrated(false);
    (async () => {
      const remote = await pullState<T>(userId, key);
      if (cancelled) return;
      if (remote != null) {
        applyRemote(remote);
        lastRef.current = JSON.stringify(remote);
      } else {
        await pushState(userId, key, value);
        lastRef.current = JSON.stringify(value);
      }
      setHydrated(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key]);

  // Grava na nuvem quando o valor muda (depois de hidratar).
  useEffect(() => {
    if (!hydrated || !cloudEnabled(userId)) return;
    const snapshot = JSON.stringify(value);
    if (snapshot === lastRef.current) return;
    lastRef.current = snapshot;
    void pushState(userId, key, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hydrated, userId, key]);
}
