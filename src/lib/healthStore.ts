// Armazém simples da Saúde, em localStorage. Sem servidor: tudo mora no
// aparelho. A página de Saúde e o resumo da Home leem daqui.
import type { Appointment, Medication } from './types';

const KEY = 'ebran:health:v1';

export interface HealthData {
  water: number;          // litros de hoje
  waterTarget: number;    // meta em litros
  workoutWeekStart: string;   // domingo da semana atual (YYYY-MM-DD)
  workoutDays: number[];      // dias da semana (0=Dom..6=Sáb) com treino feito
  workoutGoal: number;        // meta de treinos na semana
  appointments: Appointment[];
  medications: Medication[];
  day: string;            // data (YYYY-MM-DD) a que a água se refere
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Domingo da semana atual (padrão BR), para saber quando zerar os treinos.
function weekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // 0 = domingo
  return d.toISOString().slice(0, 10);
}

function fresh(): HealthData {
  return {
    water: 0, waterTarget: 3,
    workoutWeekStart: weekStart(), workoutDays: [], workoutGoal: 5,
    appointments: [], medications: [],
    day: todayKey(),
  };
}

// Aplica as viradas de dia (zera água) e de semana (zera treinos) a um dado
// já carregado — usado tanto no load local quanto ao receber da nuvem.
export function normalizeHealth(input: Partial<HealthData>): HealthData {
  const data = { ...fresh(), ...input } as HealthData;
  if (data.day !== todayKey()) {
    data.day = todayKey();
    data.water = 0;
  }
  if (data.workoutWeekStart !== weekStart()) {
    data.workoutWeekStart = weekStart();
    data.workoutDays = [];
  }
  return data;
}

export function loadHealth(): HealthData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return normalizeHealth(JSON.parse(raw));
  } catch {
    return fresh();
  }
}

export function saveHealth(data: HealthData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* cheio ou indisponível */ }
}
