import { useState, useEffect, useCallback, useRef } from 'react';

interface FullscreenButtonProps {
  mapContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function FullscreenButton({ mapContainerRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const fallbackContainerRef = useRef<HTMLElement | null>(null);

  // Check if we're in an iframe
  const isInIframe = window.self !== window.top;

  // Check if fullscreen is available
  const isFullscreenAvailable = !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );

  // Get the map container element
  const getMapContainer = useCallback((): HTMLElement | null => {
    if (mapContainerRef?.current) {
      return mapContainerRef.current;
    }
    // Fallback to finding the map container by class
    return document.querySelector('.map-container');
  }, [mapContainerRef]);

  // Request fullscreen with vendor prefixes
  const requestFullscreen = useCallback((element: HTMLElement) => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    return Promise.reject(new Error('Fullscreen not supported'));
  }, []);

  // Exit fullscreen with vendor prefixes
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    }
    return Promise.reject(new Error('Exit fullscreen not supported'));
  }, []);

  // Enter fallback quasi-fullscreen mode
  const enterFallbackMode = useCallback(() => {
    const mapContainer = getMapContainer();
    if (!mapContainer) return;

    // Store original styles
    const originalPosition = mapContainer.style.position;
    const originalTop = mapContainer.style.top;
    const originalLeft = mapContainer.style.left;
    const originalRight = mapContainer.style.right;
    const originalBottom = mapContainer.style.bottom;
    const originalWidth = mapContainer.style.width;
    const originalHeight = mapContainer.style.height;
    const originalZIndex = mapContainer.style.zIndex;
    const originalTransition = mapContainer.style.transition;

    // Apply fallback fullscreen styles
    mapContainer.style.transition = 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)';
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = '0';
    mapContainer.style.left = '0';
    mapContainer.style.right = '0';
    mapContainer.style.bottom = '0';
    mapContainer.style.width = '100vw';
    mapContainer.style.height = '100vh';
    mapContainer.style.zIndex = '9999';

    // Store original styles for restoration
    fallbackContainerRef.current = mapContainer;
    (mapContainer as any)._originalStyles = {
      position: originalPosition,
      top: originalTop,
      left: originalLeft,
      right: originalRight,
      bottom: originalBottom,
      width: originalWidth,
      height: originalHeight,
      zIndex: originalZIndex,
      transition: originalTransition,
    };

    setIsFallbackMode(true);
    setIsFullscreen(true);

    // Invalidate map size after transition
    setTimeout(() => {
      const leafletContainer = mapContainer.querySelector('.leaflet-container');
      if (leafletContainer && (leafletContainer as any)._leaflet_id) {
        const map = (window as any).L?.map?._getMap?.(leafletContainer);
        map?.invalidateSize();
      }
    }, 250);
  }, [getMapContainer]);

  // Exit fallback quasi-fullscreen mode
  const exitFallbackMode = useCallback(() => {
    const mapContainer = fallbackContainerRef.current;
    if (!mapContainer) return;

    const originalStyles = (mapContainer as any)._originalStyles || {};

    // Restore original styles
    mapContainer.style.transition = 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)';
    mapContainer.style.position = originalStyles.position || '';
    mapContainer.style.top = originalStyles.top || '';
    mapContainer.style.left = originalStyles.left || '';
    mapContainer.style.right = originalStyles.right || '';
    mapContainer.style.bottom = originalStyles.bottom || '';
    mapContainer.style.width = originalStyles.width || '';
    mapContainer.style.height = originalStyles.height || '';
    mapContainer.style.zIndex = originalStyles.zIndex || '';

    // Cleanup
    setTimeout(() => {
      mapContainer.style.transition = originalStyles.transition || '';
      delete (mapContainer as any)._originalStyles;
    }, 200);

    setIsFallbackMode(false);
    setIsFullscreen(false);
    fallbackContainerRef.current = null;

    // Invalidate map size after transition
    setTimeout(() => {
      const leafletContainer = mapContainer.querySelector('.leaflet-container');
      if (leafletContainer && (leafletContainer as any)._leaflet_id) {
        const map = (window as any).L?.map?._getMap?.(leafletContainer);
        map?.invalidateSize();
      }
    }, 250);
  }, []);

  // Handle fullscreen button click
  const handleFullscreenClick = useCallback(async () => {
    const mapContainer = getMapContainer();
    if (!mapContainer) {
      console.warn('Map container not found');
      return;
    }

    // If already in fullscreen, exit
    if (isFullscreen) {
      if (isFallbackMode) {
        exitFallbackMode();
      } else {
        try {
          await exitFullscreen();
        } catch (error) {
          console.error('Error exiting fullscreen:', error);
        }
      }
      return;
    }

    // Try to enter fullscreen
    if (!isFullscreenAvailable) {
      // No fullscreen API support, use fallback
      enterFallbackMode();
      return;
    }

    try {
      await requestFullscreen(mapContainer);
      // State will be updated by fullscreenchange event
    } catch (error) {
      console.warn('Fullscreen request failed, using fallback mode:', error);

      // Show warning if in iframe
      if (isInIframe) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }

      // Use fallback mode
      enterFallbackMode();
    }
  }, [
    getMapContainer,
    isFullscreen,
    isFallbackMode,
    isFullscreenAvailable,
    isInIframe,
    requestFullscreen,
    exitFullscreen,
    enterFallbackMode,
    exitFallbackMode,
  ]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      // Invalidate map size after fullscreen change
      if (isCurrentlyFullscreen) {
        setTimeout(() => {
          const mapContainer = getMapContainer();
          const leafletContainer = mapContainer?.querySelector('.leaflet-container');
          if (leafletContainer && (leafletContainer as any)._leaflet_id) {
            const map = (window as any).L?.map?._getMap?.(leafletContainer);
            map?.invalidateSize();
          }
        }, 250);
      }
    };

    // Add listeners for all vendor prefixes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [getMapContainer]);

  // Handle ESC key in fallback mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFallbackMode) {
        exitFallbackMode();
      }
    };

    if (isFallbackMode) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFallbackMode, exitFallbackMode]);

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control lmw-mb-4 lmw-ml-2">
        <button
          onClick={handleFullscreenClick}
          className={`
            lmw-flex lmw-items-center lmw-justify-center lmw-w-12 lmw-h-12
            lmw-bg-primary lmw-text-white lmw-rounded-full lmw-shadow-lg
            hover:lmw-bg-blue-600 hover:lmw-shadow-xl
            lmw-transition-all lmw-duration-200
            active:lmw-scale-95
            lmw-border-2 lmw-border-white dark:lmw-border-gray-700
            lmw-cursor-pointer
            focus-visible:lmw-outline-none focus-visible:lmw-ring-2
            focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2
          `}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            // Exit fullscreen - Heroicons arrows-pointing-in
            <svg
              className="lmw-w-6 lmw-h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            // Expand - Heroicons arrows-pointing-out
            <svg
              className="lmw-w-6 lmw-h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </button>

        {/* Warning tooltip for iframe restrictions */}
        {showWarning && (
          <div className="lmw-absolute lmw-bottom-full lmw-left-0 lmw-mb-2 lmw-px-3 lmw-py-2 lmw-bg-gray-900 lmw-text-white lmw-text-xs lmw-rounded lmw-shadow-lg lmw-whitespace-nowrap lmw-z-50">
            Fullscreen may be restricted in iframe
          </div>
        )}
      </div>
    </div>
  );
}
