/**
 * URL Renderer
 *
 * Renders URL values as clickable hyperlinks with external link handling.
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';

/**
 * UrlRenderer component
 * Renders URLs as clickable links that open in new tabs
 * The field name is used as the link text
 */
export const UrlRenderer: React.FC<RendererProps> = ({ value, fieldName }) => {
  const urlString = String(value);
  const href = normalizeUrl(urlString);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors"
    >
      {fieldName}
    </a>
  );
};

/**
 * Normalize a URL string to ensure it has a protocol
 */
function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https:// by default
  return `https://${trimmed}`;
}

/**
 * URL renderer function for registry
 */
export const urlRendererFn: FieldRendererFn = (value, fieldName, location) => {
  return <UrlRenderer value={value} fieldName={fieldName} location={location} />;
};
