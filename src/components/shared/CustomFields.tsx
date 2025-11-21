/**
 * CustomFields component - Display custom key-value fields
 * Uses the field renderer registry for extensible field rendering
 */

import React from 'react';
import type { Location } from '../../types';
import { useWidgetState } from '../../contexts/StoreContext';

interface CustomFieldsProps {
  customFields: Record<string, string | number | boolean>;
  location: Location;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  customFields,
  location,
}) => {
  const { fieldRendererRegistry } = useWidgetState((state) => ({
    fieldRendererRegistry: state.fieldRendererRegistry,
  }));

  if (!customFields || Object.keys(customFields).length === 0) {
    return null;
  }

  /**
   * Format field key for display
   * Examples:
   * - rental_price → Rental Price
   * - bike_types_available → Bike Types Available
   * - wheelchairAccessible → Wheelchair Accessible
   */
  const formatKey = (key: string): string => {
    return key
      // Split on underscores or camelCase boundaries
      .replace(/([A-Z])/g, ' $1') // Add space before capitals (camelCase)
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim()
      // Capitalize first letter of each word
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Format field value for display (fallback when no registry)
   */
  const formatValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  /**
   * Render a field value using the registry or fallback
   */
  const renderValue = (
    key: string,
    value: string | number | boolean
  ): React.ReactNode => {
    if (fieldRendererRegistry) {
      return fieldRendererRegistry.render(key, value, location);
    }
    return formatValue(value);
  };

  return (
    <div>
      <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
        Additional Information
      </h4>
      <div className="lmw-space-y-1 lmw-text-sm">
        {Object.entries(customFields).map(([key, value]) => {
          // Check if this field is a URL to determine rendering style
          const isUrlField =
            fieldRendererRegistry?.getRendererType(key, value) === 'url';

          // For URL fields, only show the hyperlink (no key label)
          if (isUrlField) {
            return (
              <div
                key={key}
                className="lmw-flex lmw-items-start lmw-text-gray-600 dark:lmw-text-gray-400"
              >
                <span className="lmw-mr-2 lmw-flex-shrink-0">•</span>
                <span>{renderValue(key, value)}</span>
              </div>
            );
          }

          // For other fields, show key and value
          return (
            <div
              key={key}
              className="lmw-flex lmw-items-start lmw-text-gray-600 dark:lmw-text-gray-400"
            >
              <span className="lmw-mr-2 lmw-flex-shrink-0">•</span>
              <span>
                <span className="lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300">
                  {formatKey(key)}:
                </span>{' '}
                {renderValue(key, value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
