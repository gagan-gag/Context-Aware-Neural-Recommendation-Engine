'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, SlidersHorizontal, RotateCw } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { ShopByCategory } from '@/components/ShopByCategory';
import { RecommendedForYou } from '@/components/RecommendedForYou';
import { FilterSidebar, FilterState } from '@/components/FilterSidebar';
import { ProductCard } from '@/components/ProductCard';
import { HowCanWorks } from '@/components/HowCanWorks';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';
import { fetchRecommendationsWithFilters, checkApiHealth } from '@/lib/api';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/Toaster';

export default function StorefrontPage() {
  const { setApiConnected, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state matching Mockup
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    color: 'all',
    priceMax: 20000,
    search: '',
    sortBy: 'relevance',
  });

  // Sync global search from Navbar with local filter
  useEffect(() => {
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  // Connect to CAN Recommendation Engine
  useEffect(() => {
    let active = true;
    async function loadBackendData() {
      try {
        const health = await checkApiHealth();
        if (!active) return;
        setApiConnected(health.ok);
        if (health.ok) {
          const res = await fetchRecommendationsWithFilters({
            user_id: 'avero-guest-001',
            top_k: 20,
          });
          if (active && res.products && res.products.length > 0) {
            setProducts(res.products);
          }
        }
      } catch {
        if (!active) return;
        setApiConnected(false);
      }
    }
    loadBackendData();
    return () => { active = false; };
  }, [setApiConnected]);

  // CAN Recommendations (Top 6 picks matching mockup)
  const [recommendations, setRecommendations] = useState<Product[]>(() =>
    MOCK_PRODUCTS.slice(0, 6)
  );

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    showToast('Refreshing Context-Aware Neural recommendations...', 'info');
    try {
      // Simulate real-time CAN inference update
      await new Promise(resolve => setTimeout(resolve, 600));
      // Shuffle & re-rank top candidates
      const shuffled = [...MOCK_PRODUCTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .map((p, idx) => ({
          ...p,
          score: Number((0.98 - idx * 0.02).toFixed(2)),
          is_can_pick: true,
        }));
      setRecommendations(shuffled);
      showToast('CAN recommendations updated for your session', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered Collection logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category filter
    if (filters.category && filters.category !== 'all') {
      const target = filters.category.toLowerCase();
      list = list.filter(p => {
        const cat = p.category.toLowerCase();
        if (target === 'trousers') return cat.includes('trouser') || cat.includes('jean') || cat.includes('bottom');
        if (target === 'shirts & blouses') return cat.includes('shirt') || cat.includes('blouse');
        if (target === 'tops') return cat.includes('top') || cat.includes('hoodie') || cat.includes('knit');
        return cat.includes(target);
      });
    }

    // 2. Color filter
    if (filters.color && filters.color !== 'all') {
      const colorTarget = filters.color.toLowerCase();
      list = list.filter(p => (p.color || '').toLowerCase().includes(colorTarget));
    }

    // 3. Price range filter
    if (filters.priceMax < 20000) {
      list = list.filter(p => {
        const inr = p.price_inr ?? Math.round((p.price_usd ?? 0) * 83.5);
        return inr <= filters.priceMax;
      });
    }

    // 4. Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        p =>
          p.product_name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.color || '').toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    switch (filters.sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price_inr - b.price_inr);
        break;
      case 'price-high':
        list.sort((a, b) => b.price_inr - a.price_inr);
        break;
      case 'newest':
        list.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
        break;
      default:
        // Relevance (Neural Match)
        list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return list;
  }, [products, filters]);

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      color: 'all',
      priceMax: 20000,
      search: '',
      sortBy: 'relevance',
    });
    setSearchQuery('');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* 1. Hero Section matching Mockup */}
      <HeroSection />

      {/* 2. Shop by Category matching Mockup */}
      <ShopByCategory
        selectedCategory={filters.category}
        onSelectCategory={catName => {
          setFilters(prev => ({ ...prev, category: catName }));
        }}
      />

      {/* 3. Recommended for You (CAN Engine) matching Mockup */}
      <RecommendedForYou
        products={recommendations}
        onRefresh={handleRefreshRecommendations}
        isRefreshing={isRefreshing}
        onProductClick={product => setSelectedProduct(product)}
      />

      {/* 4. Explore the Collection (Filters & Grid) matching Mockup */}
      <section id="collection-section" style={{ padding: '48px 0 64px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
          {/* Section Heading & Dynamic Style Count matching Mockup */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 28,
              borderBottom: '1px solid #ECECE8',
              paddingBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
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
                Explore the Collection
              </h2>
              <p style={{ fontSize: 14, color: '#666666', margin: 0 }}>
                Browse our complete catalog of H&amp;M fashion items. Use filters to find your perfect match.
              </p>
            </div>

            {/* Accurate style count pill */}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#666666' }}>
              {filteredProducts.length} styles shown
            </span>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div style={{ marginBottom: 20 }} className="block md:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 42,
              }}
            >
              <SlidersHorizontal size={15} />
              <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Main Collection Grid Layout: Left Sidebar + Right Products */}
          <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
            {/* Desktop Left Filter Sidebar */}
            <div className="hidden md:block" style={{ width: 240, flexShrink: 0 }}>
              <FilterSidebar
                filters={filters}
                onChange={newFilters => setFilters(newFilters)}
                onClear={handleClearFilters}
              />
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 20,
                  borderRadius: 8,
                  border: '1px solid #EAEAE6',
                  marginBottom: 20,
                }}
                className="block md:hidden w-full"
              >
                <FilterSidebar
                  filters={filters}
                  onChange={newFilters => setFilters(newFilters)}
                  onClear={handleClearFilters}
                  onCloseMobile={() => setMobileFilterOpen(false)}
                />
              </div>
            )}

            {/* Right Product Grid Area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Product Toolbar: Search + Sort Dropdown matching Mockup */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: 24,
                  flexWrap: 'wrap',
                }}
              >
                {/* Search products input matching Mockup */}
                <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 16px 0 38px',
                      fontSize: 13,
                      backgroundColor: '#F5F5F3',
                      border: '1px solid transparent',
                      borderRadius: 4,
                      color: '#111111',
                      outline: 'none',
                    }}
                    className="focus:bg-white focus:border-neutral-300"
                  />
                  <Search
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888888',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Sort Dropdown matching Mockup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#666666' }}>Sort by</span>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={filters.sortBy}
                      onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0DC',
                        borderRadius: 4,
                        padding: '8px 32px 8px 12px',
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: '#111111',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="relevance">Relevance (Neural Match)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                    <ChevronDown
                      size={14}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666666',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Badges */}
              {(filters.category !== 'all' || filters.color !== 'all' || filters.priceMax < 20000 || filters.search) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <span style={{ fontSize: 12, color: '#888' }}>Active:</span>
                  {filters.category !== 'all' && (
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: '#F0EFEA',
                        padding: '4px 10px',
                        borderRadius: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      Category: {filters.category}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        &times;
                      </button>
                    </span>
                  )}
                  {filters.color !== 'all' && (
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: '#F0EFEA',
                        padding: '4px 10px',
                        borderRadius: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      Color: {filters.color}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, color: 'all' }))}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        &times;
                      </button>
                    </span>
                  )}
                  {filters.priceMax < 20000 && (
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: '#F0EFEA',
                        padding: '4px 10px',
                        borderRadius: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      Max: ₹{filters.priceMax.toLocaleString('en-IN')}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, priceMax: 20000 }))}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        &times;
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: 12,
                      color: '#C53030',
                      cursor: 'pointer',
                      fontWeight: 600,
                      marginLeft: 4,
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.product_id || product.article_id}
                      product={product}
                      onClick={prod => setSelectedProduct(prod)}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '64px 20px',
                    textAlign: 'center',
                    backgroundColor: '#FAF9F6',
                    borderRadius: 8,
                    border: '1px dashed #E0E0DC',
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>
                    No styles match your active filters
                  </h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px' }}>
                    Try expanding your price range, clearing color selections, or resetting all filters.
                  </p>
                  <button onClick={handleClearFilters} className="btn-primary">
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. How CAN Works matching Mockup */}
      <HowCanWorks />

      {/* Quick View Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
