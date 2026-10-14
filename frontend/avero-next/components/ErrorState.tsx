'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Failed to load recommendations',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-10 sm:p-14 rounded-xs bg-[#FBF6F5] border border-[#ECD7D4] text-center my-6">
      <div className="w-12 h-12 rounded-full bg-white border border-[#E8C2BC] flex items-center justify-center mb-4 text-[#8A4032]">
        <AlertTriangle size={20} strokeWidth={1.75} />
      </div>

      <h3 className="text-base sm:text-lg font-medium text-[#171717] mb-1">
        Recommendation Service Unavailable
      </h3>

      <p className="text-xs text-[#737370] max-w-md mb-6 leading-relaxed">
        {message}. Showing high-fidelity demo catalog with simulated neural scores.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary text-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
