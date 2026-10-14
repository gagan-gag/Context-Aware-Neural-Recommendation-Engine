'use client';

import Link from 'next/link';
import { PackageOpen, RotateCcw, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onResetFilters?: () => void;
  onReset?: () => void;
  title?: string;
  description?: string;
}

export function EmptyState({
  onResetFilters,
  onReset,
  title = 'No items match your selection',
  description = 'Try adjusting your filters or browse our curated trending pieces.',
}: EmptyStateProps) {
  const handleReset = onResetFilters || onReset;
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 sm:p-16 rounded-xs bg-[#F7F7F5] border border-[#ECECE8] text-center my-6">
      <div className="w-12 h-12 rounded-full bg-white border border-[#DCDCD6] flex items-center justify-center mb-4 text-[#444441]">
        <PackageOpen size={22} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-medium text-[#171717] mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#737370] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {handleReset && (
          <button
            onClick={handleReset}
            className="btn-secondary text-xs flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
        <Link
          href="/trending"
          className="btn-primary text-xs flex items-center gap-2"
        >
          <span>View Trending</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
