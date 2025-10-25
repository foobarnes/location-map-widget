/**
 * CustomFields component - Display custom key-value fields
 * Converts snake_case keys to Title Case for display
 */

import React from 'react';

interface CustomFieldsProps {
  customFields: Record<string, string | number | boolean>;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({ customFields }) => {
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Format field value for display
   */
  const formatValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div>
      <h4 className="lmw-font-semibold lmw-text-gray-900 dark:lmw-text-gray-100 lmw-mb-2">
        Additional Information
      </h4>
      <div className="lmw-space-y-1 lmw-text-sm">
        {Object.entries(customFields).map(([key, value]) => (
          <div
            key={key}
            className="lmw-flex lmw-items-start lmw-text-gray-600 dark:lmw-text-gray-400"
          >
            <span className="lmw-mr-2 lmw-flex-shrink-0">•</span>
            <span>
              <span className="lmw-font-medium lmw-text-gray-700 dark:lmw-text-gray-300">
                {formatKey(key)}:
              </span>{' '}
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
