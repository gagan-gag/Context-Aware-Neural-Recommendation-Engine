'use client';

export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white border border-[#ECECE8] rounded-xs overflow-hidden">
      {/* 3:4 Portrait Image Skeleton */}
      <div className="aspect-[3/4] w-full skeleton-light" />

      {/* Info Lines */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Brand & Category line */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-2.5 w-20 skeleton-light rounded-xs" />
            <div className="h-2.5 w-12 skeleton-light rounded-xs" />
          </div>

          {/* Title 2-lines skeleton */}
          <div className="h-3.5 w-3/4 skeleton-light rounded-xs mb-1.5" />
          <div className="h-3.5 w-1/2 skeleton-light rounded-xs mb-3" />
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-[#F0F0EC] flex items-center justify-between">
          <div className="h-4 w-20 skeleton-light rounded-xs" />
          <div className="h-3 w-12 skeleton-light rounded-xs" />
        </div>
      </div>
    </div>
  );
}
