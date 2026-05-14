import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TurnTimerProps {
  startTime: number;
  duration: number; // in seconds
  isMyTurn: boolean;
  isPaused?: boolean;
  gameMode: 'SINGLE' | 'MULTIPLE';
  currentTurnSymbol: 'X' | 'O';
  playerCount: number;
}

const TurnTimer: React.FC<TurnTimerProps> = ({
  startTime, duration, isMyTurn, isPaused, gameMode, currentTurnSymbol, playerCount
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (isPaused || startTime === 0) {
      if (startTime === 0) setTimeLeft(duration);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      // Use Math.abs or clamp to handle slight clock drift where now < startTime
      const elapsed = Math.max(0, (now - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(Math.ceil(remaining));
      setProgress(remaining / duration);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 50);

    return () => clearInterval(interval);
  }, [startTime, duration, isPaused]);

  // SVG parameters
  const size = 42;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  let color;
  let label;
  
  if (gameMode === 'MULTIPLE' && playerCount < 2) {
    color = '#f59e0b'; // Amber for waiting
    label = 'Waiting for Player';
  } else if (gameMode === 'SINGLE') {
    color = currentTurnSymbol === 'X' ? '#3b82f6' : '#db2677'; // Blue vs Pink
    label = `Player ${currentTurnSymbol}`;
  } else {
    color = isMyTurn ? '#3b82f6' : '#f59e0b'; // Blue vs Yellow¬
    label = isMyTurn ? 'Your Turn' : 'Opponent';
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg width={size} height={size} className="transform rotate-[-90deg] scale-x-[-1]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/5 dark:text-white/5"
          />
          {/* Progress Circle (Counter-Clockwise) */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset: dashOffset,
            }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>

        {/* Seconds Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black tabular-nums" style={{ color }}>
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
            style={{ color }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
        <span className="text-[8px] text-content-muted uppercase font-bold tracking-tighter">
          {timeLeft > 0 ? 'Remaining' : 'Time Up!'}
        </span>
      </div>
    </div>
  );
};

export default TurnTimer;
