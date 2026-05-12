import React from 'react';
import { motion } from 'framer-motion';
import { User, RefreshCw, Copy, Check } from 'lucide-react';

interface InformationScreenProps {
  username: string;
  setUsername: (name: string) => void;
  generateRandomName: () => void;
  gameId: string;
  gameMode: 'SINGLE' | 'MULTIPLE';
  setGameMode: React.Dispatch<React.SetStateAction<'SINGLE' | 'MULTIPLE'>>;
  copied: boolean;
  copyToClipboard: () => void;
  connect: () => void;
}

const InformationScreen: React.FC<InformationScreenProps> = ({
  username, setUsername, generateRandomName, gameId, gameMode, setGameMode,
  copied, copyToClipboard, connect
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
      <div className="w-full max-w-md py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Main Card with Tailwind 4.0 dark: variants and custom utilities */}
          <div className="glass-card rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-8 items-center relative overflow-hidden transition-all duration-300 dark:shadow-[0_0_50px_rgba(0,0,0,0.3)]">

            {/* Header section */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/20 shadow-inner">
                <User size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-1 text-content">Gomoku Arena</h1>
                <p className="text-content-muted text-sm font-medium uppercase tracking-widest opacity-70">20x20 Strategic Battle</p>
              </div>
            </div>

            {/* Form section */}
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Your Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    className="w-full bg-slate-900/1 border border-glass-border rounded-2xl p-4 text-base outline-none transition-all duration-300 text-left pl-5 pr-12 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && connect()}
                  />
                  <button
                    onClick={generateRandomName}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none shadow-none text-content-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-center"
                    title="Generate random name"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Network Mode</label>
                <div className="flex gap-3">
                  <button disabled className="flex-1 py-4 px-4 rounded-2xl bg-slate-900/5 dark:bg-white/5 text-content-muted text-sm font-medium border border-glass-border cursor-not-allowed text-left flex justify-between items-center opacity-50">
                    <span>Online</span>
                    <span className="text-[10px] uppercase tracking-wider bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded font-bold">Soon</span>
                  </button>
                  <button className="flex-1 py-4 px-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-500/20 text-left flex justify-between items-center ring-1 ring-blue-500/30">
                    <span>Private</span>
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Game Configuration</label>
                <div
                  onClick={() => setGameMode(prev => prev === 'MULTIPLE' ? 'SINGLE' : 'MULTIPLE')}
                  className="bg-slate-900/5 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between w-full border border-glass-border cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-content font-bold">
                      {gameMode === 'SINGLE' ? 'Single Player' : 'Multiplayer'}
                    </span>
                    <span className="text-content-muted text-[10px] uppercase tracking-wider font-bold opacity-60">
                      {gameMode === 'SINGLE' ? 'Local Hotseat' : 'LAN Connection'}
                    </span>
                  </div>
                  <label className="game-mode-switch pointer-events-none">
                    <input type="checkbox" readOnly checked={gameMode === 'MULTIPLE'} />
                    <span className="game-mode-slider group-hover:shadow-lg transition-all"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex gap-3">
              <button
                onClick={connect}
                className="flex-[3] text-lg font-black h-16 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all active:scale-95 px-4 border-none"
              >
                Join Arena: {gameId}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 h-16 !p-0 flex items-center justify-center !bg-none border border-glass-border rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-lg text-content"
                title="Copy Invite Link"
              >
                {copied ? <Check size={28} className="text-green-600 dark:text-green-500" /> : <Copy size={28} className="text-content opacity-80" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InformationScreen;
