'use client';

import { SkeletonCard } from './SkeletonCard';

interface LoadingStateProps {
  count?: number;
}

export function LoadingState({ count = 8 }: LoadingStateProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
