/**
 * Location data model for the widget
 */

import type { FieldRenderersConfig } from '../renderers/types';
import type { FieldRendererRegistry } from '../renderers/FieldRendererRegistry';

/**
 * Category configuration types
 */

// Category style configuration
export interface CategoryStyle {
  bg: string;        // Tailwind background class for light mode
  text: string;      // Tailwind text class for light mode
  darkBg: string;    // Tailwind background class for dark mode
  darkText: string;  // Tailwind text class for dark mode
  color: string;     // Hex color for map markers
}

// Category metadata including style and count
export interface CategoryMetadata {
  name: string;          // Category name (original casing preserved)
  style: CategoryStyle;  // Style configuration
  count: number;         // Number of locations with this category
}

// User-provided category configuration
export interface CategoryConfig {
  [categoryName: string]: Partial<CategoryStyle>;
}

// Location category types - extensible for future use cases
export type LocationCategory = 'ambassador' | 'rental' | 'trail' | string;

// Address information
export interface Address {
  street?: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
}

// Contact information
export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

// Main Location interface
export interface Location {
  // Required fields
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: LocationCategory;

  // Core fields
  description: string;
  address: Address;

  // Optional contact
  contact?: Contact;
  url?: string; // Direct link to more information

  // Media
  images?: string[]; // Array of image URLs

  // Operational info
  hours?: string; // Operating hours (freeform text)

  // Custom fields - flexible key-value pairs
  customFields?: Record<string, string | number | boolean>;

  // Metadata
  lastUpdated?: string; // ISO timestamp

  // Calculated fields (not from data source)
  distance?: number; // Distance from user location in miles
}

/**
 * Data source configuration types
 */

// Google Sheets data source config (Direct API - like Google Maps)
export interface GoogleSheetsDataSource {
  type: 'google-sheets';
  sheetId: string;
  apiKey: string;
  range?: string; // Optional range, defaults to first sheet
  debug?: boolean; // Enable detailed logging for troubleshooting
}

// Google Sheets published/public data source (No API key required)
export interface GoogleSheetsPublicDataSource {
  type: 'google-sheets-public';
  sheetId: string;
  gid?: string; // Optional sheet tab ID (gid parameter)
  range?: string; // Optional range notation (e.g., 'A1:Z1000')
  debug?: boolean; // Enable detailed logging for troubleshooting
}

// Google Sheets proxy data source (Secure - API key hidden in backend)
export interface GoogleSheetsProxyDataSource {
  type: 'google-sheets-proxy';
  proxyUrl: string; // URL to user's proxy endpoint
  sheetId: string;
  range?: string; // Optional range, defaults to first sheet
  debug?: boolean; // Enable detailed logging for troubleshooting
}

// CSV data source config
export interface CSVDataSource {
  type: 'csv';
  url: string;
}

// JSON data source config
export interface JSONDataSource {
  type: 'json';
  url: string;
}

// Mock data source config (for development/testing)
export interface MockDataSource {
  type: 'mock';
}

// Union type for all data sources
export type DataSourceConfig =
  | GoogleSheetsDataSource
  | GoogleSheetsPublicDataSource
  | GoogleSheetsProxyDataSource
  | CSVDataSource
  | JSONDataSource
  | MockDataSource;

/**
 * Widget configuration
 */

export type ViewMode = 'map' | 'table';
export type Theme = 'light' | 'dark' | 'auto';

export interface WidgetConfig {
  // Data source
  dataSource: DataSourceConfig;

  // UI config
  height?: string; // CSS height value, default '600px'
  defaultView?: ViewMode; // Default view on load
  theme?: Theme; // Theme mode

  // Map config
  defaultCenter?: [number, number]; // [lat, lng]
  defaultZoom?: number; // Zoom level

  // Feature flags
  enableGeolocation?: boolean; // Show "Find Near Me" button
  enableClustering?: boolean; // Enable marker clustering
  enableSearch?: boolean; // Enable search bar
  enableFilters?: boolean; // Enable category filters
  enableDistanceFilter?: boolean; // Enable distance-based filtering
  showFullscreenButton?: boolean; // Show fullscreen toggle button (default: true)

  // Pagination
  itemsPerPage?: number; // Items per page in table view

  // Customization
  markerIcons?: Partial<Record<LocationCategory, string>>; // Custom marker icons per category
  categoryConfig?: CategoryConfig; // User-provided category customization

  // Field rendering
  fieldRenderers?: FieldRenderersConfig; // Custom field renderer configuration
  autoDetectFieldTypes?: boolean; // Enable auto-detection of field types (default: true)
}

/**
 * Widget initialization parameters
 */

export interface WidgetInitParams {
  container: string | HTMLElement; // CSS selector or DOM element
  dataSource: DataSourceConfig;
  config?: Partial<Omit<WidgetConfig, 'dataSource'>>;
}

/**
 * Filter state
 */

export interface FilterState {
  searchQuery: string;
  selectedCategories: LocationCategory[];
  distanceFilter: {
    enabled: boolean;
    maxDistance: number; // in miles
    userLocation?: {
      latitude: number;
      longitude: number;
    };
  };
}

/**
 * Widget store state
 */

export interface WidgetState {
  // Data
  locations: Location[];
  filteredLocations: Location[];
  loading: boolean;
  error: string | null;
  categories: CategoryMetadata[]; // Discovered categories with styling

  // UI state
  currentView: ViewMode;
  theme: Theme;

  // Filters
  filters: FilterState;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Selection
  selectedLocationId: string | null;

  // Map state
  mapCenter: [number, number];
  mapZoom: number;
  isProgrammaticMove: boolean; // Flag to track programmatic navigation

  // Field rendering
  fieldRendererRegistry: FieldRendererRegistry | null;

  // Actions
  setLocations: (locations: Location[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentView: (view: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setCurrentPage: (page: number) => void;
  setSelectedLocation: (id: string | null, context?: 'marker-click' | 'table-click') => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  applyFilters: () => void;
  setCategoriesFromLocations: (locations: Location[], config?: CategoryConfig) => void;
  setFieldRendererRegistry: (registry: FieldRendererRegistry | null) => void;
}

/**
 * Data adapter interface
 */

export interface DataAdapter {
  fetchLocations(): Promise<Location[]>;
  validateSchema(data: unknown): Location[];
}

/**
 * Google Sheets API response types
 */

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

/**
 * URL Embed Configuration Types
 */

// Visual customization options for embeds
export interface EmbedVisualOptions {
  height?: string; // CSS height value (e.g., '600px', '100vh')
  width?: string; // CSS width value (e.g., '100%', '800px')
  theme?: Theme; // Light/dark theme
}

// Feature toggle options for embeds
export interface EmbedFeatureOptions {
  hideSearch?: boolean; // Hide search bar
  hideTable?: boolean; // Hide table view toggle
  hideFilters?: boolean; // Hide category filters
  hideGeolocation?: boolean; // Hide "Find Near Me" button
  hideFullscreen?: boolean; // Hide fullscreen button
  defaultView?: ViewMode; // Default view on load (map or table)
}

// Initial state options for embeds
export interface EmbedInitialState {
  lat?: number; // Initial map center latitude
  lng?: number; // Initial map center longitude
  zoom?: number; // Initial map zoom level
  category?: string; // Pre-selected category filter
}

// Complete embed configuration
export interface EmbedOptions extends EmbedVisualOptions, EmbedFeatureOptions, EmbedInitialState {}

// Parsed URL configuration
export interface URLConfig {
  dataSource?: DataSourceConfig; // Data source parsed from URL params
  embedOptions?: EmbedOptions; // Embed customization options
}

/**
 * Utility types
 */

// Coordinates
export type Coordinates = {
  latitude: number;
  longitude: number;
};

// Bounds for map
export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};
