'use client';

import { useState } from 'react';

interface OptimizedProductImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  priority?: boolean;
}

export function OptimizedProductImage({
  src,
  alt,
  category = 'Collection',
}: OptimizedProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showFallback = !src || hasError;

  return (
    <>
      {/* Shimmer while loading */}
      {!isLoaded && !showFallback && (
        <div
          className="skeleton-light"
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          aria-hidden="true"
        />
      )}

      {/* Actual product image — plain <img> with object-fit: cover */}
      {!showFallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="product-image"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 400ms ease-out',
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Fallback placeholder when no image URL or load failed */}
      {showFallback && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#F3F3EF',
            border: '1px solid #EBEBE6',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid #D5D5CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <svg
              style={{ width: 20, height: 20, color: '#888880' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888880',
            }}
          >
            AVERO STUDIO
          </span>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#444440',
              marginTop: 4,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: 120,
            }}
          >
            {category}
          </p>
        </div>
      )}
    </>
  );
}
