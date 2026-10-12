'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedProductImageProps {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean;
}

// Module-level in-memory cache of already-loaded images in this session
// Prevents ANY re-flashing or skeleton blinking on re-render, hover, or filter
const LOADED_IMAGES_CACHE = new Set<string>();

export function OptimizedProductImage({
  src,
  alt,
  fallback = 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  priority = false,
}: OptimizedProductImageProps) {
  const isAlreadyCached = LOADED_IMAGES_CACHE.has(src);
  const [isLoading, setIsLoading] = useState(!isAlreadyCached);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const prevSrcRef = useRef(src);

  // Update image source only if the URL actually changes
  useEffect(() => {
    if (prevSrcRef.current !== src) {
      prevSrcRef.current = src;
      setCurrentSrc(src);
      setHasError(false);
      if (!LOADED_IMAGES_CACHE.has(src)) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }
  }, [src]);

  const handleLoadingComplete = () => {
    LOADED_IMAGES_CACHE.add(currentSrc);
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-900 select-none">
      {/* Skeleton placeholder while loading - stable pulse, never flashing */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-neutral-800 transition-opacity duration-300 pointer-events-none"
          style={{ willChange: 'opacity' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-neutral-800 via-neutral-700/50 to-neutral-800 animate-pulse" />
        </div>
      )}

      {/* Main product image - zero blinking, smooth fade-in */}
      <Image
        src={currentSrc}
        alt={alt}
        width={400}
        height={400}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={85}
        unoptimized
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ease-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoadingComplete}
        onError={handleError}
      />

      {/* Fallback indicator if both primary and fallback fail */}
      {hasError && currentSrc === fallback && (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center p-4">
          <div className="text-center text-neutral-500">
            <span className="text-2xl block mb-1">📷</span>
            <p className="text-[10px] uppercase tracking-wider font-semibold">H&M Collection</p>
          </div>
        </div>
      )}
    </div>
  );
}
