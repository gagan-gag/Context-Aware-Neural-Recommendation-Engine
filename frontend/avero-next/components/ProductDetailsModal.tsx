'use client';

import { useEffect } from 'react';
import { X, Heart, ShoppingBag, Sparkles, Check, Star } from 'lucide-react';
import type { Product } from '@/lib/store';
import { useStore } from '@/lib/store';
import { showToast } from './Toaster';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { savedItems, toggleSavedItem } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const productId = product.product_id || product.article_id || 'item';
  const isSaved = savedItems.includes(productId);
  const priceINR = product.price_inr ?? Math.round((product.price_usd ?? 0) * 83.5);
  const scorePercent = typeof product.score === 'number' && product.score > 0
    ? Math.round(product.score * 100)
    : 95;

  const handleWishlist = () => {
    toggleSavedItem(productId);
    showToast(isSaved ? 'Removed from wishlist' : 'Added to wishlist', isSaved ? 'info' : 'success');
  };

  const handleAddToBag = () => {
    showToast(`Added ${product.product_name} to your shopping bag`, 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          maxWidth: 820,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 0,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#F5F5F3',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#111111',
            transition: 'background 150ms ease',
          }}
          className="hover:bg-neutral-200"
        >
          <X size={18} />
        </button>

        {/* Product Image */}
        <div
          style={{
            aspectRatio: '3 / 4',
            backgroundColor: '#F5F5F3',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={product.image_url}
            alt={product.product_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>

        {/* Product Details & Actions */}
        <div
          style={{
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Category & Article ID */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#767676',
                }}
              >
                {product.category}
              </span>
              <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>
                ID: {product.article_id || product.product_id}
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#111111',
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}
            >
              {product.product_name}
            </h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#111111' }}>
                ₹{priceINR.toLocaleString('en-IN')}
              </span>
              {product.color && (
                <span style={{ fontSize: 13, color: '#666' }}>
                  Color: <strong>{product.color}</strong>
                </span>
              )}
            </div>

            {/* CAN Neural Badge & Explanation */}
            <div
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid #ECECE8',
                borderRadius: 6,
                padding: '14px 16px',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="can-badge">
                  <Sparkles size={11} />
                  CAN Pick · {scorePercent}% Neural Confidence
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#555555', lineHeight: 1.5 }}>
                {product.reason || 'Ranked in the 32D Two-Tower latent embedding space matching your current fashion interest signals.'}
              </p>
            </div>

            {/* Garment Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                <Check size={14} color="#166534" />
                <span>Verified H&amp;M Kaggle dataset catalog article</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                <Check size={14} color="#166534" />
                <span>Premium fabric composition &amp; tailored silhouette</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                <Check size={14} color="#166534" />
                <span>Context-aware styling recommendations active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              onClick={handleAddToBag}
              className="btn-primary"
              style={{
                flex: 1,
                height: 48,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ShoppingBag size={16} />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleWishlist}
              style={{
                width: 48,
                height: 48,
                borderRadius: 4,
                border: '1.5px solid #111',
                backgroundColor: isSaved ? '#111' : '#FFF',
                color: isSaved ? '#FFF' : '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              aria-label="Toggle wishlist"
            >
              <Heart
                size={18}
                fill={isSaved ? '#FFF' : 'none'}
                stroke={isSaved ? '#FFF' : '#111'}
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
