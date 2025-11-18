/**
 * Filters component - Compact search, category, and distance filtering
 */

import React, { useState } from 'react';
import { useWidgetState } from '../../contexts/StoreContext';
import { getUserLocation } from '../../utils/distance';
import type { LocationCategory } from '../../types';

export const Filters: React.FC = () => {
  const { filters, setFilters, setSelectedLocation, currentView, setCurrentView } = useWidgetState((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
    setSelectedLocation: state.setSelectedLocation,
    currentView: state.currentView,
    setCurrentView: state.setCurrentView,
  }));
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLocation(null);
    setFilters({
      searchQuery: event.target.value,
    });
  };

  // Handle category toggle
  const handleCategoryToggle = (category: LocationCategory) => {
    setSelectedLocation(null);
    const currentCategories = filters.selectedCategories;
    const isSelected = currentCategories.includes(category);

    setFilters({
      selectedCategories: isSelected
        ? currentCategories.filter((c) => c !== category)
        : [...currentCategories, category],
    });
  };

  // Handle distance slider change
  const handleDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!filters.distanceFilter.userLocation) return;
    setSelectedLocation(null);

    setFilters({
      distanceFilter: {
        ...filters.distanceFilter,
        maxDistance: parseInt(event.target.value, 10),
      },
    });
  };

  // Handle "Find Near Me" button
  const handleFindNearMe = async () => {
    setIsLoadingLocation(true);
    setSelectedLocation(null);

    try {
      const userLocation = await getUserLocation();

      setFilters({
        distanceFilter: {
          enabled: true,
          maxDistance: filters.distanceFilter.maxDistance || 25,
          userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      });
    } catch (error) {
      console.error('Failed to get user location:', error);
      alert('Failed to get your location. Please enable location services and try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle clear distance filter
  const handleClearDistance = () => {
    setSelectedLocation(null);
    setFilters({
      distanceFilter: {
        enabled: false,
        maxDistance: 25,
        userLocation: undefined,
      },
    });
  };

  // Handle clear all filters
  const handleClearAll = () => {
    setSelectedLocation(null);
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      distanceFilter: {
        enabled: false,
        maxDistance: 25,
        userLocation: undefined,
      },
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchQuery.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.distanceFilter.enabled;

  // Get categories from store (auto-discovered from data)
  const { categories: categoryMetadata } = useWidgetState((state) => ({
    categories: state.categories,
  }));

  // Transform to format needed for rendering
  const categories = categoryMetadata.map(cat => ({
    value: cat.name.toLowerCase(),
    label: cat.name,
    color: `${cat.style.bg} ${cat.style.text} ${cat.style.darkBg} ${cat.style.darkText}`,
  }));

  return (
    <div className="lmw-p-3 lmw-border-b lmw-border-gray-200 dark:lmw-border-gray-700 lmw-bg-gray-50 dark:lmw-bg-gray-800 lmw-space-y-2">
      {/* Row 1: Search Bar + Find Near Me Button */}
      <div className="lmw-flex lmw-gap-2">
        {/* Search Bar (60%) */}
        <div className="lmw-flex-1 lmw-relative">
          <div className="lmw-absolute lmw-inset-y-0 lmw-left-0 lmw-pl-3 lmw-flex lmw-items-center lmw-pointer-events-none">
            <svg className="lmw-h-4 lmw-w-4 lmw-text-gray-400 dark:lmw-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search locations..."
            className="lmw-block lmw-w-full lmw-pl-9 lmw-pr-4 lmw-py-2 lmw-text-sm lmw-border-2 lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-full lmw-leading-5 lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-900 dark:lmw-text-gray-100 placeholder:lmw-text-gray-500 dark:placeholder:lmw-text-gray-400 lmw-shadow-sm focus:lmw-outline-none focus:lmw-ring-2 focus:lmw-ring-primary focus:lmw-border-primary lmw-transition-all lmw-duration-200"
          />
        </div>

        {/* Find Near Me / Clear Distance Button */}
        {!filters.distanceFilter.enabled ? (
          <button
            onClick={handleFindNearMe}
            disabled={isLoadingLocation}
            className="lmw-flex lmw-items-center lmw-justify-center lmw-w-10 lmw-h-10 lmw-text-white lmw-bg-primary lmw-rounded-full lmw-shadow-md hover:lmw-bg-blue-600 hover:lmw-shadow-lg active:lmw-bg-blue-700 disabled:lmw-opacity-50 disabled:lmw-cursor-not-allowed lmw-cursor-pointer lmw-transition-all lmw-duration-200 lmw-border-2 lmw-border-white dark:lmw-border-gray-600 lmw-shrink-0 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
            title="Find locations near me"
          >
            {isLoadingLocation ? (
              <div className="lmw-w-5 lmw-h-5 lmw-border-2 lmw-border-white lmw-border-t-transparent lmw-rounded-full lmw-animate-spin"></div>
            ) : (
              <svg className="lmw-h-5 lmw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        ) : (
          <button
            onClick={handleClearDistance}
            className="lmw-flex lmw-items-center lmw-justify-center lmw-w-10 lmw-h-10 lmw-text-gray-600 dark:lmw-text-gray-400 lmw-bg-white dark:lmw-bg-gray-700 lmw-border-2 lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-full lmw-shadow-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 hover:lmw-shadow-lg active:lmw-bg-gray-100 dark:active:lmw-bg-gray-500 lmw-cursor-pointer lmw-transition-all lmw-duration-200 lmw-shrink-0 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
            title="Clear distance filter"
          >
            <svg className="lmw-h-5 lmw-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Row 2: View Switcher (fixed) + Category Chips (scrollable) */}
      <div className="lmw-flex lmw-items-center lmw-gap-2">
        {/* Fixed Section: View Switcher + Separator */}
        <div className="lmw-flex lmw-items-center lmw-gap-2 lmw-shrink-0">
          {/* View Switcher Toggle - Mobile: single toggle button */}
          <button
            onClick={() => setCurrentView(currentView === 'map' ? 'table' : 'map')}
            className="sm:lmw-hidden lmw-flex lmw-items-center lmw-gap-1.5 lmw-px-3 lmw-py-1.5 lmw-text-sm lmw-font-medium lmw-rounded-full lmw-border-2 lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-700 dark:lmw-text-gray-300 lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-border-gray-400 dark:hover:lmw-border-gray-500 hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 lmw-transition-all lmw-duration-200 lmw-cursor-pointer lmw-select-none lmw-whitespace-nowrap focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 active:lmw-scale-95"
            aria-label={`Switch to ${currentView === 'map' ? 'table' : 'map'} view`}
          >
            {currentView === 'map' ? (
              <>
                <svg className="lmw-w-4 lmw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Table</span>
              </>
            ) : (
              <>
                <svg className="lmw-w-4 lmw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Map</span>
              </>
            )}
          </button>

          {/* View Switcher Toggle - Desktop: dual button design */}
          <div className="lmw-hidden sm:lmw-flex lmw-items-center">
            <button
              onClick={() => setCurrentView('map')}
              className={`lmw-flex lmw-items-center lmw-gap-1.5 lmw-px-3 lmw-py-1.5 lmw-text-sm lmw-font-medium lmw-rounded-l-full lmw-border-2 lmw-border-r lmw-transition-all lmw-duration-200 lmw-cursor-pointer lmw-select-none focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 ${
                currentView === 'map'
                  ? 'lmw-bg-primary lmw-text-white lmw-border-primary hover:lmw-bg-blue-600 hover:lmw-border-blue-600'
                  : 'lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-600 dark:lmw-text-gray-400 lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-text-gray-900 dark:hover:lmw-text-gray-200 hover:lmw-border-gray-400 dark:hover:lmw-border-gray-500'
              }`}
              aria-label="Map view"
            >
              <svg className="lmw-w-4 lmw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Map</span>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`lmw-flex lmw-items-center lmw-gap-1.5 lmw-px-3 lmw-py-1.5 lmw-text-sm lmw-font-medium lmw-rounded-r-full lmw-border-2 lmw-border-l-0 lmw-transition-all lmw-duration-200 lmw-cursor-pointer lmw-select-none focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 ${
                currentView === 'table'
                  ? 'lmw-bg-primary lmw-text-white lmw-border-primary hover:lmw-bg-blue-600 hover:lmw-border-blue-600'
                  : 'lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-600 dark:lmw-text-gray-400 lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-text-gray-900 dark:hover:lmw-text-gray-200 hover:lmw-border-gray-400 dark:hover:lmw-border-gray-500'
              }`}
              aria-label="Table view"
            >
              <svg className="lmw-w-4 lmw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Table</span>
            </button>
          </div>

          {/* Separator */}
          <div className="lmw-h-6 lmw-w-px lmw-bg-gray-300 dark:lmw-bg-gray-600"></div>
        </div>

        {/* Scrollable Section: Clear All + Category Chips */}
        <div className="lmw-flex-1 lmw-overflow-x-auto lmw-flex lmw-items-center lmw-gap-2 lmw-min-w-0">
          {/* Clear All Button (prepended to categories) */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="lmw-flex lmw-items-center lmw-gap-1.5 lmw-px-2 sm:lmw-px-3 lmw-py-1.5 lmw-text-sm lmw-font-medium lmw-text-gray-600 dark:lmw-text-gray-400 lmw-bg-white dark:lmw-bg-gray-700 lmw-border-2 lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-full lmw-whitespace-nowrap hover:lmw-bg-red-50 dark:hover:lmw-bg-red-900/20 hover:lmw-text-red-600 dark:hover:lmw-text-red-400 hover:lmw-border-red-300 dark:hover:lmw-border-red-800 lmw-cursor-pointer lmw-transition-all lmw-duration-200 lmw-shrink-0 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 active:lmw-scale-95"
              aria-label="Clear all filters"
            >
              <svg className="lmw-w-4 lmw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="lmw-hidden sm:lmw-inline">Clear</span>
            </button>
          )}

          {/* Category Chips */}
          {categories.map((category) => {
            const isSelected = filters.selectedCategories.includes(category.value);
            return (
              <button
                key={category.value}
                onClick={() => handleCategoryToggle(category.value)}
                className={`lmw-flex lmw-items-center lmw-justify-center lmw-px-3 lmw-py-1.5 lmw-rounded-full lmw-text-sm lmw-font-medium lmw-transition-all lmw-duration-200 lmw-border-2 lmw-select-none lmw-cursor-pointer lmw-whitespace-nowrap lmw-shrink-0 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 ${
                  isSelected
                    ? `${category.color} lmw-border-current hover:lmw-opacity-90 active:lmw-scale-95`
                    : 'lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-700 dark:lmw-text-gray-300 lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-border-gray-400 dark:hover:lmw-border-gray-500 hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 active:lmw-scale-95'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance Slider - Only show when geolocation is enabled */}
      {filters.distanceFilter.enabled && filters.distanceFilter.userLocation && (
        <div className="lmw-flex lmw-items-center lmw-gap-3 lmw-pt-1">
          <span className="lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400 lmw-whitespace-nowrap">
            Within {filters.distanceFilter.maxDistance} mi
          </span>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={filters.distanceFilter.maxDistance}
            onChange={handleDistanceChange}
            className="lmw-flex-1 lmw-h-2 lmw-bg-gray-200 dark:lmw-bg-gray-700 lmw-rounded-lg lmw-appearance-none lmw-cursor-pointer slider"
          />
        </div>
      )}
    </div>
  );
};
