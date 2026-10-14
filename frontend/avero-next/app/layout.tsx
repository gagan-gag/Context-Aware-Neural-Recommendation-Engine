import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/Toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'AVERO — Fashion That Finds Your Style | AI-Powered Discovery',
    template: '%s | AVERO',
  },
  description:
    'AVERO is an AI-powered fashion discovery platform using Context-Aware Neural (CAN) matching on the H&M dataset to deliver personalized recommendations.',
  keywords: [
    'AVERO',
    'AI fashion discovery',
    'context-aware neural recommendation',
    'two-tower model',
    'personalized fashion',
    'H&M dataset',
  ],
  authors: [{ name: 'AVERO' }],
  creator: 'AVERO',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'AVERO',
    title: 'AVERO — Fashion That Finds Your Style',
    description: 'Personalized recommendations using Context-Aware Neural matching on real fashion data.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#111111" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-white text-[#171717] antialiased min-h-screen flex flex-col font-sans selection:bg-[#111111] selection:text-white">
        <Navbar />
        <main id="main-content" role="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
