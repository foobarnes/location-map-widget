/**
 * LocationMarker component - Individual marker with popup
 */

import React, { useRef, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../../types';
import { useWidgetStore } from '../../stores/widgetStore';
import { formatDistance } from '../../utils/distance';

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
  const { setSelectedLocation, selectedLocationId } = useWidgetStore();
  const markerRef = useRef<L.Marker>(null);

  const handleMarkerClick = () => {
    setSelectedLocation(location.id);
  };

  // Open popup when this location is selected
  useEffect(() => {
    if (selectedLocationId === location.id && markerRef.current) {
      // Small delay to ensure map has finished centering and cluster has expanded
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [selectedLocationId, location.id]);

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
      >
        <div className="lmw-p-2">
          {/* Category badge */}
          <div className="lmw-mb-2">
            <CategoryBadge category={location.category} />
          </div>

          {/* Name */}
          <h3 className="lmw-text-lg lmw-font-bold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
            {location.name}
          </h3>

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
