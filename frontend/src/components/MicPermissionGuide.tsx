import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Settings, Globe, Shield } from 'lucide-react';

interface MicPermissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Detect the user's platform for tailored instructions. */
const getPlatform = (): 'ios' | 'android' | 'mac-safari' | 'desktop' => {
  const ua = navigator.userAgent || '';
  // iOS & iPadOS (iPadOS reports as Mac in newer versions)
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/android/i.test(ua)) return 'android';
  if (/^((?!chrome|android).)*safari/i.test(ua)) return 'mac-safari';
  return 'desktop';
};

const MicPermissionGuide: React.FC<MicPermissionGuideProps> = ({ isOpen, onClose }) => {
  const platform = getPlatform();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="w-full max-w-md rounded-3xl border border-glass-border shadow-2xl overflow-hidden"
            style={{ background: 'var(--color-surface)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Mic size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-black text-content leading-tight">
                    Microphone Access Required
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-0.5">
                    Voice chat needs permission
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-content-muted hover:text-content transition-colors border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 flex flex-col gap-4">
              <p className="text-sm text-content-muted leading-relaxed">
                Your browser blocked microphone access. Please enable it manually using the steps below:
              </p>

              {/* ── iOS / iPadOS Safari ── */}
              {platform === 'ios' && (
                <div className="flex flex-col gap-3">
                  <StepCard
                    icon={<Settings size={16} />}
                    step={1}
                    title="Open Settings app"
                    description="Go to your iPhone or iPad home screen and tap Settings."
                  />
                  <StepCard
                    icon={<Globe size={16} />}
                    step={2}
                    title='Scroll down to "Safari"'
                    description="Find Safari in the app list and tap it."
                  />
                  <StepCard
                    icon={<Mic size={16} />}
                    step={3}
                    title="Microphone → Allow"
                    description='Under "Settings for Websites", tap Microphone and set it to "Allow" or "Ask".'
                  />
                  <StepCard
                    icon={<Shield size={16} />}
                    step={4}
                    title="Reload this page"
                    description="Come back to Safari and reload this page. You should now see a microphone permission prompt."
                  />
                </div>
              )}

              {/* ── macOS Safari ── */}
              {platform === 'mac-safari' && (
                <div className="flex flex-col gap-3">
                  <StepCard
                    icon={<Globe size={16} />}
                    step={1}
                    title="Open Safari Preferences"
                    description="Click Safari in the menu bar → Settings (or Preferences)."
                  />
                  <StepCard
                    icon={<Shield size={16} />}
                    step={2}
                    title='Go to "Websites" tab'
                    description='Select the "Websites" tab at the top, then click "Microphone" in the left sidebar.'
                  />
                  <StepCard
                    icon={<Mic size={16} />}
                    step={3}
                    title="Allow for this site"
                    description='Find this website in the list and change the dropdown to "Allow" or "Ask".'
                  />
                  <StepCard
                    icon={<Settings size={16} />}
                    step={4}
                    title="Reload this page"
                    description="Close Settings and reload this page to try the call again."
                  />
                </div>
              )}

              {/* ── Android Chrome ── */}
              {platform === 'android' && (
                <div className="flex flex-col gap-3">
                  <StepCard
                    icon={<Shield size={16} />}
                    step={1}
                    title="Tap the lock icon"
                    description="In the address bar, tap the lock/info icon next to the URL."
                  />
                  <StepCard
                    icon={<Mic size={16} />}
                    step={2}
                    title="Permissions → Microphone"
                    description='Tap "Permissions" or "Site settings" and toggle Microphone to "Allow".'
                  />
                  <StepCard
                    icon={<Settings size={16} />}
                    step={3}
                    title="Reload this page"
                    description="Tap the reload button and try the call again."
                  />
                </div>
              )}

              {/* ── Desktop Chrome / Firefox / Edge ── */}
              {platform === 'desktop' && (
                <div className="flex flex-col gap-3">
                  <StepCard
                    icon={<Shield size={16} />}
                    step={1}
                    title="Click the lock icon in the address bar"
                    description="You'll see it to the left of the URL. Click it to open site permissions."
                  />
                  <StepCard
                    icon={<Mic size={16} />}
                    step={2}
                    title='Set Microphone to "Allow"'
                    description='Find the Microphone permission and change it from "Blocked" to "Allow".'
                  />
                  <StepCard
                    icon={<Settings size={16} />}
                    step={3}
                    title="Reload the page"
                    description="Reload this page and click the call button again. The browser should now ask for permission."
                  />
                </div>
              )}

              {/* HTTPS notice */}
              {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
                  ⚠️ This site is not served over <strong>HTTPS</strong>. Most browsers require HTTPS
                  for microphone access. Please contact the site administrator to enable SSL.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-sm transition-colors border-none cursor-pointer shadow-lg shadow-brand/20"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** A single numbered instruction step. */
const StepCard: React.FC<{
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
}> = ({ icon, step, title, description }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-glass-border">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black text-content leading-tight">
        <span className="text-brand mr-1">Step {step}.</span>
        {title}
      </p>
      <p className="text-[11px] text-content-muted leading-snug mt-1">{description}</p>
    </div>
  </div>
);

export default MicPermissionGuide;
