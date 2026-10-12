'use client';

import { motion } from 'framer-motion';

function SkeletonCard() {
  return (
    <div className="flex flex-col card-gradient rounded-xl border border-white/5 overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[4/3] skeleton" />
      {/* Content skeleton */}
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <div className="skeleton h-5 w-20 rounded mb-1" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
          <div className="skeleton h-7 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface LoadingSkeletonsProps {
  count?: number;
}

export function LoadingSkeletons({ count = 12 }: LoadingSkeletonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="product-grid"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </motion.div>
  );
}
