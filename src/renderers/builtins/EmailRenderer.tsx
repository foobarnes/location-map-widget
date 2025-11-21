/**
 * Email Renderer
 *
 * Renders email addresses as clickable mailto: links.
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';

/**
 * EmailRenderer component
 * Renders email addresses as clickable mailto: links
 */
export const EmailRenderer: React.FC<RendererProps> = ({ value }) => {
  const email = String(value).trim();

  return (
    <a
      href={`mailto:${email}`}
      className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors"
    >
      {email}
    </a>
  );
};

/**
 * Email renderer function for registry
 */
export const emailRendererFn: FieldRendererFn = (value, fieldName, location) => {
  return <EmailRenderer value={value} fieldName={fieldName} location={location} />;
};
