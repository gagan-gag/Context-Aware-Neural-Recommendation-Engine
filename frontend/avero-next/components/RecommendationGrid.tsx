'use client';

import { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { LoadingSkeletons } from './LoadingSkeletons';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import type { Product } from '@/lib/store';
import { useStore } from '@/lib/store';

interface RecommendationGridProps {
  products?: Product[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  isDemoScore?: boolean;
}

export function RecommendationGrid({
  products: propProducts,
  loading: propLoading,
  error: propError,
  onRetry,
  title = 'Recommended for You',
  subtitle = 'Context-aware neural matches based on your recent style signals',
  isDemoScore = true,
}: RecommendationGridProps) {
  const store = useStore();
  const products = propProducts ?? store.recommendations;
  const loading = propLoading ?? store.loading;
  const error = propError ?? store.error;

  const {
    selectedCategories,
    priceRange,
    minRating,
    sortBy,
    clearFilters,
  } = store;

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      const lowerCats = selectedCategories.map((c) => c.toLowerCase());
      list = list.filter((p) => lowerCats.some((c) => p.category.toLowerCase().includes(c)));
    }

    // Price range filter
    list = list.filter((p) => {
      const inr = p.price_inr ?? p.price_usd * 83.5;
      return inr >= priceRange[0] && inr <= priceRange[1];
    });

    // Rating filter
    if (minRating > 0) {
      list = list.filter((p) => (p.rating ?? 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case 'price-high':
        list.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'relevance':
      default:
        list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
    }

    return list;
  }, [products, selectedCategories, priceRange, minRating, sortBy]);

  return (
    <section className="w-full my-8" aria-label={title}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-[#ECECE8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#171717]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#737370] mt-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8E8E88] font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingSkeletons count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState onResetFilters={clearFilters} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.product_id || product.article_id || index}
              product={product}
              index={index}
              isDemoScore={isDemoScore}
            />
          ))}
        </div>
      )}
    </section>
  );
}
