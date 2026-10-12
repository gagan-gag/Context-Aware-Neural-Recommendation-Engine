'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Failed to load recommendations',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center justify-center p-12 sm:p-14 rounded-2xl bg-rose-950/20 border border-rose-500/25 text-center my-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
        <AlertTriangle size={28} />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>

      <p className="text-sm text-rose-200/80 max-w-md mb-2 font-mono">
        {message}
      </p>

      <p className="text-xs text-neutral-400 mb-6">
        Try refreshing the page or checking if the backend server is reachable on port 8000.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
          >
            <RefreshCw size={13} />
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2 active:scale-95"
        >
          <RotateCcw size={13} />
          Refresh Page
        </button>
      </div>
    </motion.div>
  );
}
