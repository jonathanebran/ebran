import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { classifyAICommand } from '../lib/aiClassifier';

const quickExamples = [
  'Recebi R$ 500 via Pix hoje',
  'Adiciona frango e ovos ao mercado',
  'Quero fazer botox em 3 meses, ~R$ 900',
  'Tenho psicóloga quinta às 15h',
  'Paguei R$ 300 no dermatologista',
];

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  result?: ReturnType<typeof classifyAICommand>;
}

const DESTINATION_ROUTES: Record<string, string> = {
  finance:        '/financas',
  goals:          '/metas',
  daily_focus:    '/foco',
  health:         '/saude',
  work:           '/trabalho',
  work_and_goals: '/trabalho',
  ai_hub:         '/ai-hub',
};

const ACTION_ROUTES: Record<string, string> = {
  'Ir para Finanças':    '/financas',
  'Ir para Metas':       '/metas',
  'Ir para Foco diário': '/foco',
  'Ir para Saúde':       '/saude',
  'Ir para Trabalho':    '/trabalho',
};

export function AIHub() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'ai',
      content: 'Olá! Sou a IA do Ebran. Pode me dizer o que quer organizar, registrar ou planejar. Use texto livre — voz e imagem em breve. 🔮',
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), type: 'user', content: text };
    const result = classifyAICommand(text);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `Entendido! Detectei: **${result.intent.replace(/_/g, ' ')}**. Aqui estão as ações sugeridas:`,
      result,
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 flex-shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <div className="flex items-center gap-2">
          <Sparkles size={18} color="#FF9F3D" />
          <h1 className="text-xl font-bold text-[#F7F7F7]">IA Ebran</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'ai' && (
                <div className="max-w-[85%]">
                  <GlassCard padding="p-3.5">
                    <p className="text-[#F7F7F7] text-sm leading-relaxed">{msg.content}</p>
                    {msg.result && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {msg.result.suggestedActions.filter(Boolean).map((action, i) => {
                          const dest = ACTION_ROUTES[action];
                          return dest ? (
                            <motion.button
                              key={i}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => navigate(dest)}
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-left w-full"
                              style={{ background: 'rgba(255,159,61,0.1)', border: '1px solid rgba(255,159,61,0.2)' }}
                            >
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#FF9F3D' }} />
                              <p className="text-xs text-[#FF9F3D] font-medium">{action}</p>
                            </motion.button>
                          ) : (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-xl px-3 py-2"
                              style={{ background: 'rgba(255,159,61,0.06)' }}
                            >
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#FF9F3D' }} />
                              <p className="text-xs text-[#A8A8A8]">{action}</p>
                            </div>
                          );
                        })}
                        {msg.result.confirmationRequired && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              const route = DESTINATION_ROUTES[msg.result!.suggestedDestination] ?? '/';
                              navigate(route);
                            }}
                            className="mt-1 py-2 rounded-xl text-xs font-semibold text-center"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-start,#FFD84A), var(--color-end,#FF2F7D))',
                              color: '#000',
                            }}
                          >
                            Confirmar e salvar
                          </motion.button>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}
              {msg.type === 'user' && (
                <div
                  className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm"
                  style={{ background: 'rgba(255,159,61,0.15)', border: '1px solid rgba(255,159,61,0.2)' }}
                >
                  <p className="text-[#F7F7F7] text-sm">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Quick examples */}
        {messages.length < 3 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-[#6F6F6F] text-xs">Tente dizer:</p>
            {quickExamples.map(ex => (
              <motion.button
                key={ex}
                whileTap={{ scale: 0.98 }}
                onClick={() => send(ex)}
                className="text-left px-3 py-2.5 rounded-xl text-xs"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#A8A8A8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                "{ex}"
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Mic size={18} color="#6F6F6F" />
        </motion.button>
        <div className="flex-1 flex items-center rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Digite uma ação..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#F7F7F7' }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, #FFD84A, #FF2F7D)'
              : 'rgba(255,255,255,0.06)',
          }}
        >
          <Send size={16} color={input.trim() ? '#000' : '#6F6F6F'} />
        </motion.button>
      </div>
    </div>
  );
}
