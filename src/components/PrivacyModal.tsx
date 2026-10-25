import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 id="privacy-policy-title" className="text-sm font-semibold text-zinc-100">
              Privacy Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close privacy policy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">1. Zero Telemetry and Client-Side Execution</h3>
            <p>
              SnapColor is built with strict privacy-first engineering. All color math, harmony generations, gradient renders, and WCAG contrast calculations execute 100% locally in your web browser. We do not track, collect, store, or transmit your color choices or IP address to external servers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">2. Local Storage Persistence</h3>
            <p>
              When you save favorite palettes, they are stored exclusively on your device using your browser LocalStorage API under the key <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-200 font-mono">snapcolor_saved_palettes_v1</code>. You retain complete control over this data and may export or delete it at any time directly through the Saved Palettes drawer.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">3. Cookies and Third-Party Trackers</h3>
            <p>
              SnapColor does not set any advertising, tracking, or analytics cookies. No third-party behavioral profiling scripts or pixel tags are loaded.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">4. Exported Files and PNG Downloads</h3>
            <p>
              When you download PNG cards, CSS files, or JSON records, these files are synthesized locally via client-side HTML5 canvas and blob memory without server intervention.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">5. Contact and Inquiries</h3>
            <p>
              For security disclosures, open-source audit questions, or technical inquiries regarding SnapColor, please submit an issue on the project repository.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">Effective Date: October 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
