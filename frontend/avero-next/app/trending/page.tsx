'use client';

import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';

export default function TrendingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const trendingProducts = useMemo(() => {
    let list = [...MOCK_PRODUCTS].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    return list;
  }, [activeCategory]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 32,
            borderBottom: '1px solid #ECECE8',
            paddingBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendingUp size={14} color="#111" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#767676',
              }}
            >
              Curated Popularity
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
            Trending Collections
          </h1>
          <p style={{ fontSize: 14, color: '#666666', margin: 0, maxWidth: 600 }}>
            Highest velocity garments and popular silhouettes ranked by interaction frequency across the catalog.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 32, paddingBottom: 4 }}>
          {['all', 'Dresses', 'Tops', 'Shirts & Blouses', 'Trousers', 'Outerwear', 'Knitwear', 'Accessories'].map(cat => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? '#111111' : '#F5F5F3',
                  color: isSelected ? '#FFFFFF' : '#333333',
                  border: 'none',
                  borderRadius: 20,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat === 'all' ? 'All Trending' : cat}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.product_id || product.article_id}
              product={product}
              onClick={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>

        {/* Quick View Modal */}
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </div>
  );
}
