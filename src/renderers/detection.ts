/**
 * Field Type Detection
 *
 * Auto-detection logic for determining field types based on value content.
 * Used by FieldRendererRegistry when autoDetect is enabled.
 */

import type { BuiltInRendererType, DetectionResult } from './types';

/**
 * Detect the type of a field value based on its content
 *
 * @param value - The value to analyze
 * @returns Detection result with type and confidence, or null for default text
 */
export function detectFieldType(
  value: string | number | boolean
): DetectionResult | null {
  // Boolean values - highest confidence
  if (typeof value === 'boolean') {
    return { type: 'boolean', confidence: 1.0 };
  }

  // Convert to string for pattern matching
  const strValue = String(value).trim();

  // Empty values default to text
  if (!strValue) {
    return null;
  }

  // URL patterns - check first as they're most distinctive
  if (isUrl(strValue)) {
    return { type: 'url', confidence: 0.95 };
  }

  // Email pattern
  if (isEmail(strValue)) {
    return { type: 'email', confidence: 0.9 };
  }

  // Array patterns - JSON-like or comma-separated
  if (isArrayString(strValue)) {
    return { type: 'array', confidence: 0.85 };
  }

  // Phone pattern - must check after array to avoid false positives
  if (isPhone(strValue)) {
    return { type: 'phone', confidence: 0.7 };
  }

  // Boolean-like strings
  if (isBooleanString(strValue)) {
    return { type: 'boolean', confidence: 0.8 };
  }

  // Default to text
  return null;
}

/**
 * Check if a string looks like a URL
 */
function isUrl(value: string): boolean {
  // Explicit protocol
  if (/^https?:\/\//i.test(value)) {
    return true;
  }

  // Common URL patterns without protocol
  if (/^www\./i.test(value)) {
    return true;
  }

  // Domain-like pattern with TLD
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+/i.test(value)) {
    // Exclude email addresses
    if (value.includes('@')) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Check if a string looks like an email address
 */
function isEmail(value: string): boolean {
  // Standard email pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Check if a string looks like a phone number
 */
function isPhone(value: string): boolean {
  // Must contain enough digits (at least 7 for local, up to 15 for international)
  const digitCount = (value.match(/\d/g) || []).length;
  if (digitCount < 7 || digitCount > 15) {
    return false;
  }

  // Should primarily be digits, spaces, dashes, parens, dots, plus
  // At least 60% digits
  if (digitCount / value.length < 0.5) {
    return false;
  }

  // Common phone patterns
  return /^[\d\s\-\(\)\+\.]+$/.test(value);
}

/**
 * Check if a string looks like an array
 */
function isArrayString(value: string): boolean {
  // JSON-like array with quotes: ['a', 'b'] or ["a", "b"]
  if (/^\[['"].*['"]\]$/.test(value)) {
    return true;
  }

  // Comma-separated list (at least 2 items)
  // Must have at least one comma and items on both sides
  if (/^[^,]+,\s*[^,]+/.test(value)) {
    // Avoid matching things like "123,456" (numbers with commas)
    // or "City, State" (single location)
    const parts = value.split(',').map((s) => s.trim());
    if (parts.length >= 2 && parts.every((p) => p.length > 0)) {
      // If all parts look like numbers, it's probably not a list
      const allNumbers = parts.every((p) => /^\d+$/.test(p));
      if (!allNumbers) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a string represents a boolean value
 */
function isBooleanString(value: string): boolean {
  const lower = value.toLowerCase();
  return ['true', 'false', 'yes', 'no', '1', '0'].includes(lower);
}

/**
 * Parse a string representation of an array into actual array
 *
 * Handles formats:
 * - ['item1', 'item2']
 * - ["item1", "item2"]
 * - item1, item2, item3
 *
 * @param value - String to parse
 * @returns Array of string items
 */
export function parseArrayString(value: string): string[] {
  const trimmed = value.trim();

  // Try JSON-like array format first
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      // Try standard JSON parse
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim());
      }
    } catch {
      // Try with single quotes converted to double quotes
      try {
        const converted = trimmed.replace(/'/g, '"');
        const parsed = JSON.parse(converted);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim());
        }
      } catch {
        // Fall through to comma-separated parsing
      }
    }
  }

  // Fall back to comma-separated
  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Convert a boolean-like string to actual boolean
 */
export function parseBooleanString(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return ['true', 'yes', '1'].includes(lower);
}

/**
 * Get the built-in renderer type for a given field name
 * Used for standard contact fields
 */
export function getStandardFieldRenderer(
  fieldName: string
): BuiltInRendererType | null {
  const normalizedName = fieldName.toLowerCase().replace(/[_\s-]/g, '');

  // Map standard field names to renderer types
  const standardMappings: Record<string, BuiltInRendererType> = {
    // URL fields
    website: 'url',
    url: 'url',
    link: 'url',
    homepage: 'url',

    // Email fields
    email: 'email',
    mail: 'email',
    emailaddress: 'email',

    // Phone fields
    phone: 'phone',
    telephone: 'phone',
    tel: 'phone',
    mobile: 'phone',
    cell: 'phone',
    fax: 'phone',
  };

  return standardMappings[normalizedName] || null;
}
