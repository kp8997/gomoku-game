import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, User as UserIcon, LogOut, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gomoku_theme') !== 'light');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Sync user changes (e.g. after login hydration)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAvatar(user.avatar || null);
    }
  }, [user]);

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('gomoku_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setError('Avatar must be smaller than 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setIsUpdating(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({ fullName: fullName.trim(), avatar: avatar || undefined });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

      {/* Content */}
      <main className="flex-1 px-4 py-8 max-w-xl mx-auto w-full">
        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold flex items-center gap-3"
            >
              <CheckCircle size={18} />
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 mb-6"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-content-muted mb-6">Profile Information</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-white/5 border-4 border-glass-border flex items-center justify-center group-hover:border-brand transition-all duration-300">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={44} className="text-content-muted" />
                )}
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="bg-black/60 rounded-full p-2.5">
                  <Camera size={20} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <p className="text-[10px] text-content-muted mt-3 font-bold uppercase tracking-wider">
              Hover to change • Max 500KB
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full px-4 py-3 bg-input-bg rounded-xl border border-glass-border focus:bg-input-focus focus:border-brand outline-none transition-all text-content"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2 block">
                Username
              </label>
              <div className="w-full px-4 py-3 bg-white/5 rounded-xl border border-glass-border text-content-muted text-sm flex items-center gap-2 cursor-not-allowed">
                <span className="text-brand font-bold">@</span>
                {user?.username}
                <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded">Locked</span>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-500 font-bold"
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-black rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
            >
              {isUpdating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-content-muted mb-4">Account</h2>
          <div className="flex items-center justify-between py-3 border-b border-glass-border mb-4">
            <div>
              <p className="text-sm font-bold text-content">Member Account</p>
              <p className="text-xs text-content-muted">@{user?.username}</p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-full">
              Active
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl border border-red-500/20 transition-all active:scale-[0.98]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
