'use client';

import { PremiumProductCard } from './PremiumProductCard';
import { EmptyState } from './EmptyState';
import type { Product } from '@/lib/mockData';

interface PremiumProductGridProps {
  products: Product[];
  isLoading: boolean;
  onResetFilters?: () => void;
}

export function PremiumProductGrid({
  products,
  isLoading,
  onResetFilters,
}: PremiumProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#ECECE8] rounded-xs overflow-hidden aspect-[3/4] skeleton-light"
          />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        onResetFilters={onResetFilters}
        title="No collection products found"
        description="Try adjusting your filter criteria to discover our editorial fashion range."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
      {products.map((product) => (
        <PremiumProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}
