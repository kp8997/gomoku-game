import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

/** All possible voice call states */
export type VoiceCallState =
  | 'IDLE'          // no call
  | 'CALLING'       // this user initiated, waiting for other to accept
  | 'RECEIVING'     // this user has an incoming call to accept/decline
  | 'CONNECTING'    // WebRTC handshake in progress
  | 'IN_CALL';      // P2P audio active

interface VoiceCallButtonsProps {
  /** Current state of the voice call. */
  callState: VoiceCallState;
  /** Whether the local mic is currently muted. */
  isMuted: boolean;
  /** True only when gameMode===MULTIPLE and playerCount===2. */
  canCall: boolean;
  onCallClick: () => void;
  onHangUp: () => void;
  onToggleMic: () => void;
}

const VoiceCallButtons: React.FC<VoiceCallButtonsProps> = ({
  callState,
  isMuted,
  canCall,
  onCallClick,
  onHangUp,
  onToggleMic,
}) => {
  const isInCall = callState === 'IN_CALL' || callState === 'CONNECTING';
  const isCalling = callState === 'CALLING';

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {/* ── IN CALL: Mic toggle + Hang Up ── */}
        {isInCall && (
          <React.Fragment key="in-call-controls">
            {/* Mic Toggle */}
            <motion.button
              key="mic-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggleMic}
              title={isMuted ? 'Unmute mic' : 'Mute mic'}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-colors border-none
                ${isMuted
                  ? 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
                }
                text-white
              `}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              {/* Active call pulsing ring when unmuted */}
              {!isMuted && (
                <span className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping pointer-events-none" />
              )}
            </motion.button>

            {/* Hang Up */}
            <motion.button
              key="hangup-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, delay: 0.05 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={onHangUp}
              title="Hang up"
              className="relative w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30 flex items-center justify-center transition-colors border-none"
            >
              <PhoneOff size={18} />
            </motion.button>
          </React.Fragment>
        )}

        {/* ── CALLING: Cancel spinner ── */}
        {isCalling && (
          <motion.button
            key="cancel-call-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onHangUp}
            title="Cancel call"
            className="relative w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-500/30 flex items-center justify-center transition-colors border-none"
          >
            <PhoneOff size={20} />
            {/* Dialing animation ring */}
            <span className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping pointer-events-none" />
          </motion.button>
        )}

        {/* ── IDLE: Call button (only shown when 2 players are in room) ── */}
        {callState === 'IDLE' && canCall && (
          <motion.button
            key="call-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onCallClick}
            title="Start voice call"
            className="relative w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-500/30 flex items-center justify-center transition-colors border-none"
          >
            <Phone size={22} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export type { VoiceCallButtonsProps };
export default VoiceCallButtons;
