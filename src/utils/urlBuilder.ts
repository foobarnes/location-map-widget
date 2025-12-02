import type { DataSourceConfig, EmbedOptions } from '../types';

/**
 * Build an embed URL from a data source configuration and embed options
 *
 * @param baseUrl - Base URL for the embed page (e.g., 'https://example.com/embed')
 * @param dataSource - Data source configuration
 * @param embedOptions - Optional embed customization options
 * @returns Complete embed URL with query parameters
 */
export function buildEmbedURL(
  baseUrl: string,
  dataSource: DataSourceConfig,
  embedOptions?: EmbedOptions
): string {
  const url = new URL(baseUrl);
  const params = url.searchParams;

  // Add data source parameters
  addDataSourceParams(params, dataSource);

  // Add embed options
  if (embedOptions) {
    addEmbedOptionsParams(params, embedOptions);
  }

  return url.toString();
}

/**
 * Add data source parameters to URLSearchParams
 */
function addDataSourceParams(
  params: URLSearchParams,
  dataSource: DataSourceConfig
): void {
  params.set('type', dataSource.type);

  switch (dataSource.type) {
    case 'google-sheets':
      params.set('sheetId', dataSource.sheetId);
      params.set('apiKey', dataSource.apiKey);
      if (dataSource.range) params.set('range', dataSource.range);
      break;

    case 'google-sheets-public':
      params.set('sheetId', dataSource.sheetId);
      if (dataSource.gid) params.set('gid', dataSource.gid);
      if (dataSource.range) params.set('range', dataSource.range);
      break;

    case 'google-sheets-proxy':
      params.set('proxyUrl', dataSource.proxyUrl);
      params.set('sheetId', dataSource.sheetId);
      if (dataSource.range) params.set('range', dataSource.range);
      break;

    case 'csv':
    case 'json':
      params.set('url', dataSource.url);
      break;

    case 'mock':
      // No additional parameters needed
      break;
  }
}

/**
 * Add embed options parameters to URLSearchParams
 */
function addEmbedOptionsParams(
  params: URLSearchParams,
  options: EmbedOptions
): void {
  // Visual options
  if (options.height) params.set('height', options.height);
  if (options.width) params.set('width', options.width);
  if (options.theme) params.set('theme', options.theme);

  // Feature toggles
  if (options.hideSearch !== undefined) {
    params.set('hideSearch', options.hideSearch.toString());
  }
  if (options.hideTable !== undefined) {
    params.set('hideTable', options.hideTable.toString());
  }
  if (options.hideFilters !== undefined) {
    params.set('hideFilters', options.hideFilters.toString());
  }
  if (options.defaultView) params.set('defaultView', options.defaultView);

  // Initial state
  if (options.lat !== undefined) params.set('lat', options.lat.toString());
  if (options.lng !== undefined) params.set('lng', options.lng.toString());
  if (options.zoom !== undefined) params.set('zoom', options.zoom.toString());
  if (options.category) params.set('category', options.category);
}

/**
 * Generate an iframe embed code with the given URL
 *
 * @param embedUrl - Complete embed URL
 * @param options - Optional iframe attributes
 * @returns HTML iframe embed code
 */
export function generateIframeCode(
  embedUrl: string,
  options?: {
    width?: string;
    height?: string;
    title?: string;
    frameBorder?: string;
    allowFullScreen?: boolean;
  }
): string {
  const {
    width = '100%',
    height = '600px',
    title = 'Interactive Map',
    frameBorder = '0',
    allowFullScreen = false,
  } = options || {};

  const attrs: string[] = [
    `src="${embedUrl}"`,
    `width="${width}"`,
    `height="${height}"`,
    `title="${title}"`,
    `frameborder="${frameBorder}"`,
  ];

  if (allowFullScreen) {
    attrs.push('allowfullscreen');
  }

  return `<iframe ${attrs.join(' ')}></iframe>`;
}

/**
 * Example usage helper - generates common embed URL patterns
 */
export const EmbedURLExamples = {
  /**
   * Generate embed URL for a public Google Sheet
   */
  publicGoogleSheet: (baseUrl: string, sheetId: string, gid?: string) =>
    buildEmbedURL(baseUrl, {
      type: 'google-sheets-public',
      sheetId,
      gid,
    }),

  /**
   * Generate embed URL for a CSV file
   */
  csv: (baseUrl: string, csvUrl: string) =>
    buildEmbedURL(baseUrl, {
      type: 'csv',
      url: csvUrl,
    }),

  /**
   * Generate embed URL with dark theme
   */
  darkTheme: (baseUrl: string, dataSource: DataSourceConfig) =>
    buildEmbedURL(baseUrl, dataSource, {
      theme: 'dark',
    }),

  /**
   * Generate embed URL with custom initial position
   */
  customPosition: (
    baseUrl: string,
    dataSource: DataSourceConfig,
    lat: number,
    lng: number,
    zoom: number
  ) =>
    buildEmbedURL(baseUrl, dataSource, {
      lat,
      lng,
      zoom,
    }),
};
