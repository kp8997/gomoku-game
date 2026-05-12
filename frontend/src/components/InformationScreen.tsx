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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative"
      >
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-3xl px-6 md:px-10 py-10 md:py-14 w-full flex flex-col gap-10 md:gap-12 items-center relative z-10 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
            <User size={40} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Gomoku Arena</h1>
          <p className="text-slate-400 text-center text-sm mb-4">Strategic 20x20 real-time battle</p>

          <div className="w-full flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Your Name</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 text-base outline-none transition-all duration-200 text-left pl-4 pr-12 focus:border-blue-500 focus:bg-slate-900/80 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && connect()}
                />
                <button
                  onClick={generateRandomName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 !bg-none !p-2 !border-none !shadow-none hover:!-translate-y-1/2 active:!-translate-y-1/2 !brightness-100 text-slate-500 hover:text-blue-400 transition-colors"
                  title="Generate random name"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Network Mode</label>
              <div className="flex gap-2">
                <button disabled className="flex-1 py-4 px-4 rounded-xl bg-white/5 text-slate-500 text-sm font-medium border border-white/5 cursor-not-allowed text-left flex justify-between items-center opacity-70">
                  <span>Online</span>
                  <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-slate-400">Disabled</span>
                </button>
                <button className="flex-1 py-4 px-4 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30 text-left flex justify-between items-center ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  <span>Private Room</span>
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Offline Game Type</label>
              <div
                onClick={() => setGameMode(prev => prev === 'MULTIPLE' ? 'SINGLE' : 'MULTIPLE')}
                className="bg-[var(--item-bg)] p-4 rounded-2xl flex items-center justify-between w-full border border-[var(--item-border)] cursor-pointer hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--text-color)] font-medium">
                    {gameMode === 'SINGLE' ? 'Single Player (Hotseat)' : 'Multiplayer (LAN)'}
                  </span>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold opacity-70">
                    {gameMode === 'SINGLE' ? '2 players on same machine' : 'Other sockets at same URL'}
                  </span>
                </div>
                <label className="game-mode-switch">
                  <input type="checkbox" readOnly checked={gameMode === 'MULTIPLE'} />
                  <span className="game-mode-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full mt-4 flex gap-3">
            <button onClick={connect} className="flex-1 text-lg h-14 shadow-lg shadow-blue-500/20 bg-linear-to-br from-blue-500 to-blue-700">
              Join Room: {gameId}
            </button>
            <button
              onClick={copyToClipboard}
              className="w-14 h-14 !p-0 flex items-center justify-center !bg-none border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 shadow-lg hover:!-translate-y-0 active:!-translate-y-0"
              title="Copy Invite Link"
            >
              {copied ? <Check size={28} className="text-green-400" /> : <Copy size={28} className="text-slate-400" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InformationScreen;
