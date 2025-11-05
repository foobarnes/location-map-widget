/**
 * ResultsSummary component - Displays filtered/total location count
 */

import React from 'react';
import { useWidgetState } from '../../contexts/StoreContext';

export const ResultsSummary: React.FC = () => {
  const { locations, filteredLocations, filters } = useWidgetState((state) => ({
    locations: state.locations,
    filteredLocations: state.filteredLocations,
    filters: state.filters,
  }));

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchQuery.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.distanceFilter.enabled;

  const filteredCount = filteredLocations.length;
  const totalCount = locations.length;

  return (
    <div className="lmw-px-4 lmw-py-2 lmw-border-b lmw-border-gray-200 dark:lmw-border-gray-700 lmw-bg-white dark:lmw-bg-gray-900">
      <p className="lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400 lmw-text-right">
        {hasActiveFilters && filteredCount !== totalCount ? (
          <>
            <span className="lmw-font-medium lmw-text-gray-900 dark:lmw-text-gray-100">
              {filteredCount}
            </span>
            {' of '}
            <span className="lmw-text-gray-500 dark:lmw-text-gray-500">
              {totalCount}
            </span>
            {' locations'}
          </>
        ) : (
          <>
            <span className="lmw-font-medium lmw-text-gray-900 dark:lmw-text-gray-100">
              {totalCount}
            </span>
            {' location'}
            {totalCount !== 1 ? 's' : ''}
          </>
        )}
      </p>
    </div>
  );
};
