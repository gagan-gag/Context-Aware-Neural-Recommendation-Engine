'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { LoadingSkeletons } from '@/components/LoadingSkeletons';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fetchRecommendationsWithFilters, checkApiHealth } from '@/lib/api';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';
import { Sparkles, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/Toaster';

export default function RecommendationsPage() {
  const { setApiConnected } = useStore();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await checkApiHealth();
      setApiConnected(health.ok);
      setIsDemoMode(!health.ok);

      const res = await fetchRecommendationsWithFilters({
        user_id: 'avero-guest-session',
        top_k: 24,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });

      if (res.products && res.products.length > 0) {
        setProducts(res.products);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
      setIsDemoMode(res.fromFallback);
    } catch {
      setIsDemoMode(true);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [categoryFilter]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter(p =>
      p.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }, [products, categoryFilter]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 32,
            borderBottom: '1px solid #ECECE8',
            paddingBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#767676',
                }}
              >
                Neural Recommendation Engine
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  backgroundColor: isDemoMode ? '#F5F5F3' : '#ECFDF5',
                  color: isDemoMode ? '#666' : '#047857',
                }}
              >
                {isDemoMode ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
                {isDemoMode ? 'Verified Catalog (Offline Engine)' : 'Live Two-Tower Neural Engine Active'}
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
              Recommendation Studio
            </h1>
            <p style={{ fontSize: 14, color: '#666666', margin: 0, maxWidth: 640 }}>
              Real-time candidate generation and cosine similarity ranking computed across
              the H&amp;M personalized fashion dataset embedding space.
            </p>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => {
              showToast('Querying Two-Tower neural model...', 'info');
              loadRecommendations();
            }}
            disabled={loading}
            className="btn-primary"
            style={{
              height: 42,
              padding: '0 20px',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 4,
            }}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Regenerate Picks</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 32, paddingBottom: 4 }}>
          {['all', 'Dresses', 'Tops', 'Shirts & Blouses', 'Trousers', 'Outerwear', 'Knitwear', 'Accessories'].map(cat => {
            const isSelected = categoryFilter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
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
                {cat === 'all' ? 'All Styles' : cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSkeletons count={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadRecommendations} />
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.product_id || product.article_id}
                product={product}
                showCanPick={true}
                onClick={prod => setSelectedProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onReset={() => setCategoryFilter('all')} />
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
