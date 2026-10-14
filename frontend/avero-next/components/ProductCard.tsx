'use client';

import { useCallback } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/store';
import { useStore } from '@/lib/store';
import { showToast } from './Toaster';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  showCanPick?: boolean;
  index?: number;
  isDemoScore?: boolean;
}

export function ProductCard({ product, onClick, showCanPick = false }: ProductCardProps) {
  const { savedItems, toggleSavedItem } = useStore();

  const productId = product.product_id || product.article_id || 'item';
  const productName = product.product_name || product.name || 'Fashion Garment';
  const category = product.category || 'Fashion';
  const priceINR = product.price_inr ?? Math.round((product.price_usd ?? 0) * 83.5);
  const isSaved = savedItems.includes(productId);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedItem(productId);
    showToast(isSaved ? 'Removed from wishlist' : 'Added to wishlist', isSaved ? 'info' : 'success');
  }, [isSaved, productId, toggleSavedItem]);

  return (
    <article
      className="product-card group"
      onClick={() => onClick && onClick(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 3:4 Image Frame matching Mockup */}
      <div
        className="product-image-container"
        style={{
          aspectRatio: '3 / 4',
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 6,
          backgroundColor: '#F5F5F3',
          marginBottom: 10,
        }}
      >
        <img
          src={product.image_url || '/placeholder-garment.svg'}
          alt={productName}
          className="product-image group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== '/placeholder-garment.svg') {
              target.src = '/placeholder-garment.svg';
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '6px',
            transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Wishlist Heart Icon Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Save to Wishlist"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'transform 150ms ease, background 150ms ease',
            zIndex: 5,
          }}
          className="hover:scale-110 active:scale-95"
        >
          <Heart
            size={16}
            fill={isSaved ? '#E50010' : 'none'}
            stroke={isSaved ? '#E50010' : '#111111'}
            strokeWidth={1.75}
          />
        </button>

        {/* CAN Pick badge if applicable */}
        {(showCanPick || product.is_can_pick) && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 5 }}>
            <span className="can-badge">
              CAN Pick
            </span>
          </div>
        )}
      </div>

      {/* Metadata matching Mockup */}
      <div>
        {/* Category in uppercase */}
        <p
          style={{
            margin: '0 0 3px',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#767676',
          }}
        >
          {category}
        </p>

        {/* Product Title */}
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: 13.5,
            fontWeight: 500,
            color: '#111111',
            lineHeight: 1.3,
            fontFamily: 'var(--font-sans)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {productName}
        </h3>

        {/* Price in INR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#111111',
            }}
          >
            ₹{priceINR.toLocaleString('en-IN')}
          </span>

          {product.color && (
            <span style={{ fontSize: 11.5, color: '#888' }}>
              {product.color}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
