'use client';

import { useState, useMemo } from 'react';
import { Info, RotateCcw, Zap } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

interface LiveReRankingControlsProps {
  onWeightsChange?: (weights: { seasonality: number; price: number; formality: number; style: number }) => void;
}

// Product pool for re-ranking demo
const RERANK_POOL = [
  { id: '0865857002', name: 'Satin Midi Dress',    cat: 'Evening', price: 2999, formality: 90, seasonal: 85, style: 88 },
  { id: '0751471001', name: 'Chiffon Maxi Dress',  cat: 'Evening', price: 2499, formality: 85, seasonal: 80, style: 82 },
  { id: '0730713001', name: 'Tailored Blazer',     cat: 'Formal',  price: 4999, formality: 95, seasonal: 60, style: 75 },
  { id: '0583845001', name: 'Rib-Knit Jumper',     cat: 'Casual',  price: 2299, formality: 40, seasonal: 70, style: 78 },
  { id: '0924243001', name: 'Wide-Leg Trousers',   cat: 'Casual',  price: 2799, formality: 55, seasonal: 65, style: 70 },
  { id: '0110065001', name: 'Oxford Shirt',        cat: 'Smart',   price: 1999, formality: 80, seasonal: 55, style: 72 },
  { id: '0852521001', name: 'Varsity Bomber',      cat: 'Casual',  price: 3499, formality: 30, seasonal: 75, style: 85 },
  { id: '0834478002', name: 'Linen Co-ord Set',    cat: 'Smart',   price: 3299, formality: 65, seasonal: 90, style: 80 },
];

export function LiveReRankingControls({ onWeightsChange }: LiveReRankingControlsProps) {
  const defaultWeights = { seasonality: 78, price: 65, formality: 82, style: 60 };
  const [weights, setWeights] = useState(defaultWeights);
  const [isApplying, setIsApplying] = useState(false);

  const updateWeight = (key: keyof typeof weights, val: number) => {
    const next = { ...weights, [key]: val };
    setWeights(next);
    setIsApplying(true);
    setTimeout(() => setIsApplying(false), 600);
    onWeightsChange?.(next);
  };

  const handleReset = () => {
    setWeights(defaultWeights);
    setIsApplying(true);
    setTimeout(() => setIsApplying(false), 600);
    onWeightsChange?.(defaultWeights);
  };

  // Compute re-ranked products based on weights
  const reranked = useMemo(() => {
    return RERANK_POOL
      .map(p => {
        const priceScore = 100 - Math.min(100, ((p.price - 1500) / 4000) * 100);
        const score =
          (weights.seasonality / 100) * p.seasonal +
          (weights.price / 100) * priceScore +
          (weights.formality / 100) * p.formality +
          (weights.style / 100) * p.style;
        return { ...p, score: Math.round(score * 10) / 10 };
      })
      .sort((a, b) => b.score - a.score);
  }, [weights]);

  const sliders = [
    { key: 'seasonality' as const, label: 'Seasonality', sub: 'Summer Evening' },
    { key: 'price' as const,       label: 'Price',        sub: 'Premium Range' },
    { key: 'formality' as const,   label: 'Occasion',     sub: 'Formality' },
    { key: 'style' as const,       label: 'Style',        sub: 'Similarity' },
  ];

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E5E0', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', letterSpacing: '-0.01em', margin: 0 }}>
            Live Re-Ranking Controls
          </h3>
          <span style={{ color: '#94A3B8', cursor: 'help', lineHeight: 0 }} title="Modulates contextual weights in the recommendation re-ranking layer">
            <Info size={14} />
          </span>
        </div>
        <button
          onClick={handleReset}
          style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #D0D0CA', color: '#444', background: '#FAFAF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 150ms ease' }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sliders.map(({ key, label, sub }) => (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E293B' }}>
                {label}: <span style={{ color: '#64748B', fontWeight: 400 }}>{sub}</span>
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1D4ED8', minWidth: '36px', textAlign: 'right' }}>
                {weights[key]}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[key]}
              onChange={(e) => updateWeight(key, Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '4px',
                appearance: 'none',
                cursor: 'pointer',
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${weights[key]}%, #E2E8F0 ${weights[key]}%, #E2E8F0 100%)`,
                outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 -4px' }} />

      {/* Live Output — Re-ranked Results */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Zap size={13} style={{ color: '#F59E0B' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>Live Re-Ranked Output</span>
          {isApplying && (
            <span style={{ fontSize: '10px', color: '#3B82F6', background: '#EFF6FF', padding: '1px 7px', borderRadius: '9999px', fontWeight: 600, marginLeft: 'auto' }}>
              Applying…
            </span>
          )}
          {!isApplying && (
            <span style={{ fontSize: '10px', color: '#22C55E', background: '#F0FDF4', padding: '1px 7px', borderRadius: '9999px', fontWeight: 600, marginLeft: 'auto' }}>
              ✓ Updated
            </span>
          )}
        </div>

        {/* Top 5 re-ranked products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {reranked.slice(0, 5).map((p, i) => {
            const product = MOCK_PRODUCTS.find(m => m.product_id === p.id);
            const imgSrc = product?.image_url || `/catalog/${p.id}.jpg`;
            const rankColors = ['#F59E0B', '#94A3B8', '#CD7F32', '#64748B', '#94A3B8'];
            const barW = Math.round((p.score / reranked[0].score) * 100);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '10px', background: i === 0 ? '#FFFBEB' : '#FAFAF8', border: `1px solid ${i === 0 ? '#FDE68A' : '#ECECE8'}`, transition: 'all 300ms ease' }}>
                {/* Rank badge */}
                <span style={{ fontSize: '11px', fontWeight: 700, color: rankColors[i], minWidth: '16px', textAlign: 'center' }}>
                  #{i + 1}
                </span>
                {/* Thumbnail */}
                <div style={{ width: '32px', height: '40px', background: '#FFF', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={imgSrc} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                {/* Name + score bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                    {p.name}
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: i === 0 ? '#F59E0B' : '#3B82F6', borderRadius: '2px', transition: 'width 400ms ease' }} />
                  </div>
                </div>
                {/* Score */}
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: i === 0 ? '#D97706' : '#475569', flexShrink: 0 }}>
                  {p.score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
