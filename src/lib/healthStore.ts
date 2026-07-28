// Armazém simples da Saúde, em localStorage. Sem servidor: tudo mora no
// aparelho. A página de Saúde e o resumo da Home leem daqui.
import type { Appointment, Medication } from './types';

const KEY = 'ebran:health:v1';

export interface Habit { id: string; name: string; done: boolean }

export interface HealthData {
  water: number;          // litros de hoje
  waterTarget: number;    // meta em litros
  sleepHours: number;
  sleepMinutes: number;
  workoutWeekStart: string;   // segunda-feira da semana atual (YYYY-MM-DD)
  workoutDays: number[];      // dias da semana (0=Dom..6=Sáb) com treino feito
  habits: Habit[];
  appointments: Appointment[];
  medications: Medication[];
  day: string;            // data (YYYY-MM-DD) a que água/sono se referem
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Segunda-feira da semana atual, para saber quando zerar os treinos.
function weekStart(): string {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dow);
  return d.toISOString().slice(0, 10);
}

function fresh(): HealthData {
  return {
    water: 0, waterTarget: 3,
    sleepHours: 0, sleepMinutes: 0,
    workoutWeekStart: weekStart(), workoutDays: [],
    habits: [], appointments: [], medications: [],
    day: todayKey(),
  };
}

export function loadHealth(): HealthData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const data = { ...fresh(), ...JSON.parse(raw) } as HealthData;
    // Vira o dia: zera água e sono.
    if (data.day !== todayKey()) {
      data.day = todayKey();
      data.water = 0;
      data.sleepHours = 0;
      data.sleepMinutes = 0;
    }
    // Vira a semana: zera os treinos marcados.
    if (data.workoutWeekStart !== weekStart()) {
      data.workoutWeekStart = weekStart();
      data.workoutDays = [];
    }
    return data;
  } catch {
    return fresh();
  }
}

export function saveHealth(data: HealthData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* cheio ou indisponível */ }
}
