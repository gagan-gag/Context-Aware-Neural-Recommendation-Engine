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

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]));
}

export function showToast(message: string, type: ToastType = 'info', duration = 3500) {
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
  success: { border: 'border-[#D1DDC9]', icon: 'text-[#4A5540]', bg: 'bg-[#EDF1E8]' },
  error: { border: 'border-[#E8C2BC]', icon: 'text-[#8A4032]', bg: 'bg-[#FBEFEB]' },
  warning: { border: 'border-[#ECD8A5]', icon: 'text-[#8A6A1C]', bg: 'bg-[#FEF8E7]' },
  info: { border: 'border-[#DCDCD6]', icon: 'text-[#171717]', bg: 'bg-[#F7F7F5]' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xs
        bg-white border ${color.border}
        max-w-sm min-w-[280px] pointer-events-auto
        shadow-card
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`rounded-xs ${color.bg} p-1 flex-shrink-0 mt-0.5`}>
        <Icon size={13} className={color.icon} />
      </div>
      <p className="text-xs font-medium text-[#171717] flex-1 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[#8E8E88] hover:text-[#171717] transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={13} />
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
