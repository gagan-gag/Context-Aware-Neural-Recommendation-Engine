import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/HeroSection';
import { Zap, TrendingUp, Bookmark, ArrowRight, Shield, Cpu, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AVERO — AI-Powered Recommendation Engine',
  description:
    'Discover products curated just for you with AVERO\'s context-aware neural recommendation engine.',
};

const FEATURES = [
  {
    icon: Cpu,
    title: 'Neural Engine',
    description: 'Deep learning models trained on millions of user interactions to surface what you\'ll love.',
    color: 'text-[#D4AF37]',
    bg: 'bg-[#D4AF37]/10',
    border: 'border-[#D4AF37]/20',
  },
  {
    icon: Layers,
    title: 'Context-Aware',
    description: 'Real-time signals from your browsing, preferences, and purchase history power hyper-relevant results.',
    color: 'text-[#FF6B35]',
    bg: 'bg-[#FF6B35]/10',
    border: 'border-[#FF6B35]/20',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. All personalization is computed on-device with zero third-party sharing.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

const QUICK_LINKS = [
  {
    href: '/recommendations',
    icon: Zap,
    title: 'For You',
    desc: 'AI-curated picks based on your profile',
    accent: 'from-[#D4AF37]/20 to-transparent',
    iconColor: 'text-[#D4AF37]',
  },
  {
    href: '/trending',
    icon: TrendingUp,
    title: 'Trending Now',
    desc: 'What\'s hot across the platform',
    accent: 'from-[#FF6B35]/20 to-transparent',
    iconColor: 'text-[#FF6B35]',
  },
  {
    href: '/saved',
    icon: Bookmark,
    title: 'Saved Items',
    desc: 'Your curated wishlist',
    accent: 'from-emerald-500/20 to-transparent',
    iconColor: 'text-emerald-400',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Features Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20" aria-label="Features">
        <div className="text-center mb-14">
          <p className="text-eyebrow mb-3">Why AVERO</p>
          <h2 className="text-headline">Intelligence at Every Touch Point</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
            <div
              key={title}
              className={`glass rounded-2xl p-8 border ${border} hover:border-opacity-50 transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={color} strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-lg mb-3">{title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20" aria-label="Quick access">
        <div className="text-center mb-10">
          <p className="text-eyebrow mb-3">Explore</p>
          <h2 className="text-headline">Start Discovering</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {QUICK_LINKS.map(({ href, icon: Icon, title, desc, accent, iconColor }) => (
            <Link
              key={href}
              href={href}
              className={`relative overflow-hidden glass rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <Icon size={28} className={`${iconColor} mb-5 group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm mb-5">{desc}</p>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${iconColor}`}>
                  Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
