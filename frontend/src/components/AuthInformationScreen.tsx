import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, RefreshCw, ChevronRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import type { UserStatsDTO } from '../types';

interface AuthInformationScreenProps {
  gameId: string;
  gameMode: 'SINGLE' | 'MULTIPLE';
  setGameMode: React.Dispatch<React.SetStateAction<'SINGLE' | 'MULTIPLE'>>;
  copied: boolean;
  copyToClipboard: () => void;
  connect: () => void;
  isRoomFull: boolean;
  roomFullReason: string | null;
  serverGameMode: 'SINGLE' | 'MULTIPLE' | null;
  createNewRoom: () => void;
}

const AuthInformationScreen: React.FC<AuthInformationScreenProps> = ({
  gameId, gameMode, setGameMode, copied, copyToClipboard, connect,
  isRoomFull, roomFullReason, serverGameMode, createNewRoom
}) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UserStatsDTO | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch quick stats
  useEffect(() => {
    if (!token) return;
    authApi.getStats(token)
      .then(data => {
        setStats(data);
        setIsLoadingStats(false);
      })
      .catch(err => {
        console.error("Failed to load stats for arena dashboard:", err);
        setIsLoadingStats(false);
      });
  }, [token]);

  const getInitials = (name: string) => {
    if (!name) return 'G';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md py-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Main Glassmorphic Card */}
          <div className="glass-card rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-6 items-center relative overflow-hidden transition-all duration-300 dark:shadow-[0_0_50px_rgba(0,0,0,0.35)] border border-glass-border">
            
            {/* Header section with User Profile */}
            <div className="flex flex-col items-center gap-3 text-center w-full">
              {/* Profile Avatar */}
              <div className="relative group cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-glass-border flex items-center justify-center group-hover:border-brand transition-all duration-300 shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand/20 to-brand/40 flex items-center justify-center text-brand font-black text-2xl">
                      {getInitials(user?.fullName || '')}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-surface flex items-center justify-center shadow-lg" title="Online">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-content flex items-center justify-center gap-1.5">
                  Gomoku Arena
                </h1>
                <p className="text-content-muted text-[10px] font-black uppercase tracking-widest opacity-60">
                  Welcome back, {user?.fullName || 'Champion'}
                </p>
              </div>

              {/* View History Shortcut */}
              <button 
                onClick={() => navigate('/history')}
                className="mt-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-brand hover:text-brand-hover transition-colors group cursor-pointer bg-brand/5 border border-brand/20 rounded-full px-4 py-1.5 shadow-sm active:scale-95"
              >
                <span>Battle Records</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Quick Stats Widget */}
            <div className="w-full bg-white/5 dark:bg-black/10 rounded-2xl p-4 border border-glass-border shadow-inner">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-2 text-xs text-content-muted font-bold animate-pulse">
                  Fetching your record stats...
                </div>
              ) : stats ? (
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-glass-border">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-content-muted">Wins</span>
                    <span className="text-lg font-black text-green-500 leading-tight mt-0.5">{stats.totalWins}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-content-muted">Losses</span>
                    <span className="text-lg font-black text-red-500 leading-tight mt-0.5">{stats.totalLosses}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-content-muted">Win Rate</span>
                    <span className="text-lg font-black text-amber-500 leading-tight mt-0.5">{stats.winRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-content-muted font-bold py-1">
                  No match statistics found.
                </div>
              )}
            </div>

            {/* Settings section */}
            <div className="w-full flex flex-col gap-5">
              {/* Authenticated Name Plate */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-content-muted ml-1">Your Identity</label>
                <div 
                  onClick={() => navigate('/settings')}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 flex items-center justify-between hover:bg-white/10 hover:border-brand/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <UserIcon size={16} className="text-brand opacity-80 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-content leading-snug">{user?.fullName}</span>
                      <span className="text-[10px] text-content-muted leading-none mt-0.5">@{user?.username}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand px-2.5 py-1 rounded-md">Settings</span>
                </div>
              </div>

              {/* Network Mode */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-content-muted ml-1">Network Mode</label>
                <div className="flex gap-2">
                  <button disabled className="flex-1 py-3 px-4 rounded-xl bg-slate-900/5 dark:bg-white/5 text-content-muted text-xs font-bold border border-glass-border cursor-not-allowed text-left flex justify-between items-center opacity-50">
                    <span>Online</span>
                    <span className="text-[9px] uppercase tracking-wider bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded font-black">Soon</span>
                  </button>
                  <button className="flex-1 py-3 px-4 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-500/20 text-left flex justify-between items-center ring-1 ring-blue-500/30">
                    <span>Private</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  </button>
                </div>
              </div>

              {/* Game Configuration */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-content-muted ml-1">Game Configuration</label>
                <div
                  onClick={() => !serverGameMode && setGameMode(prev => prev === 'MULTIPLE' ? 'SINGLE' : 'MULTIPLE')}
                  className={`bg-slate-900/5 dark:bg-white/5 p-4 rounded-xl flex items-center justify-between w-full border border-glass-border transition-all duration-300 group ${serverGameMode ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-content font-bold text-sm">
                      {(serverGameMode || gameMode) === 'SINGLE' ? 'Single Player' : 'Multiplayer'}
                    </span>
                    <span className="text-content-muted text-[9px] uppercase tracking-wider font-bold opacity-60">
                      {serverGameMode ? 'Fixed by host' : (gameMode === 'SINGLE' ? 'Local Hotseat' : 'LAN Connection')}
                    </span>
                  </div>
                  <label className="game-mode-switch pointer-events-none">
                    <input type="checkbox" readOnly checked={(serverGameMode || gameMode) === 'MULTIPLE'} />
                    <span className="game-mode-slider group-hover:shadow-lg transition-all"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  onClick={connect}
                  disabled={isRoomFull}
                  className={`flex-[3] text-base font-black h-14 rounded-xl transition-all px-4 border-2 flex items-center justify-center gap-3 cursor-pointer ${
                    isRoomFull 
                      ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none border-dashed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 active:scale-95 border-blue-500'
                  }`}
                >
                  {isRoomFull && <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>}
                  {isRoomFull ? 'Arena Full' : `Join Arena: ${gameId}`}
                </button>
                {isRoomFull ? (
                  <button
                    onClick={createNewRoom}
                    className="flex-1 h-14 !p-0 flex flex-col items-center justify-center bg-blue-500/10 border-2 border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all shadow-lg text-blue-600 dark:text-blue-400 group cursor-pointer"
                    title="Create New Room"
                  >
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[8px] font-black uppercase mt-1">New Arena</span>
                  </button>
                ) : (
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 h-14 !p-0 flex items-center justify-center !bg-none border border-glass-border rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-lg text-content cursor-pointer"
                    title="Copy Invite Link"
                  >
                    {copied ? <Check size={24} className="text-green-600 dark:text-green-500" /> : <Copy size={22} className="text-content opacity-80" />}
                  </button>
                )}
              </div>
              
              {isRoomFull && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px] animate-bounce">
                    !
                  </div>
                  <span className="flex-1 text-left leading-tight">
                    {roomFullReason || "Maximum capacity reached for this room mode."}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthInformationScreen;
