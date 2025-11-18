/**
 * Text Renderer
 *
 * Default fallback renderer that displays values as plain text.
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';

/**
 * TextRenderer component
 * Renders values as plain text with proper string conversion
 */
export const TextRenderer: React.FC<RendererProps> = ({ value }) => {
  const displayValue = formatTextValue(value);
  return <span>{displayValue}</span>;
};

/**
 * Format a value for text display
 */
function formatTextValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

/**
 * Text renderer function for registry
 */
export const textRendererFn: FieldRendererFn = (value) => {
  return <TextRenderer value={value} fieldName="" location={{} as never} />;
};
