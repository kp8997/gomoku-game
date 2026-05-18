import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingDown, Swords,
  Loader2, Ghost, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import type { ConfrontationRecord, UserStatsDTO } from '../types';
import Header from '../components/Header';

const MatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gomoku_theme') !== 'light');
  const [stats, setStats] = useState<UserStatsDTO | null>(null);
  const [records, setRecords] = useState<ConfrontationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('gomoku_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fetch data
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profileData, statsData] = await Promise.all([
          authApi.getProfile(token),
          authApi.getStats(token),
        ]);
        setRecords(profileData.confrontations);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  const winRateColor = (rate: number) => {
    if (rate >= 60) return 'text-green-500';
    if (rate >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const statCards = stats ? [
    {
      label: 'Total Wins',
      value: stats.totalWins,
      icon: <Trophy size={20} />,
      color: 'text-green-500',
      bg: 'bg-green-500/10 border-green-500/20',
      glow: 'shadow-green-500/10',
    },
    {
      label: 'Total Losses',
      value: stats.totalLosses,
      icon: <TrendingDown size={20} />,
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/20',
      glow: 'shadow-red-500/10',
    },
    {
      label: 'Total Matches',
      value: stats.totalMatches,
      icon: <Swords size={20} />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      glow: 'shadow-blue-500/10',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: <Shield size={20} />,
      color: winRateColor(stats.winRate),
      bg: 'bg-amber-500/10 border-amber-500/20',
      glow: 'shadow-amber-500/10',
    },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-surface text-content">
      {/* Global Header */}
      <Header
        isJoined={false}
        isLightMode={!isDarkMode}
        setIsLightMode={(val) => setIsDarkMode(!val)}
        isAuthenticated={isAuthenticated}
        userAvatar={user?.avatar || null}
        userFullName={user?.fullName || null}
        backPath="/"
        backLabel="Back to Arena"
      />

      {/* Page Content */}
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-black tracking-tight text-content flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Swords size={18} className="text-blue-500" />
            </div>
            Battle Records
          </h1>
          <p className="text-content-muted text-sm mt-1 ml-12">Your complete match history and confrontation stats</p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={36} className="animate-spin text-brand/40" />
            <p className="text-content-muted text-sm">Loading your battle records...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xs font-black uppercase tracking-widest text-content-muted mb-4">Your Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {statCards.map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className={`glass-card rounded-2xl p-4 border ${card.bg} shadow-lg ${card.glow} flex flex-col gap-2`}
                    >
                      <div className={`${card.color}`}>{card.icon}</div>
                      <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-content-muted">{card.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Confrontation Records */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xs font-black uppercase tracking-widest text-content-muted mb-4">Confrontation Records</h2>

              {records.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4 border border-dashed border-glass-border text-center">
                  <Trophy size={48} className="text-content-muted opacity-20" />
                  <div>
                    <p className="font-bold text-content-muted">No battle records yet</p>
                    <p className="text-xs text-content-muted/60 mt-1">Play against other registered players to start tracking your H2H history</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record, idx) => {
                    const isAnon = record.opponentUsername === 'anonymous';
                    const isWinning = record.wins > record.losses;
                    const isLosing = record.losses > record.wins;
                    const totalMatches = record.wins + record.losses;
                    const winPct = totalMatches > 0 ? Math.round((record.wins / totalMatches) * 100) : 0;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + idx * 0.05 }}
                        className="glass-card rounded-2xl p-4 border border-glass-border hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border-2 border-glass-border flex-shrink-0 flex items-center justify-center">
                            {isAnon ? (
                              <Ghost size={22} className="text-content-muted" />
                            ) : record.opponentAvatar ? (
                              <img src={record.opponentAvatar} alt={record.opponentUsername} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-brand font-black text-lg">
                                {record.opponentFullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-content truncate">{record.opponentFullName}</p>
                            <p className="text-[11px] text-content-muted truncate">
                              {isAnon ? 'All anonymous opponents' : `@${record.opponentUsername}`}
                            </p>
                            {/* Progress bar */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700"
                                  style={{ width: `${winPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-content-muted font-mono">{winPct}%</span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className={`text-lg font-black ${isWinning ? 'text-green-500' : 'text-content'}`}>
                                {record.wins}
                              </span>
                              <span className="text-content-muted text-xs font-bold">—</span>
                              <span className={`text-lg font-black ${isLosing ? 'text-red-500' : 'text-content'}`}>
                                {record.losses}
                              </span>
                            </div>
                            <p className="text-[9px] text-content-muted uppercase font-bold tracking-wider">
                              W — L
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchHistoryPage;
