import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setError('Avatar must be smaller than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (activeTab === 'signup') {
      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasLetter || !hasNumber || !hasSpecial) {
        setError('Password must contain letters, numbers, and special characters');
        return false;
      }
      if (!fullName.trim()) {
        setError('Full name is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login({ username, password });
      } else {
        await signup({ username, password, fullName, avatar: avatar || undefined });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-card rounded-3xl overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-content-muted hover:text-content"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {/* Tabs */}
            <div className="flex mb-8 bg-black/20 rounded-xl p-1 relative">
              <div 
                className="absolute inset-y-1 transition-all duration-300 bg-brand rounded-lg shadow-lg"
                style={{ 
                  width: 'calc(50% - 4px)', 
                  left: activeTab === 'login' ? '4px' : 'calc(50%)' 
                }}
              />
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${activeTab === 'login' ? 'text-white' : 'text-content-muted hover:text-content'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${activeTab === 'signup' ? 'text-white' : 'text-content-muted hover:text-content'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-glass-border flex items-center justify-center group-hover:border-brand transition-colors">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={24} className="text-content-muted" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-content-muted mt-2">Optional Avatar (Max 500KB)</span>
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-input-bg rounded-xl border border-glass-border focus:bg-input-focus focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-bg rounded-xl border border-glass-border focus:bg-input-focus focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                />
                {activeTab === 'signup' && (
                  <p className="text-[9px] text-content-muted mt-1 ml-1 uppercase tracking-tighter">Min 3 characters</p>
                )}
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-bg rounded-xl border border-glass-border focus:bg-input-focus focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                />
                {activeTab === 'signup' && (
                  <p className="text-[9px] text-content-muted mt-1 ml-1 uppercase tracking-tighter">Min 8 chars, must have letters, numbers & special chars</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  activeTab === 'login' ? 'Sign In' : 'Join Arena'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
