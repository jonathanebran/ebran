import { createContext, useContext, useState, type ReactNode } from 'react';

const THEME_KEY = 'ebran:theme:v1';

export interface ThemePreset {
  id: string;
  label: string;
  emoji: string;
  /** Paradas usadas nos gradientes da interface. */
  start: string;
  mid: string;
  end: string;
  /** Cor de destaque — textos, ícones e estados ativos sobre o fundo preto.
   *  É sempre a mais clara da paleta, senão some no preto do app. */
  accent: string;
  /** Cor do texto que fica em cima do gradiente (botão primário, por exemplo).
   *  Paletas escuras pedem branco; as claras, preto. */
  onGradient: string;
  /** Gradiente exato da paleta, mostrado no seletor de temas. Pode ter mais
   *  paradas que start/mid/end — é só uma amostra, não é usado na interface. */
  swatch: string;
}

export const THEMES: ThemePreset[] = [
  {
    // Fogo é o tema original do app — as mesmas cores do logo. Por isso não
    // tem paleta própria nem recebe filtro de cor no logo.
    id: 'fogo', label: 'Fogo', emoji: '🔥',
    start: '#FFD84A', mid: '#FF9F3D', end: '#FF2F7D',
    accent: '#FF9F3D', onGradient: '#000000',
    swatch: 'linear-gradient(135deg, #FFD84A 0%, #FF9F3D 35%, #FF6B5F 65%, #FF2F7D 100%)',
  },
  {
    id: 'oceano', label: 'Oceano', emoji: '🌊',
    start: '#03396C', mid: '#005B96', end: '#0190EA',
    accent: '#0190EA', onGradient: '#FFFFFF',
    swatch: 'linear-gradient(135deg, #03396C 0%, #005B96 50%, #0190EA 100%)',
  },
  {
    id: 'gelo', label: 'Gelo', emoji: '❄️',
    start: '#EBF8FF', mid: '#C2E9FB', end: '#A1C4FD',
    accent: '#A1C4FD', onGradient: '#000000',
    swatch: 'linear-gradient(135deg, #EBF8FF 0%, #C2E9FB 50%, #A1C4FD 100%)',
  },
  {
    id: 'floresta', label: 'Floresta', emoji: '🌿',
    start: '#0B3C12', mid: '#1B7A2B', end: '#5BD149',
    accent: '#5BD149', onGradient: '#FFFFFF',
    swatch: 'linear-gradient(135deg, #0B3C12 0%, #1B7A2B 50%, #5BD149 100%)',
  },
  {
    // Preto rende 5,0:1 no violeta e 8,3:1 no esmeralda — a faixa onde o texto
    // dos botões cai. O verde petróleo do fim é escuro, mas fica nas bordas.
    id: 'neon-nebula', label: 'Neon Nebula', emoji: '🌌',
    start: '#8B5CF6', mid: '#10B981', end: '#065F46',
    accent: '#8B5CF6', onGradient: '#000000',
    swatch: 'linear-gradient(135deg, #8B5CF6 0%, #10B981 50%, #065F46 100%)',
  },
  {
    // Paleta escura: preto sobre ela fica entre 1,7:1 e 3,6:1, ou seja,
    // ilegível. O texto dos botões é branco, que rende de 5,8:1 a 12,5:1.
    id: 'borgonha', label: 'Borgonha Imperial', emoji: '🍷',
    start: '#61192B', mid: '#8C233B', end: '#B8324F',
    accent: '#B8324F', onGradient: '#FFFFFF',
    swatch: 'linear-gradient(135deg, #61192B 0%, #8C233B 50%, #B8324F 100%)',
  },
  {
    id: 'pradaria', label: 'Pradaria de Lufa', emoji: '🌵',
    start: '#F5E6CA', mid: '#E0C097', end: '#D2A8B7',
    accent: '#E0C097', onGradient: '#000000',
    swatch: 'linear-gradient(135deg, #F5E6CA 0%, #E0C097 50%, #D2A8B7 100%)',
  },
  {
    // Paleta clara: preto rende de 4,2:1 a 12,6:1 sobre ela.
    id: 'sirio', label: 'Sírio do Sul', emoji: '🌟',
    start: '#B45309', mid: '#D97706', end: '#FBBF24',
    accent: '#FBBF24', onGradient: '#000000',
    swatch: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)',
  },
];

interface ThemeData {
  themeId: string;
  glassOpacity: number;
}

function loadThemeData(): ThemeData {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw) return JSON.parse(raw) as ThemeData;
  } catch { /* localStorage indisponível — segue com o padrão */ }
  return { themeId: 'fogo', glassOpacity: 0.72 };
}

// "#FF9F3D" -> "255,159,61", para poder usar em rgba(var(--x-rgb), 0.15)
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function applyThemeToDom(themeId: string, glassOpacity: number) {
  const preset = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;

  root.style.setProperty('--color-start', preset.start);
  root.style.setProperty('--color-mid', preset.mid);
  root.style.setProperty('--color-end', preset.end);
  root.style.setProperty('--color-accent', preset.accent);

  // Versões em RGB: usadas nos fundos e bordas translúcidos do app inteiro.
  root.style.setProperty('--color-start-rgb', hexToRgb(preset.start));
  root.style.setProperty('--color-mid-rgb', hexToRgb(preset.mid));
  root.style.setProperty('--color-end-rgb', hexToRgb(preset.end));
  root.style.setProperty('--color-accent-rgb', hexToRgb(preset.accent));

  // Texto/ícone que fica por cima do gradiente — muda com a luminosidade da
  // paleta, senão temas escuros ficariam com texto preto ilegível.
  root.style.setProperty('--color-on-gradient', preset.onGradient);

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
    try { localStorage.setItem(THEME_KEY, JSON.stringify(next)); } catch { /* armazenamento cheio ou indisponível */ }
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
