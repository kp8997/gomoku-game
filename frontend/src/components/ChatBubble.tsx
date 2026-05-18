import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUser: string;
  unreadCount: number;
  onOpen: () => void;
  onClose: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  messages,
  onSendMessage,
  currentUser,
  unreadCount,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      onOpen(); // resets unread count
    } else {
      onClose();
    }
    setIsOpen(prev => !prev);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[55] flex flex-col items-end gap-3">
      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-card/90 backdrop-blur-2xl rounded-2xl border border-glass-border shadow-2xl overflow-hidden flex flex-col"
            style={{
              width: 'min(320px, calc(100vw - 2rem))',
              maxHeight: '420px',
              background: 'var(--color-glass-bg)',
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                <span className="text-xs font-black uppercase tracking-widest text-content">Chat Arena</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-content-muted hover:text-content"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-content-muted text-center py-8">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3">
                    <MessageSquare size={22} />
                  </div>
                  <p className="text-xs font-medium">No messages yet</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === currentUser;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 mb-0.5 px-1">
                        {!isMe && <User size={9} className="text-blue-400" />}
                        <span className="text-[9px] font-bold uppercase tracking-widest text-content-muted opacity-60">
                          {isMe ? 'You' : msg.sender}
                        </span>
                      </div>
                      <div
                        className={`
                          max-w-[85%] px-3 py-2 rounded-xl text-xs font-medium leading-relaxed shadow-sm
                          ${isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-white/10 text-content rounded-tl-none border border-glass-border'
                          }
                        `}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[8px] mt-0.5 opacity-30 text-content-muted">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-glass-border flex-shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-input-bg border border-glass-border rounded-xl py-2.5 pl-3 pr-10 text-xs text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-input-focus transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500/30 text-white rounded-lg transition-all active:scale-95 border-none shadow-md"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleToggle}
        className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-colors border-none"
        title="Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={22} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-surface"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatBubble;
