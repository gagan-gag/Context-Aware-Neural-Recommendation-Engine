'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import type { RecommendationFilters } from '@/lib/recommendationEngine';
import { HM_PRODUCTS } from '@/lib/mockData';
import { Sparkles, ShoppingBag, AlertCircle, RefreshCw, Cpu } from 'lucide-react';

export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price_usd: number;
  price_inr: number;
  price_inr_formatted: string;
  score: number;
  rating?: number;
  image_url?: string;
  article_id?: string;
  name?: string;
  color?: string;
  brand?: string;
  reason?: string;
}

export default function RecommendationsPage() {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiveApi, setIsLiveApi] = useState(false);

  const [filters, setFilters] = useState<RecommendationFilters>({
    category: 'all',
    priceMin: 0,
    priceMax: 50000,
    minRating: 0,
    sortBy: 'relevance',
  });

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/recommendations?user_id=test&top_k=16')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('✅ Data received from backend API:', data);
        const list: Product[] = (data.recommendations || []).map((p: any) => ({
          product_id: p.product_id || p.article_id,
          product_name: p.product_name || p.name,
          category: p.category || 'Apparel',
          price_usd: p.price_usd ?? p.price ?? 50,
          price_inr: p.price_inr ?? Math.round((p.price ?? 50) * 83.5),
          price_inr_formatted:
            p.price_inr_formatted ||
            `₹${Math.round(p.price_inr ?? (p.price ?? 50) * 83.5).toLocaleString('en-IN')}`,
          score: p.score ?? 0.9,
          rating: p.rating ?? 4.8,
          image_url: p.image_url,
          color: p.color,
          reason: p.reason,
        }));
        setRawProducts(list);
        setIsLiveApi(true);
        setError('');
      })
      .catch((err) => {
        console.warn('❌ Live API offline, fallback to mock data:', err);
        setError(`Failed to load products: ${err.message}`);
        setIsLiveApi(false);
        setRawProducts(HM_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters and sorting to the products
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // 1. Category
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === cat);
    }

    // 2. Price
    if (typeof filters.priceMin === 'number' || typeof filters.priceMax === 'number') {
      list = list.filter((p) => {
        const price = p.price_inr;
        if (typeof filters.priceMin === 'number' && price < filters.priceMin) return false;
        if (typeof filters.priceMax === 'number' && price > filters.priceMax) return false;
        return true;
      });
    }

    // 3. Min Rating
    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      list = list.filter((p) => (p.rating ?? 0) >= filters.minRating!);
    }

    // 4. Sort
    switch (filters.sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price_inr - b.price_inr);
        break;
      case 'price-high':
        list.sort((a, b) => b.price_inr - a.price_inr);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'relevance':
      default:
        list.sort((a, b) => b.score - a.score);
        break;
    }

    return list;
  }, [rawProducts, filters]);

  return (
    <div className="bg-black text-white min-h-screen pt-20">
      {/* ─── Hero Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles size={11} />
                AVERO Neural Engine
              </span>
              {isLiveApi ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live API Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-medium flex items-center gap-1">
                  Catalog Fallback
                </span>
              )}
            </div>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh Feed
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Recommendations <span className="text-[#D4AF37]">For You</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            AI-curated products tailored for your context, preferences, and style using deep neural representations.
          </p>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status / Error Message */}
        {error && (
          <div className="bg-red-950/60 border border-red-800/80 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-200 text-sm font-semibold">❌ {error}</p>
                <p className="text-red-300/80 text-xs mt-1">
                  Make sure backend is running:{' '}
                  <code className="bg-black px-2 py-0.5 rounded font-mono text-red-200 ml-1">
                    python -m uvicorn backend.app.main:app --port 8000
                  </code>
                </p>
              </div>
            </div>
            <button
              onClick={fetchProducts}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Grid Area */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#D4AF37]" />
                <p className="text-xs sm:text-sm font-semibold text-neutral-300">
                  Showing <span className="text-white font-bold">{filteredProducts.length}</span> curated items
                </p>
              </div>

              {filters.category !== 'all' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 capitalize font-medium">
                  {filters.category}
                </span>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-neutral-900/80 border border-white/5 rounded-2xl overflow-hidden aspect-square animate-pulse flex flex-col justify-end p-4"
                  >
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.product_id} product={product as any} index={index} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-neutral-950 border border-neutral-800/80 rounded-2xl p-8">
                <p className="text-4xl mb-3">🛍️</p>
                <h3 className="text-xl font-bold text-white mb-1">No products match your filters</h3>
                <p className="text-neutral-400 text-sm mb-6">
                  Try adjusting your price range or selecting another category.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      category: 'all',
                      priceMin: 0,
                      priceMax: 50000,
                      minRating: 0,
                      sortBy: 'relevance',
                    })
                  }
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded-xl text-xs transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

