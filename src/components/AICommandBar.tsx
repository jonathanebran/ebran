import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { classifyAICommand } from '../lib/aiClassifier';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

interface AICommandBarProps {
  placeholder?: string;
  compact?: boolean;
}

export function AICommandBar({ placeholder = 'O que você quer organizar agora? 🔮', compact = false }: AICommandBarProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof classifyAICommand> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const r = classifyAICommand(input);
    setResult(r);
    setSheetOpen(true);
    setInput('');
  };

  return (
    <>
      <div
        className="flex items-center gap-3 rounded-2xl px-4"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          height: compact ? 48 : 56,
        }}
      >
        <Sparkles size={18} style={{ flexShrink: 0, stroke: 'url(#ai-grad)' }} />
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD84A" />
              <stop offset="100%" stopColor="#FF2F7D" />
            </linearGradient>
          </defs>
        </svg>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: '#F7F7F7' }}
        />
        <AnimatePresence>
          {input.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleSubmit}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FFD84A 0%, #FF2F7D 100%)',
              }}
            >
              <Send size={14} color="#000" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="IA interpretou">
        {result && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs text-[#A8A8A8] mb-1">Intenção detectada</p>
              <p className="text-[#F7F7F7] font-semibold capitalize">{result.intent.replace(/_/g, ' ')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-[#A8A8A8] font-medium">Ações sugeridas</p>
              {result.suggestedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF9F3D, #FF2F7D)' }}
                  />
                  <p className="text-sm text-[#F7F7F7]">{action}</p>
                </div>
              ))}
            </div>

            {result.confirmationRequired && (
              <PrimaryButton fullWidth onClick={() => setSheetOpen(false)}>
                Confirmar e salvar
              </PrimaryButton>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
