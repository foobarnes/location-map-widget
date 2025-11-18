/**
 * Field Renderer Types
 *
 * Type definitions for the extensible field renderer system.
 * Enables custom rendering of field values based on their content or explicit configuration.
 */

import type { Location } from '../types';

/**
 * Built-in renderer type identifiers
 */
export type BuiltInRendererType =
  | 'text'
  | 'url'
  | 'email'
  | 'phone'
  | 'array'
  | 'boolean';

/**
 * Field renderer function signature
 *
 * @param value - The field value to render
 * @param fieldName - The name/key of the field
 * @param location - The full location object for context
 * @returns React node to render
 */
export type FieldRendererFn = (
  value: string | number | boolean,
  fieldName: string,
  location: Location
) => React.ReactNode;

/**
 * Configuration value for a field renderer
 * Can be a built-in type name or a custom renderer function
 */
export type FieldRendererConfigValue = BuiltInRendererType | FieldRendererFn;

/**
 * User-facing field renderer configuration
 * Maps field names to their renderer type or custom function
 */
export interface FieldRenderersConfig {
  [fieldName: string]: FieldRendererConfigValue;
}

/**
 * Result of auto-detecting a field's type
 */
export interface DetectionResult {
  type: BuiltInRendererType;
  confidence: number; // 0.0 to 1.0
}

/**
 * Options for creating a FieldRendererRegistry
 */
export interface FieldRendererRegistryOptions {
  /** Explicit field name to renderer mappings */
  renderers?: FieldRenderersConfig;
  /** Enable auto-detection of field types (default: true) */
  autoDetect?: boolean;
}

/**
 * Built-in renderer component props
 */
export interface RendererProps {
  value: string | number | boolean;
  fieldName: string;
  location: Location;
}
