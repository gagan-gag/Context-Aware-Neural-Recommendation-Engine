'use client';

import { X } from 'lucide-react';

export interface FilterState {
  category: string;
  color: string;
  priceMax: number;
  search: string;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onClear: () => void;
  onCloseMobile?: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'Dresses', label: 'Dresses', count: 24 },
  { id: 'Tops', label: 'Tops', count: 48 },
  { id: 'Shirts & Blouses', label: 'Shirts & Blouses', count: 36 },
  { id: 'Trousers', label: 'Trousers', count: 42 },
  { id: 'Outerwear', label: 'Outerwear', count: 28 },
  { id: 'Knitwear', label: 'Knitwear', count: 31 },
  { id: 'Accessories', label: 'Accessories', count: 18 },
];

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Grey', hex: '#9E9E9E' },
  { name: 'Beige', hex: '#D7C4B7' },
  { name: 'Red', hex: '#C53030' },
  { name: 'Pink', hex: '#E5989B' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#166534' },
];

export function FilterSidebar({
  filters,
  onChange,
  onClear,
  onCloseMobile,
}: FilterSidebarProps) {
  const handleCategoryToggle = (catId: string) => {
    const isAlreadySelected = filters.category.toLowerCase() === catId.toLowerCase();
    onChange({
      ...filters,
      category: isAlreadySelected ? 'all' : catId,
    });
  };

  const handleColorToggle = (colorName: string) => {
    const isAlreadySelected = filters.color.toLowerCase() === colorName.toLowerCase();
    onChange({
      ...filters,
      color: isAlreadySelected ? 'all' : colorName,
    });
  };

  const handlePriceChange = (val: number) => {
    onChange({
      ...filters,
      priceMax: val,
    });
  };

  return (
    <aside style={{ width: '100%', maxWidth: 260 }}>
      {/* Sidebar Header matching Mockup */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 16,
          borderBottom: '1px solid #ECECE8',
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111111' }}>
          Filters
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 12,
              fontWeight: 500,
              color: '#666666',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
            className="hover:text-black"
          >
            Clear All
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              className="md:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Filter Section */}
      <div style={{ marginBottom: 32 }}>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#111111',
            margin: '0 0 14px',
            letterSpacing: '0.02em',
          }}
        >
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CATEGORY_OPTIONS.map(cat => {
            const isChecked = filters.category.toLowerCase() === cat.id.toLowerCase();
            return (
              <label
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: isChecked ? '#111111' : '#555555',
                  cursor: 'pointer',
                  fontWeight: isChecked ? 600 : 400,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat.id)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#111111',
                    cursor: 'pointer',
                    borderRadius: 3,
                  }}
                />
                <span>
                  {cat.label} <span style={{ color: '#888888', fontSize: 12 }}>({cat.count})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Color Swatches Filter Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Color
          </h4>
          {filters.color !== 'all' && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>
              {filters.color}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_SWATCHES.map(swatch => {
            const isSelected = filters.color.toLowerCase() === swatch.name.toLowerCase();
            return (
              <button
                key={swatch.name}
                type="button"
                onClick={() => handleColorToggle(swatch.name)}
                title={swatch.name}
                aria-label={`Filter by ${swatch.name}`}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: swatch.hex,
                  border: swatch.border ? '1px solid #CCC' : 'none',
                  outline: isSelected ? '2px solid #111111' : 'none',
                  outlineOffset: 2,
                  cursor: 'pointer',
                  transition: 'transform 120ms ease',
                  padding: 0,
                }}
                className="hover:scale-115 active:scale-95"
              />
            );
          })}
        </div>
      </div>

      {/* 3. Price Range Filter Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Price Range
          </h4>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>
            Up to ₹{filters.priceMax.toLocaleString('en-IN')}
          </span>
        </div>

        <input
          type="range"
          min={1000}
          max={20000}
          step={500}
          value={filters.priceMax}
          onChange={e => handlePriceChange(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 8 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#888888' }}>
          <span>₹1,000</span>
          <span>₹20,000</span>
        </div>
      </div>
    </aside>
  );
}
