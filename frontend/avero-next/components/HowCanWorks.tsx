'use client';

import Link from 'next/link';
import { Sparkles, Network, Sliders, ArrowRight } from 'lucide-react';

export function HowCanWorks() {
  return (
    <section
      id="how-can-works-section"
      style={{
        backgroundColor: '#FAF9F6',
        borderTop: '1px solid #ECECE8',
        borderBottom: '1px solid #ECECE8',
        padding: '56px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* Left Explanation Content */}
          <div style={{ zIndex: 2 }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#111111',
                margin: '0 0 6px',
              }}
            >
              How CAN Works
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#666666',
                margin: '0 0 36px',
              }}
            >
              Context-Aware Neural recommendations that understand your style.
            </p>

            {/* 3 Stages Flow matching Mockup */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 36,
              }}
            >
              {/* Stage 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  maxWidth: 220,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#111111',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#111' }}>
                    1. Understand
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
                    Analyze your interactions and product context.
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={16} color="#999" className="hidden sm:block" />

              {/* Stage 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  maxWidth: 220,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#111111',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <Network size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#111' }}>
                    2. Match
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
                    Two-tower neural model finds similar fashion items.
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={16} color="#999" className="hidden sm:block" />

              {/* Stage 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  maxWidth: 220,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#111111',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#111' }}>
                    3. Personalize
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
                    Rank and recommend the most relevant styles for you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Link to ML Analytics */}
            <Link
              href="/insights"
              className="btn-primary"
              style={{
                height: 44,
                padding: '0 22px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 4,
              }}
            >
              <span>Learn More About CAN</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right Clothing Rack Visual Backdrop matching Mockup */}
          <div
            style={{
              position: 'relative',
              height: 280,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#ECEAE5',
            }}
            className="hidden md:block"
          >
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80"
              alt="Fashion Wardrobe and Studio Rack"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
