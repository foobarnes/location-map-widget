/**
 * Array Renderer
 *
 * Renders array values as bulleted lists.
 * Handles string representations of arrays from Google Sheets.
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';
import { parseArrayString } from '../detection';

/**
 * ArrayRenderer component
 * Renders arrays as bulleted lists
 */
export const ArrayRenderer: React.FC<RendererProps> = ({ value }) => {
  const items = getArrayItems(value);

  if (items.length === 0) {
    return <span>-</span>;
  }

  if (items.length === 1) {
    return <span>{items[0]}</span>;
  }

  return (
    <ul className="lmw-list-disc lmw-list-inside lmw-space-y-0.5 lmw-m-0 lmw-p-0">
      {items.map((item, index) => (
        <li key={index} className="lmw-text-sm">
          {item}
        </li>
      ))}
    </ul>
  );
};

/**
 * Get array items from a value
 * Handles both actual arrays and string representations
 */
function getArrayItems(value: string | number | boolean): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const strValue = String(value).trim();

  if (!strValue) {
    return [];
  }

  return parseArrayString(strValue);
}

/**
 * Array renderer function for registry
 */
export const arrayRendererFn: FieldRendererFn = (value, fieldName, location) => {
  return <ArrayRenderer value={value} fieldName={fieldName} location={location} />;
};
