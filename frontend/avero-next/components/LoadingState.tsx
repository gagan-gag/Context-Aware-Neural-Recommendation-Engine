'use client';

import { motion } from 'framer-motion';
import { SkeletonCard } from './SkeletonCard';

interface LoadingStateProps {
  count?: number;
}

export function LoadingState({ count = 12 }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </motion.div>
  );
}
