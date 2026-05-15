import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, Trophy, Swords, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import type { ConfrontationRecord } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, token, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [records, setRecords] = useState<ConfrontationRecord[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchRecords();
    }
  }, [isOpen, token]);

  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const profile = await authApi.getProfile(token!);
      setRecords(profile.confrontations);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

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

  const handleSave = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateProfile({ fullName, avatar: avatar || undefined });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl glass-card rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-content-muted hover:text-content z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 border-4 border-glass-border flex items-center justify-center group-hover:border-brand transition-colors">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={48} className="text-content-muted" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-2 cursor-pointer">
                      <Camera size={24} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-4">@{user?.username}</h2>
                <span className="text-xs text-content-muted uppercase tracking-widest font-bold">Player Identity</span>
              </div>

              {/* Edit Fields */}
              <div className="flex-1 w-full space-y-6">
                <div>
                  <label className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-input-bg rounded-xl border border-glass-border focus:bg-input-focus focus:border-brand outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </div>

            <hr className="border-glass-border mb-8" />

            {/* Confrontation Records */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Swords size={20} className="text-brand" />
                <h3 className="text-lg font-bold">Confrontation Records</h3>
                <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full ml-auto">H2H Stats</span>
              </div>

              {isLoadingRecords ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-brand/40" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-glass-border">
                  <Trophy size={40} className="mx-auto text-content-muted opacity-20 mb-3" />
                  <p className="text-content-muted text-sm">No match records against registered users yet.</p>
                  <p className="text-xs text-content-muted/60 mt-1">Challenge other authenticated players to track your history!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {records.map((record, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-glass-border">
                          {record.opponentAvatar ? (
                            <img src={record.opponentAvatar} alt={record.opponentUsername} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand font-bold">
                              {record.opponentFullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{record.opponentFullName}</p>
                          <p className="text-[10px] text-content-muted truncate">@{record.opponentUsername}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end text-xs font-bold">
                            <span className={record.wins > record.losses ? "text-green-500" : "text-content"}>{record.wins}W</span>
                            <span className="text-content-muted">-</span>
                            <span className={record.losses > record.wins ? "text-red-500" : "text-content"}>{record.losses}L</span>
                          </div>
                          <p className="text-[9px] text-content-muted uppercase font-bold">Match Score</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;
