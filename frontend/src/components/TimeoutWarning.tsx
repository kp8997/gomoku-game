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
  const isWarning = isMyTurn && !isPaused && startTime > 0 && timeLeft <= 15 && timeLeft > 0;
  const isUrgent = isWarning && timeLeft <= 5;

  return (
    <AnimatePresence>
      {isWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100]"
        >
          {/* Pulsing Backdrop Blur & Subtle Tint - Masked to keep center clear */}
          <motion.div
            animate={{
              backgroundColor: isUrgent
                ? ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.12)", "rgba(239, 68, 68, 0)"]
                : ["rgba(234, 179, 8, 0)", "rgba(234, 179, 8, 0.08)", "rgba(234, 179, 8, 0)"], // Increased yellow tint
              backdropFilter: isUrgent
                ? ["blur(0px)", "blur(5px)", "blur(0px)"]
                : ["blur(0px)", "blur(3px)", "blur(0px)"] // Increased yellow blur
            }}
            transition={{
              duration: isUrgent ? 0.8 : 2, // Slightly slower pulse for early yellow
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              // Mask out the center (game board) to ensure zero interaction interference
              maskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)'
            }}
          />

          {/* Dynamic Vignette Glow */}
          <motion.div
            animate={{
              boxShadow: isUrgent
                ? [
                  "inset 0 0 60px rgba(239, 68, 68, 0.15)",
                  "inset 0 0 180px rgba(239, 68, 68, 0.3)",
                  "inset 0 0 60px rgba(239, 68, 68, 0.15)"
                ]
                : [
                  "inset 0 0 40px rgba(234, 179, 8, 0.1)",
                  "inset 0 0 120px rgba(234, 179, 8, 0.2)", // Highlighted yellow vignette
                  "inset 0 0 40px rgba(234, 179, 8, 0.1)"
                ]
            }}
            transition={{
              duration: isUrgent ? 0.8 : 2.5,
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
