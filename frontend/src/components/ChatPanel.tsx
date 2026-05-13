import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X as CloseIcon, User } from 'lucide-react';

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  currentUser: string;
  isInline?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isOpen,
  setIsOpen,
  currentUser,
  isInline = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const content = (
    <div className={`flex flex-col min-h-0 ${isInline ? 'flex-1 bg-transparent' : 'h-full bg-glass-bg backdrop-blur-3xl border-l border-slate-200/50 dark:border-white/5 rounded-bl-3xl shadow-xl'}`}>
      {/* Header - Only show if not inline */}
      {!isInline && (
        <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <MessageSquare size={20} className="text-blue-500" />
            </div>
            <h2 className="font-bold text-lg text-content tracking-tight">Chat Arena</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-content-muted border-none bg-transparent"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 custom-scrollbar min-h-0">
        {messages.length > 0 ? (
          messages.map((msg, i) => {
            const isMe = msg.sender === currentUser;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={i}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {!isMe && <User size={10} className="text-blue-400" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted opacity-50">
                    {isMe ? 'You' : msg.sender}
                  </span>
                </div>
                <div
                  className={`
                    max-w-[85%] p-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed
                    ${isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-white/10 text-content rounded-tl-none border border-glass-border'
                    }
                  `}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] mt-1 opacity-30 text-content-muted">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-content-muted text-center p-8">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className={`p-4 ${isInline ? 'border-t border-glass-border' : 'border-t border-glass-border bg-white/5'}`}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-slate-900/5 dark:bg-white/5 border border-glass-border rounded-2xl py-3 pl-4 pr-12 text-sm text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500/30 text-white rounded-xl transition-all active:scale-95 border-none shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  if (isInline) return content;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          layout
          initial={{ x: 320, opacity: 0, width: 0 }}
          animate={{ x: 0, opacity: 1, width: 'auto' }}
          exit={{ x: 320, opacity: 0, width: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 w-[85vw] sm:w-80 z-[60]"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;
