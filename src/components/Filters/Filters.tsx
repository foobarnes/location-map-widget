/**
 * Filters component - Compact search, category, and distance filtering
 */

import React, { useState } from 'react';
import { useWidgetStore } from '../../stores/widgetStore';
import { getUserLocation } from '../../utils/distance';
import type { LocationCategory } from '../../types';

export const Filters: React.FC = () => {
  const { filters, setFilters, setSelectedLocation } = useWidgetStore();
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
  const { categories: categoryMetadata } = useWidgetStore();

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
            <svg className="lmw-h-4 lmw-w-4 lmw-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search locations..."
            className="lmw-block lmw-w-full lmw-pl-9 lmw-pr-3 lmw-py-2 lmw-text-sm lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md lmw-leading-5 lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-900 dark:lmw-text-gray-100 placeholder:lmw-text-gray-500 dark:placeholder:lmw-text-gray-400 focus:lmw-outline-none focus:lmw-ring-2 focus:lmw-ring-primary focus:lmw-border-transparent"
          />
        </div>

        {/* Find Near Me / Clear Distance Button */}
        {!filters.distanceFilter.enabled ? (
          <button
            onClick={handleFindNearMe}
            disabled={isLoadingLocation}
            className="lmw-flex lmw-items-center lmw-gap-1.5 lmw-px-4 lmw-py-2 lmw-text-sm lmw-font-medium lmw-text-white lmw-bg-primary lmw-rounded-md hover:lmw-bg-blue-600 active:lmw-bg-blue-700 disabled:lmw-opacity-50 disabled:lmw-cursor-not-allowed lmw-cursor-pointer lmw-transition-all lmw-duration-200 lmw-whitespace-nowrap focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
          >
            {isLoadingLocation ? (
              <>
                <svg className="lmw-animate-spin lmw-h-4 lmw-w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="lmw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="lmw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Finding...</span>
              </>
            ) : (
              <>
                <svg className="lmw-h-4 lmw-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Find Near Me</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleClearDistance}
            className="lmw-px-4 lmw-py-2 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-700 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-500 lmw-cursor-pointer lmw-transition-all lmw-duration-200 lmw-whitespace-nowrap focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
          >
            Clear Distance
          </button>
        )}
      </div>

      {/* Row 2: Category Chips + Clear All Button */}
      <div className="lmw-flex lmw-flex-nowrap lmw-overflow-x-auto lmw-items-center lmw-gap-2 lmw-pb-1">
        {/* Category Chips */}
        {categories.map((category) => {
          const isSelected = filters.selectedCategories.includes(category.value);
          return (
            <button
              key={category.value}
              onClick={() => handleCategoryToggle(category.value)}
              className={`lmw-px-3 lmw-py-1.5 lmw-rounded-full lmw-text-sm lmw-font-medium lmw-transition-all lmw-duration-200 lmw-border-2 lmw-select-none lmw-cursor-pointer focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2 ${
                isSelected
                  ? `${category.color} lmw-border-current hover:lmw-opacity-90 active:lmw-scale-95`
                  : 'lmw-bg-white dark:lmw-bg-gray-700 lmw-text-gray-700 dark:lmw-text-gray-300 lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-border-gray-400 dark:hover:lmw-border-gray-500 hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 active:lmw-scale-95'
              }`}
            >
              {category.label}
            </button>
          );
        })}

        {/* Clear All Button (inline with chips) */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="lmw-ml-auto lmw-px-3 lmw-py-1.5 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-700 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-600 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-500 lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
          >
            Clear All
          </button>
        )}
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
