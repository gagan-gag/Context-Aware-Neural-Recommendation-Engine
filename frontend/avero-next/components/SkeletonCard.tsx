'use client';

export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-neutral-900/60 border border-white/5 rounded-2xl overflow-hidden p-0 animate-pulse">
      {/* 16:9 Image Skeleton */}
      <div className="p-1.5 w-full">
        <div className="aspect-video w-full rounded-[8px] bg-neutral-800/80 relative overflow-hidden">
          {/* Shimmer gradient highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Info Lines */}
      <div className="p-4 pt-2 flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Brand & Category line */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-20 bg-neutral-800 rounded" />
            <div className="h-3 w-12 bg-neutral-800/60 rounded" />
          </div>

          {/* Title 2-lines skeleton */}
          <div className="h-5 w-3/4 bg-neutral-800 rounded mb-1.5" />
          <div className="h-5 w-1/2 bg-neutral-800 rounded mb-3" />

          {/* Rating stars line */}
          <div className="flex items-center gap-1 mb-2">
            <div className="h-3 w-16 bg-neutral-800 rounded" />
            <div className="h-3 w-8 bg-neutral-800/60 rounded" />
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="h-6 w-24 bg-neutral-800 rounded" />
          <div className="h-6 w-16 bg-neutral-800/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
