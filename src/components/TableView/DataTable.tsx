/**
 * DataTable component - Table view with pagination and expandable rows
 */

import React, { useState } from 'react';
import type { Location } from '../../types';
import { useWidgetState, useStore } from '../../contexts/StoreContext';
import { ImageGallery, CustomFields } from '../shared';

export const DataTable: React.FC = () => {
  const {
    filteredLocations,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setSelectedLocation,
    selectedLocationId,
  } = useWidgetState((state) => ({
    filteredLocations: state.filteredLocations,
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    setCurrentPage: state.setCurrentPage,
    setSelectedLocation: state.setSelectedLocation,
    selectedLocationId: state.selectedLocationId,
  }));

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

  const handleRowClick = (location: Location) => {
    // Toggle expansion
    if (expandedRowId === location.id) {
      setExpandedRowId(null);
      setSelectedLocation(null);
    } else {
      setExpandedRowId(location.id);
      // Pass 'table-click' context to trigger programmatic navigation to marker
      setSelectedLocation(location.id, 'table-click');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRowId(null); // Collapse any expanded row
  };

  if (filteredLocations.length === 0) {
    return (
      <div className="lmw-flex lmw-items-center lmw-justify-center lmw-h-full lmw-p-8">
        <div className="lmw-text-center">
          <div className="lmw-text-gray-400 lmw-mb-4">
            <svg className="lmw-mx-auto lmw-w-16 lmw-h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="lmw-text-lg lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
            No Locations Found
          </h3>
          <p className="lmw-text-gray-600 dark:lmw-text-gray-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lmw-flex lmw-flex-col lmw-h-full lmw-overflow-hidden">
      {/* Table */}
      <div className="lmw-flex-1 lmw-overflow-y-auto lmw-overflow-x-auto scrollbar-thin">
        <table className="lmw-w-full lmw-border-collapse">
          <thead className="lmw-bg-gray-50 dark:lmw-bg-gray-800 lmw-sticky lmw-top-0 lmw-z-10">
            <tr>
              <th className="lmw-px-4 lmw-py-3 lmw-text-left lmw-text-xs lmw-font-semibold lmw-text-gray-700 dark:lmw-text-gray-300 lmw-uppercase lmw-tracking-wider">
                Location
              </th>
              <th className="lmw-px-4 lmw-py-3 lmw-text-left lmw-text-xs lmw-font-semibold lmw-text-gray-700 dark:lmw-text-gray-300 lmw-uppercase lmw-tracking-wider lmw-hidden md:lmw-table-cell">
                Category
              </th>
              <th className="lmw-px-4 lmw-py-3 lmw-text-left lmw-text-xs lmw-font-semibold lmw-text-gray-700 dark:lmw-text-gray-300 lmw-uppercase lmw-tracking-wider lmw-hidden lg:lmw-table-cell">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="lmw-bg-white dark:lmw-bg-gray-900 lmw-divide-y lmw-divide-gray-200 dark:lmw-divide-gray-700">
            {paginatedLocations.map((location) => (
              <TableRow
                key={location.id}
                location={location}
                isExpanded={expandedRowId === location.id}
                isSelected={selectedLocationId === location.id}
                onClick={() => handleRowClick(location)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLocations.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

/**
 * TableRow component - Individual row with expansion
 */
interface TableRowProps {
  location: Location;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ location, isExpanded, isSelected, onClick }) => {
  const store = useStore();
  const getCategoryColor = (category: string) => {
    const { categories } = store.getState();
    const categoryMeta = categories.find(c => c.name.toLowerCase() === category.toLowerCase());

    if (categoryMeta) {
      const { bg, text, darkBg, darkText } = categoryMeta.style;
      return `${bg} ${text} ${darkBg} ${darkText}`;
    }

    // Fallback to gray if category not found
    return 'lmw-bg-gray-100 lmw-text-gray-800 dark:lmw-bg-gray-700 dark:lmw-text-gray-200';
  };

  return (
    <>
      <tr
        onClick={onClick}
        className={`
          lmw-cursor-pointer lmw-transition-colors
          ${isSelected
            ? 'lmw-bg-blue-50 dark:lmw-bg-blue-900/20'
            : 'hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-800'
          }
        `}
      >
        {/* Location Name */}
        <td className="lmw-px-4 lmw-py-4">
          <div className="lmw-flex lmw-items-center lmw-gap-2">
            <div className="lmw-flex-1">
              <div className="lmw-font-medium lmw-text-gray-900 dark:lmw-text-gray-100">
                {location.name}
              </div>
              {/* Mobile: Show category badge inline */}
              <div className="md:lmw-hidden lmw-mt-1">
                <span className={`lmw-inline-block lmw-px-2 lmw-py-0.5 lmw-text-xs lmw-font-semibold lmw-rounded ${getCategoryColor(location.category)}`}>
                  {location.category}
                </span>
              </div>
            </div>
            {/* Expand/Collapse icon */}
            <svg
              className={`lmw-w-4 lmw-h-4 lmw-flex-shrink-0 lmw-text-gray-400 lmw-transition-transform ${isExpanded ? 'lmw-rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </td>

        {/* Category - Hidden on mobile */}
        <td className="lmw-px-4 lmw-py-4 lmw-hidden md:lmw-table-cell">
          <span className={`lmw-inline-block lmw-px-2 lmw-py-1 lmw-text-xs lmw-font-semibold lmw-rounded ${getCategoryColor(location.category)}`}>
            {location.category}
          </span>
        </td>

        {/* Address - Hidden on mobile/tablet */}
        <td className="lmw-px-4 lmw-py-4 lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400 lmw-hidden lg:lmw-table-cell">
          {location.address.city}, {location.address.state}
        </td>
      </tr>

      {/* Expanded Row Details */}
      {isExpanded && (
        <tr className="lmw-bg-gray-50 dark:lmw-bg-gray-800">
          <td colSpan={3} className="lmw-px-4 lmw-py-4">
            <ExpandedRowDetails location={location} />
          </td>
        </tr>
      )}
    </>
  );
};

/**
 * ExpandedRowDetails component - Shows full location details
 */
const ExpandedRowDetails: React.FC<{ location: Location }> = ({ location }) => {
  return (
    <div className="lmw-grid lmw-grid-cols-1 md:lmw-grid-cols-2 lmw-gap-4 lmw-text-sm">
      {/* Images */}
      {location.images && location.images.length > 0 && (
        <div className="md:lmw-col-span-2">
          <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">Images</h4>
          <ImageGallery images={location.images} locationName={location.name} />
        </div>
      )}

      {/* Description */}
      {location.description && (
        <div className="md:lmw-col-span-2">
          <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-1">Description</h4>
          <p className="lmw-text-gray-600 dark:lmw-text-gray-400">{location.description}</p>
        </div>
      )}

      {/* Address */}
      <div>
        <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-1">Address</h4>
        <div className="lmw-text-gray-600 dark:lmw-text-gray-400">
          {location.address.street && <div>{location.address.street}</div>}
          <div>
            {location.address.city}, {location.address.state} {location.address.zip}
          </div>
        </div>
      </div>

      {/* Contact */}
      {location.contact && (
        <div>
          <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-1">Contact</h4>
          <div className="lmw-space-y-1 lmw-text-gray-600 dark:lmw-text-gray-400">
            {location.contact.phone && (
              <div>
                <a href={`tel:${location.contact.phone}`} className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors">
                  📞 {location.contact.phone}
                </a>
              </div>
            )}
            {location.contact.email && (
              <div>
                <a href={`mailto:${location.contact.email}`} className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors">
                  ✉️ {location.contact.email}
                </a>
              </div>
            )}
            {location.contact.website && (
              <div>
                <a href={location.contact.website} target="_blank" rel="noopener noreferrer" className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors">
                  🌐 Website
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hours */}
      {location.hours && (
        <div>
          <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-1">Hours</h4>
          <p className="lmw-text-gray-600 dark:lmw-text-gray-400">{location.hours}</p>
        </div>
      )}

      {/* Custom Fields */}
      {location.customFields && Object.keys(location.customFields).length > 0 && (
        <div className="md:lmw-col-span-2">
          <CustomFields customFields={location.customFields} location={location} />
        </div>
      )}

      {/* View Details Button */}
      {location.url && (
        <div className="md:lmw-col-span-2">
          <a
            href={location.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lmw-inline-block lmw-px-4 lmw-py-2 lmw-bg-primary lmw-text-white lmw-rounded-md hover:lmw-bg-blue-600 active:lmw-bg-blue-700 lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
          >
            View Full Details →
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Pagination component
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;

  // Calculate page range
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Calculate current range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="lmw-flex lmw-flex-col sm:lmw-flex-row lmw-items-center lmw-justify-between lmw-gap-3 lmw-px-4 lmw-py-3 lmw-bg-white dark:lmw-bg-gray-900 lmw-border-t lmw-border-gray-200 dark:lmw-border-gray-700">
      {/* Results Summary */}
      <div className="lmw-text-sm lmw-text-gray-600 dark:lmw-text-gray-400">
        Showing <span className="lmw-font-medium lmw-text-gray-900 dark:lmw-text-gray-100">{startItem}-{endItem}</span> of <span className="lmw-font-medium lmw-text-gray-900 dark:lmw-text-gray-100">{totalItems}</span> location{totalItems !== 1 ? 's' : ''}
      </div>

      {/* Pagination Controls */}
      <div className="lmw-flex lmw-items-center lmw-gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="lmw-px-3 lmw-py-1 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-800 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-700 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-600 disabled:lmw-opacity-50 disabled:lmw-cursor-not-allowed lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="lmw-flex lmw-gap-1">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="lmw-px-3 lmw-py-1 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-800 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-700 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-600 lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
            >
              1
            </button>
            {startPage > 2 && <span className="lmw-px-2 lmw-py-1 lmw-text-gray-500 dark:lmw-text-gray-400">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              lmw-px-3 lmw-py-1 lmw-text-sm lmw-font-medium lmw-rounded-md lmw-cursor-pointer lmw-transition-all lmw-duration-200
              focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2
              ${page === currentPage
                ? 'lmw-bg-primary lmw-text-white hover:lmw-bg-blue-600 active:lmw-bg-blue-700'
                : 'lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-800 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-700 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-600'
              }
            `}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="lmw-px-2 lmw-py-1 lmw-text-gray-500 dark:lmw-text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="lmw-px-3 lmw-py-1 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-800 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-700 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-600 lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="lmw-px-3 lmw-py-1 lmw-text-sm lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300 lmw-bg-white dark:lmw-bg-gray-800 lmw-border lmw-border-gray-300 dark:lmw-border-gray-600 lmw-rounded-md hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-700 active:lmw-bg-gray-100 dark:active:lmw-bg-gray-600 disabled:lmw-opacity-50 disabled:lmw-cursor-not-allowed lmw-cursor-pointer lmw-transition-all lmw-duration-200 focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-offset-2"
      >
        Next
      </button>
      </div>
    </div>
  );
};
