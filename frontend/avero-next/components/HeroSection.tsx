'use client';

import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      style={{
        backgroundColor: '#FAF9F6',
        borderBottom: '1px solid #ECECE8',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 28px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            minHeight: 520,
            gap: 40,
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          {/* Left Editorial Copy */}
          <div style={{ maxWidth: 540, paddingRight: 16 }}>
            {/* Tagline */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#767676',
                marginBottom: 16,
              }}
            >
              AI Powered Fashion Discovery
            </p>

            {/* Headline matching mockup */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                lineHeight: 1.06,
                fontWeight: 500,
                color: '#111111',
                margin: '0 0 20px',
                letterSpacing: '-0.02em',
              }}
            >
              Fashion<br />
              that finds<br />
              your style.
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: '#555555',
                margin: '0 0 32px',
                maxWidth: 440,
              }}
            >
              Personalized recommendations using Context-Aware Neural (CAN) matching
              on real H&amp;M fashion data.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleScrollTo('recommended-section')}
                className="btn-primary"
                style={{
                  height: 46,
                  padding: '0 24px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Explore Recommendations</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => handleScrollTo('collection-section')}
                className="btn-secondary"
                style={{
                  height: 46,
                  padding: '0 24px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Browse Collection
              </button>
            </div>
          </div>

          {/* Right Model Editorial Portrait with Quote Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: 460,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 580,
                height: 480,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#EAE6E1',
              }}
            >
              {/* High Fashion Portrait Model */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=85"
                alt="AVERO Editorial Fashion Campaign"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                }}
              />

              {/* Floating Quote Box matching Mockup */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(8px)',
                  padding: '16px 20px',
                  borderRadius: 6,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: 200,
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: '#222222',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Curated looks.<br />
                  Smarter choices.<br />
                  Your style, your way.
                </p>
                <div style={{ marginTop: 8, fontSize: 11, color: '#666', letterSpacing: '0.08em' }}>
                  —<br />
                  <strong style={{ fontFamily: 'var(--font-serif)', color: '#111', letterSpacing: '0.1em' }}>
                    AVERO
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
