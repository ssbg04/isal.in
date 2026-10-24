import React, { useEffect, useRef } from 'react';
import { Shield, X, Lock, EyeOff, Server, CheckCircle2, Mail } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      // Focus first actionable element inside modal
      const timer = setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Tab') {
          const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables || focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-800 dark:text-neutral-200 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg font-bold text-neutral-900 dark:text-white">
                Privacy Policy & Data Security
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Last updated: October 2026 • 100% Client-Side Processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-5 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <h3>1. Zero Server Uploads (Client-Side Sandboxing)</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              All conversions—including image manipulation, PDF generation, JSON/YAML parsing, Base64 encoding, and UUID generation—run <strong>entirely inside your browser's local sandbox</strong>.
            </p>
            <ul className="space-y-1.5 pl-6 list-disc text-neutral-600 dark:text-neutral-400 text-xs">
              <li>Your files and text inputs are processed locally and are never uploaded to our servers or third-party cloud storage.</li>
              <li>Calculations utilize HTML5 Canvas, <code className="text-neutral-800 dark:text-neutral-200">crypto.randomUUID()</code>, and in-memory Web APIs.</li>
              <li>Active file memory is automatically cleared when you clear your inputs or leave the tool.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <EyeOff className="w-4 h-4 text-sky-500" />
              <h3>2. Advertising & Third-Party Partners (Google AdSense)</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              To keep all conversion tools and Philippine calculators 100% free, we partner with <strong>Google AdSense</strong> to display advertisements:
            </p>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Advertising Cookies:</strong> Google and its ad partners use cookies or unique device identifiers to serve and personalize ads based on a user's prior visits to this and other websites.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>User Choice & Opt-Out:</strong> You can opt out of personalized advertising at any time by visiting{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-500"
                  >
                    Google Ads Settings
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://www.aboutads.info/choices"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-500"
                  >
                    aboutads.info
                  </a>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Non-Intrusive Layout:</strong> Ad banners are configured in designated non-blocking slots and will not interfere with tool execution.</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Server className="w-4 h-4 text-indigo-500" />
              <h3>3. Infrastructure & Analytics</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              This site is hosted globally via Vercel's Edge Network. Standard temporary access logs (IP address, user-agent, timestamp) are recorded for security, DDoS protection, and rate-limiting.
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              We also use <strong>Vercel Web Analytics</strong> to monitor aggregated performance and page views. Vercel Web Analytics is privacy-friendly, does not use tracking cookies, does not track individual user identities across the web, and does not sell your data. We do not use third-party tracking pixels (such as Meta Pixel).
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Shield className="w-4 h-4 text-amber-500" />
              <h3>4. Local Storage Usage & Data Control</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              We use your browser's <code className="text-neutral-800 dark:text-neutral-200">localStorage</code> exclusively on your device to enhance your experience:
            </p>
            <ul className="space-y-1 pl-6 list-disc text-neutral-600 dark:text-neutral-400 text-xs">
              <li><strong>Interface Preferences:</strong> Preserving your theme choice (dark or light mode) and category layout.</li>
              <li><strong>Local Conversion History:</strong> Storing up to 20 recent transformations locally so you can review or restore previous results without recalculating.</li>
              <li><strong>Unit Pairs:</strong> Remembering recently used unit pairs for faster conversion.</li>
            </ul>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              <strong>How to clear:</strong> This data never leaves your device and is never uploaded to any server. You can clear your conversion history at any time by clicking <em>"Clear History"</em> in the Activity History drawer, or by clearing your browser's site data/cookies.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Mail className="w-4 h-4 text-amber-500" />
              <h3>5. Suggestions, Feedback & Bug Reports</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              Have a suggestion for a new Philippine calculator or developer converter? Encountered an issue? Reach out directly via email at{' '}
              <a
                href="mailto:crischarlesgarcia345@gmail.com?subject=Isal.in%20Inquiry%20or%20Suggestion"
                className="text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-500"
              >
                crischarlesgarcia345@gmail.com
              </a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs sm:text-sm font-semibold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 focus-visible:outline-none"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
