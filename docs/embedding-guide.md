# Location Map Widget - Embedding Guide

A comprehensive guide to embedding and customizing the Location Map Widget in your website or application.

## 🔒 Security First

**Choose your deployment mode based on your security needs:**

| Mode | Security | Setup Time | Best For |
|------|---------|------------|----------|
| [**Public Sheets**](#data-source-public-sheets-recommended) | ✅ High (no API key) | 2 min | Most users |
| [**Direct API**](#data-source-direct-api) | ⚠️ Medium (restricted key) | 10 min | Real-time needs |
| [**Proxy**](#data-source-proxy-maximum-security) | ✅ Maximum (server-side) | 30 min | Enterprises |

**👉 See [Security Guide](./security-guide.md) for detailed comparison**

## Table of Contents

- [Security First](#-security-first)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
  - [CDN (UMD) - Simple HTML Pages](#cdn-umd---simple-html-pages)
  - [NPM - React/Vue/Angular Apps](#npm---reactvueangular-apps)
  - [WordPress Integration](#wordpress-integration)
- [Configuration Options](#configuration-options)
- [Category Customization](#category-customization)
- [Image Galleries](#image-galleries)
- [Custom Fields](#custom-fields)
- [Search and Filtering](#search-and-filtering)
- [Data Source Options](#data-source-options)
- [Responsive Design](#responsive-design)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

The fastest way to get started with the Location Map Widget:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Location Map</title>
</head>
<body>
  <!-- Widget container -->
  <div id="map-widget" style="height: 600px;"></div>

  <!-- Load widget script (CSS is automatically included) -->
  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>

  <!-- Initialize widget -->
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      }
    });
  </script>
</body>
</html>
```

---

## Installation Methods

### CDN (UMD) - Simple HTML Pages

Best for static websites, WordPress sites, or quick prototypes.

**CDN hosted on GitHub Pages** - automatically updated with every push to main branch.

#### Step 1: Add container element

```html
<div id="map-widget" style="height: 600px;"></div>
```

#### Step 2: Add JavaScript before closing `</body>`

```html
<!-- Load widget script (CSS is automatically included) -->
<script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
<script>
  OpenMapEmbed.init({
    container: '#map-widget',
    dataSource: {
      type: 'google-sheets',
      sheetId: 'YOUR_SHEET_ID',
      apiKey: 'YOUR_API_KEY'
    },
    config: {
      defaultView: 'map',
      theme: 'auto',
      enableGeolocation: true
    }
  });
</script>
```

#### CDN URL

The widget is hosted on GitHub Pages and automatically updated with every push. The CSS is automatically included in the JavaScript bundle - no separate stylesheet needed:

```html
<!-- Load widget script (CSS is automatically included) -->
<script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
```

This URL always serves the latest version from the main branch.

---

### NPM - React/Vue/Angular Apps

Best for modern JavaScript frameworks and build tools.

#### Installation

```bash
npm install open-map-embed
```

#### React Example

```jsx
import { useEffect, useRef } from 'react';
import { init } from 'open-map-embed';
// CSS is automatically injected - no import needed!

function MapComponent() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      init({
        container: containerRef.current,
        dataSource: {
          type: 'google-sheets',
          sheetId: 'YOUR_SHEET_ID',
          apiKey: 'YOUR_API_KEY'
        },
        config: {
          defaultView: 'map',
          theme: 'auto',
          enableGeolocation: true
        }
      });
    }
  }, []);

  return <div ref={containerRef} style={{ height: '600px' }} />;
}

export default MapComponent;
```

#### Vue 3 Example

```vue
<template>
  <div ref="mapContainer" style="height: 600px"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { init } from 'open-map-embed';
// CSS is automatically injected - no import needed!

const mapContainer = ref(null);

onMounted(() => {
  init({
    container: mapContainer.value,
    dataSource: {
      type: 'google-sheets',
      sheetId: 'YOUR_SHEET_ID',
      apiKey: 'YOUR_API_KEY'
    },
    config: {
      defaultView: 'map',
      theme: 'auto'
    }
  });
});
</script>
```

#### Angular Example

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { init } from 'open-map-embed';
// CSS is automatically injected - no setup needed!

@Component({
  selector: 'app-map',
  template: '<div #mapContainer style="height: 600px"></div>',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  ngAfterViewInit() {
    init({
      container: this.mapContainer.nativeElement,
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultView: 'map',
        theme: 'auto'
      }
    });
  }
}
```

**Note:** CSS is now automatically included in the JavaScript bundle - no need to add it to `angular.json`!

---

### WordPress Integration

#### Method 1: Using HTML Block (Recommended)

1. Edit your page/post in WordPress
2. Add a "Custom HTML" block
3. Paste the following code:

```html
<!-- Widget container -->
<div id="open-map-embed" style="height: 600px; margin: 20px 0;"></div>

<!-- Load widget script (CSS is automatically included) -->
<script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
<script>
  (function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
    } else {
      initWidget();
    }

    function initWidget() {
      OpenMapEmbed.init({
        container: '#open-map-embed',
        dataSource: {
          type: 'google-sheets',
          sheetId: 'YOUR_SHEET_ID',
          apiKey: 'YOUR_API_KEY'
        },
        config: {
          defaultView: 'map',
          theme: 'auto',
          enableGeolocation: true
        }
      });
    }
  })();
</script>
```

#### Method 2: Using Theme Functions

Add to your theme's `functions.php`:

```php
function enqueue_location_map_widget() {
    // Only load on specific pages
    if (is_page('locations')) {
        // Enqueue the widget script (CSS is automatically included)
        wp_enqueue_script(
            'open-map-embed',
            'https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js',
            array(),
            null,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_location_map_widget');
```

Then in your page template:

```php
<div id="open-map-embed" style="height: 600px;"></div>
<script>
  OpenMapEmbed.init({
    container: '#open-map-embed',
    dataSource: {
      type: 'google-sheets',
      sheetId: '<?php echo get_option('map_widget_sheet_id'); ?>',
      apiKey: '<?php echo get_option('map_widget_api_key'); ?>'
    }
  });
</script>
```

---

## Configuration Options

Complete reference for `WidgetConfig` object:

```typescript
interface WidgetConfig {
  // Data source (REQUIRED)
  dataSource: DataSourceConfig;

  // UI Configuration
  height?: string;              // CSS height value (default: container height)
  defaultView?: 'map' | 'table'; // Default view on load (default: 'map')
  theme?: 'light' | 'dark' | 'auto'; // Theme mode (default: 'auto')

  // Map Configuration
  defaultCenter?: [number, number]; // [latitude, longitude] (default: [39.8283, -98.5795])
  defaultZoom?: number;         // Initial zoom level (default: 4)

  // Feature Flags
  enableGeolocation?: boolean;  // Show "Find Near Me" button (default: true)
  enableClustering?: boolean;   // Enable marker clustering (default: true)
  enableSearch?: boolean;       // Enable search bar (default: true)
  enableFilters?: boolean;      // Enable category filters (default: true)
  enableDistanceFilter?: boolean; // Enable distance filtering (default: true)

  // Pagination
  itemsPerPage?: number;        // Items per page in table view (default: 10)

  // Customization
  markerIcons?: Record<string, string>; // Custom marker icons per category
  categoryConfig?: CategoryConfig; // Custom category styling
}
```

### Configuration Examples

#### Minimal Configuration

```javascript
OpenMapEmbed.init({
  container: '#map-widget',
  dataSource: {
    type: 'google-sheets',
    sheetId: 'YOUR_SHEET_ID',
    apiKey: 'YOUR_API_KEY'
  }
});
```

#### Full Configuration

```javascript
OpenMapEmbed.init({
  container: '#map-widget',
  dataSource: {
    type: 'google-sheets',
    sheetId: 'YOUR_SHEET_ID',
    apiKey: 'YOUR_API_KEY',
    range: 'Sheet1!A1:Z1000'
  },
  config: {
    // UI
    height: '700px',
    defaultView: 'map',
    theme: 'auto',

    // Map settings
    defaultCenter: [40.7128, -74.0060], // New York City
    defaultZoom: 10,

    // Features
    enableGeolocation: true,
    enableClustering: true,
    enableSearch: true,
    enableFilters: true,
    enableDistanceFilter: true,

    // Table
    itemsPerPage: 20,

    // Custom category styling
    categoryConfig: {
      'Restaurant': {
        color: '#FF5733',
        bg: 'lmw-bg-yellow-100',
        text: 'lmw-text-yellow-800',
        darkBg: 'dark:lmw-bg-yellow-900',
        darkText: 'dark:lmw-text-yellow-200'
      },
      'Hotel': {
        color: '#3498DB',
        bg: 'lmw-bg-blue-100',
        text: 'lmw-text-blue-800'
      }
    }
  }
});
```

---

## Category Customization

The widget automatically assigns colors to categories, but you can customize them using `categoryConfig`.

### Category Style Options

```typescript
interface CategoryStyle {
  bg: string;        // Tailwind background class for light mode
  text: string;      // Tailwind text class for light mode
  darkBg: string;    // Tailwind background class for dark mode
  darkText: string;  // Tailwind text class for dark mode
  color: string;     // Hex color for map markers
}
```

### Default Color Palette

The widget uses 8 default colors that rotate:
- Blue (#3B82F6)
- Green (#10B981)
- Orange (#F97316)
- Purple (#A855F7)
- Pink (#EC4899)
- Teal (#14B8A6)
- Indigo (#6366F1)
- Red (#EF4444)

### Custom Category Examples

#### Example 1: Custom Marker Color Only

```javascript
categoryConfig: {
  'Restaurant': { color: '#FF5733' },
  'Cafe': { color: '#28B463' },
  'Bar': { color: '#8E44AD' }
}
```

#### Example 2: Full Customization

```javascript
categoryConfig: {
  'Restaurant': {
    color: '#FF5733',
    bg: 'lmw-bg-yellow-100',
    text: 'lmw-text-yellow-800',
    darkBg: 'dark:lmw-bg-yellow-900',
    darkText: 'dark:lmw-text-yellow-200'
  },
  'Cafe': {
    color: '#28B463',
    bg: 'lmw-bg-green-100',
    text: 'lmw-text-green-800',
    darkBg: 'dark:lmw-bg-green-900',
    darkText: 'dark:lmw-text-green-200'
  },
  'Hotel': {
    color: '#3498DB',
    bg: 'lmw-bg-blue-100',
    text: 'lmw-text-blue-800',
    darkBg: 'dark:lmw-bg-blue-900',
    darkText: 'dark:lmw-text-blue-200'
  }
}
```

#### Example 3: Brand Colors

```javascript
categoryConfig: {
  'Premium': {
    color: '#FFD700', // Gold
    bg: 'lmw-bg-yellow-50',
    text: 'lmw-text-yellow-900'
  },
  'Standard': {
    color: '#C0C0C0', // Silver
    bg: 'lmw-bg-gray-100',
    text: 'lmw-text-gray-800'
  }
}
```

### Tailwind Class Reference

Available Tailwind classes (prefixed with `lmw-`):

**Background Colors:**
- `lmw-bg-{color}-{shade}` (e.g., `lmw-bg-blue-100`, `lmw-bg-red-900`)
- Colors: blue, green, red, yellow, purple, pink, indigo, teal, orange, gray
- Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

**Text Colors:**
- `lmw-text-{color}-{shade}` (e.g., `lmw-text-blue-800`, `lmw-text-red-200`)

**Dark Mode:**
- Prefix with `dark:` (e.g., `dark:lmw-bg-blue-900`)

---

## Image Galleries

The widget automatically displays location images in both map tooltips and table view.

### Adding Images to Your Data

Include an `images` column in your Google Sheet with comma-separated image URLs:

```csv
id,name,latitude,longitude,category,images
loc-1,Coffee Shop,37.7749,-122.4194,cafe,"https://example.com/shop-front.jpg,https://example.com/interior.jpg"
loc-2,Bike Rental,34.0522,-118.2437,rental,https://example.com/bikes.jpg
```

### Image Display Features

- **Map Tooltips**: Images appear automatically in location popups when you click markers
- **Table View**: Images display in the expanded details section
- **Gallery View**: Multiple images show in a horizontal scrollable gallery
- **Lazy Loading**: Images load on-demand for better performance
- **Error Handling**: Failed images are automatically hidden
- **Full Size View**: Click any image to open full size in a new tab

### Image Best Practices

**Formats**: JPEG, PNG, WebP, GIF
```csv
images: "https://cdn.example.com/photo.jpg,https://cdn.example.com/photo2.webp"
```

**Recommended Specifications**:
- **Dimensions**: 800×600px or smaller
- **File Size**: Under 200KB per image
- **Compression**: 80-90% quality for JPEGs
- **Hosting**: Use a CDN for faster loading

**Multiple Images**:
```csv
# Three images in a gallery
images: "https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg"
```

**Alternative Column Name**:
- You can use `image` (singular) instead of `images`

### Image Gallery Example

```html
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-public',
      sheetId: 'YOUR_SHEET_ID'
    }
  });
</script>
```

Your Google Sheet with images:
| id | name | latitude | longitude | category | images |
|----|------|----------|-----------|----------|--------|
| 1 | Bay Trail | 37.8044 | -122.2712 | trail | `https://example.com/trail1.jpg,https://example.com/trail2.jpg` |

Result: Both images display in a scrollable gallery when the location is clicked on the map or expanded in the table.

---

## Custom Fields

The widget automatically detects and displays any custom columns you add to your Google Sheet, making it easy to extend location data with your own fields.

### Adding Custom Fields to Your Data

Simply add any additional columns to your Google Sheet beyond the standard fields:

```csv
id,name,latitude,longitude,category,rental_price,bike_types,parking_available
loc-1,Bike Shop,37.7749,-122.4194,rental,25,Road|Mountain|Hybrid,true
loc-2,Trail Head,34.0522,-118.2437,trail,,,,false
```

**Common Use Cases**:
- Pricing information: `rental_price`, `membership_cost`
- Availability details: `parking_available`, `wheelchair_accessible`
- Features: `bike_types_available`, `amenities`, `equipment`
- Business info: `years_in_business`, `certified_mechanic`
- Technical specs: `max_capacity`, `trail_difficulty`, `elevation_gain`

### Custom Field Display

Custom fields automatically appear in an **"Additional Information"** section:

**Map Tooltips**: Display below contact info
```
Additional Information:
• Rental Price: $25/day
• Bike Types: Road, Mountain, Hybrid
• Parking Available: Yes
```

**Table View**: Display in expanded details section after hours

### Field Name Formatting

The widget automatically formats field names for better readability:

| Column Name | Displayed As |
|-------------|--------------|
| `rental_price` | Rental Price |
| `bike_types_available` | Bike Types Available |
| `wheelchairAccessible` | Wheelchair Accessible |
| `parking_available` | Parking Available |
| `yearsInBusiness` | Years In Business |

**Formatting Rules**:
- Underscores (`_`) are converted to spaces
- camelCase words are split at capitals
- First letter of each word is capitalized

### Value Type Handling

The widget intelligently handles different value types:

**Boolean Values**: `true` → "Yes", `false` → "No"
```csv
parking_available,wheelchair_accessible
true,false
```
Displays as:
```
• Parking Available: Yes
• Wheelchair Accessible: No
```

**Numeric Values**: Displayed as-is
```csv
rental_price,max_capacity
25,50
```
Displays as:
```
• Rental Price: 25
• Max Capacity: 50
```

**String Values**: Displayed as-is
```csv
bike_types,amenities
Road|Mountain|Hybrid,Repair Shop|Rentals|Classes
```
Displays as:
```
• Bike Types: Road|Mountain|Hybrid
• Amenities: Repair Shop|Rentals|Classes
```

### Custom Fields Example

```html
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-public',
      sheetId: 'YOUR_SHEET_ID'
    }
  });
</script>
```

Your Google Sheet with custom fields:
| id | name | category | rental_price | bike_types | parking |
|----|------|----------|--------------|------------|---------|
| 1 | Bay Bikes | rental | $25/day | Road, Mountain | Yes |

Result: Custom fields automatically appear under "Additional Information" in both map and table views.

### Best Practices

1. **Use descriptive field names**: `rental_price` is better than `price` or `cost`
2. **Be consistent**: Use the same naming style across all fields
3. **Use snake_case or camelCase**: Both are automatically formatted
4. **Keep values concise**: Long text values may not display well
5. **Use booleans wisely**: For yes/no values, use `true`/`false` or `yes`/`no`

---

## Search and Filtering

The widget includes powerful search and filtering capabilities to help users find locations quickly.

### Search Functionality

The search bar performs a **comprehensive text search** across multiple fields:

**Standard Fields:**
- **Name**: Location name
- **Description**: Full description text
- **Category**: Location category/type
- **Street**: Street address
- **City**: City name
- **State**: State/province name
- **Country**: Country name

**Custom Fields:**
- **All custom field values** are automatically included in search

### Search Examples

**Search by State:**
```
Search: "California"
Results: All locations in California
```

**Search by Country:**
```
Search: "USA"
Results: All locations in the USA
```

**Search by Category:**
```
Search: "rental"
Results: All locations with "rental" category
```

**Search by Custom Field:**
```
Search: "parking"
Results: All locations where any custom field contains "parking"
(e.g., parking_available: "Yes", amenities: "Free parking")
```

**Search by Name:**
```
Search: "Bay Bikes"
Results: Locations with "Bay" or "Bikes" in the name
```

### Search Behavior

- **Case-insensitive**: "california", "California", and "CALIFORNIA" all work
- **Partial matching**: "calif" will match "California"
- **Real-time filtering**: Results update as you type
- **Combined with filters**: Search works alongside category and distance filters

### Category Filtering

Click category badges to filter by one or more categories:

- **Single category**: Click one badge to show only that category
- **Multiple categories**: Click multiple badges to show locations from any selected category
- **Clear filter**: Click a selected badge again to deselect it

### Distance Filtering

Use the "Find Near Me" button to enable location-based filtering:

1. Click "Find Near Me"
2. Allow location access
3. Use distance slider to set maximum distance
4. Locations are filtered and sorted by distance

**Distance Filter Features:**
- Shows distance to each location
- Automatically sorts by nearest first
- Works with search and category filters
- Distance displayed in miles or kilometers

### Combining Filters

All filters work together:

```
Example: Search "California" + Category "rental" + Within 50 miles
Result: Rental locations in California within 50 miles of your location
```

### Configuration

You can disable specific filters if needed:

```javascript
init({
  container: '#map',
  dataSource: { /* ... */ },
  config: {
    enableSearch: true,           // Enable/disable search bar
    enableFilters: true,           // Enable/disable category filters
    enableDistanceFilter: true     // Enable/disable distance filtering
  }
});
```

---

## Data Source Options

The widget supports multiple data source types with different security levels:

### Data Source: Public Sheets (Recommended)

**No API key required!** Most secure and easiest option.

```javascript
dataSource: {
  type: 'google-sheets-public',
  sheetId: '1abc123...',  // Your Google Sheet ID
  gid: '0',               // Optional: sheet tab ID (default: 0 = first tab)
}
```

**Setup:**
1. File → Share → Publish to web
2. Choose CSV format
3. Click Publish
4. Use your Sheet ID in config

**Pros:** No API key, free, secure
**Cons:** 5-minute cache delay
**See:** [Security Guide - Public Sheets](./security-guide.md#quick-start-public-sheets---most-secure--easiest)

---

### Data Source: Direct API

Uses Google Sheets API directly (like Google Maps).

```javascript
dataSource: {
  type: 'google-sheets',
  sheetId: '1abc123...',  // Your Google Sheet ID
  apiKey: 'AIza...',      // Your Google API Key
  range: 'Sheet1!A1:Z1000' // Optional: specific range (default: entire first sheet)
}
```

**⚠️ SECURITY REQUIREMENTS:**
- Must restrict API key to your domain in Google Cloud Console
- Must restrict to Google Sheets API only
- Must set usage quotas
- API key visible in page source

**Pros:** Real-time updates, flexible
**Cons:** Requires Google Cloud setup, security management
**See:** [Security Guide - Direct API](./security-guide.md#standard-deployment-direct-api---like-google-maps)

---

### Data Source: Proxy (Maximum Security)

API key hidden in your backend proxy.

```javascript
dataSource: {
  type: 'google-sheets-proxy',
  proxyUrl: 'https://your-app.vercel.app/api/sheets',
  sheetId: '1abc123...',
  range: 'Sheet1!A1:Z1000' // Optional
}
```

**Pros:** Maximum security, full control
**Cons:** Requires backend deployment
**See:** [Security Guide - Proxy Mode](./security-guide.md#advanced-deployment-proxy---maximum-security)

#### Setting up Google Sheets:

1. **Create a Google Sheet** with these columns:
   - `id` - Unique identifier
   - `name` - Location name
   - `latitude` - Latitude coordinate
   - `longitude` - Longitude coordinate
   - `category` - Location category
   - `description` - Location description
   - `address_city` - City
   - `address_state` - State
   - `address_street` - Street address (optional)
   - `address_zip` - ZIP code (optional)
   - `contact_phone` - Phone number (optional)
   - `contact_email` - Email (optional)
   - `contact_website` - Website URL (optional)

2. **Share your sheet** - Set to "Anyone with the link can view"

3. **Get your Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

4. **Create a Google API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Sheets API
   - Create credentials (API Key)
   - Restrict the key to Google Sheets API

### Mock Data (Testing)

For development and testing:

```javascript
dataSource: {
  type: 'mock'
}
```

This uses built-in sample data.

### JSON API (Future)

Coming soon:

```javascript
dataSource: {
  type: 'json',
  url: 'https://api.example.com/locations'
}
```

### CSV (Future)

Coming soon:

```javascript
dataSource: {
  type: 'csv',
  url: 'https://example.com/locations.csv'
}
```

---

## Responsive Design

The widget is fully responsive and adapts to its container.

### Container Height Control

The widget respects the container's height. You have two options:

#### Option 1: Container Style (Recommended)

```html
<div id="map-widget" style="height: 600px;"></div>
```

```javascript
OpenMapEmbed.init({
  container: '#map-widget',
  dataSource: { /* ... */ }
  // No height in config
});
```

#### Option 2: Config Height

```html
<div id="map-widget"></div>
```

```javascript
OpenMapEmbed.init({
  container: '#map-widget',
  dataSource: { /* ... */ },
  config: {
    height: '600px'
  }
});
```

### Responsive Examples

#### Full Width, Fixed Height

```html
<div id="map-widget" style="width: 100%; height: 600px;"></div>
```

#### Responsive Height (70% of viewport)

```html
<div id="map-widget" style="width: 100%; height: 70vh;"></div>
```

#### Within a Grid Layout

```html
<div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; height: 600px;">
  <div><!-- Sidebar content --></div>
  <div id="map-widget"></div>
</div>
```

#### Mobile Responsive

```html
<style>
  #map-widget {
    height: 400px;
  }

  @media (min-width: 768px) {
    #map-widget {
      height: 600px;
    }
  }

  @media (min-width: 1024px) {
    #map-widget {
      height: 800px;
    }
  }
</style>

<div id="map-widget"></div>
```

---

## Examples

### Example 1: Basic Embed

Minimal setup with default options:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basic Map Widget</title>
</head>
<body>
  <h1>Our Locations</h1>
  <div id="map-widget" style="height: 600px; max-width: 1200px; margin: 0 auto;"></div>

  <!-- Load widget script (CSS is automatically included) -->
  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      }
    });
  </script>
</body>
</html>
```

### Example 2: Custom Categories with Brand Colors

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Branded Map Widget</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    #map-widget {
      height: 700px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Find Our Stores</h1>
    <p>Discover our premium, standard, and outlet locations</p>
  </div>

  <div id="map-widget"></div>

  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultView: 'map',
        theme: 'light',
        defaultCenter: [39.8283, -98.5795],
        defaultZoom: 4,
        categoryConfig: {
          'Premium Store': {
            color: '#FFD700',
            bg: 'lmw-bg-yellow-100',
            text: 'lmw-text-yellow-900',
            darkBg: 'dark:lmw-bg-yellow-900',
            darkText: 'dark:lmw-text-yellow-200'
          },
          'Standard Store': {
            color: '#3B82F6',
            bg: 'lmw-bg-blue-100',
            text: 'lmw-text-blue-800',
            darkBg: 'dark:lmw-bg-blue-900',
            darkText: 'dark:lmw-text-blue-200'
          },
          'Outlet': {
            color: '#EF4444',
            bg: 'lmw-bg-red-100',
            text: 'lmw-text-red-800',
            darkBg: 'dark:lmw-bg-red-900',
            darkText: 'dark:lmw-text-red-200'
          }
        }
      }
    });
  </script>
</body>
</html>
```

### Example 3: Dark Mode

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dark Mode Map</title>
  <style>
    body {
      background: #1a1a1a;
      color: #f5f5f5;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    #map-widget {
      height: 700px;
      max-width: 1400px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <h1 style="text-align: center;">Night Mode Location Finder</h1>
  <div id="map-widget"></div>

  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        theme: 'dark', // Force dark mode
        defaultView: 'map',
        enableGeolocation: true,
        enableClustering: true
      }
    });
  </script>
</body>
</html>
```

### Example 4: Custom Height with Responsive Design

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Map</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    #map-widget {
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
    }

    /* Tablet */
    @media (min-width: 768px) {
      #map-widget {
        height: 600px;
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      #map-widget {
        height: 800px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Responsive Location Map</h1>
    <div id="map-widget"></div>
  </div>

  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultView: 'map',
        theme: 'auto'
      }
    });
  </script>
</body>
</html>
```

### Example 5: Multiple Widgets on One Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Multiple Maps</title>
  <style>
    .map-container {
      height: 500px;
      margin-bottom: 40px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>East Coast Locations</h1>
    <div id="map-east" class="map-container"></div>

    <h1>West Coast Locations</h1>
    <div id="map-west" class="map-container"></div>
  </div>

  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    // East Coast Map
    OpenMapEmbed.init({
      container: '#map-east',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultCenter: [40.7128, -74.0060], // NYC
        defaultZoom: 6
      }
    });

    // West Coast Map
    OpenMapEmbed.init({
      container: '#map-west',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultCenter: [34.0522, -118.2437], // LA
        defaultZoom: 6
      }
    });
  </script>
</body>
</html>
```

### Example 6: Table View Default

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Directory View</title>
</head>
<body>
  <div id="map-widget" style="height: 700px; max-width: 1400px; margin: 0 auto;"></div>

  <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map-widget',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_API_KEY'
      },
      config: {
        defaultView: 'table', // Start with table view
        itemsPerPage: 25      // Show 25 items per page
      }
    });
  </script>
</body>
</html>
```

---

## Troubleshooting

### Widget Not Displaying

**Problem:** The widget container is empty or shows no content.

**Solutions:**

1. Check that the container has a height:
   ```html
   <div id="map-widget" style="height: 600px;"></div>
   ```

2. Verify JavaScript is loaded:
   ```html
   <script src="https://foobarnes.github.io/open-map-embed/dist/open-map-embed.umd.js"></script>
   ```

3. Check browser console for errors (F12)

4. Ensure container selector is correct:
   ```javascript
   // Correct
   container: '#map-widget'  // ID selector
   container: '.map-widget'  // Class selector

   // Incorrect
   container: 'map-widget'   // Missing selector
   ```

### Google Sheets Error: "Failed to load locations"

**Problem:** Widget shows error message about loading data.

**Solutions:**

1. Verify Google Sheet is shared publicly:
   - Open your sheet
   - Click "Share"
   - Change to "Anyone with the link can view"

2. Check Sheet ID is correct:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
                                              ^^^^^^^^^^^^^^
   ```

3. Verify API Key is valid:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Check API key is enabled
   - Ensure Google Sheets API is enabled

4. Check column names match expected format (case-sensitive)

### Map Not Showing

**Problem:** Map tiles don't load or map is blank.

**Solutions:**

1. Check internet connection (map tiles load from CDN)

2. Verify coordinates are valid:
   ```javascript
   defaultCenter: [latitude, longitude]  // Correct order
   defaultCenter: [40.7128, -74.0060]    // NYC example
   ```

3. Check if location data has valid coordinates

4. Look for console errors related to Leaflet

### Categories Not Showing Custom Colors

**Problem:** Custom category colors are not applied.

**Solutions:**

1. Verify category names match exactly (case-sensitive):
   ```javascript
   categoryConfig: {
     'Restaurant': { color: '#FF5733' }  // Must match data exactly
   }
   ```

2. Check color format is hex:
   ```javascript
   color: '#FF5733'  // Correct
   color: 'red'      // Won't work
   ```

3. Ensure Tailwind classes use `lmw-` prefix:
   ```javascript
   bg: 'lmw-bg-blue-100'    // Correct
   bg: 'bg-blue-100'        // Won't work
   ```

### WordPress: Widget Not Initializing

**Problem:** Widget doesn't load on WordPress site.

**Solutions:**

1. Wrap initialization in DOM ready check:
   ```javascript
   (function() {
     if (document.readyState === 'loading') {
       document.addEventListener('DOMContentLoaded', initWidget);
     } else {
       initWidget();
     }

     function initWidget() {
       OpenMapEmbed.init({ /* ... */ });
     }
   })();
   ```

2. Check for JavaScript conflicts:
   - Open browser console
   - Look for errors
   - Try disabling other plugins

3. Ensure scripts are loading:
   - View page source
   - Search for "open-map-embed"
   - Verify CSS and JS files are present

### Performance Issues

**Problem:** Widget is slow or laggy with many locations.

**Solutions:**

1. Enable clustering (default is enabled):
   ```javascript
   config: {
     enableClustering: true  // Groups nearby markers
   }
   ```

2. Reduce items per page:
   ```javascript
   config: {
     itemsPerPage: 10  // Default, lower for faster rendering
   }
   ```

3. Use specific Google Sheets range:
   ```javascript
   dataSource: {
     type: 'google-sheets',
     sheetId: 'YOUR_SHEET_ID',
     apiKey: 'YOUR_API_KEY',
     range: 'Sheet1!A1:Z500'  // Limit rows
   }
   ```

### Mobile Display Issues

**Problem:** Widget doesn't display correctly on mobile.

**Solutions:**

1. Add viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. Use responsive height:
   ```css
   #map-widget {
     height: 70vh;  /* 70% of viewport height */
   }
   ```

3. Test responsive breakpoints:
   ```css
   #map-widget {
     height: 400px;  /* Mobile */
   }

   @media (min-width: 768px) {
     #map-widget {
       height: 600px;  /* Tablet+ */
     }
   }
   ```

### Dark Mode Not Working

**Problem:** Dark mode doesn't activate.

**Solutions:**

1. Force dark mode for testing:
   ```javascript
   config: {
     theme: 'dark'  // Force dark mode
   }
   ```

2. Check system preferences if using 'auto':
   - Widget respects OS dark mode setting
   - Test by changing system theme

3. Verify dark mode CSS is loaded

### Container Height Issues

**Problem:** Widget height is incorrect or inconsistent.

**Solutions:**

1. Set explicit height on container:
   ```html
   <div id="map-widget" style="height: 600px;"></div>
   ```

2. Or use config height:
   ```javascript
   config: {
     height: '600px'
   }
   ```

3. Check parent container has height if using percentage:
   ```css
   .parent {
     height: 800px;
   }
   #map-widget {
     height: 100%;  /* Now works because parent has height */
   }
   ```

### Still Having Issues?

1. Check browser console (F12) for error messages
2. Verify all required fields in your data source
3. Test with mock data first:
   ```javascript
   dataSource: { type: 'mock' }
   ```
4. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
5. Check that JavaScript is enabled
6. Try incognito/private mode to rule out extension conflicts

---

## Additional Resources

- **GitHub Repository:** [github.com/yourorg/open-map-embed](https://github.com)
- **API Documentation:** [Full TypeScript API Reference](./api-reference.md)
- **Live Demo:** [demo.locationmapwidget.com](https://demo.example.com)
- **Google Sheets Template:** [Sample Sheet Template](https://docs.google.com/spreadsheets/)

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Email: support@example.com
- Documentation: Full docs at [docs.locationmapwidget.com](https://docs.example.com)

---

**Version:** 1.0.0
**Last Updated:** 2025-10-25
**License:** MIT
