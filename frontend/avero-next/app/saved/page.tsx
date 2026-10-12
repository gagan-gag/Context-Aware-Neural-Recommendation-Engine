'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Zap, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/Toaster';

export default function SavedPage() {
  const { savedItems, recommendations, trendingProducts, removeSavedItem } = useStore();

  const savedProducts = useMemo(() => {
    const allProducts = [...recommendations, ...trendingProducts];
    const seen = new Set<string>();
    const unique = allProducts.filter((p) => {
      const id = p.product_id || p.article_id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return unique.filter((p) => {
      const id = p.product_id || p.article_id;
      return id ? savedItems.includes(id) : false;
    });
  }, [savedItems, recommendations, trendingProducts]);

  const handleClearAll = () => {
    savedItems.forEach((id) => removeSavedItem(id));
    showToast('Cleared all saved items', 'info');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="badge-gold">
                <Heart size={10} className="fill-current" />
                Wishlist
              </div>
            </div>
            <h1 className="text-headline mb-2">
              Saved{' '}
              <span className="text-gold-gradient">Items</span>
            </h1>
            <p className="text-neutral-500 text-sm">
              {savedProducts.length > 0
                ? `${savedProducts.length} item${savedProducts.length !== 1 ? 's' : ''} in your wishlist`
                : 'Your wishlist is empty'}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-all"
              aria-label="Clear all saved items"
            >
              <Trash2 size={14} />
              Clear All
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {savedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-20 text-center border border-white/5"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-8"
            >
              <Heart size={36} className="text-[#D4AF37]" strokeWidth={1.5} />
            </motion.div>
            <h2 className="font-bold text-2xl mb-3">No saved items yet</h2>
            <p className="text-neutral-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Tap the heart icon on any product to save it here for later.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/recommendations" className="btn-primary">
                <Zap size={16} />
                Get Recommendations
                <ArrowRight size={14} />
              </Link>
              <Link href="/trending" className="btn-secondary flex items-center gap-2">
                <ShoppingBag size={16} />
                Browse Trending
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Products Grid */}
      {savedProducts.length > 0 && (
        <AnimatePresence>
          <div className="product-grid">
            {savedProducts.map((product, index) => (
              <ProductCard key={product.article_id} product={product} index={index} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
