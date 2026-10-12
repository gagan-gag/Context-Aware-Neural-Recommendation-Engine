'use client';

import { motion } from 'framer-motion';
import { PremiumProductCard } from './PremiumProductCard';
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden aspect-square animate-pulse flex flex-col justify-end p-4"
          >
            <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
            <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl p-12 border border-white/5 my-4">
        <p className="text-4xl mb-4">🛍️</p>
        <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
        <p className="text-neutral-400 mb-6 max-w-sm text-sm">
          No H&amp;M products match your current filter selections. Try broadening your criteria.
        </p>
        <button
          onClick={onResetFilters}
          className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded-xl transition shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer text-sm"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.product_id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
        >
          <PremiumProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
