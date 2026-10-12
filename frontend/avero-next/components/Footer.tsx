'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Code2, Rss, Camera, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'For You', href: '/recommendations' },
    { label: 'Trending', href: '/trending' },
    { label: 'Saved Items', href: '/saved' },
  ],
  company: [
    { label: 'About AVERO', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'API Docs', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24 pb-8" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FF6B35] flex items-center justify-center">
                <Zap size={14} className="text-black" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-gold-gradient">AVERO</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mb-6">
              Context-aware neural recommendation engine. Discover products curated by AI, personalized for you.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Code2, label: 'GitHub', href: '#' },
                { icon: Rss, label: 'Blog', href: '#' },
                { icon: Camera, label: 'Instagram', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h3 className="text-eyebrow mb-4 capitalize">{key}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-neutral-400 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                    >
                      {label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-xs">
            © 2026 AVERO. All rights reserved. Built with Next.js 14 + AI.
          </p>
          <div className="badge-gold">
            <Zap size={10} />
            Neural Recommendation Engine v0.2
          </div>
        </div>
      </div>
    </footer>
  );
}
