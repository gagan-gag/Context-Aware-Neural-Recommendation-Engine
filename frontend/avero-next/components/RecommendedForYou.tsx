'use client';

import { useRef, useState } from 'react';
import { RotateCw, ChevronRight, Heart } from 'lucide-react';
import type { Product } from '@/lib/store';
import { useStore } from '@/lib/store';
import { showToast } from './Toaster';

interface RecommendedForYouProps {
  products: Product[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  onProductClick: (product: Product) => void;
}

export function RecommendedForYou({
  products,
  onRefresh,
  isRefreshing = false,
  onProductClick,
}: RecommendedForYouProps) {
  const { savedItems, toggleSavedItem } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const isSaved = savedItems.includes(productId);
    toggleSavedItem(productId);
    showToast(isSaved ? 'Removed from wishlist' : 'Added to wishlist', isSaved ? 'info' : 'success');
  };

  return (
    <section id="recommended-section" style={{ padding: '48px 0', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#111111',
                margin: '0 0 6px',
              }}
            >
              Recommended for You
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#666666',
                margin: 0,
              }}
            >
              Personalized picks from our CAN (Context-Aware Neural) engine based on your interests.
            </p>
          </div>

          {/* Refresh Button matching Mockup */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #111111',
              borderRadius: 4,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#111111',
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: 'all 150ms ease',
            }}
            className="hover:bg-neutral-50 active:scale-98"
          >
            <RotateCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh Recommendations</span>
          </button>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative' }}>
          <div
            ref={scrollContainerRef}
            style={{
              display: 'flex',
              gap: 18,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: 12,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="no-scrollbar"
          >
            {products.map(product => {
              const productId = product.product_id || product.article_id || 'item';
              const isSaved = savedItems.includes(productId);
              const priceINR = product.price_inr ?? Math.round((product.price_usd ?? 0) * 83.5);

              return (
                <article
                  key={productId}
                  onClick={() => onProductClick(product)}
                  style={{
                    flex: '0 0 calc(16.666% - 15px)',
                    minWidth: 200,
                    maxWidth: 240,
                    scrollSnapAlign: 'start',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                  }}
                  className="group"
                >
                  {/* Image Container with 3:4 aspect ratio */}
                  <div
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
                      src={product.image_url}
                      alt={product.product_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Wishlist Heart Icon Button */}
                    <button
                      onClick={e => handleWishlistToggle(e, productId)}
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
                      }}
                      className="hover:scale-110"
                    >
                      <Heart
                        size={16}
                        fill={isSaved ? '#E50010' : 'none'}
                        stroke={isSaved ? '#E50010' : '#111111'}
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>

                  {/* Product Metadata matching Mockup */}
                  <div>
                    {/* Category */}
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
                      {product.category}
                    </p>

                    {/* Title */}
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
                      {product.product_name}
                    </h3>

                    {/* Price & CAN Pick Pill */}
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

                      {/* CAN Pick badge matching mockup */}
                      <span className="can-badge">
                        CAN Pick
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Chevron Scroll Button */}
          <button
            onClick={scrollRight}
            aria-label="Scroll recommendations"
            style={{
              position: 'absolute',
              right: -16,
              top: '40%',
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECECE8',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'transform 150ms ease',
            }}
            className="hover:scale-110 active:scale-95 hidden sm:flex"
          >
            <ChevronRight size={18} color="#111111" />
          </button>
        </div>
      </div>
    </section>
  );
}
