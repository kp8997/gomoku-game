import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff } from 'lucide-react';

interface IncomingCallPopupProps {
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({ callerName, onAccept, onDecline }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="fixed bottom-28 right-4 sm:right-6 z-[57] w-[min(300px,calc(100vw-2rem))]"
      >
        <div
          className="rounded-2xl border border-glass-border shadow-2xl overflow-hidden"
          style={{ background: 'var(--color-glass-bg)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            {/* Pulsing ring avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Phone size={18} className="text-green-400" />
              </div>
              {/* Ripple rings */}
              <div className="absolute inset-0 rounded-full border-2 border-green-500/40 animate-ping" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">
                Incoming voice call
              </p>
              <p className="text-sm font-black text-content truncate">{callerName}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-4 pb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={onDecline}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-colors border-none shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={14} />
              Decline
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-black transition-colors border-none shadow-lg shadow-green-500/30"
            >
              <Phone size={14} />
              Accept
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallPopup;
