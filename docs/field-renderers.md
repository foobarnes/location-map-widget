# Field Renderers Guide - Location Map Widget

A comprehensive guide to customizing how custom field values are displayed in the Location Map Widget.

## Table of Contents

- [Overview](#overview)
- [Built-in Renderers](#built-in-renderers)
- [Auto-Detection](#auto-detection)
- [Configuration](#configuration)
- [Custom Renderers](#custom-renderers)
- [Best Practices](#best-practices)
- [Common Mistakes](#common-mistakes)

---

## Overview

The Field Renderer system automatically formats custom field values based on their content. URLs become clickable links, arrays display as bulleted lists, and more.

| Renderer | Auto-Detects | Displays As | Example Input | Example Output |
|----------|-------------|-------------|---------------|----------------|
| **Text** | Fallback | Plain text | `Hello World` | Hello World |
| **URL** | `https://...`, `www.` | Clickable link | `https://example.com` | [example.com](link) |
| **Email** | `user@domain` | mailto: link | `info@company.com` | [info@company.com](mailto) |
| **Phone** | Digit patterns | tel: link | `(555) 123-4567` | [(555) 123-4567](tel) |
| **Array** | `['a', 'b']`, `a, b, c` | Bulleted list | `['Red', 'Blue']` | • Red<br>• Blue |
| **Boolean** | `true`, `yes`, `1` | Yes/No | `true` | Yes |

---

## Built-in Renderers

### Text Renderer (Default)

The fallback renderer for any field that doesn't match other patterns.

- Displays value as plain text
- Converts booleans to "Yes"/"No"
- Safe for all content

### URL Renderer

Renders URLs as clickable external links.

**Auto-detects:**
- Values starting with `https://` or `http://`
- Values starting with `www.`
- Domain-like patterns (e.g., `example.com/path`)

**Features:**
- Opens in new tab (`target="_blank"`)
- Security attributes (`rel="noopener noreferrer"`)
- Truncates long URLs (50+ chars)
- Auto-adds `https://` if missing protocol

### Email Renderer

Renders email addresses as clickable mailto: links.

**Auto-detects:**
- Standard email pattern: `user@domain.tld`

**Features:**
- Creates `mailto:` link
- Shows full email address as link text

### Phone Renderer

Renders phone numbers as clickable tel: links.

**Auto-detects:**
- 7-15 digit patterns with common separators
- Formats: `555-1234`, `(555) 123-4567`, `+1 555-123-4567`

**Features:**
- Creates `tel:` link for click-to-call
- Strips non-numeric chars for tel: protocol
- Preserves display format

### Array Renderer

Renders arrays as bulleted lists.

**Auto-detects:**
- JSON-like arrays: `['item1', 'item2']` or `["item1", "item2"]`
- Comma-separated lists: `item1, item2, item3`

**Features:**
- Parses string representations from Google Sheets
- Single items display inline (no bullet)
- Handles mixed quote styles

### Boolean Renderer

Renders boolean values as styled Yes/No text.

**Auto-detects:**
- Boolean values: `true`, `false`
- String booleans: `yes`, `no`, `1`, `0`

**Features:**
- Green color for Yes/true
- Gray color for No/false

---

## Auto-Detection

By default, the widget automatically detects field types based on their values. This provides smart formatting without any configuration.

### Detection Order

1. **Boolean** - Native boolean values (confidence: 1.0)
2. **URL** - HTTP links and domain patterns (confidence: 0.95)
3. **Email** - Email address pattern (confidence: 0.9)
4. **Array** - JSON arrays or comma lists (confidence: 0.85)
5. **Phone** - Digit patterns with separators (confidence: 0.7)
6. **Text** - Default fallback

### Disabling Auto-Detection

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  autoDetectFieldTypes: false  // Only use explicit configuration
});
```

---

## Configuration

### Basic Usage (Auto-Detection)

No configuration needed - auto-detection handles common patterns:

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: {
    type: 'google-sheets-public',
    sheetId: 'YOUR_SHEET_ID'
  }
  // Auto-detection is enabled by default
});
```

### Explicit Field Registration

Map specific field names to renderer types:

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  fieldRenderers: {
    'company_website': 'url',      // Force URL renderer
    'product_list': 'array',       // Force array renderer
    'support_email': 'email',      // Force email renderer
    'hotline': 'phone',            // Force phone renderer
    'active': 'boolean'            // Force boolean renderer
  }
});
```

### Hybrid Configuration

Combine auto-detection with explicit overrides:

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  autoDetectFieldTypes: true,  // Keep auto-detection (default)
  fieldRenderers: {
    // Override specific fields
    'external_link': 'url',    // This field is always a URL
    'tags': 'array'            // This field is always an array
  }
});
```

---

## Custom Renderers

Create custom rendering logic for specific fields.

### Basic Custom Renderer

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  fieldRenderers: {
    'rating': (value) => '⭐'.repeat(Number(value)),
    'price': (value) => `$${Number(value).toFixed(2)}`
  }
});
```

### Custom Renderer with Styling

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  fieldRenderers: {
    'status': (value) => {
      const isActive = value === 'active' || value === 'open';
      const colorClass = isActive
        ? 'lmw-text-green-600 dark:lmw-text-green-400'
        : 'lmw-text-red-600 dark:lmw-text-red-400';

      return `<span class="${colorClass}">${value}</span>`;
    }
  }
});
```

### TypeScript Custom Renderer

```typescript
import type { FieldRendererFn } from 'open-map-embed/renderers';

const ratingRenderer: FieldRendererFn = (value, fieldName, location) => {
  const stars = Math.min(5, Math.max(0, Number(value)));
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
};

OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  fieldRenderers: {
    'rating': ratingRenderer
  }
});
```

### Renderer Function Signature

```typescript
type FieldRendererFn = (
  value: string | number | boolean,  // The field value
  fieldName: string,                  // The field key/name
  location: Location                  // Full location object for context
) => React.ReactNode;
```

### Accessing Location Context

Use the full location object for conditional rendering:

```javascript
OpenMapEmbed.init({
  container: '#map',
  dataSource: { /* ... */ },
  fieldRenderers: {
    'discount': (value, fieldName, location) => {
      // Show percentage for rentals, amount for others
      if (location.category === 'rental') {
        return `${value}% off`;
      }
      return `$${value} off`;
    }
  }
});
```

---

## Best Practices

### Performance

- **Prefer built-in renderers** - They're optimized and tested
- **Keep custom renderers simple** - Avoid heavy computations
- **Don't fetch data in renderers** - Renderers should be pure functions

### Accessibility

- **Use semantic HTML** - Links should be `<a>`, lists should be `<ul>`
- **Preserve click targets** - Phone/email links improve mobile UX
- **Support dark mode** - Use the `dark:` Tailwind variants

### Security

- **Sanitize user content** - Don't render raw HTML from data sources
- **Validate URLs** - Malicious links could harm users
- **Escape special characters** - Prevent XSS in custom renderers

```javascript
// ❌ Bad - XSS vulnerability
'description': (value) => value  // Raw HTML injection risk

// ✅ Good - Safe text rendering
'description': (value) => document.createTextNode(value)
```

### Maintainability

- **Document custom renderers** - Add comments explaining purpose
- **Use explicit configuration** - Makes behavior predictable
- **Test with edge cases** - Empty values, long strings, special chars

---

## Common Mistakes

### Mistake #1: Forgetting to Enable Arrays for Google Sheets

Google Sheets stores arrays as strings like `"['Red', 'Blue', 'Green']"`.

**Problem:** Field displays as literal string with brackets.

```javascript
// ❌ Without configuration
// Displays: ['Red', 'Blue', 'Green']
```

**Solution:** Auto-detection handles this, but explicit config is clearer:

```javascript
// ✅ Explicit array configuration
fieldRenderers: {
  'colors': 'array'
}
// Displays: • Red  • Blue  • Green
```

### Mistake #2: Using Wrong Renderer Type Name

```javascript
// ❌ Bad - Invalid type name
fieldRenderers: {
  'website': 'link'  // 'link' doesn't exist
}

// ✅ Good - Use correct type name
fieldRenderers: {
  'website': 'url'   // Correct type
}
```

**Valid type names:** `text`, `url`, `email`, `phone`, `array`, `boolean`

### Mistake #3: Custom Renderer Returns Invalid Value

```javascript
// ❌ Bad - Returns undefined on error
'status': (value) => {
  if (value === 'active') {
    return 'Active';
  }
  // Missing return for other values!
}

// ✅ Good - Always returns a value
'status': (value) => {
  return value === 'active' ? 'Active' : 'Inactive';
}
```

### Mistake #4: Styling Without Dark Mode Support

```javascript
// ❌ Bad - Only works in light mode
'priority': (value) => {
  return `<span class="lmw-text-red-600">${value}</span>`;
}

// ✅ Good - Works in both modes
'priority': (value) => {
  return `<span class="lmw-text-red-600 dark:lmw-text-red-400">${value}</span>`;
}
```

### Mistake #5: Field Name Case Sensitivity

Field names are matched case-insensitively and normalized.

```javascript
// Your Google Sheet column: "Product_URL"

// ✅ All of these will match:
fieldRenderers: {
  'Product_URL': 'url',   // Exact match
  'product_url': 'url',   // Lowercase
  'PRODUCT_URL': 'url'    // Uppercase
}
```

---

## Integration with Data Source Adapters

The field renderer system works with all data source types:

- **Google Sheets (Public)** - Auto-detection parses string arrays
- **Google Sheets (API)** - Same behavior
- **Google Sheets (Proxy)** - Same behavior
- **JSON/CSV** - Future support will work identically

See [Security Guide](./security-guide.md) for data source setup details.

---

## Troubleshooting

### Field Not Rendering as Expected

1. **Check the raw value** - Enable `debug: true` in your data source config
2. **Verify field name** - Check spelling and case
3. **Test auto-detection** - Remove explicit config to see what's detected
4. **Check for empty values** - Empty strings won't render anything

### Custom Renderer Not Working

1. **Check function syntax** - Must return valid React node
2. **Log the value** - Add `console.log(value)` to debug
3. **Check for errors** - Open browser console for stack traces
4. **Verify field name match** - Field names are case-insensitive

### Array Not Parsing

1. **Check format** - Must be `['a', 'b']` or `a, b, c`
2. **Watch for escaping** - Google Sheets may add extra quotes
3. **Try explicit config** - `'field': 'array'` forces array parsing
