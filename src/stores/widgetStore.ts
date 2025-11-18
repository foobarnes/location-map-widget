/**
 * Zustand store for widget state management
 * Factory pattern for instance-scoped stores to support multiple independent widgets
 */

import { create } from 'zustand';
import type { StoreApi } from 'zustand';
import type { WidgetState, Location, ViewMode, Theme, FilterState, CategoryConfig } from '../types';
import { calculateDistance } from '../utils/distance';
import { extractCategories } from '../utils/category';

/**
 * Create a new widget store instance
 * Each widget instance gets its own isolated state
 */
export function createWidgetStore() {
  return create<WidgetState>((set, get) => ({
  // Data state
  locations: [],
  filteredLocations: [],
  categories: [],
  loading: false,
  error: null,

  // UI state
  currentView: 'map',
  theme: 'auto',

  // Filters
  filters: {
    searchQuery: '',
    selectedCategories: [],
    distanceFilter: {
      enabled: false,
      maxDistance: 25, // default 25 miles
      userLocation: undefined,
    },
  },

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,

  // Selection
  selectedLocationId: null,

  // Map state
  mapCenter: [39.8283, -98.5795], // Center of USA as default
  mapZoom: 4,
  isProgrammaticMove: false, // Track when we're programmatically navigating

  // Actions
  setLocations: (locations: Location[]) => {
    set({ locations });
    // Automatically apply filters when locations change
    get().applyFilters();
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setCurrentView: (view: ViewMode) => {
    set({ currentView: view });
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    // Apply theme to document
    applyTheme(theme);
  },

  setFilters: (newFilters: Partial<FilterState>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    }));
    // Apply filters whenever they change
    get().applyFilters();
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setSelectedLocation: (id: string | null, context?: 'marker-click' | 'table-click') => {
    console.log('[STORE] setSelectedLocation called:', { id, context, timestamp: Date.now() });
    set({ selectedLocationId: id });

    // Only change map position for table clicks (programmatic navigation)
    // For marker clicks, the marker is already visible - just open popup
    if (id && context === 'table-click') {
      const location = get().locations.find((loc) => loc.id === id);
      if (location) {
        console.log('[STORE] Table click - navigating to:', {
          id,
          lat: location.latitude,
          lng: location.longitude,
          zoom: 13
        });
        // Use zoom level 13 to prevent clustering (disableClusteringAtZoom: 13)
        set({
          mapCenter: [location.latitude, location.longitude],
          mapZoom: 13,
          currentView: 'map', // Switch to map view
          isProgrammaticMove: true, // Mark as programmatic move
        });
        console.log('[STORE] isProgrammaticMove set to TRUE');
      }
    } else if (context === 'marker-click') {
      console.log('[STORE] Marker click - no navigation, isProgrammaticMove stays:', get().isProgrammaticMove);
    }
  },

  setMapCenter: (center: [number, number]) => {
    set({ mapCenter: center });
  },

  setMapZoom: (zoom: number) => {
    set({ mapZoom: zoom });
  },

  applyFilters: () => {
    const { locations, filters } = get();
    let filtered = [...locations];

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((loc) => {
        // Search in standard fields
        const standardFieldsMatch =
          loc.name.toLowerCase().includes(query) ||
          loc.description.toLowerCase().includes(query) ||
          loc.category.toLowerCase().includes(query) ||
          loc.address.street?.toLowerCase().includes(query) ||
          loc.address.city?.toLowerCase().includes(query) ||
          loc.address.state?.toLowerCase().includes(query) ||
          loc.address.country?.toLowerCase().includes(query);

        // Search in custom fields values
        const customFieldsMatch = loc.customFields
          ? Object.values(loc.customFields).some((value) =>
              String(value).toLowerCase().includes(query)
            )
          : false;

        return standardFieldsMatch || customFieldsMatch;
      });
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((loc) =>
        filters.selectedCategories.includes(loc.category.toLowerCase())
      );
    }

    // Apply distance filter
    if (filters.distanceFilter.enabled && filters.distanceFilter.userLocation) {
      const { userLocation, maxDistance } = filters.distanceFilter;

      filtered = filtered
        .map((loc) => ({
          ...loc,
          distance: calculateDistance(
            { latitude: loc.latitude, longitude: loc.longitude },
            userLocation
          ),
        }))
        .filter((loc) => loc.distance! <= maxDistance)
        .sort((a, b) => a.distance! - b.distance!); // Sort by distance
    }

    set({ filteredLocations: filtered });
  },

  setCategoriesFromLocations: (locations: Location[], config?: CategoryConfig) => {
    const categories = extractCategories(locations, config);
    set({ categories });
  },
  }));
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'auto') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Initialize theme based on system preference
 * @param store - Widget store instance to check theme setting
 */
export function initializeTheme(store: StoreApi<WidgetState>): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = store.getState();
    if (state.theme === 'auto') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
}

/**
 * Export type for store instances
 */
export type WidgetStore = ReturnType<typeof createWidgetStore>;
