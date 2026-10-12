'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, TrendingUp, ArrowRight, Cpu, Sparkles, Brain } from 'lucide-react';

const floatingIcons = [
  { icon: Sparkles, delay: 0, x: -120, y: -60, size: 24, opacity: 0.5 },
  { icon: Brain, delay: 1, x: 140, y: -80, size: 28, opacity: 0.4 },
  { icon: Cpu, delay: 2, x: -160, y: 80, size: 20, opacity: 0.35 },
  { icon: Zap, delay: 0.5, x: 180, y: 60, size: 22, opacity: 0.45 },
  { icon: TrendingUp, delay: 1.5, x: 60, y: 120, size: 18, opacity: 0.3 },
];

const STATS = [
  { value: '98%', label: 'Match Accuracy' },
  { value: '<50ms', label: 'Inference Time' },
  { value: '10K+', label: 'Products Indexed' },
  { value: '5★', label: 'User Satisfaction' },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <section
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden hero-gradient pt-24 pb-16"
      aria-label="Hero section"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating Icons */}
      {floatingIcons.map(({ icon: Icon, delay, x, y: iy, size, opacity: op }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: op, scale: 1 }}
          transition={{ delay: delay + 1, duration: 0.8 }}
          className="absolute animate-float pointer-events-none"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(45% + ${iy}px)`,
            animationDelay: `${delay}s`,
          }}
        >
          <div className="glass rounded-xl p-2.5 border border-white/10">
            <Icon size={size} className="text-[#D4AF37]" strokeWidth={1.5} />
          </div>
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        ref={containerRef}
        style={{ y, opacity }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="badge-coral">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Neural Recommendation Engine
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-display mb-6"
        >
          <span className="text-white">AI-Powered</span>
          <br />
          <span className="text-gold-gradient">Personalization</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Discover products curated just for you by AVERO&apos;s context-aware neural network.
          Fashion meets intelligence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/recommendations" className="btn-primary">
            <Zap size={16} />
            Get Recommendations
            <ArrowRight size={16} />
          </Link>
          <Link href="/trending" className="btn-secondary">
            <TrendingUp size={16} />
            Browse Trending
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 mt-20 w-full max-w-3xl mx-auto px-4"
      >
        <div className="glass rounded-2xl border border-white/5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/5">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="flex flex-col items-center py-6 px-4"
            >
              <span className="text-2xl font-bold text-gold-gradient">{value}</span>
              <span className="text-xs text-neutral-500 mt-1">{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gradient fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
