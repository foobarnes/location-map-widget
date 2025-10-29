/**
 * LocationMarker component - Individual marker with popup
 */

import React, { useRef, useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../../types';
import { useWidgetStore } from '../../stores/widgetStore';
import { formatDistance } from '../../utils/distance';
import { ImageGallery, CustomFields } from '../shared';

interface LocationMarkerProps {
  location: Location;
}

// Custom marker icons by category
const getMarkerIcon = (category: string): L.Icon => {
  const { categories } = useWidgetStore.getState();
  const categoryMeta = categories.find(c => c.name.toLowerCase() === category.toLowerCase());

  const color = categoryMeta?.style.color || '#6B7280'; // Gray default

  // Create custom colored marker SVG
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#ffffff" stroke-width="2"
        d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.4 12.5 28.5 12.5 28.5S25 20.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#ffffff"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export const LocationMarker: React.FC<LocationMarkerProps> = ({ location }) => {
  const { setSelectedLocation, selectedLocationId, isProgrammaticMove } = useWidgetStore();
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();
  const [maxPopupHeight, setMaxPopupHeight] = useState(400);

  // Log component mount
  useEffect(() => {
    console.log('[MARKER] Component mounted:', {
      locationId: location.id,
      locationName: location.name,
      selectedLocationId,
      isProgrammaticMove,
      timestamp: Date.now()
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkerClick = () => {
    console.log('[MARKER] Click handler called:', {
      locationId: location.id,
      timestamp: Date.now()
    });
    // Pass 'marker-click' context - don't trigger map pan/zoom
    setSelectedLocation(location.id, 'marker-click');

    // Directly open popup to handle both new selections and re-clicks of already-selected markers
    // Small delay to ensure state updates and any cluster spiderfy completes
    setTimeout(() => {
      console.log('[MARKER] Attempting to open popup from click handler:', {
        locationId: location.id,
        markerRefExists: !!markerRef.current,
        timestamp: Date.now()
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
        console.log('[MARKER] openPopup() called from click handler');
      }
    }, 50);
  };

  // Calculate max popup height as 80% of map container height
  useEffect(() => {
    const calculateMaxHeight = () => {
      const mapContainer = map.getContainer();
      const mapHeight = mapContainer.clientHeight;
      // Set max height to 80% of map height, with min of 300px and max of 600px
      const calculatedHeight = Math.max(300, Math.min(600, Math.floor(mapHeight * 0.8)));
      setMaxPopupHeight(calculatedHeight);
    };

    calculateMaxHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateMaxHeight);
    return () => window.removeEventListener('resize', calculateMaxHeight);
  }, [map]);

  // Open popup when this location is selected via table click (programmatic navigation)
  // Direct marker clicks are handled in handleMarkerClick
  useEffect(() => {
    console.log('[MARKER] Programmatic move effect running:', {
      locationId: location.id,
      selectedLocationId,
      markerRefExists: !!markerRef.current,
      isProgrammaticMove,
      conditionMet: selectedLocationId === location.id && markerRef.current && isProgrammaticMove,
      timestamp: Date.now()
    });

    if (selectedLocationId === location.id && markerRef.current && isProgrammaticMove) {
      console.log('[MARKER] Component mounted for programmatic move - opening popup after delay');

      // Component just mounted after programmatic navigation
      // Don't rely on moveend (it fires before component mounts!)
      // Just wait for cluster animations to complete, then open popup
      const timer = setTimeout(() => {
        console.log('[MARKER] Attempting to open popup after delay:', {
          locationId: location.id,
          markerRefExists: !!markerRef.current,
          timestamp: Date.now()
        });
        if (markerRef.current) {
          markerRef.current.openPopup();
          console.log('[MARKER] openPopup() called from programmatic move');
          // Reset isProgrammaticMove flag after successfully opening popup
          useWidgetStore.setState({ isProgrammaticMove: false });
          console.log('[MARKER] isProgrammaticMove reset to FALSE');
        } else {
          console.warn('[MARKER] markerRef.current is NULL, cannot open popup!');
        }
      }, 300); // 300ms delay for cluster animations

      return () => {
        console.log('[MARKER] Cleanup: clearing timeout');
        clearTimeout(timer);
      };
    }
  }, [selectedLocationId, location.id, isProgrammaticMove]);

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={getMarkerIcon(location.category)}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup
        className="location-popup"
        maxWidth={300}
        minWidth={250}
        autoPan={true}
        autoPanPaddingTopLeft={[50, 50]}
        autoPanPaddingBottomRight={[50, 50]}
        autoPanPadding={[50, 50]}
      >
        <div
          className="lmw-p-2 lmw-overflow-y-auto"
          style={{ maxHeight: `${maxPopupHeight}px` }}
        >
          {/* Category badge */}
          <div className="lmw-mb-2">
            <CategoryBadge category={location.category} />
          </div>

          {/* Name */}
          <h3 className="lmw-text-lg lmw-font-bold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
            {location.name}
          </h3>

          {/* Images */}
          {location.images && location.images.length > 0 && (
            <ImageGallery images={location.images} locationName={location.name} />
          )}

          {/* Distance (if calculated) */}
          {location.distance !== undefined && (
            <p className="lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400 lmw-mb-2">
              📍 {formatDistance(location.distance)} away
            </p>
          )}

          {/* Address */}
          <div className="lmw-mb-2 lmw-text-sm lmw-text-gray-700 dark:lmw-text-gray-300">
            {location.address.street && <div>{location.address.street}</div>}
            <div>
              {location.address.city}, {location.address.state}{' '}
              {location.address.zip}
            </div>
          </div>

          {/* Description */}
          {location.description && (
            <p className="lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400 lmw-mb-3 lmw-line-clamp-3">
              {location.description}
            </p>
          )}

          {/* Hours */}
          {location.hours && (
            <div className="lmw-mb-2 lmw-text-sm">
              <span className="lmw-font-semibold lmw-text-gray-700 dark:lmw-text-gray-300">
                Hours:
              </span>{' '}
              <span className="lmw-text-gray-600 dark:lmw-text-gray-400">
                {location.hours}
              </span>
            </div>
          )}

          {/* Contact info */}
          {location.contact && (
            <div className="lmw-space-y-1 lmw-mb-3 lmw-text-sm">
              {location.contact.phone && (
                <div>
                  <a
                    href={`tel:${location.contact.phone}`}
                    className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline"
                  >
                    📞 {location.contact.phone}
                  </a>
                </div>
              )}
              {location.contact.email && (
                <div>
                  <a
                    href={`mailto:${location.contact.email}`}
                    className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline"
                  >
                    ✉️ {location.contact.email}
                  </a>
                </div>
              )}
              {location.contact.website && (
                <div>
                  <a
                    href={location.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline"
                  >
                    🌐 Website
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Custom Fields */}
          {location.customFields && Object.keys(location.customFields).length > 0 && (
            <div className="lmw-mb-3">
              <CustomFields customFields={location.customFields} />
            </div>
          )}

          {/* Main URL link */}
          {location.url && (
            <div className="lmw-mt-3">
              <a
                href={location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lmw-inline-block lmw-px-3 lmw-py-2 lmw-text-sm lmw-font-medium lmw-text-white lmw-bg-primary lmw-rounded-md hover:lmw-bg-blue-600 lmw-transition-colors"
              >
                View Details →
              </a>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

/**
 * Category badge component with dynamic styling
 */
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const { categories } = useWidgetStore.getState();
  const categoryMeta = categories.find(c => c.name.toLowerCase() === category.toLowerCase());

  if (!categoryMeta) {
    return (
      <span className="lmw-inline-block lmw-px-2 lmw-py-1 lmw-text-xs lmw-font-semibold lmw-rounded lmw-bg-gray-100 lmw-text-gray-800 dark:lmw-bg-gray-700 dark:lmw-text-gray-200">
        {category}
      </span>
    );
  }

  const { bg, text, darkBg, darkText } = categoryMeta.style;
  const classes = `lmw-inline-block lmw-px-2 lmw-py-1 lmw-text-xs lmw-font-semibold lmw-rounded ${bg} ${text} ${darkBg} ${darkText}`;

  return <span className={classes}>{category}</span>;
};
