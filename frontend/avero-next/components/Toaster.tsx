'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Global toast state (singleton pattern)
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]));
}

export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  currentToasts = [...currentToasts, { id, message, type, duration }];
  notifyListeners();
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
}

export function removeToast(id: string) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  notifyListeners();
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: { border: 'border-green-500/30', icon: 'text-green-400', bg: 'bg-green-500/10' },
  error: { border: 'border-red-500/30', icon: 'text-red-400', bg: 'bg-red-500/10' },
  warning: { border: 'border-amber-500/30', icon: 'text-amber-400', bg: 'bg-amber-500/10' },
  info: { border: 'border-[#D4AF37]/30', icon: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-xl
        glass border ${color.border}
        max-w-sm min-w-[280px] pointer-events-auto
        shadow-2xl
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`rounded-full ${color.bg} p-1 flex-shrink-0 mt-0.5`}>
        <Icon size={14} className={color.icon} />
      </div>
      <p className="text-sm text-neutral-200 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-neutral-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const listener = useCallback((newToasts: Toast[]) => {
    setToasts(newToasts);
  }, []);

  useEffect(() => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== listener);
    };
  }, [listener]);

  return (
    <div className="toast-container" aria-label="Notifications" role="region">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
