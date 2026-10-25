import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-md shadow-2xl transition-all"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-zinc-400 hover:text-zinc-200 text-xs px-1.5 py-0.5 rounded transition-colors"
        aria-label="Dismiss toast"
      >
        Dismiss
      </button>
    </div>
  );
};
