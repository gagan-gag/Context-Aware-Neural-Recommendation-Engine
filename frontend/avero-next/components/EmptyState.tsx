'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackageOpen, ArrowRight, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onResetFilters?: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl bg-neutral-900/40 border border-white/5 text-center my-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center mb-5 text-[#D4AF37]">
        <PackageOpen size={32} />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
        No products found
      </h3>

      <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
        Try adjusting your filters or browse trending products to discover today&apos;s most-wanted luxury fashion drops.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2 active:scale-95"
          >
            <RotateCcw size={13} />
            Reset All Filters
          </button>
        )}
        <Link
          href="/trending"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs transition-all flex items-center gap-2 hover:opacity-95 shadow-lg shadow-[#D4AF37]/20 active:scale-95"
        >
          <span>View Trending Products</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
