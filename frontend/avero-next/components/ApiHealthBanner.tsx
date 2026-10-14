'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Server } from 'lucide-react';
import { checkApiHealth } from '@/lib/api';
import { useStore } from '@/lib/store';

export function ApiHealthBanner() {
  const { apiConnected, setApiConnected, setApiHealthStatus } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const checkHealth = useCallback(async () => {
    const result = await checkApiHealth();
    if (result.ok) {
      setApiConnected(true);
      setApiHealthStatus('connected');
    } else {
      setApiConnected(false);
      setApiHealthStatus('disconnected');
    }
    setRetrying(false);
    setCountdown(10);
  }, [setApiConnected, setApiHealthStatus]);

  useEffect(() => {
    let active = true;
    checkApiHealth().then((result) => {
      if (!active) return;
      if (result.ok) {
        setApiConnected(true);
        setApiHealthStatus('connected');
      } else {
        setApiConnected(false);
        setApiHealthStatus('disconnected');
      }
    });
    return () => {
      active = false;
    };
  }, [setApiConnected, setApiHealthStatus]);

  // Periodic retry countdown when disconnected
  useEffect(() => {
    if (apiConnected || dismissed) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [apiConnected, dismissed, checkHealth]);

  if (dismissed || apiConnected) return null;

  return (
    <aside
      className="bg-[#F7F7F5] border-b border-[#ECECE8] text-[#171717] px-4 py-2.5 text-xs transition-all"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#ECECE8] text-[#555550] font-semibold text-[10px] tracking-wider uppercase">
            <Server size={11} />
            Demo Mode Active
          </span>
          <span className="text-[#555550]">
            FastAPI backend offline on port 8000. Displaying curated H&amp;M catalog with simulated neural scores.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setRetrying(true);
              setApiHealthStatus('checking');
              checkHealth();
            }}
            disabled={retrying}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#171717] hover:underline disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={11} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Checking...' : `Retry (${countdown}s)`}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#8E8E88] hover:text-[#171717] cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
