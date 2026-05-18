import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose }) => {
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
          className="w-56 glass-card rounded-2xl shadow-2xl overflow-hidden border border-glass-border p-2"
        >
          <div className="px-4 py-3 border-b border-glass-border mb-1">
            <p className="text-[10px] text-content-muted uppercase tracking-wider font-bold">Profile</p>
            <p className="text-sm font-bold truncate text-brand">{user?.fullName}</p>
            <p className="text-[10px] text-content-muted truncate">@{user?.username}</p>
          </div>

          <button
            onClick={() => handleNav('/history')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content-muted hover:text-content hover:bg-white/10 rounded-xl transition-all"
          >
            <User size={16} />
            <span>Profile &amp; Records</span>
          </button>

          <button
            onClick={() => handleNav('/settings')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content-muted hover:text-content hover:bg-white/10 rounded-xl transition-all"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <div className="my-1 border-t border-glass-border" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown;
