'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Menu, X, Zap, TrendingUp, Home, Bookmark, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/recommendations', label: 'For You', icon: Zap },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { savedItems, recentSearches, addRecentSearch, setSearchQuery } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      addRecentSearch(searchValue.trim());
      setSearchQuery(searchValue.trim());
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/5 shadow-xl' : 'bg-transparent'
        }`}
        role="banner"
      >
        <nav
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="AVERO Home"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FF6B35] flex items-center justify-center"
            >
              <Zap size={14} className="text-black" strokeWidth={2.5} />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gold-gradient">AVERO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/8'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full bg-white/8 -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="btn-ghost rounded-full w-9 h-9 p-0 flex items-center justify-center"
              aria-label="Open search"
            >
              <Search size={18} />
            </motion.button>

            {/* Saved */}
            <Link href="/saved" aria-label={`Saved items (${savedItems.length})`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative btn-ghost rounded-full w-9 h-9 p-0 flex items-center justify-center"
              >
                <Heart size={18} />
                <AnimatePresence>
                  {savedItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-bold flex items-center justify-center"
                    >
                      {savedItems.length > 9 ? '9+' : savedItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Demo Badge */}
            <div className="hidden sm:block badge-coral">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Demo
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost rounded-full w-9 h-9 p-0 flex items-center justify-center"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-16 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col gap-2 p-6">
              {navLinks.map(({ href, label, icon: Icon }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-lg font-medium transition-all ${
                      pathname === href
                        ? 'text-white bg-white/8 border border-white/10'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                    {pathname === href && <ChevronDown className="ml-auto rotate-[-90deg]" size={16} />}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-6 mt-auto pb-10">
              <div className="divider mb-6" />
              <div className="badge-coral inline-flex mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                DEMO MODE — AI-Powered
              </div>
              <p className="text-neutral-500 text-sm">Context-aware neural recommendations</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products, categories..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-2xl pl-14 pr-14 py-5 text-lg text-white placeholder-neutral-500 outline-none focus:border-[#D4AF37]/50 transition-colors"
                  aria-label="Search products"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </form>

              {recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4 glass rounded-2xl p-4"
                >
                  <p className="text-eyebrow mb-3">Recent</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSearchValue(q);
                          searchRef.current?.focus();
                        }}
                        className="filter-pill"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
