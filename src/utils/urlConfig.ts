import type {
  DataSourceConfig,
  EmbedOptions,
  URLConfig,
  Theme,
  ViewMode,
} from '../types';

/**
 * Parse URL query parameters into a URLConfig object
 * Supports all data source types and embed customization options
 *
 * @param searchParams - URLSearchParams object (defaults to window.location.search)
 * @returns Parsed configuration object
 */
export function parseURLConfig(searchParams?: URLSearchParams): URLConfig {
  const params = searchParams || new URLSearchParams(window.location.search);

  const config: URLConfig = {};

  // Parse data source configuration
  const type = params.get('type');
  if (type) {
    config.dataSource = parseDataSource(params, type);
  }

  // Parse embed options
  const embedOptions = parseEmbedOptions(params);
  if (Object.keys(embedOptions).length > 0) {
    config.embedOptions = embedOptions;
  }

  return config;
}

/**
 * Parse data source configuration from URL parameters
 */
function parseDataSource(
  params: URLSearchParams,
  type: string
): DataSourceConfig | undefined {
  switch (type) {
    case 'google-sheets': {
      const sheetId = params.get('sheetId');
      const apiKey = params.get('apiKey');
      if (sheetId && apiKey) {
        return {
          type: 'google-sheets',
          sheetId,
          apiKey,
          range: params.get('range') || undefined,
        };
      }
      break;
    }

    case 'google-sheets-public': {
      const sheetId = params.get('sheetId');
      if (sheetId) {
        return {
          type: 'google-sheets-public',
          sheetId,
          gid: params.get('gid') || undefined,
          range: params.get('range') || undefined,
        };
      }
      break;
    }

    case 'google-sheets-proxy': {
      const proxyUrl = params.get('proxyUrl');
      const sheetId = params.get('sheetId');
      if (proxyUrl && sheetId) {
        return {
          type: 'google-sheets-proxy',
          proxyUrl,
          sheetId,
          range: params.get('range') || undefined,
        };
      }
      break;
    }

    case 'csv': {
      const url = params.get('url');
      if (url) {
        return {
          type: 'csv',
          url,
        };
      }
      break;
    }

    case 'json': {
      const url = params.get('url');
      if (url) {
        return {
          type: 'json',
          url,
        };
      }
      break;
    }

    case 'mock': {
      return {
        type: 'mock',
      };
    }

    default:
      console.warn(`Unknown data source type: ${type}`);
  }

  return undefined;
}

/**
 * Parse embed customization options from URL parameters
 */
function parseEmbedOptions(params: URLSearchParams): EmbedOptions {
  const options: EmbedOptions = {};

  // Visual options
  const height = params.get('height');
  if (height) options.height = height;

  const width = params.get('width');
  if (width) options.width = width;

  const theme = params.get('theme');
  if (theme && (theme === 'light' || theme === 'dark' || theme === 'auto')) {
    options.theme = theme as Theme;
  }

  // Feature toggles
  const hideSearch = params.get('hideSearch');
  if (hideSearch !== null) options.hideSearch = hideSearch === 'true';

  const hideTable = params.get('hideTable');
  if (hideTable !== null) options.hideTable = hideTable === 'true';

  const hideFilters = params.get('hideFilters');
  if (hideFilters !== null) options.hideFilters = hideFilters === 'true';

  const defaultView = params.get('defaultView');
  if (defaultView && (defaultView === 'map' || defaultView === 'table')) {
    options.defaultView = defaultView as ViewMode;
  }

  // Initial state
  const lat = params.get('lat');
  if (lat !== null) {
    const latitude = parseFloat(lat);
    if (!isNaN(latitude)) options.lat = latitude;
  }

  const lng = params.get('lng');
  if (lng !== null) {
    const longitude = parseFloat(lng);
    if (!isNaN(longitude)) options.lng = longitude;
  }

  const zoom = params.get('zoom');
  if (zoom !== null) {
    const zoomLevel = parseInt(zoom, 10);
    if (!isNaN(zoomLevel)) options.zoom = zoomLevel;
  }

  const category = params.get('category');
  if (category) options.category = category;

  return options;
}

/**
 * Convert embed options to widget configuration
 * Maps embed options to the widget config structure
 */
export function embedOptionsToWidgetConfig(
  embedOptions: EmbedOptions
): Partial<{
  height: string;
  theme: Theme;
  defaultView: ViewMode;
  defaultCenter: [number, number];
  defaultZoom: number;
  enableSearch: boolean;
  enableFilters: boolean;
}> {
  const config: any = {};

  // Visual options
  if (embedOptions.height) config.height = embedOptions.height;
  if (embedOptions.theme) config.theme = embedOptions.theme;

  // View mode
  if (embedOptions.defaultView) config.defaultView = embedOptions.defaultView;

  // Initial map state
  if (embedOptions.lat !== undefined && embedOptions.lng !== undefined) {
    config.defaultCenter = [embedOptions.lat, embedOptions.lng];
  }
  if (embedOptions.zoom !== undefined) config.defaultZoom = embedOptions.zoom;

  // Feature toggles (inverted logic - hide* becomes enable*)
  if (embedOptions.hideSearch !== undefined) {
    config.enableSearch = !embedOptions.hideSearch;
  }
  if (embedOptions.hideFilters !== undefined) {
    config.enableFilters = !embedOptions.hideFilters;
  }

  return config;
}
