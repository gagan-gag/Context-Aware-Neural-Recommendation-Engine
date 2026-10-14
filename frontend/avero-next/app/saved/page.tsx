'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useStore } from '@/lib/store';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';
import { showToast } from '@/components/Toaster';

export default function SavedPage() {
  const { savedItems, removeSavedItem } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const savedProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const id = p.product_id || p.article_id;
      return id ? savedItems.includes(id) : false;
    });
  }, [savedItems]);

  const handleClearAll = () => {
    savedItems.forEach((id) => removeSavedItem(id));
    showToast('Cleared all saved items', 'info');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 36,
            borderBottom: '1px solid #ECECE8',
            paddingBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Heart size={14} color="#C53030" fill="#C53030" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#767676',
                }}
              >
                Personal Lookbook
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 32,
                fontWeight: 600,
                color: '#111111',
                margin: '0 0 8px',
              }}
            >
              Saved Items
            </h1>
            <p style={{ fontSize: 14, color: '#666666', margin: 0 }}>
              {savedProducts.length > 0
                ? `${savedProducts.length} style${savedProducts.length !== 1 ? 's' : ''} saved to your wishlist`
                : 'Your wishlist is currently empty'}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 12.5,
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid #CCC',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#111',
              }}
              className="hover:border-black"
            >
              <Trash2 size={13} />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* Content */}
        {savedProducts.length === 0 ? (
          <div
            style={{
              padding: '80px 20px',
              textAlign: 'center',
              backgroundColor: '#FAF9F6',
              borderRadius: 8,
              border: '1px dashed #E0E0DC',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECECE8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Heart size={20} color="#888" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>
              No saved items yet
            </h3>
            <p style={{ fontSize: 13.5, color: '#666', margin: '0 0 24px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Explore the AVERO collection and tap the heart icon on any style to curate your personal lookbook.
            </p>
            <Link
              href="/#collection-section"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {savedProducts.map((product) => (
              <ProductCard
                key={product.product_id || product.article_id}
                product={product}
                onClick={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </div>
  );
}
