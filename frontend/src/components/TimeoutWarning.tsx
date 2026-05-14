import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeoutWarningProps {
  startTime: number;
  duration: number;
  isMyTurn: boolean;
  isPaused: boolean;
}

/**
 * Global Timeout Warning Component
 * Provides a subtle, premium alert when a player's turn is about to expire.
 * Uses pulsing backdrop blur and a red vignette to maintain focus while signaling urgency.
 */
const TimeoutWarning: React.FC<TimeoutWarningProps> = ({ startTime, duration, isMyTurn, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  useEffect(() => {
    // Reset or stop if conditions aren't met
    if (isPaused || !isMyTurn || startTime === 0) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, isMyTurn, isPaused]);

  // Thresholds for warning
  const isWarning = isMyTurn && !isPaused && timeLeft <= 15 && timeLeft > 0;
  const isUrgent = timeLeft <= 5;

  return (
    <AnimatePresence>
      {isWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100]"
        >
          {/* Pulsing Backdrop Blur & Subtle Tint */}
          <motion.div
            animate={{
              backgroundColor: isUrgent 
                ? ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.06)", "rgba(239, 68, 68, 0)"] // Red for urgent
                : ["rgba(234, 179, 8, 0)", "rgba(234, 179, 8, 0.04)", "rgba(234, 179, 8, 0)"], // Yellow for warning
              backdropFilter: isUrgent
                ? ["blur(0px)", "blur(1.2px)", "blur(0px)"]
                : ["blur(0px)", "blur(0.8px)", "blur(0px)"]
            }}
            transition={{
              duration: isUrgent ? 0.8 : 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          />

          {/* Dynamic Vignette Glow */}
          <motion.div
            animate={{
              boxShadow: isUrgent
                ? [
                    "inset 0 0 40px rgba(239, 68, 68, 0.08)",
                    "inset 0 0 120px rgba(239, 68, 68, 0.15)",
                    "inset 0 0 40px rgba(239, 68, 68, 0.08)"
                  ]
                : [
                    "inset 0 0 25px rgba(234, 179, 8, 0.04)",
                    "inset 0 0 70px rgba(234, 179, 8, 0.08)",
                    "inset 0 0 25px rgba(234, 179, 8, 0.04)"
                  ]
            }}
            transition={{
              duration: isUrgent ? 0.8 : 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          />
          
          {/* Subtle Scanline or Edge Flash if Urgent */}
          {isUrgent && (
            <motion.div 
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="absolute inset-0 border-[4px] border-red-500/20"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimeoutWarning;
