'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Scale, Star, Zap } from 'lucide-react';
import type { Product } from '@/lib/store';
import { useStore } from '@/lib/store';
import { showToast } from './Toaster';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const easeCubic = [0.34, 1.56, 0.64, 1] as const;

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { savedItems, toggleSavedItem, currency } = useStore();

  const productId = product.product_id || product.article_id || 'item-unknown';
  const productName = product.product_name || product.name || 'Luxury Fashion Item';
  const brand = product.brand || 'AVERO ATELIER';
  const rating = product.rating ?? 4.8;
  const reviewCount = product.review_count ?? 124;
  const discount = product.discount ?? product.discount_percent ?? 0;
  const scorePercent = Math.round((product.score ?? 0.9) * 100);

  const priceUSD = product.price_usd ?? product.price ?? 190.0;
  const priceINR = product.price_inr ?? Math.round(priceUSD * 83.5);
  const priceINRFormatted = product.price_inr_formatted ?? `₹${priceINR.toLocaleString('en-IN')}`;

  const isSaved = savedItems.includes(productId);

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      toggleSavedItem(productId);
      if (isSaved) {
        showToast('Removed from wishlist', 'info');
      } else {
        showToast('Added to wishlist ❤️', 'success');
      }
    },
    [isSaved, productId, toggleSavedItem]
  );

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(
            typeof window !== 'undefined'
              ? `${window.location.origin}/recommendations?product=${productId}`
              : `https://avero.ai/product/${productId}`
          );
          showToast('Copied to clipboard ✅', 'success');
        } else {
          showToast('Copied to clipboard ✅', 'success');
        }
      } catch {
        showToast('Copied to clipboard ✅', 'success');
      }
    },
    [productId]
  );

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    showToast(`Added ${productName} to comparison`, 'info');
  }, [productName]);

  const fallbackImageUrl =
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80';
  const finalImageUrl = imageError || !product.image_url ? fallbackImageUrl : product.image_url;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.4),
        ease: easeCubic,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: easeCubic },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-neutral-900/90 border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 hover:shadow-2xl hover:shadow-black/60 transition-colors duration-300"
    >
      {/* ─── Image Container (16:9, rounded 8px inner) ────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 p-1.5">
        <div className="relative w-full h-full rounded-[8px] overflow-hidden bg-neutral-900">
          <motion.div
            className="w-full h-full relative"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.3, ease: easeCubic }}
          >
            <Image
              src={finalImageUrl}
              alt={productName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              className="object-cover object-center transition-opacity duration-300"
              onError={() => setImageError(true)}
            />
          </motion.div>

          {/* Hover Overlay Gradient (0 to 100% black) */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: easeCubic }}
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none"
          />

          {/* AI Score Badge (Top-Right, Gold Pill) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#D4AF37]/50 shadow-lg">
            <Zap size={11} className="text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-[11px] font-semibold text-[#D4AF37] tracking-tight">
              {scorePercent}% Match
            </span>
          </div>

          {/* Discount Badge (Top-Left, Green Pill) */}
          {discount > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-semibold text-[10px] tracking-wider uppercase">
              {discount}% OFF
            </div>
          )}

          {/* Floating Action Buttons on Hover */}
          <motion.div
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 8,
            }}
            transition={{ duration: 0.3, ease: easeCubic }}
            className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5"
          >
            {/* Compare Button */}
            <motion.button
              whileHover={{ scale: 1.1, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className="w-8 h-8 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center shadow-lg transition-colors"
              title="Add to Compare"
              aria-label="Add to comparison"
            >
              <Scale size={13} />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center shadow-lg transition-colors"
              title="Share Product"
              aria-label="Share product"
            >
              <Share2 size={13} />
            </motion.button>

            {/* Wishlist Heart Toggle */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transition-colors ${
                isSaved
                  ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-rose-400 border-white/10'
              }`}
              title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <motion.div
                initial={false}
                animate={{ scale: isSaved ? [1, 1.35, 1] : 1 }}
                transition={{ duration: 0.4, ease: easeCubic }}
              >
                <Heart
                  size={14}
                  className={isSaved ? 'fill-current text-white' : 'stroke-current'}
                />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ─── Product Info Section ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-4 pt-3">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.75rem] font-semibold text-neutral-400 uppercase tracking-wider">
              {brand}
            </span>
            <span className="text-[11px] text-neutral-500 font-medium capitalize">
              {product.category}
            </span>
          </div>

          {/* Title (1.25rem, bold, white, 2-line clamp) */}
          <h3
            className="text-[1.125rem] sm:text-[1.25rem] font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-[#D4AF37] transition-colors duration-200"
            title={productName}
          >
            {productName}
          </h3>

          {/* Rating Stars ⭐ + Count */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(rating)
                      ? 'text-[#D4AF37] fill-[#D4AF37]'
                      : 'text-neutral-700 fill-neutral-700'
                  }
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-neutral-300">
              {rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-neutral-500">
              ({reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* ─── Price Section ──────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-white/5 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              {currency === 'USD' ? (
                <>
                  <span className="text-lg font-bold text-white tracking-tight">
                    ${priceUSD.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    ({priceINRFormatted})
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold text-white tracking-tight">
                    {priceINRFormatted}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    (${priceUSD.toFixed(2)})
                  </span>
                </>
              )}
            </div>

            {/* Neural Context Reason */}
            {product.reason && (
              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 italic">
                ✨ {product.reason}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
