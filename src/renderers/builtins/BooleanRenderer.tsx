/**
 * Boolean Renderer
 *
 * Renders boolean values as "Yes"/"No" text.
 * Handles boolean-like strings (true, false, yes, no, 1, 0).
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';
import { parseBooleanString } from '../detection';

/**
 * BooleanRenderer component
 * Renders boolean values as Yes/No
 */
export const BooleanRenderer: React.FC<RendererProps> = ({ value }) => {
  const boolValue = getBooleanValue(value);
  const displayText = boolValue ? 'Yes' : 'No';

  return (
    <span
      className={
        boolValue
          ? 'lmw-text-green-600 dark:lmw-text-green-400'
          : 'lmw-text-gray-500 dark:lmw-text-gray-400'
      }
    >
      {displayText}
    </span>
  );
};

/**
 * Convert value to boolean
 */
function getBooleanValue(value: string | number | boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return parseBooleanString(value);
}

/**
 * Boolean renderer function for registry
 */
export const booleanRendererFn: FieldRendererFn = (value, fieldName, location) => {
  return <BooleanRenderer value={value} fieldName={fieldName} location={location} />;
};
