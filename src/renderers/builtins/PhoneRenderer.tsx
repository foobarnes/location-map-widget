/**
 * Phone Renderer
 *
 * Renders phone numbers as clickable tel: links.
 */

import React from 'react';
import type { FieldRendererFn, RendererProps } from '../types';

/**
 * PhoneRenderer component
 * Renders phone numbers as clickable tel: links
 */
export const PhoneRenderer: React.FC<RendererProps> = ({ value }) => {
  const phone = String(value).trim();
  const telHref = formatPhoneForTel(phone);

  return (
    <a
      href={`tel:${telHref}`}
      className="lmw-text-blue-600 dark:lmw-text-blue-400 hover:lmw-underline lmw-cursor-pointer lmw-transition-colors"
    >
      {phone}
    </a>
  );
};

/**
 * Format phone number for tel: protocol
 * Strips non-numeric characters except leading +
 */
function formatPhoneForTel(phone: string): string {
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Phone renderer function for registry
 */
export const phoneRendererFn: FieldRendererFn = (value, fieldName, location) => {
  return <PhoneRenderer value={value} fieldName={fieldName} location={location} />;
};
