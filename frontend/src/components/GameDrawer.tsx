import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, MessageSquare, X as CloseIcon, Hash } from 'lucide-react';
import ChatPanel from './ChatPanel';
import HistorySection from './HistorySection';
import { type Move, type ChatMessage } from '../types';

interface GameDrawerProps {
  setShowDrawer: (val: boolean) => void;
  history: Move[];
  chatMessages: ChatMessage[];
  onSendMessage: (content: string) => void;
  username: string;
  gameId: string;
}

const GameDrawer: React.FC<GameDrawerProps> = ({
  setShowDrawer,
  history,
  chatMessages,
  onSendMessage,
  username,
  gameId
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'chat'>('history');

  const closeDrawer = () => setShowDrawer(false);

  return (
    <div className="h-full bg-glass-bg backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 rounded-br-3xl flex flex-col shadow-xl overflow-hidden">
          {/* Drawer Header with Tabs */}
          <div className="p-4 border-b border-glass-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  {activeTab === 'history' ? (
                    <HistoryIcon size={18} className="text-blue-500" />
                  ) : (
                    <MessageSquare size={18} className="text-green-500" />
                  )}
                </div>
                <h2 className="font-bold text-content">
                  {activeTab === 'history' ? 'Game History' : 'Chat Arena'}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-content-muted border-none bg-transparent shadow-none"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Tab Toggles */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-glass-border">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-white/10 shadow-sm text-blue-500'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <HistoryIcon size={14} /> History
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-white/10 shadow-sm text-green-500'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <MessageSquare size={14} /> Chat
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'history' ? (
              <HistorySection history={history} />
            ) : (
              <ChatPanel
                messages={chatMessages}
                onSendMessage={onSendMessage}
                isOpen={true}
                setIsOpen={() => {}}
                currentUser={username}
                isInline={true}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-glass-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold tracking-wider text-content-muted uppercase">
                Room: {gameId}
              </span>
            </div>
          </div>
    </div>
  );
};

export default GameDrawer;
