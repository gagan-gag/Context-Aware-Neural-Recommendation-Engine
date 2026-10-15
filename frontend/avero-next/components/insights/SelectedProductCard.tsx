'use client';

import { MOCK_PRODUCTS } from '@/lib/mockProducts';

interface SelectedProductCardProps {
  productId?: string | null;
  onSelectNeighbor?: (id: string) => void;
}

export function SelectedProductCard({
  productId = '070844001',
  onSelectNeighbor,
}: SelectedProductCardProps) {
  const product =
    MOCK_PRODUCTS.find(
      (p) => p.product_id === productId || p.article_id === productId,
    ) ||
    MOCK_PRODUCTS.find((p) => p.product_id === '0865857002') ||
    MOCK_PRODUCTS[1];

  const neighborIds = ['0751471001', '0583845001', '0865857002', '0730713001', '0110065001'];
  const neighbors = neighborIds.map((id) => MOCK_PRODUCTS.find((p) => p.product_id === id)).filter(Boolean);

  const isSatinMidiDress = product.product_name === 'Satin Midi Dress' || product.product_id === '0865857002' || product.product_id === '070844001';
  const displayArticleId = isSatinMidiDress ? '070844001' : (product.article_id || product.product_id);
  const displayPrice = isSatinMidiDress ? '₹2,999' : (product.price_inr_formatted || '₹2,999');
  const displayVector = isSatinMidiDress ? '[-10.1, 6.8, 0.5]' : '[-12.3, 8.4, 1.2]';
  const displayCategory = isSatinMidiDress ? 'Evening Wear' : (product.subcategory || product.category || 'Casual');

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E5E0', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', letterSpacing: '-0.01em', margin: 0 }}>
        Selected Product
      </h3>

      {/* Product image — full width, stacked above metadata */}
      <div style={{ width: '100%', height: '160px', background: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', boxSizing: 'border-box', flexShrink: 0 }}>
        <img
          src={product.image_url || `/catalog/${product.product_id}.jpg`}
          alt={product.product_name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.product_name}
        </span>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500, background: '#FDF2F8', color: '#E11D48', border: '1px solid #FBCFE8', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {product.category || 'Dresses'}
        </span>
      </div>

      {/* Metadata 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        {([
          { label: 'Article ID', value: displayArticleId, mono: true },
          { label: 'Category', value: displayCategory, mono: false },
          { label: 'Price', value: displayPrice, mono: true },
          { label: 'Vector', value: displayVector, mono: true, small: true },
        ] as { label: string; value: string; mono: boolean; small?: boolean }[]).map(({ label, value, mono, small }) => (
          <div key={label}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '2px' }}>{label}</span>
            <span style={{ fontSize: small ? '10px' : '11px', fontFamily: mono ? 'monospace' : undefined, fontWeight: 500, color: small ? '#475569' : '#1E293B', wordBreak: 'break-all' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Nearest Neighbors */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1E293B' }}>Nearest Neighbors</span>
          <button style={{ fontSize: '10.5px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            View all
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {neighbors.map((n) => {
            if (!n) return null;
            const isCurrent = n.product_id === product.product_id;
            return (
              <button
                key={n.product_id}
                onClick={() => onSelectNeighbor && onSelectNeighbor(n.product_id)}
                title={n.product_name}
                style={{ width: '44px', minWidth: '44px', height: '56px', borderRadius: '8px', background: '#FAF9F6', border: isCurrent ? '2px solid #2563EB' : '1px solid #E2E8F0', overflow: 'hidden', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isCurrent ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none', transform: isCurrent ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.15s ease' }}
              >
                <img
                  src={n.image_url || `/catalog/${n.product_id}.jpg`}
                  alt={n.product_name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
