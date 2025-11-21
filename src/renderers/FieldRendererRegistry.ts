/**
 * Field Renderer Registry
 *
 * Core registry class that manages field renderers and handles
 * both explicit configuration and auto-detection of field types.
 */

import type { Location } from '../types';
import type {
  BuiltInRendererType,
  FieldRendererConfigValue,
  FieldRendererFn,
  FieldRendererRegistryOptions,
} from './types';
import { detectFieldType, getStandardFieldRenderer } from './detection';
import {
  textRendererFn,
  urlRendererFn,
  emailRendererFn,
  phoneRendererFn,
  arrayRendererFn,
  booleanRendererFn,
} from './builtins';

/**
 * Registry for field renderers
 *
 * Manages the mapping between field names/values and their appropriate renderers.
 * Supports both explicit configuration and automatic type detection.
 */
export class FieldRendererRegistry {
  private explicitRenderers: Map<string, FieldRendererConfigValue>;
  private autoDetectEnabled: boolean;

  /** Map of built-in type names to their renderer functions */
  private readonly builtinMap: Record<BuiltInRendererType, FieldRendererFn> = {
    text: textRendererFn,
    url: urlRendererFn,
    email: emailRendererFn,
    phone: phoneRendererFn,
    array: arrayRendererFn,
    boolean: booleanRendererFn,
  };

  /**
   * Create a new FieldRendererRegistry
   *
   * @param options - Registry configuration options
   */
  constructor(options: FieldRendererRegistryOptions = {}) {
    this.explicitRenderers = new Map(
      Object.entries(options.renderers ?? {}).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    );
    this.autoDetectEnabled = options.autoDetect ?? true;
  }

  /**
   * Get the appropriate renderer function for a field
   *
   * Resolution order:
   * 1. Explicit configuration (field name match)
   * 2. Standard field mapping (website, email, phone)
   * 3. Auto-detection (if enabled)
   * 4. Default text renderer
   *
   * @param fieldName - The name/key of the field
   * @param value - The field value
   * @returns The renderer function to use
   */
  getRenderer(
    fieldName: string,
    value: string | number | boolean
  ): FieldRendererFn {
    const normalizedName = fieldName.toLowerCase();

    // 1. Check explicit configuration
    const explicit = this.explicitRenderers.get(normalizedName);
    if (explicit) {
      return this.resolveRenderer(explicit);
    }

    // 2. Check standard field mappings
    const standardType = getStandardFieldRenderer(fieldName);
    if (standardType) {
      return this.builtinMap[standardType];
    }

    // 3. Try auto-detection if enabled
    if (this.autoDetectEnabled) {
      const detected = detectFieldType(value);
      if (detected) {
        return this.builtinMap[detected.type];
      }
    }

    // 4. Default to text renderer
    return this.builtinMap.text;
  }

  /**
   * Render a field value using the appropriate renderer
   *
   * @param fieldName - The name/key of the field
   * @param value - The field value
   * @param location - The full location object for context
   * @returns React node to render
   */
  render(
    fieldName: string,
    value: string | number | boolean,
    location: Location
  ): React.ReactNode {
    const renderer = this.getRenderer(fieldName, value);
    return renderer(value, fieldName, location);
  }

  /**
   * Check if a field has an explicit renderer configured
   */
  hasExplicitRenderer(fieldName: string): boolean {
    return this.explicitRenderers.has(fieldName.toLowerCase());
  }

  /**
   * Register a new renderer for a field name
   * Useful for dynamic registration after initialization
   */
  registerRenderer(
    fieldName: string,
    renderer: FieldRendererConfigValue
  ): void {
    this.explicitRenderers.set(fieldName.toLowerCase(), renderer);
  }

  /**
   * Remove a registered renderer
   */
  unregisterRenderer(fieldName: string): void {
    this.explicitRenderers.delete(fieldName.toLowerCase());
  }

  /**
   * Get all explicitly registered field names
   */
  getRegisteredFields(): string[] {
    return Array.from(this.explicitRenderers.keys());
  }

  /**
   * Check if auto-detection is enabled
   */
  isAutoDetectEnabled(): boolean {
    return this.autoDetectEnabled;
  }

  /**
   * Enable or disable auto-detection
   */
  setAutoDetect(enabled: boolean): void {
    this.autoDetectEnabled = enabled;
  }

  /**
   * Get the renderer type that will be used for a field
   * Useful for conditional rendering logic
   */
  getRendererType(
    fieldName: string,
    value: string | number | boolean
  ): BuiltInRendererType {
    const normalizedName = fieldName.toLowerCase();

    // Check explicit configuration
    const explicit = this.explicitRenderers.get(normalizedName);
    if (explicit) {
      if (typeof explicit === 'string') {
        return explicit;
      }
      // Custom function - return 'text' as fallback type
      return 'text';
    }

    // Check standard field mappings
    const standardType = getStandardFieldRenderer(fieldName);
    if (standardType) {
      return standardType;
    }

    // Try auto-detection if enabled
    if (this.autoDetectEnabled) {
      const detected = detectFieldType(value);
      if (detected) {
        return detected.type;
      }
    }

    // Default to text renderer
    return 'text';
  }

  /**
   * Resolve a config value to a renderer function
   */
  private resolveRenderer(config: FieldRendererConfigValue): FieldRendererFn {
    if (typeof config === 'function') {
      return config;
    }

    // It's a built-in type name
    const builtin = this.builtinMap[config];
    if (!builtin) {
      console.warn(
        `Unknown renderer type "${config}", falling back to text renderer`
      );
      return this.builtinMap.text;
    }

    return builtin;
  }
}

/**
 * Create a new FieldRendererRegistry with the given options
 *
 * Factory function for creating registry instances.
 *
 * @param options - Registry configuration options
 * @returns New FieldRendererRegistry instance
 */
export function createFieldRendererRegistry(
  options?: FieldRendererRegistryOptions
): FieldRendererRegistry {
  return new FieldRendererRegistry(options);
}
