import React from 'react';
import type { AchievementDTO } from '../../types';

interface Props {
  badge: AchievementDTO;
}

export const BadgeCard: React.FC<Props> = ({ badge }) => {
  const isWinRate = badge.category === 'WIN_RATE';
  const isMatch = badge.category === 'MATCHES';
  const isWin = badge.category === 'WINS';

  // Uniform container shape to make them perfectly equal
  const shapeClasses = 'rounded-xl border';

  const baseClasses = 'relative flex flex-col items-center justify-center p-1.5 text-center transition-all duration-300 w-14 h-18 sm:w-16 sm:h-20';

  const unlockedClasses = badge.unlocked
    ? 'overflow-hidden hover:scale-105 cursor-pointer shadow-md hover:shadow-lg'
    : 'bg-slate-200 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-90';

  let colorClasses = '';
  if (badge.unlocked) {
    if (isWinRate) {
      colorClasses = 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-200 dark:border-yellow-400 text-white';
    } else if (isMatch) {
      colorClasses = 'bg-gradient-to-tr from-cyan-400 to-blue-500 border-cyan-200 dark:border-cyan-400 text-white';
    } else if (isWin) {
      colorClasses = 'bg-gradient-to-b from-purple-400 to-indigo-650 border-purple-200 dark:border-purple-400 text-white';
    }
  } else {
    colorClasses = 'text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700';
  }

  return (
    <div className={`${baseClasses} ${shapeClasses} ${unlockedClasses} ${colorClasses} group`}>
      {/* Shine effect on hover for unlocked */}
      {badge.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
      )}

      {/* Lock icon for locked state */}
      {!badge.unlocked && (
        <div className="absolute top-1 right-1">
          <svg className="w-2.5 h-2.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Icon placeholder (based on category) */}
      <div className={`text-lg sm:text-xl mb-1 ${badge.unlocked ? 'drop-shadow-md' : 'opacity-50 grayscale'}`}>
        {isWinRate && '🛡️'}
        {isMatch && '⭐'}
        {isWin && '👑'}
      </div>

      <div className={`font-bold text-[8px] sm:text-[9px] leading-tight px-0.5 ${badge.unlocked ? 'drop-shadow-md' : ''}`}>
        {badge.label}
      </div>

      {badge.unlocked && badge.unlockedAt && (
        <div className="text-[6px] sm:text-[7px] text-white/80 mt-0.5">
          {new Date(badge.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
