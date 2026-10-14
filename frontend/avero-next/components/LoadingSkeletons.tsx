'use client';

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white border border-[#ECECE8] rounded-xs overflow-hidden">
      {/* 3:4 Portrait Image Skeleton */}
      <div className="aspect-[3/4] w-full skeleton-light" />
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col gap-2.5">
        <div className="skeleton-light h-2.5 w-1/3 rounded-xs" />
        <div className="skeleton-light h-3.5 w-3/4 rounded-xs" />
        <div className="pt-2 border-t border-[#F0F0EC] flex items-center justify-between">
          <div className="skeleton-light h-3.5 w-16 rounded-xs" />
          <div className="skeleton-light h-2.5 w-12 rounded-xs" />
        </div>
      </div>
    </div>
  );
}

interface LoadingSkeletonsProps {
  count?: number;
}

export function LoadingSkeletons({ count = 8 }: LoadingSkeletonsProps) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
