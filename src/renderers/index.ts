/**
 * Field Renderer System
 *
 * Extensible field renderer system for customizing how field values are displayed.
 * Supports auto-detection of common field types (URLs, emails, arrays, etc.)
 * and allows explicit configuration and custom renderer functions.
 *
 * @example
 * ```typescript
 * import { createFieldRendererRegistry } from './renderers';
 *
 * // Create with auto-detection (default)
 * const registry = createFieldRendererRegistry();
 *
 * // Create with explicit configuration
 * const registry = createFieldRendererRegistry({
 *   renderers: {
 *     'company_website': 'url',
 *     'products': 'array',
 *     'status': (value) => <StatusBadge value={value} />
 *   },
 *   autoDetect: true
 * });
 *
 * // Render a field
 * const node = registry.render('website', 'https://example.com', location);
 * ```
 */

// Types
export type {
  BuiltInRendererType,
  FieldRendererFn,
  FieldRendererConfigValue,
  FieldRenderersConfig,
  DetectionResult,
  FieldRendererRegistryOptions,
  RendererProps,
} from './types';

// Registry
export {
  FieldRendererRegistry,
  createFieldRendererRegistry,
} from './FieldRendererRegistry';

// Detection utilities
export {
  detectFieldType,
  parseArrayString,
  parseBooleanString,
  getStandardFieldRenderer,
} from './detection';

// Built-in renderers
export {
  TextRenderer,
  textRendererFn,
  UrlRenderer,
  urlRendererFn,
  EmailRenderer,
  emailRendererFn,
  PhoneRenderer,
  phoneRendererFn,
  ArrayRenderer,
  arrayRendererFn,
  BooleanRenderer,
  booleanRendererFn,
} from './builtins';
