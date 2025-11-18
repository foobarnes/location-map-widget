/**
 * Main entry point for the embeddable widget
 * Exposes the OpenMapEmbed global object for embedding
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Widget } from './components/Widget';
import { createWidgetStore } from './stores/widgetStore';
import { StoreProvider } from './contexts/StoreContext';
import type { WidgetInitParams, WidgetConfig } from './types';
import './style.css';

/**
 * Initialize the widget
 */
function init(params: WidgetInitParams): void {
  // Get container element
  let container: HTMLElement | null;

  if (typeof params.container === 'string') {
    container = document.querySelector(params.container);
    if (!container) {
      throw new Error(`Container not found: ${params.container}`);
    }
  } else {
    container = params.container;
  }

  // Merge config with defaults
  const config: WidgetConfig = {
    dataSource: params.dataSource,
    height: params.config?.height, // Let container control height if not specified
    defaultView: params.config?.defaultView || 'map',
    theme: params.config?.theme || 'auto',
    defaultCenter: params.config?.defaultCenter || [39.8283, -98.5795],
    defaultZoom: params.config?.defaultZoom || 4,
    enableGeolocation: params.config?.enableGeolocation ?? true,
    enableClustering: params.config?.enableClustering ?? true,
    enableSearch: params.config?.enableSearch ?? true,
    enableFilters: params.config?.enableFilters ?? true,
    enableDistanceFilter: params.config?.enableDistanceFilter ?? true,
    itemsPerPage: params.config?.itemsPerPage || 10,
    markerIcons: params.config?.markerIcons,
  };

  // Create widget store instance
  const store = createWidgetStore();

  // Create React root and render widget
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <StoreProvider store={store}>
        <Widget config={config} />
      </StoreProvider>
    </React.StrictMode>
  );
}

/**
 * Expose global API for embedding
 */
if (typeof window !== 'undefined') {
  (window as any).OpenMapEmbed = {
    init,
    version: '1.0.0',
  };
}

// For module imports
export { init, Widget };
export type { WidgetInitParams, WidgetConfig };
