import { useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useCloudBlob } from '../hooks/useCloudBlob';

/**
 * Sincroniza a preferência de tema (themeId + glassOpacity) com a conta do
 * usuário, para o tema ser o mesmo em todos os dispositivos. Usa o mesmo
 * mecanismo (app_state) das demais áreas, com diagnóstico no console.
 */
export function ThemeSync() {
  const { themeId, glassOpacity, setTheme, setGlassOpacity } = useTheme();

  const blob = useMemo(() => ({ themeId, glassOpacity }), [themeId, glassOpacity]);
  const applyRemote = useCallback((remote: { themeId?: string; glassOpacity?: number }) => {
    if (remote.themeId) setTheme(remote.themeId);
    if (typeof remote.glassOpacity === 'number') setGlassOpacity(remote.glassOpacity);
  }, [setTheme, setGlassOpacity]);

  useCloudBlob('theme', blob, applyRemote);

  return null;
}
