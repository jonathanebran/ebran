import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 rounded-3xl p-5 max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(22,22,24,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              transform: 'translateY(-50%)',
            }}
            initial={{ opacity: 0, scale: 0.92, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, y: '-45%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#F7F7F7] font-bold text-lg">{title}</h2>
                <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
                  <X size={20} color="#6F6F6F" />
                </motion.button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
