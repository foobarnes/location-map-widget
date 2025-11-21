/**
 * Main Widget component - Entry point for the embeddable widget
 */

import React, { useEffect } from 'react';
import { initializeTheme } from '../stores/widgetStore';
import { useWidgetState, useStore } from '../contexts/StoreContext';
import { createDataAdapter } from '../adapters';
import type { WidgetConfig } from '../types';
import { MapView } from './MapView';
import { TableView } from './TableView';
import { Filters } from './Filters';

interface WidgetProps {
  config: WidgetConfig;
}

export const Widget: React.FC<WidgetProps> = ({ config }) => {
  const store = useStore();
  const { setLocations, setLoading, setError, setTheme } = useWidgetState(
    (state) => ({
      setLocations: state.setLocations,
      setLoading: state.setLoading,
      setError: state.setError,
      setTheme: state.setTheme,
    })
  );

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme(store);
    if (config.theme) {
      setTheme(config.theme);
    }
  }, [config.theme, setTheme, store]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const adapter = createDataAdapter(config.dataSource);
        const locations = await adapter.fetchLocations();

        if (locations.length === 0) {
          setError('No locations found in data source');
        } else {
          setLocations(locations);

          // Extract and store category metadata
          const state = store.getState();
          state.setCategoriesFromLocations(locations, config.categoryConfig);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        const message = err instanceof Error ? err.message : 'Failed to load locations';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.dataSource, config.categoryConfig, setLocations, setLoading, setError, store]);

  // Set initial config values
  useEffect(() => {
    const state = store.getState();

    if (config.defaultView) {
      state.setCurrentView(config.defaultView);
    }

    if (config.defaultCenter) {
      state.setMapCenter(config.defaultCenter);
    }

    if (config.defaultZoom) {
      state.setMapZoom(config.defaultZoom);
    }

    if (config.itemsPerPage) {
      store.setState({ itemsPerPage: config.itemsPerPage });
    }
  }, [config, store]);

  return (
    <div
      className="widget-container lmw-w-full lmw-h-full lmw-bg-white dark:lmw-bg-gray-900 lmw-text-gray-900 dark:lmw-text-gray-100 lmw-font-sans lmw-antialiased"
      style={config.height ? { height: config.height } : undefined}
    >
      <WidgetContent config={config} />
    </div>
  );
};

/**
 * Widget content with loading and error states
 */
const WidgetContent: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  const { loading, error, currentView } = useWidgetState((state) => ({
    loading: state.loading,
    error: state.error,
    currentView: state.currentView,
  }));

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="lmw-w-full lmw-h-full lmw-flex lmw-flex-col">

      {/* Filters Section */}
      <Filters />

      {/* Main Content Area */}
      <div
        className="lmw-flex-1 lmw-overflow-hidden lmw-bg-white dark:lmw-bg-gray-900 lmw-relative"
        style={{ minHeight: '400px' }}
        role="tabpanel"
        id={`${currentView}-panel`}
        aria-labelledby={`${currentView}-tab`}
      >
        {currentView === 'map' ? (
          <MapView
            enableGeolocation={config.enableGeolocation}
            enableClustering={config.enableClustering}
            showFullscreenButton={config.showFullscreenButton}
          />
        ) : (
          <TableView />
        )}
      </div>
    </div>
  );
};

/**
 * Loading state component with aesthetic animation
 */
const LoadingState: React.FC = () => {
  return (
    <div className="lmw-w-full lmw-h-full lmw-flex lmw-items-center lmw-justify-center lmw-bg-gradient-to-br lmw-from-gray-50 lmw-to-gray-100 dark:lmw-from-gray-900 dark:lmw-to-gray-800">
      <div className="lmw-text-center lmw-px-6">
        {/* Animated Map Pin Icon */}
        <div className="lmw-relative lmw-mx-auto lmw-mb-8" style={{ width: '80px', height: '80px' }}>
          {/* Pulsing circles */}
          <div className="lmw-absolute lmw-inset-0 lmw-rounded-full lmw-bg-blue-400 dark:lmw-bg-blue-500 lmw-opacity-20 lmw-animate-ping"></div>
          <div className="lmw-absolute lmw-inset-0 lmw-rounded-full lmw-bg-blue-400 dark:lmw-bg-blue-500 lmw-opacity-20 lmw-animate-pulse"></div>

          {/* Map pin SVG */}
          <div className="lmw-absolute lmw-inset-0 lmw-flex lmw-items-center lmw-justify-center">
            <svg
              className="lmw-w-12 lmw-h-12 lmw-text-blue-600 dark:lmw-text-blue-400 lmw-animate-bounce"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDuration: '1.5s' }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </div>

        {/* Subtle description */}
        <p className="lmw-text-sm lmw-text-gray-500 dark:lmw-text-gray-400 lmw-max-w-xs lmw-mx-auto">
          Fetching location data from your source...
        </p>
      </div>
    </div>
  );
};

/**
 * Error state component
 */
const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  const setError = useWidgetState((state) => state.setError);

  const handleRetry = () => {
    // Trigger a re-fetch by clearing error
    setError(null);
    // The useEffect in Widget will automatically re-fetch
  };

  return (
    <div className="lmw-w-full lmw-h-full lmw-flex lmw-items-center lmw-justify-center lmw-bg-white dark:lmw-bg-gray-900">
      <div className="lmw-text-center lmw-max-w-md lmw-p-6">
        {/* Error Icon */}
        <div className="lmw-mx-auto lmw-w-16 lmw-h-16 lmw-mb-4 lmw-text-red-500">
          <svg
            className="lmw-w-full lmw-h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="lmw-text-lg lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
          Failed to Load Locations
        </h3>

        <p className="lmw-text-gray-600 dark:lmw-text-gray-400 lmw-mb-4">
          {message}
        </p>

        <button
          onClick={handleRetry}
          className="lmw-px-4 lmw-py-2 lmw-bg-primary lmw-text-white lmw-rounded-md hover:lmw-bg-blue-600 active:lmw-bg-blue-700 lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
