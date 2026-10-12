'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';
import { RecommendationGrid } from '@/components/RecommendationGrid';
import { useStore } from '@/lib/store';
import { fetchTrending } from '@/lib/api';
import type { Product } from '@/lib/store';
import { showToast } from '@/components/Toaster';

export default function TrendingPage() {
  const {
    trendingProducts, trendingLoading, error,
    setTrendingProducts, setTrendingLoading, setError,
  } = useStore();

  const load = useCallback(async () => {
    setTrendingLoading(true);
    setError(null);
    try {
      const data = await fetchTrending(16);
      setTrendingProducts(data.recommendations);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trending products';
      setError(message);
      showToast('Could not load trending products.', 'error');
    } finally {
      setTrendingLoading(false);
    }
  }, [setTrendingLoading, setError, setTrendingProducts]);

  useEffect(() => {
    if (trendingProducts.length === 0) {
      load();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="badge-coral">
            <Flame size={10} className="fill-current" />
            Trending Now
          </div>
        </div>
        <h1 className="text-headline mb-2">
          What&apos;s{' '}
          <span className="text-coral-gradient">Hot</span>{' '}
          Right Now
        </h1>
        <p className="text-neutral-500 text-sm">
          Top products based on platform-wide signals — updated hourly
        </p>
      </motion.div>

      {/* Trending Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 mb-8 flex-wrap"
      >
        {['Last 7 days', 'Across all categories', 'Real-time signals'].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-500">
            <TrendingUp size={11} className="text-[#FF6B35]" />
            {label}
          </div>
        ))}
      </motion.div>

      {/* Main Layout */}
      <div className="flex gap-8 items-start">
        <FilterSidebar />
        <RecommendationGrid
          products={trendingProducts}
          loading={trendingLoading}
          error={error}
          title="Trending Products"
          subtitle="Sorted by popularity across the platform"
        />
      </div>
    </div>
  );
}
