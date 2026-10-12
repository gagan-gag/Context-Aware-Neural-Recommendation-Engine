'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, ShoppingBag } from 'lucide-react';
import { OptimizedProductImage } from './OptimizedProductImage';
import type { Product } from '@/lib/mockData';
import { showToast } from './Toaster';

interface PremiumProductCardProps {
  product: Product;
}

const COLOR_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#0A0A0A',
  navy: '#0F1D38',
  gray: '#737373',
  beige: '#F5F5DC',
  brown: '#8B4513',
  camel: '#C19A6B',
  emerald: '#046A38',
  champagne: '#F7E7CE',
  charcoal: '#36454F',
  cream: '#FFFDD0',
  khaki: '#C3B091',
  slate: '#708090',
  blue: '#1E3A8A',
  denim: '#3B82F6',
  burgundy: '#800020',
  oatmeal: '#E3DAC9',
  sage: '#9DC183',
  tortoise: '#8B5A2B',
  rust: '#B7410E',
};

function getColorHex(colorName: string): string {
  const key = colorName.toLowerCase().split(' ')[0];
  return COLOR_MAP[key] || '#9CA3AF';
}

export function PremiumProductCard({ product }: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.model_image || product.image_url);

  const handleBuyNow = () => {
    showToast(`Added ${product.product_name} to cart!`, 'success');
  };

  const handleToggleWishlist = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (nextSaved) {
      showToast('Added to wishlist ❤️', 'success');
    } else {
      showToast('Removed from wishlist', 'info');
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}/recommendations?id=${product.product_id}`);
      }
      showToast('Link copied to clipboard! 📋', 'success');
    } catch {
      showToast('Link copied to clipboard! 📋', 'success');
    }
  };

  return (
    <motion.div
      className="group h-full select-none"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="bg-neutral-950 rounded-2xl overflow-hidden h-full flex flex-col border border-white/5 shadow-xl hover:border-[#D4AF37]/40 hover:shadow-2xl transition-all duration-300">
        {/* ─── Image Container (Square) ────────────────────────────────────── */}
        <div className="relative w-full aspect-square overflow-hidden bg-neutral-900" style={{ position: 'relative' }}>
          <OptimizedProductImage
            src={currentImage}
            alt={product.product_name}
            fallback="https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
          />

          {/* Hover Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* AI Score Badge (Top-Left) */}
          <div className="absolute top-3.5 left-3.5 z-10 bg-[#D4AF37] text-black px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg flex items-center gap-1">
            <span>✨</span>
            <span>{Math.round(product.score * 100)}% Match</span>
          </div>

          {/* Discount Badge (Top-Right) */}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-3.5 right-3.5 z-10 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
              -{product.discount}%
            </div>
          )}

          {/* Color Swatches (Bottom-Left) */}
          {product.colors && product.colors.length > 0 && (
            <div className={`absolute bottom-3.5 left-3.5 z-10 flex gap-1.5 transition-opacity duration-300 ${
              isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-white/40 shadow-sm transition-transform hover:scale-125"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Floating Action Buttons on Hover */}
          <div
            className={`absolute bottom-3.5 left-3.5 right-3.5 z-20 flex gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            {/* Add to Cart / Buy Now */}
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-white hover:bg-neutral-100 text-black py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Buy Now</span>
            </button>

            {/* Wishlist Heart */}
            <button
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-xl transition shadow-lg active:scale-95 cursor-pointer ${
                isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/10'
              }`}
              title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-xl border border-white/10 transition shadow-lg active:scale-95 cursor-pointer"
              title="Share product"
              aria-label="Share product"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* ─── Product Info Section ───────────────────────────────────────── */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-neutral-950">
          <div>
            {/* Brand & Collection */}
            <p className="text-neutral-400 text-[11px] uppercase tracking-wider font-semibold mb-1.5">
              {product.brand} • {product.collection}
            </p>

            {/* Product Title */}
            <h3
              className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#D4AF37] transition-colors"
              title={product.product_name}
            >
              {product.product_name}
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex text-[#D4AF37] text-xs">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(product.rating) ? 'text-[#D4AF37]' : 'text-neutral-700'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-neutral-400 text-xs font-medium">
                {product.rating} ({product.review_count.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Price & Sizes Section */}
          <div className="border-t border-neutral-800/80 pt-3.5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {product.price_inr_formatted}
              </span>
              <span className="text-xs text-neutral-500 line-through">
                ${(product.price_usd * 1.2).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3 font-medium">
              ≈ ${product.price_usd.toFixed(2)} USD
            </p>

            {/* Available Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {product.sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="px-2 py-0.5 bg-neutral-900 border border-white/5 hover:border-[#D4AF37]/40 text-neutral-300 text-[10px] font-semibold rounded-md transition cursor-pointer"
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
