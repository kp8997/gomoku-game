import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Moon, Sun, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  effectsEnabled: boolean;
  onToggleEffects: () => void;
}

/** iOS-style pill toggle */
const TogglePill: React.FC<{ enabled: boolean; onToggle: () => void; id: string }> = ({ enabled, onToggle, id }) => (
  <button
    id={id}
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      enabled ? 'bg-blue-500' : 'bg-white/20 dark:bg-white/10'
    }`}
    role="switch"
    aria-checked={enabled}
  >
    <motion.span
      layout
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md`}
      animate={{ x: enabled ? 16 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    />
  </button>
);

const UserDropdown: React.FC<UserDropdownProps> = ({
  isOpen,
  onClose,
  isLightMode,
  onToggleTheme,
  effectsEnabled,
  onToggleEffects,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-64 glass-card rounded-2xl shadow-2xl overflow-hidden border border-glass-border p-2"
        >
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-glass-border mb-1">
            <p className="text-[10px] text-content-muted uppercase tracking-wider font-bold">Profile</p>
            <p className="text-sm font-bold truncate text-brand">{user?.fullName}</p>
            <p className="text-[10px] text-content-muted truncate">@{user?.username}</p>
          </div>

          {/* Navigation */}
          <button
            id="dropdown-profile-records"
            onClick={() => handleNav('/history')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content-muted hover:text-content hover:bg-white/10 rounded-xl transition-all"
          >
            <User size={15} />
            <span>Profile &amp; Records</span>
          </button>

          <button
            id="dropdown-settings"
            onClick={() => handleNav('/settings')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content-muted hover:text-content hover:bg-white/10 rounded-xl transition-all"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>

          {/* Preferences section */}
          <div className="mt-2 mb-1">
            <div className="flex items-center gap-2 px-4 pt-1 pb-1.5">
              <div className="flex-1 h-px bg-glass-border" />
              <span className="text-[9px] font-black uppercase tracking-widest text-content-muted whitespace-nowrap">
                Preferences
              </span>
              <div className="flex-1 h-px bg-glass-border" />
            </div>

            {/* Dark Mode row */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={onToggleTheme}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors flex-shrink-0">
                {isLightMode ? (
                  <Moon size={13} className="text-blue-400" />
                ) : (
                  <Sun size={13} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content leading-tight">Dark Mode</p>
                <p className="text-[10px] text-content-muted leading-tight">
                  {isLightMode ? 'Currently light' : 'Currently dark'}
                </p>
              </div>
              <TogglePill
                id="toggle-dark-mode"
                enabled={!isLightMode}
                onToggle={onToggleTheme}
              />
            </div>

            {/* Symbol Effects row */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={onToggleEffects}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors flex-shrink-0">
                <Sparkles
                  size={13}
                  className={effectsEnabled ? 'text-purple-400' : 'text-content-muted'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content leading-tight">Symbol Effects</p>
                <p className="text-[10px] text-content-muted leading-tight">
                  {effectsEnabled ? 'Animated effects on' : 'Plain symbols only'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!effectsEnabled && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded-full"
                  >
                    OFF
                  </motion.span>
                )}
                <TogglePill
                  id="toggle-symbol-effects"
                  enabled={effectsEnabled}
                  onToggle={onToggleEffects}
                />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="my-1 border-t border-glass-border" />
          <button
            id="dropdown-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown;
