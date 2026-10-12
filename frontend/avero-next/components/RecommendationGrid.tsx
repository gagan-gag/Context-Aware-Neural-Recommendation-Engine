'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronDown } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { LoadingState } from './LoadingState';
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
}

export function RecommendationGrid({
  products: propProducts,
  loading: propLoading,
  error: propError,
  onRetry,
  title = 'Recommended For You',
  subtitle = 'Context-aware neural matches tailored to your profile',
}: RecommendationGridProps) {
  const store = useStore();
  const products = propProducts ?? store.recommendations;
  const loading = propLoading ?? store.loading;
  const error = propError ?? store.error;

  const [visibleCount, setVisibleCount] = useState(12);

  const {
    selectedCategories,
    priceRange,
    minRating,
    sortBy,
    clearFilters,
    setFilters,
  } = store;

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      const lowerCats = selectedCategories.map((c) => c.toLowerCase());
      list = list.filter((p) => lowerCats.includes(p.category.toLowerCase()));
    }

    // Price range filter (in INR)
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

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // Active filter pills list
  const activeFilters = useMemo(() => {
    const pills: Array<{ id: string; label: string; onRemove: () => void }> = [];

    selectedCategories.forEach((cat) => {
      pills.push({
        id: `cat-${cat}`,
        label: `Category: ${cat}`,
        onRemove: () => {
          setFilters({
            selectedCategories: selectedCategories.filter((c) => c !== cat),
          });
        },
      });
    });

    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      pills.push({
        id: 'price-filter',
        label: `Price: ₹${priceRange[0].toLocaleString('en-IN')} - ₹${priceRange[1].toLocaleString('en-IN')}`,
        onRemove: () => {
          setFilters({ priceRange: [0, 50000] });
        },
      });
    }

    if (minRating > 0) {
      pills.push({
        id: 'rating-filter',
        label: `Rating: ${minRating.toFixed(1)}+ ★`,
        onRemove: () => {
          setFilters({ minRating: 0 });
        },
      });
    }

    return pills;
  }, [selectedCategories, priceRange, minRating, setFilters]);

  return (
    <section className="flex-1 w-full min-w-0">
      {/* ─── Header & Active Filter Pills ─────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs text-neutral-400">{subtitle}</p>
            )}
          </div>

          <div className="text-xs text-neutral-400 font-medium">
            Showing{' '}
            <span className="text-white font-semibold">
              {visibleProducts.length}
            </span>{' '}
            of{' '}
            <span className="text-white font-semibold">
              {filteredProducts.length}
            </span>{' '}
            products
          </div>
        </div>

        {/* Filter Pills */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 pt-2 pb-1"
            >
              {activeFilters.map((pill) => (
                <motion.span
                  key={pill.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800/90 text-neutral-200 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <span>{pill.label}</span>
                  <button
                    onClick={pill.onRemove}
                    className="p-0.5 rounded-full hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
                    aria-label={`Remove filter ${pill.label}`}
                  >
                    <X size={12} />
                  </button>
                </motion.span>
              ))}

              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Clear All</span>
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Error State ─────────────────────────────────────────────────── */}
      {error && !loading && (
        <ErrorState message={error} onRetry={onRetry} />
      )}

      {/* ─── Loading State (Skeletons) ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading && <LoadingState count={12} />}
      </AnimatePresence>

      {/* ─── Empty State ─────────────────────────────────────────────────── */}
      {!loading && !error && filteredProducts.length === 0 && (
        <EmptyState onResetFilters={clearFilters} />
      )}

      {/* ─── Product Grid ────────────────────────────────────────────────── */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.product_id || product.article_id || `prod-${index}`}
              product={product}
              index={index}
            />
          ))}
        </div>
      )}

      {/* ─── Load More Button ────────────────────────────────────────────── */}
      {!loading && !error && hasMore && (
        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadMore}
            className="px-8 py-3.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-[#D4AF37]/50 text-white font-semibold text-sm transition-all shadow-xl shadow-black/40 flex items-center gap-2 group cursor-pointer"
          >
            <span>Load More Products</span>
            <ChevronDown
              size={16}
              className="text-[#D4AF37] group-hover:translate-y-0.5 transition-transform"
            />
          </motion.button>
        </div>
      )}
    </section>
  );
}
