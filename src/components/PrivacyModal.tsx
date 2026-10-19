import React, { useEffect } from 'react';
import { Shield, X, Lock, EyeOff, Server, CheckCircle2, Mail } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-800 dark:text-neutral-200"
        onClick={(e) => e.stopPropagation()}
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
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Last updated: October 2026 • 100% Client-Side Processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
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
              <li>Your files and text inputs are never uploaded to our servers or third-party cloud storage.</li>
              <li>Calculations utilize HTML5 Canvas, <code className="text-neutral-800 dark:text-neutral-200">crypto.randomUUID()</code>, and in-memory Web APIs.</li>
              <li>Data is automatically discarded from browser memory as soon as you clear the input or refresh the page.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <EyeOff className="w-4 h-4 text-sky-500" />
              <h3>2. Privacy-Respecting Advertising (EthicalAds)</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              To keep all conversion tools free and maintain fast serverless infrastructure, we partner with <strong>EthicalAds</strong>:
            </p>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-3.5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Tracking Cookies:</strong> EthicalAds does not place third-party cookies or track you across the web.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Contextual Only:</strong> Ads are selected purely based on page context (developer and digital media tools) and coarse geographic region (e.g., country level), never your personal behavioral history.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Invasive Scripts:</strong> EthicalAds respects "Do Not Track" browser signals and complies strictly with GDPR, CCPA, and Acceptable Ads standards.</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Server className="w-4 h-4 text-indigo-500" />
              <h3>3. Hosting & Server Infrastructure</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              This site is hosted globally via Vercel's Edge Network. When your browser requests static assets (HTML, CSS, JS), temporary standard server access logs (such as IP address, user-agent, and timestamp) are processed exclusively for security, rate-limiting, and DDoS defense. No analytics tracking pixels (such as Google Analytics or Facebook Pixel) are present.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              <Shield className="w-4 h-4 text-amber-500" />
              <h3>4. Local Storage Usage</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs">
              We only use your browser's <code className="text-neutral-800 dark:text-neutral-200">localStorage</code> to remember your interface preferences (such as dark mode vs light mode). This information never leaves your device.
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
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs sm:text-sm font-semibold transition"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
