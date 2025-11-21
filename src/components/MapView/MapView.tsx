/**
 * MapView component - Leaflet map with clustering and markers
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useWidgetState, useStore } from '../../contexts/StoreContext';
import { LocationMarker } from './LocationMarker';
import { GeolocationButton } from './GeolocationButton';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with bundlers
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Tile layer configurations for light/dark modes
const TILE_CONFIGS = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

/**
 * Create custom cluster icon with improved visuals
 */
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();

  // Different sizes based on cluster size (color stays blue)
  let size = 'small';
  const color = '#3B82F6'; // Blue - consistent for all cluster sizes

  if (count >= 20) {
    size = 'large';
  } else if (count >= 10) {
    size = 'medium';
  }

  const sizeMap = {
    small: 40,
    medium: 50,
    large: 60,
  };

  const dimension = sizeMap[size as keyof typeof sizeMap];

  return L.divIcon({
    html: `
      <div style="
        width: ${dimension}px;
        height: ${dimension}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: ${size === 'large' ? '18px' : size === 'medium' ? '16px' : '14px'};
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(dimension, dimension),
  });
};

interface MapViewProps {
  enableGeolocation?: boolean;
  enableClustering?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  enableGeolocation = true,
  enableClustering = true,
}) => {
  const { filteredLocations, mapCenter, mapZoom, theme } = useWidgetState((state) => ({
    filteredLocations: state.filteredLocations,
    mapCenter: state.mapCenter,
    mapZoom: state.mapZoom,
    theme: state.theme,
  }));

  // Determine if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // if (theme === 'dark') return true;
    // if (theme === 'light') return false;
    // return document.documentElement.classList.contains('dark');
    return false;
  });

  // Update dark mode state when theme changes or system preference changes
  useEffect(() => {
    // if (theme === 'dark') {
    //   setIsDarkMode(true);
    //   return;
    // }
    if (theme === 'light') {
      setIsDarkMode(false);
      return;
    }

    // For 'auto' theme, watch for class changes on documentElement
    const checkDarkMode = () => {
      // setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [theme]);

  const tileConfig = isDarkMode ? TILE_CONFIGS.dark : TILE_CONFIGS.light;

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="lmw-z-0"
      >
        {/* Map tiles - key forces reload on theme change */}
        <TileLayer
          key={isDarkMode ? 'dark' : 'light'}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />

        {/* Map controller for centering */}
        <MapController />

        {/* Geolocation button */}
        {enableGeolocation && <GeolocationButton />}

        {/* Markers with optional clustering */}
        {enableClustering ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={false}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            disableClusteringAtZoom={13}
            iconCreateFunction={createClusterCustomIcon}
          >
            {filteredLocations.map((location) => (
              <LocationMarker key={location.id} location={location} />
            ))}
          </MarkerClusterGroup>
        ) : (
          <>
            {filteredLocations.map((location) => (
              <LocationMarker key={location.id} location={location} />
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

/**
 * Map controller component to handle centering and auto-zoom
 */
const MapController: React.FC = () => {
  const map = useMap();
  const { mapCenter, mapZoom, filteredLocations, selectedLocationId, isProgrammaticMove } = useWidgetState((state) => ({
    mapCenter: state.mapCenter,
    mapZoom: state.mapZoom,
    filteredLocations: state.filteredLocations,
    selectedLocationId: state.selectedLocationId,
    isProgrammaticMove: state.isProgrammaticMove,
  }));
  const store = useStore();
  const prevCenter = useRef(mapCenter);
  const prevZoom = useRef(mapZoom);
  const prevFilteredCount = useRef(filteredLocations.length);

  // Handle manual center/zoom changes (e.g., when selecting a location)
  useEffect(() => {
    // Check if center or zoom actually changed
    const coordsChanged =
      prevCenter.current[0] !== mapCenter[0] ||
      prevCenter.current[1] !== mapCenter[1] ||
      prevZoom.current !== mapZoom;

    // Always call setView for programmatic moves to ensure moveend fires
    // OR when coordinates actually changed
    if (coordsChanged || isProgrammaticMove) {
      console.log('[MAP CONTROLLER] Calling map.setView:', {
        center: mapCenter,
        zoom: mapZoom,
        isProgrammaticMove,
        coordsChanged,
        reason: isProgrammaticMove ? 'programmatic move (forced)' : 'coordinates changed',
        timestamp: Date.now()
      });

      // Set up moveend listener to track when animation completes
      const handleMoveEnd = () => {
        console.log('[MAP CONTROLLER] moveend event fired', {
          timestamp: Date.now(),
          currentZoom: map.getZoom(),
          currentCenter: map.getCenter()
        });
        map.off('moveend', handleMoveEnd);
      };
      map.once('moveend', handleMoveEnd);

      map.setView(mapCenter, mapZoom);
      prevCenter.current = mapCenter;
      prevZoom.current = mapZoom;
    }
  }, [map, mapCenter, mapZoom, isProgrammaticMove]);

  // Auto-fit bounds when filtered locations change (but not when selecting a specific location)
  useEffect(() => {
    const { locations, filters } = store.getState();

    // Don't auto-zoom during programmatic navigation or when a specific location is selected
    if (isProgrammaticMove || selectedLocationId) {
      console.log('[MAP CONTROLLER] fitBounds skipped:', {
        isProgrammaticMove,
        selectedLocationId,
        reason: isProgrammaticMove ? 'programmatic move in progress' : 'location selected'
      });
      prevFilteredCount.current = filteredLocations.length;
      return;
    }

    // Check if filters are active
    const hasActiveFilters =
      filters.searchQuery.length > 0 ||
      filters.selectedCategories.length > 0 ||
      filters.distanceFilter.enabled;

    // Only auto-zoom if the filtered count actually changed
    if (filteredLocations.length !== prevFilteredCount.current) {
      // If no filters and showing all locations, reset to default view
      if (!hasActiveFilters && filteredLocations.length === locations.length) {
        map.setView([39.8283, -98.5795], 4); // Default center of USA
      } else if (filteredLocations.length > 0) {
        // If filters are active, fit bounds to filtered locations
        const bounds = L.latLngBounds(
          filteredLocations.map((loc) => [loc.latitude, loc.longitude])
        );

        // Fit bounds with padding
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12, // Don't zoom in too much for single locations
        });
      }

      prevFilteredCount.current = filteredLocations.length;
    }
  }, [map, filteredLocations, selectedLocationId]);

  return null;
};
