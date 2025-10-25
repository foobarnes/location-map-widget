/**
 * ImageGallery component - Display location images
 * Supports single or multiple images with horizontal scroll
 */

import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  locationName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, locationName }) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  // Filter out failed images
  const validImages = images.filter((_, index) => !failedImages.has(index));

  if (validImages.length === 0) {
    return null; // Don't show anything if all images failed to load
  }

  return (
    <div className="lmw-mb-3">
      {/* Image container with horizontal scroll */}
      <div
        className="lmw-flex lmw-gap-2 lmw-overflow-x-auto lmw-pb-2"
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {images.map((imageUrl, index) => {
          // Skip failed images
          if (failedImages.has(index)) {
            return null;
          }

          const isLoaded = loadedImages.has(index);

          return (
            <div
              key={index}
              className="lmw-relative lmw-flex-shrink-0"
              style={{ width: '120px', height: '90px' }}
            >
              {/* Loading placeholder */}
              {!isLoaded && (
                <div className="lmw-absolute lmw-inset-0 lmw-bg-gray-200 dark:lmw-bg-gray-700 lmw-rounded lmw-animate-pulse lmw-flex lmw-items-center lmw-justify-center">
                  <svg
                    className="lmw-w-6 lmw-h-6 lmw-text-gray-400 dark:lmw-text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Actual image */}
              <img
                src={imageUrl}
                alt={`${locationName} - Image ${index + 1}`}
                className="lmw-w-full lmw-h-full lmw-object-cover lmw-rounded lmw-border lmw-border-gray-200 dark:lmw-border-gray-600 lmw-cursor-pointer hover:lmw-opacity-90 lmw-transition-opacity"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                loading="lazy"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                }}
                onClick={() => window.open(imageUrl, '_blank')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.open(imageUrl, '_blank');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View full size image ${index + 1} of ${locationName}`}
              />
            </div>
          );
        })}
      </div>

      {/* Image counter for multiple images */}
      {validImages.length > 1 && (
        <p className="lmw-text-xs lmw-text-gray-500 dark:lmw-text-gray-400 lmw-mt-1">
          {validImages.length} {validImages.length === 1 ? 'image' : 'images'}
        </p>
      )}
    </div>
  );
};
