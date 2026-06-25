import type { AIClassifierResult } from './types';

export function classifyAICommand(input: string): AIClassifierResult {
  const lower = input.toLowerCase();

  // Income: "recebi", "ganhei", "entrou"
  if (lower.includes('recebi') || lower.includes('ganhei') || (lower.includes('entrou') && (lower.includes('pix') || lower.includes('reais') || lower.includes('r$')))) {
    const valueMatch = input.match(/(\d+[\.,]?\d*)/);
    const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
    const method = lower.includes('pix') ? 'Pix' : lower.includes('transferência') ? 'Transferência' : lower.includes('dinheiro') ? 'Dinheiro' : 'Outro';
    return {
      intent: 'register_income',
      module: 'finance',
      action: 'create_finance_record',
      extractedData: { type: 'income', amount: value, method },
      suggestedDestination: 'finance',
      confirmationRequired: true,
      suggestedActions: [
        `Registrar entrada: R$ ${value}`,
        `Método: ${method}`,
        'Categoria: Receita',
      ],
    };
  }

  // Goal annotation: "anotar nas metas", "adicionar meta", "criar meta"
  if (lower.includes('meta') && (lower.includes('anotar') || lower.includes('adicionar') || lower.includes('criar') || lower.includes('quero') || lower.includes('nova'))) {
    return {
      intent: 'create_goal',
      module: 'goals',
      action: 'create_goal',
      extractedData: { input },
      suggestedDestination: 'goals',
      confirmationRequired: true,
      suggestedActions: [
        'Criar nova meta',
        'Definir valor e prazo',
        'Escolher categoria',
      ],
    };
  }

  // Finance + work + goal combination
  if (lower.includes('recebi') && lower.includes('pix') && lower.includes('jogar')) {
    const valueMatch = input.match(/R?\$?\s*(\d+[\.,]?\d*)/g);
    const values = valueMatch?.map(v => parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'))) ?? [];
    return {
      intent: 'register_income_and_contribute_goal',
      module: 'work_and_goals',
      action: 'create_work_record_and_goal_contribution',
      extractedData: {
        income: values[0] ?? 350,
        contribution: values[1] ?? 100,
        paymentMethod: 'pix',
        goal: 'Londres',
      },
      suggestedDestination: 'work_and_goals',
      confirmationRequired: true,
      suggestedActions: [
        `Criar registro de R$ ${values[0] ?? 350} em Trabalho (Pix)`,
        `Adicionar R$ ${values[1] ?? 100} à meta Londres`,
      ],
    };
  }

  // Shopping / care items
  if (lower.includes('adiciona') || lower.includes('coloca') || lower.includes('frango') || lower.includes('ovos') || lower.includes('protetor') || lower.includes('hidratante')) {
    const items: string[] = [];
    const marketItems = ['frango', 'ovos', 'banana', 'whey', 'creatina', 'leite', 'arroz', 'feijão'];
    const careItems = ['protetor solar', 'hidratante', 'sabonete', 'shampoo', 'condicionador', 'pasta de dente', 'minoxidil'];
    const foundMarket = marketItems.filter(i => lower.includes(i));
    const foundCare = careItems.filter(i => lower.includes(i));
    if (foundMarket.length) items.push(...foundMarket);
    if (foundCare.length) items.push(...foundCare);
    return {
      intent: 'add_items_to_focus',
      module: 'daily_focus',
      action: 'add_items',
      extractedData: { marketItems: foundMarket, careItems: foundCare },
      suggestedDestination: 'daily_focus',
      confirmationRequired: false,
      suggestedActions: [
        ...(foundMarket.length ? [`Adicionar ${foundMarket.join(', ')} ao Mercado`] : []),
        ...(foundCare.length ? [`Adicionar ${foundCare.join(', ')} ao Cuidado`] : []),
        'Sugerir recorrência para itens repetidos',
      ],
    };
  }

  // Care procedure / botox
  if (lower.includes('botox') || lower.includes('prp') || lower.includes('laser') || lower.includes('limpeza de pele') || (lower.includes('dermatologista') && !lower.includes('paguei'))) {
    const monthMatch = input.match(/(\d+)\s*mes/i);
    const months = monthMatch ? parseInt(monthMatch[1]) : 3;
    const valueMatch = input.match(/(\d+[\.,]?\d*)\s*reais?/i);
    const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 900;
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + months);
    return {
      intent: 'create_care_goal',
      module: 'goals',
      action: 'create_goal',
      extractedData: {
        type: 'care',
        title: lower.includes('botox') ? 'Botox' : lower.includes('prp') ? 'PRP Capilar' : 'Procedimento estético',
        target_amount: value,
        deadline: deadline.toISOString().split('T')[0],
        monthly_suggestion: Math.ceil(value / months),
      },
      suggestedDestination: 'goals',
      confirmationRequired: true,
      suggestedActions: [
        `Criar meta de cuidado: R$ ${value}`,
        `Prazo: ${months} meses`,
        `Guardar R$ ${Math.ceil(value / months)}/mês`,
        'Criar lembrete para agendar',
      ],
    };
  }

  // Appointment / psychology
  if (lower.includes('psicólog') || lower.includes('psiquiatr') || lower.includes('dentista') || (lower.includes('dermatologista') && !lower.includes('paguei'))) {
    const dayMatch = input.match(/(segunda|terça|quarta|quinta|sexta|sábado|domingo)/i);
    const timeMatch = input.match(/(\d{1,2})h(?:(\d{2})?)?/i);
    const specialty = lower.includes('psicólog') ? 'Psicólogo(a)'
      : lower.includes('psiquiatr') ? 'Psiquiatra'
      : lower.includes('dentista') ? 'Dentista'
      : 'Dermatologista';
    return {
      intent: 'create_appointment',
      module: 'health',
      action: 'create_appointment',
      extractedData: {
        specialty,
        day: dayMatch?.[1] ?? null,
        time: timeMatch ? `${timeMatch[1]}:${timeMatch[2] ?? '00'}` : null,
      },
      suggestedDestination: 'health',
      confirmationRequired: true,
      suggestedActions: [
        `Criar consulta: ${specialty}`,
        dayMatch ? `Dia: ${dayMatch[1]}` : '',
        timeMatch ? `Horário: ${timeMatch[1]}h${timeMatch[2] ?? '00'}` : '',
        'Vincular ao Google Calendar',
        'Criar lembrete',
      ].filter(Boolean) as string[],
    };
  }

  // Finance expense
  if (lower.includes('paguei') || lower.includes('gastei') || lower.includes('comprei')) {
    const valueMatch = input.match(/(\d+[\.,]?\d*)/);
    const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
    const isDerma = lower.includes('dermatologista');
    const isPsych = lower.includes('psicólog') || lower.includes('psiquiatr');
    return {
      intent: 'create_expense',
      module: 'finance',
      action: 'create_finance_record',
      extractedData: {
        type: 'expense',
        amount: value,
        category: isDerma || isPsych ? 'care' : 'general',
        description: input,
      },
      suggestedDestination: 'finance',
      confirmationRequired: true,
      suggestedActions: [
        `Registrar despesa: R$ ${value}`,
        isDerma ? 'Categoria: Cuidado pessoal > Consultas' : 'Escolher categoria',
        'Permitir anexar comprovante',
      ],
    };
  }

  // Work / faturamento
  if (lower.includes('atendimento') || lower.includes('cliente') || lower.includes('faturei') || lower.includes('cobrei') || lower.includes('serviço')) {
    const valueMatch = input.match(/(\d+[\.,]?\d*)/);
    const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
    return {
      intent: 'register_work_record',
      module: 'work',
      action: 'create_work_record',
      extractedData: { amount: value, description: input },
      suggestedDestination: 'work',
      confirmationRequired: true,
      suggestedActions: [
        value > 0 ? `Registrar R$ ${value} em Trabalho` : 'Registrar atendimento',
        'Definir tipo de serviço',
        'Vincular ao cliente',
      ],
    };
  }

  // Generic fallback — show navigation options
  return {
    intent: 'general_query',
    module: 'ai_hub',
    action: 'process_query',
    extractedData: { input },
    suggestedDestination: 'ai_hub',
    confirmationRequired: false,
    suggestedActions: [
      'Ir para Finanças',
      'Ir para Metas',
      'Ir para Foco diário',
      'Ir para Saúde',
    ],
  };
}
