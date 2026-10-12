import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/Toaster';
import { ApiHealthBanner } from '@/components/ApiHealthBanner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'AVERO — AI-Powered Recommendation Engine',
    template: '%s | AVERO',
  },
  description:
    'Discover products curated just for you with AVERO\'s context-aware neural recommendation engine. Luxury fashion meets artificial intelligence.',
  keywords: [
    'AI recommendations',
    'fashion',
    'personalized shopping',
    'neural network',
    'luxury fashion',
    'context-aware',
  ],
  authors: [{ name: 'AVERO Team' }],
  creator: 'AVERO',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://avero.ai',
    siteName: 'AVERO',
    title: 'AVERO — AI-Powered Recommendation Engine',
    description:
      'Discover products curated just for you with AVERO\'s context-aware neural recommendation engine.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AVERO - AI Recommendation Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVERO — AI-Powered Recommendation Engine',
    description: 'Discover products curated just for you.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://avero.ai" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-black text-white antialiased min-h-screen">
        <Navbar />
        <ApiHealthBanner />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
