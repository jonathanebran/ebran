export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getMonthlySuggestion(target: number, current: number, deadline: string): number {
  const remaining = target - current;
  const months = getDaysRemaining(deadline) / 30;
  if (months <= 0) return remaining;
  return Math.ceil(remaining / months);
}

export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return map[priority] ?? priority;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    planning: 'Planejando',
    active: 'Ativa',
    paused: 'Pausada',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    archived: 'Arquivada',
    pending: 'Pendente',
    done: 'Feito',
    skipped: 'Ignorado',
  };
  return map[status] ?? status;
}

export function getRecurrenceLabel(rec: string): string {
  const map: Record<string, string> = {
    once: 'Única',
    daily: 'Diária',
    weekly: 'Semanal',
    biweekly: 'Quinzenal',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    semiannual: 'Semestral',
    annual: 'Anual',
    custom: 'Personalizada',
  };
  return map[rec] ?? rec;
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
