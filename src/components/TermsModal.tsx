import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-conditions-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h2 id="terms-conditions-title" className="text-sm font-semibold text-zinc-100">
              Terms and Conditions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close terms and conditions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terms Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">1. Acceptance of Terms</h3>
            <p>
              By accessing and utilizing SnapColor, you agree to comply with these Terms and Conditions. If you do not accept these terms in their entirety, you should discontinue use of the utility immediately.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">2. Permitted Commercial and Personal Use</h3>
            <p>
              All color swatches, color combinations, CSS variables, SCSS variables, Tailwind tokens, and image assets generated via SnapColor are free to use without restriction. You may incorporate them into commercial digital products, print materials, software codebases, and client projects without attribution or licensing royalties.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">3. Disclaimer of Warranty</h3>
            <p>
              SnapColor and its contrast assessment tools are provided "as is" without warranty of any kind, either express or implied. While calculations adhere to the W3C Web Content Accessibility Guidelines (WCAG) 2.1 formulas, final production accessibility compliance remains the responsibility of your design team across varying physical display hardware.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">4. Open Source and Modifications</h3>
            <p>
              The SnapColor application codebase is distributed under permissive open-source terms. You are entitled to fork, deploy on your custom domains, and adapt features in alignment with the underlying license.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">5. Governing Law</h3>
            <p>
              These terms are governed and construed in accordance with standard international open-source software practices and applicable digital commerce regulations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">Last Revised: October 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
