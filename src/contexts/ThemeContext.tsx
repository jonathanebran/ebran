import { createContext, useContext, useState, type ReactNode } from 'react';

const THEME_KEY = 'ebran:theme:v1';

export interface ThemePreset {
  id: string;
  label: string;
  emoji: string;
  start: string;
  mid: string;
  end: string;
  accent: string;
}

export const THEMES: ThemePreset[] = [
  { id: 'fogo',      label: 'Fogo',      emoji: '🔥', start: '#FFD84A', mid: '#FF9F3D', end: '#FF2F7D', accent: '#FF9F3D' },
  { id: 'oceano',    label: 'Oceano',    emoji: '🌊', start: '#00D2FF', mid: '#4285F4', end: '#3B5BDB', accent: '#4285F4' },
  { id: 'floresta',  label: 'Floresta',  emoji: '🌿', start: '#A8FF78', mid: '#2ECC71', end: '#1ABC9C', accent: '#2ECC71' },
  { id: 'violeta',   label: 'Violeta',   emoji: '💜', start: '#E9A8FF', mid: '#9B51E0', end: '#5B2DD1', accent: '#9B51E0' },
  { id: 'aurora',    label: 'Aurora',    emoji: '🌸', start: '#FF8FAB', mid: '#FF5C8D', end: '#C0288C', accent: '#FF5C8D' },
  { id: 'gelo',      label: 'Gelo',      emoji: '❄️', start: '#A8DFFF', mid: '#00B4D8', end: '#0077B6', accent: '#00B4D8' },
  { id: 'por-do-sol',label: 'Pôr do Sol',emoji: '🌅', start: '#FFB347', mid: '#FF6B35', end: '#E84545', accent: '#FF6B35' },
  { id: 'cosmos',    label: 'Cosmos',    emoji: '🪐', start: '#C2A4FF', mid: '#7A5AF8', end: '#3A1FA8', accent: '#7A5AF8' },
];

interface ThemeData {
  themeId: string;
  glassOpacity: number;
}

function loadThemeData(): ThemeData {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw) return JSON.parse(raw) as ThemeData;
  } catch {}
  return { themeId: 'fogo', glassOpacity: 0.72 };
}

export function applyThemeToDom(themeId: string, glassOpacity: number) {
  const preset = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--color-start', preset.start);
  root.style.setProperty('--color-mid', preset.mid);
  root.style.setProperty('--color-end', preset.end);
  root.style.setProperty('--color-accent', preset.accent);
  root.style.setProperty('--glass-opacity', String(glassOpacity));
}

interface ThemeCtx {
  themeId: string;
  glassOpacity: number;
  setTheme: (id: string) => void;
  setGlassOpacity: (v: number) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  themeId: 'fogo',
  glassOpacity: 0.72,
  setTheme: () => {},
  setGlassOpacity: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ThemeData>(() => {
    const d = loadThemeData();
    applyThemeToDom(d.themeId, d.glassOpacity);
    return d;
  });

  const save = (next: ThemeData) => {
    setData(next);
    applyThemeToDom(next.themeId, next.glassOpacity);
    try { localStorage.setItem(THEME_KEY, JSON.stringify(next)); } catch {}
  };

  return (
    <ThemeContext.Provider value={{
      themeId: data.themeId,
      glassOpacity: data.glassOpacity,
      setTheme: (id) => save({ ...data, themeId: id }),
      setGlassOpacity: (v) => save({ ...data, glassOpacity: v }),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
