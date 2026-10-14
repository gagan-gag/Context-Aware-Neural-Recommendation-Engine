'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#111111', color: '#FFFFFF', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '64px 28px 40px' }}>
        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            marginBottom: 56,
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: 360 }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#FFFFFF',
                display: 'block',
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              AVERO
            </span>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: '#A0A0A0',
                margin: 0,
              }}
            >
              A personalized fashion discovery platform powered by Context-Aware Neural
              (CAN) recommendations on H&amp;M dataset.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 0 18px',
              }}
            >
              Shop
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <Link href="/recommendations?category=dresses" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/recommendations?category=shirts" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/#categories-section" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/trending" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 0 18px',
              }}
            >
              About
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <Link href="/#how-can-works-section" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/#how-can-works-section" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  How CAN Works
                </Link>
              </li>
              <li>
                <Link href="/insights" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Dataset &amp; Tech
                </Link>
              </li>
              <li>
                <a href="mailto:contact@avero.fashion" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 0 18px',
              }}
            >
              Help
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <Link href="/help?tab=shipping" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/help?tab=returns" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/help?tab=size-guide" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/help?tab=faq" style={{ fontSize: 13, color: '#A0A0A0', transition: 'color 150ms' }} className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching Mockup */}
        <div
          style={{
            borderTop: '1px solid #222222',
            paddingTop: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: '#777777' }}>
            &copy; {currentYear} AVERO. Academic project using H&amp;M dataset.
          </p>

          {/* Social / Repo Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              style={{ color: '#888888', transition: 'color 150ms' }}
              className="hover:text-white"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              style={{ color: '#888888', transition: 'color 150ms' }}
              className="hover:text-white"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
