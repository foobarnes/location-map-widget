import type { Location, CategoryStyle, CategoryMetadata, CategoryConfig } from '../types';

/**
 * Default color palette with 8 diverse, accessible colors
 * All Tailwind classes are hardcoded to ensure JIT compiler can detect them
 */
const DEFAULT_PALETTE: readonly CategoryStyle[] = [
  // Blue
  {
    bg: 'lmw-bg-blue-100',
    text: 'lmw-text-blue-800',
    darkBg: 'dark:lmw-bg-blue-900',
    darkText: 'dark:lmw-text-blue-200',
    color: '#3B82F6',
  },
  // Green
  {
    bg: 'lmw-bg-green-100',
    text: 'lmw-text-green-800',
    darkBg: 'dark:lmw-bg-green-900',
    darkText: 'dark:lmw-text-green-200',
    color: '#10B981',
  },
  // Orange
  {
    bg: 'lmw-bg-orange-100',
    text: 'lmw-text-orange-800',
    darkBg: 'dark:lmw-bg-orange-900',
    darkText: 'dark:lmw-text-orange-200',
    color: '#F97316',
  },
  // Purple
  {
    bg: 'lmw-bg-purple-100',
    text: 'lmw-text-purple-800',
    darkBg: 'dark:lmw-bg-purple-900',
    darkText: 'dark:lmw-text-purple-200',
    color: '#A855F7',
  },
  // Pink
  {
    bg: 'lmw-bg-pink-100',
    text: 'lmw-text-pink-800',
    darkBg: 'dark:lmw-bg-pink-900',
    darkText: 'dark:lmw-text-pink-200',
    color: '#EC4899',
  },
  // Teal
  {
    bg: 'lmw-bg-teal-100',
    text: 'lmw-text-teal-800',
    darkBg: 'dark:lmw-bg-teal-900',
    darkText: 'dark:lmw-text-teal-200',
    color: '#14B8A6',
  },
  // Indigo
  {
    bg: 'lmw-bg-indigo-100',
    text: 'lmw-text-indigo-800',
    darkBg: 'dark:lmw-bg-indigo-900',
    darkText: 'dark:lmw-text-indigo-200',
    color: '#6366F1',
  },
  // Red
  {
    bg: 'lmw-bg-red-100',
    text: 'lmw-text-red-800',
    darkBg: 'dark:lmw-bg-red-900',
    darkText: 'dark:lmw-text-red-200',
    color: '#EF4444',
  },
] as const;

/**
 * Default fallback style for uncategorized locations
 */
const UNCATEGORIZED_STYLE: CategoryStyle = {
  bg: 'lmw-bg-gray-100',
  text: 'lmw-text-gray-800',
  darkBg: 'dark:lmw-bg-gray-700',
  darkText: 'dark:lmw-text-gray-200',
  color: '#6B7280',
};

/**
 * Normalizes a category name for matching (lowercase, trimmed)
 */
function normalizeCategory(category: string | undefined): string {
  return (category || '').trim().toLowerCase();
}

/**
 * Extracts unique categories from locations and assigns styles
 *
 * @param locations - Array of locations to extract categories from
 * @param userConfig - Optional user-provided category configuration overrides
 * @returns Array of category metadata with styles and counts
 *
 * @example
 * ```ts
 * const categories = extractCategories(locations, {
 *   'restaurant': { color: '#FF5733' },
 *   'cafe': { bg: 'bg-yellow-100', text: 'text-yellow-800' }
 * });
 * ```
 */
export function extractCategories(
  locations: Location[],
  userConfig?: CategoryConfig
): CategoryMetadata[] {
  // Map to track categories with normalized keys
  const categoryMap = new Map<string, {
    displayName: string;
    count: number;
  }>();

  // Extract and count categories
  for (const location of locations) {
    const category = location.category?.trim();

    if (!category) {
      // Track uncategorized locations
      const key = 'uncategorized';
      const existing = categoryMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(key, { displayName: 'Uncategorized', count: 1 });
      }
      continue;
    }

    // Use normalized key for matching, but preserve original casing for display
    const normalizedKey = normalizeCategory(category);
    const existing = categoryMap.get(normalizedKey);

    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(normalizedKey, { displayName: category, count: 1 });
    }
  }

  // Convert to array and sort alphabetically by display name
  const sortedCategories = Array.from(categoryMap.entries())
    .map(([key, { displayName, count }]) => ({
      normalizedKey: key,
      displayName,
      count,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Assign styles
  const result: CategoryMetadata[] = sortedCategories.map((cat, index) => {
    // Special handling for uncategorized
    if (cat.normalizedKey === 'uncategorized') {
      const userOverride = userConfig?.['uncategorized'] || userConfig?.['Uncategorized'];
      return {
        name: cat.displayName,
        style: userOverride ? { ...UNCATEGORIZED_STYLE, ...userOverride } : UNCATEGORIZED_STYLE,
        count: cat.count,
      };
    }

    // Get default palette color (cycle through 8 colors)
    const paletteIndex = index % DEFAULT_PALETTE.length;
    const defaultStyle = DEFAULT_PALETTE[paletteIndex];

    // Apply user overrides if provided (case-insensitive lookup)
    let userOverride: Partial<CategoryStyle> | undefined;
    if (userConfig) {
      // Try exact match first
      userOverride = userConfig[cat.displayName];

      // If no exact match, try case-insensitive match
      if (!userOverride) {
        const configKey = Object.keys(userConfig).find(
          key => normalizeCategory(key) === cat.normalizedKey
        );
        if (configKey) {
          userOverride = userConfig[configKey];
        }
      }
    }

    return {
      name: cat.displayName,
      style: userOverride ? { ...defaultStyle, ...userOverride } : defaultStyle,
      count: cat.count,
    };
  });

  return result;
}

/**
 * Gets the style for a specific category by name
 *
 * @param categoryName - Name of the category (case-insensitive)
 * @param categories - Array of category metadata
 * @returns Category style, or uncategorized style if not found
 *
 * @example
 * ```ts
 * const style = getCategoryStyle('Restaurant', categories);
 * const classes = `${style.bg} ${style.text}`;
 * ```
 */
export function getCategoryStyle(
  categoryName: string | undefined,
  categories: CategoryMetadata[]
): CategoryStyle {
  if (!categoryName?.trim()) {
    return UNCATEGORIZED_STYLE;
  }

  const normalized = normalizeCategory(categoryName);
  const category = categories.find(
    cat => normalizeCategory(cat.name) === normalized
  );

  return category?.style || UNCATEGORIZED_STYLE;
}

/**
 * Gets the full category metadata for a specific category name
 *
 * @param categoryName - Name of the category (case-insensitive)
 * @param categories - Array of category metadata
 * @returns Category metadata, or undefined if not found
 */
export function getCategoryMetadata(
  categoryName: string | undefined,
  categories: CategoryMetadata[]
): CategoryMetadata | undefined {
  if (!categoryName?.trim()) {
    return categories.find(cat => normalizeCategory(cat.name) === 'uncategorized');
  }

  const normalized = normalizeCategory(categoryName);
  return categories.find(
    cat => normalizeCategory(cat.name) === normalized
  );
}

/**
 * Validates and normalizes user-provided category configuration
 *
 * @param config - User-provided category configuration
 * @returns Validated configuration with defaults filled in
 */
export function validateCategoryConfig(
  config: CategoryConfig | undefined
): CategoryConfig | undefined {
  if (!config || Object.keys(config).length === 0) {
    return undefined;
  }

  // Could add validation logic here (e.g., validate hex colors, check Tailwind classes)
  // For now, just return as-is
  return config;
}
