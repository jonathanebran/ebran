// Registro de atividades recentes, em localStorage. Cada ação relevante do
// app (aporte numa meta, item concluído, consulta agendada…) chama
// logActivity; a Home lê as últimas com loadActivity.

const KEY = 'ebran:activity:v1';
const MAX = 20;

export type ActivityIcon = 'goal' | 'focus' | 'income' | 'expense' | 'appointment' | 'medication';

export interface Activity {
  id: string;
  icon: ActivityIcon;
  title: string;
  subtitle?: string;
  at: string; // ISO
}

export function loadActivity(): Activity[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch {
    return [];
  }
}

export function logActivity(icon: ActivityIcon, title: string, subtitle?: string) {
  try {
    const list = loadActivity();
    list.unshift({ id: `act-${Date.now()}`, icon, title, subtitle, at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch { /* cheio ou indisponível */ }
}

// "agora", "2h", "ontem", "3d"
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ontem';
  return `${d}d`;
}
