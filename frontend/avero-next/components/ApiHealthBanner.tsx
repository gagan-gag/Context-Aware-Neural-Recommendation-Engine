'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, RefreshCw, Server, X } from 'lucide-react';
import { checkApiHealth } from '@/lib/api';
import { useStore } from '@/lib/store';

export function ApiHealthBanner() {
  const { apiConnected, setApiConnected, setApiHealthStatus } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');

  const checkHealth = useCallback(async () => {
    setRetrying(true);
    setApiHealthStatus('checking');
    console.log(`[AVERO Health Check] Pinging ${apiUrl}/health...`);

    const result = await checkApiHealth();
    if (result.ok) {
      console.log('[AVERO Health Check] ✅ Backend connected:', result.data);
      setApiConnected(true);
      setApiHealthStatus('connected');
    } else {
      console.warn(`[AVERO Health Check] ⚠️ Backend offline: ${result.error}. Serving from demo catalog.`);
      setApiConnected(false);
      setApiHealthStatus('disconnected');
    }
    setRetrying(false);
    setCountdown(5);
  }, [apiUrl, setApiConnected, setApiHealthStatus]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    setApiUrl(url);
    checkHealth();
  }, [checkHealth]);

  // Periodic retry countdown when disconnected
  useEffect(() => {
    if (apiConnected || dismissed) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [apiConnected, dismissed, checkHealth]);

  if (dismissed || apiConnected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl px-4 py-3 bg-neutral-900/95 border border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs text-neutral-200"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <AlertCircle size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">
              API server not connected. Make sure backend is running on :8000
            </p>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 truncate">
              <Server size={11} className="text-amber-400" />
              <span>Target: <code className="text-amber-300">{apiUrl}</code></span>
              <span className="text-neutral-500">•</span>
              <span>Running in offline catalog demo mode</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => checkHealth()}
            disabled={retrying}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium border border-amber-500/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            title="Retry connecting to API"
          >
            <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} />
            <span>{retrying ? 'Checking...' : `Retry (${countdown}s)`}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss API banner"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
