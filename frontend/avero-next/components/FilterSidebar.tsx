'use client';

import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { HM_PRODUCTS } from '@/lib/mockData';
import type { RecommendationFilters } from '@/lib/recommendationEngine';

const CATEGORIES = Array.from(new Set(HM_PRODUCTS.map((p) => p.category)));

interface FilterSidebarProps {
  filters?: RecommendationFilters;
  setFilters?: React.Dispatch<React.SetStateAction<RecommendationFilters>>;
}

export function FilterSidebar({
  filters: propFilters,
  setFilters: propSetFilters,
}: FilterSidebarProps) {
  const [internalFilters, setInternalFilters] = useState<RecommendationFilters>({
    category: 'all',
    priceMin: 0,
    priceMax: 50000,
    minRating: 0,
    sortBy: 'relevance',
  });

  const filters = propFilters ?? internalFilters;
  const setFilters = propSetFilters ?? setInternalFilters;

  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    category: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleReset = () => {
    setFilters({
      category: 'all',
      priceMin: 0,
      priceMax: 50000,
      minRating: 0,
      sortBy: 'relevance',
    });
  };

  return (
    <div className="bg-neutral-950 border border-white/10 rounded-2xl p-6 sticky top-24 h-fit shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#D4AF37]" />
          <h2 className="text-lg font-bold text-white tracking-tight">H&amp;M Filters</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* ─── 1. Sort By ─────────────────────────────────────────────────── */}
      <div className="mb-6 border-b border-neutral-800/80 pb-5">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between mb-3 text-white hover:text-[#D4AF37] transition font-semibold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Sort By</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.sort ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.sort && (
          <div className="space-y-2 pt-1">
            {[
              { value: 'relevance', label: 'AI Relevance (Match %)' },
              { value: 'price-low', label: 'Price: Low → High' },
              { value: 'price-high', label: 'Price: High → Low' },
              { value: 'rating', label: 'Highest Rated' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white transition text-xs py-1"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={(filters.sortBy || 'relevance') === option.value}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ─── 2. Categories ──────────────────────────────────────────────── */}
      <div className="mb-6 border-b border-neutral-800/80 pb-5">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between mb-3 text-white hover:text-[#D4AF37] transition font-semibold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Category</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.category ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.category && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white transition text-xs py-1">
              <input
                type="radio"
                name="category"
                value="all"
                checked={(filters.category || 'all') === 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
              />
              <span className="font-medium">All Collections</span>
            </label>
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white transition text-xs py-1 capitalize"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={filters.category === cat}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ─── 3. Price Range (in INR) ─────────────────────────────────────── */}
      <div className="mb-6 border-b border-neutral-800/80 pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-3 text-white hover:text-[#D4AF37] transition font-semibold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Price Range</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs text-neutral-300">
              <span className="text-neutral-500">Max Price:</span>
              <span className="font-bold text-white bg-neutral-900 px-2.5 py-1 rounded-md border border-white/5">
                ₹{(filters.priceMax ?? 50000).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={filters.priceMax ?? 50000}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. Rating ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between mb-3 text-white hover:text-[#D4AF37] transition font-semibold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Rating</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.rating ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.rating && (
          <div className="space-y-2 pt-1">
            {[
              { value: 0, label: 'All ratings' },
              { value: 4.0, label: '⭐⭐⭐⭐ & up (4.0+)' },
              { value: 4.5, label: '⭐⭐⭐⭐⭐ (4.5+)' },
              { value: 4.8, label: 'Top Rated (4.8+)' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white transition text-xs py-1"
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={(filters.minRating ?? 0) === option.value}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ─── Clear All Filters Button ───────────────────────────────────── */}
      <button
        onClick={handleReset}
        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-white/5 transition active:scale-95 cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );
}
