'use client';

import { useState } from 'react';
import { Heart, Share2, ShoppingBag } from 'lucide-react';
import { OptimizedProductImage } from './OptimizedProductImage';
import type { Product } from '@/lib/mockData';
import { showToast } from './Toaster';

interface PremiumProductCardProps {
  product: Product;
}

const COLOR_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#171717',
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

  const handleBuyNow = () => {
    showToast(`Added ${product.product_name} to cart!`, 'success');
  };

  const handleToggleWishlist = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (nextSaved) {
      showToast('Added to wishlist', 'success');
    } else {
      showToast('Removed from wishlist', 'info');
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}/recommendations?id=${product.product_id}`);
      }
      showToast('Link copied to clipboard', 'success');
    } catch {
      showToast('Link copied to clipboard', 'success');
    }
  };

  return (
    <div
      className="group h-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xs overflow-hidden h-full flex flex-col border border-[#ECECE8] hover:border-[#DCDCD6] shadow-subtle hover:shadow-card transition-all duration-300">
        {/* ─── Image Container (3:4 Ratio) ─────────────────────────────────── */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F5F3]">
          <OptimizedProductImage
            src={product.model_image || product.image_url}
            alt={product.product_name}
            category={product.category}
          />

          {/* AI Score Badge (Top-Left) */}
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 text-[#4A5540] border border-[#DCDCD6] px-2 py-0.5 rounded-xs text-[10px] font-semibold">
            {Math.round(product.score * 100)}% Match
          </div>

          {/* Discount Badge (Top-Right) */}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10 bg-[#FBEFEB] text-[#8A4032] border border-[#ECD7D4] px-2 py-0.5 rounded-xs text-[10px] font-semibold">
              -{product.discount}%
            </div>
          )}

          {/* Color Swatches (Bottom-Left) */}
          {product.colors && product.colors.length > 0 && (
            <div
              className={`absolute bottom-2.5 left-2.5 z-10 flex gap-1 transition-opacity duration-200 ${
                isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Floating Action Buttons on Hover */}
          <div
            className={`absolute bottom-2.5 left-2.5 right-2.5 z-20 flex gap-1.5 transition-all duration-200 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-[#171717] hover:bg-[#333333] text-white py-2 px-3 rounded-xs font-semibold text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
            >
              <ShoppingBag size={12} />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-xs border transition cursor-pointer ${
                isSaved
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#444441] hover:text-[#171717] border-[#DCDCD6]'
              }`}
              title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 bg-white text-[#444441] hover:text-[#171717] rounded-xs border border-[#DCDCD6] transition cursor-pointer"
              title="Share product"
              aria-label="Share product"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* ─── Product Info Section ───────────────────────────────────────── */}
        <div className="flex-1 p-4 flex flex-col justify-between bg-white">
          <div>
            <p className="text-[#8E8E88] text-[10px] uppercase tracking-wider font-semibold mb-1">
              {product.brand} · {product.collection}
            </p>

            <h3
              className="text-[#171717] font-medium text-sm leading-snug line-clamp-1 mb-1.5 group-hover:text-[#4A5540] transition-colors"
              title={product.product_name}
            >
              {product.product_name}
            </h3>

            <div className="flex items-center gap-1 text-xs text-[#737370] mb-2">
              <span className="text-[#B38E46]">★</span>
              <span className="font-semibold text-[#171717]">{product.rating}</span>
              <span>({product.review_count.toLocaleString()})</span>
            </div>
          </div>

          <div className="border-t border-[#F0F0EC] pt-2.5 flex items-baseline justify-between">
            <span className="text-base font-semibold text-[#171717] tracking-tight">
              {product.price_inr_formatted}
            </span>
            <span className="text-xs text-[#8E8E88]">
              ${product.price_usd.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
