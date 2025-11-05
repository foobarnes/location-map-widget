/**
 * GeolocationButton component - "Find Near Me" button for the map
 */

import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { getUserLocation } from '../../utils/distance';
import { useWidgetState } from '../../contexts/StoreContext';

export const GeolocationButton: React.FC = () => {
  const map = useMap();
  const { setFilters, filters, setMapCenter, setMapZoom } = useWidgetState((state) => ({
    setFilters: state.setFilters,
    filters: state.filters,
    setMapCenter: state.setMapCenter,
    setMapZoom: state.setMapZoom,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindNearMe = async () => {
    setLoading(true);
    setError(null);

    try {
      const userLocation = await getUserLocation();

      // Update filters with user location
      setFilters({
        distanceFilter: {
          ...filters.distanceFilter,
          enabled: true,
          userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      });

      // Center map on user location
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(12);

      // Add a marker for user location (optional visual feedback)
      map.setView([userLocation.latitude, userLocation.longitude], 12);

      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get your location'
      );
      setLoading(false);
    }
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control lmw-mb-4 lmw-mr-2">
        <button
          onClick={handleFindNearMe}
          disabled={loading}
          className={`
            lmw-flex lmw-items-center lmw-justify-center lmw-w-12 lmw-h-12
            lmw-bg-primary lmw-text-white lmw-rounded-full lmw-shadow-lg
            hover:lmw-bg-blue-600 hover:lmw-shadow-xl
            lmw-transition-all lmw-duration-200
            disabled:lmw-opacity-50 disabled:lmw-cursor-not-allowed
            lmw-border-2 lmw-border-white dark:lmw-border-gray-700
          `}
          title="Find locations near me"
        >
          {loading ? (
            <div className="lmw-w-5 lmw-h-5 lmw-border-2 lmw-border-white lmw-border-t-transparent lmw-rounded-full lmw-animate-spin"></div>
          ) : (
            <svg
              className="lmw-w-6 lmw-h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="lmw-mt-2 lmw-p-2 lmw-bg-red-50 dark:lmw-bg-red-900 lmw-border lmw-border-red-200 dark:lmw-border-red-700 lmw-rounded lmw-text-xs lmw-text-red-800 dark:lmw-text-red-200 lmw-max-w-[200px]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
