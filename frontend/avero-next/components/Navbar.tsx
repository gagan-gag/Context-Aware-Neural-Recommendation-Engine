'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';

const NAV_LINKS = [
  { href: '/', label: 'Discover' },
  { href: '/#categories-section', label: 'Categories' },
  { href: '/#recommended-section', label: 'For You' },
  { href: '/insights', label: 'AI Insights' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { savedItems, setSearchQuery } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      // If not on homepage, navigate to homepage collection section
      if (pathname !== '/') {
        router.push('/#collection-section');
      } else {
        const el = document.getElementById('collection-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: scrolled ? '1px solid #EAEAE6' : '1px solid #F0F0EC',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 200ms ease',
      }}
    >
      <nav
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 28px',
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* AVERO Brand Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#111111',
            textDecoration: 'none',
            flexShrink: 0,
            textTransform: 'uppercase',
          }}
          aria-label="AVERO Homepage"
        >
          AVERO
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            flex: 1,
            justifyContent: 'center',
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map(link => {
            const isDiscover = link.href === '/' && pathname === '/';
            const isActive = isDiscover || (link.href !== '/' && pathname === link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#111111' : '#555555',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  padding: '6px 0',
                  position: 'relative',
                  transition: 'color 150ms ease',
                }}
                className="hover:text-black"
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: '#111111',
                      borderRadius: 1,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Search & Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Search Input Bar (Mockup Style) */}
          <form
            onSubmit={handleSearchSubmit}
            style={{ position: 'relative' }}
            className="hidden sm:block"
          >
            <input
              type="text"
              placeholder="Search for dresses, tops, jeans..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: 250,
                height: 38,
                padding: '0 16px 0 38px',
                fontSize: 12.5,
                backgroundColor: '#F5F5F3',
                border: '1px solid transparent',
                borderRadius: 20,
                color: '#111111',
                outline: 'none',
                transition: 'all 180ms ease',
              }}
              className="focus:bg-white focus:border-neutral-300 focus:w-72"
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
          </form>

          {/* Wishlist Link */}
          <Link
            href="/saved"
            aria-label="Saved Wishlist"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              color: '#111111',
              transition: 'background 150ms ease',
            }}
            className="hover:bg-neutral-100"
          >
            <Heart size={20} strokeWidth={1.75} />
            {savedItems.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: '#111111',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {savedItems.length}
              </span>
            )}
          </Link>

          {/* Bag Icon (with Mockup badge 2) */}
          <Link
            href="/#collection-section"
            aria-label="Shopping Bag"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              color: '#111111',
              transition: 'background 150ms ease',
            }}
            className="hover:bg-neutral-100"
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: '#111111',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              2
            </span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden"
            aria-label="Toggle mobile menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: '#111111',
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid #EAEAE6',
            backgroundColor: '#FFFFFF',
            padding: '16px 24px 24px',
          }}
          className="md:hidden"
        >
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: 16, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for dresses, tops, jeans..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 16px 0 40px',
                fontSize: 13,
                backgroundColor: '#F5F5F3',
                border: 'none',
                borderRadius: 20,
                outline: 'none',
              }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
              }}
            />
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#111111',
                  padding: '4px 0',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
