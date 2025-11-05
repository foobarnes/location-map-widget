# Google Sheets Template Documentation

## Overview

The Location Map Widget integrates seamlessly with Google Sheets to display location data on an interactive map. This integration allows you to manage your location data in a familiar spreadsheet interface.

### 🔒 Choose Your Security Mode

| Mode | Security | Setup | Best For |
|------|---------|-------|----------|
| [**Public Sheets**](#setup-mode-1-public-sheets-recommended) | ✅ High (no API key) | 2 min | Most users |
| [**Direct API**](#setup-mode-2-direct-api) | ⚠️ Medium (restricted key) | 10 min | Real-time needs |
| [**Proxy**](#setup-mode-3-proxy) | ✅ Maximum (server-side) | 30 min | Enterprises |

**👉 See [Security Guide](./security-guide.md) for detailed comparison**

### Key Features

- **No Database Required**: Use Google Sheets as your data source
- **Auto-Discovery**: Categories are automatically detected from your data
- **Flexible Categories**: Use any category names you want (not limited to predefined types)
- **Automatic Styling**: 8-color palette automatically assigned to categories
- **Multiple Security Modes**: Choose the right level for your needs
- **Custom Fields Support**: Add any additional columns for location-specific data

### 📥 Download Template

**[Download CSV Template](./location-data-template.csv)** - Pre-configured with all standard headers and example data

---

## Template Structure

### Required Columns

These columns MUST be present in your Google Sheet for the widget to function:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | String | Unique identifier for each location | `loc-001`, `ambassador-1` |
| `name` | String | Display name of the location | `John's Bike Shop`, `Trail Head Park` |
| `latitude` | Number | Latitude coordinate (decimal degrees) | `37.7749` |
| `longitude` | Number | Longitude coordinate (decimal degrees) | `-122.4194` |
| `category` | String | Location category (can be ANY value) | `rental`, `ambassador`, `trail`, `shop` |

**Alternative Column Names**:
- Latitude: `lat` also works
- Longitude: `lng`, `lon` also work
- Category: `type` also works

### Optional Columns

Add these columns to enhance your location data:

#### Basic Information
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `description` | String | Description or details about the location | `Full-service bike shop with rentals and repairs` |

#### Address Fields
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `street` | String | Street address | `123 Main Street` |
| `city` | String | City name | `San Francisco` |
| `state` | String | State/Province | `CA` |
| `zip` | String | Postal code | `94102` |
| `country` | String | Country name | `USA` |

**Alternative Column Names**:
- Street: `address` also works
- Zip: `zipcode`, `postal_code` also work

#### Contact Information
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `phone` | String | Contact phone number | `(555) 123-4567` |
| `email` | String | Contact email address | `info@example.com` |
| `website` | String | Website URL | `https://example.com` |

#### Additional Fields
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `url` | String | Direct link to more information | `https://example.com/locations/shop1` |
| `hours` | String | Operating hours (freeform text) | `Mon-Fri 9am-6pm, Sat 10am-4pm` |
| `images` | String | Comma-separated image URLs | `https://example.com/img1.jpg, https://example.com/img2.jpg` |
| `last_updated` | String | ISO timestamp of last update | `2025-10-25T14:30:00Z` |

**Alternative Column Names**:
- Images: `image` also works (singular)
- Last Updated: `lastupdated` also works (no underscore)

**Image Display**:
- Images appear in **map tooltips** and **table view expanded details**
- Multiple images display in a **horizontal scrollable gallery**
- Thumbnails are sized at 120×90px for optimal performance
- Click any image to view full size in a new tab
- Failed images are automatically skipped
- Supports standard formats: JPEG, PNG, WebP, GIF

### Custom Fields

You can add ANY additional columns to your sheet! The widget will automatically capture them as custom fields and display them in the UI. For example:

- `rental_price`
- `bike_types_available`
- `parking_available`
- `wheelchair_accessible`
- `special_features`

**Custom Field Display**:
- Appear under **"Additional Information"** section
- Shown in both **map tooltips** and **table view expanded details**
- Field names are automatically formatted for readability:
  - `rental_price` → **Rental Price**
  - `bike_types_available` → **Bike Types Available**
  - `wheelchairAccessible` → **Wheelchair Accessible** (camelCase supported)
- Boolean values display as "Yes" or "No"
- All custom fields are displayed in bullet-point format

---

## Category Configuration

### How Categories Work

The widget's category system is **completely flexible and auto-discovered**:

1. **Any Category Name**: You can use any category names in your data (e.g., `rental`, `shop`, `trail`, `restaurant`, `cafe`, `park`, etc.)

2. **Auto-Discovery**: The widget automatically scans your data and finds all unique categories

3. **Automatic Colors**: Categories are automatically assigned colors from an 8-color palette:
   - Blue (#3B82F6)
   - Green (#10B981)
   - Orange (#F97316)
   - Purple (#A855F7)
   - Pink (#EC4899)
   - Teal (#14B8A6)
   - Indigo (#6366F1)
   - Red (#EF4444)

4. **Color Cycling**: If you have more than 8 categories, colors will cycle through the palette again

5. **Alphabetical Assignment**: Categories are sorted alphabetically, and colors are assigned in order (so "Ambassador" gets the first color, "Rental" gets a later color, etc.)

### Category Examples

Here are some example category configurations you might use:

**Bike Shop Locations**:
- `retail` - Bike shops
- `rental` - Rental locations
- `service` - Repair shops
- `event` - Event venues

**Restaurant Finder**:
- `restaurant` - Full-service restaurants
- `cafe` - Coffee shops and cafes
- `food-truck` - Food trucks
- `bar` - Bars and pubs

**Trail Map**:
- `trailhead` - Trail starting points
- `parking` - Parking areas
- `viewpoint` - Scenic viewpoints
- `campground` - Camping areas

**Community Resources**:
- `food-bank` - Food banks
- `shelter` - Homeless shelters
- `clinic` - Medical clinics
- `library` - Public libraries

### Customizing Category Colors (Optional)

If you want to override the default colors, you can provide custom category configuration in the widget initialization:

```javascript
init({
  container: '#map',
  dataSource: {
    type: 'google-sheets',
    sheetId: 'YOUR_SHEET_ID',
    apiKey: 'YOUR_API_KEY'
  },
  config: {
    categoryConfig: {
      'rental': {
        color: '#FF5733',  // Custom marker color
        bg: 'bg-red-100',  // Tailwind background class
        text: 'text-red-800'  // Tailwind text class
      },
      'ambassador': {
        color: '#2ECC71',
        bg: 'bg-emerald-100',
        text: 'text-emerald-800'
      }
    }
  }
});
```

**Note**: Category names in the config are case-insensitive, so `'Rental'`, `'rental'`, and `'RENTAL'` will all match.

---

## Setup Instructions

### Setup Mode 1: Public Sheets (Recommended)

**⏱️ 2 minutes | ✅ No API key | 🔒 Most secure**

#### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet or use an existing one
3. Import the [CSV template](./location-data-template.csv) or set up columns manually
4. Add your location data (see Example Data section below)

#### Step 2: Publish Your Sheet

1. Click **File → Share → Publish to web**
2. Choose:
   - **Document to publish**: "Entire Document" (or specific sheet)
   - **Format**: "Comma-separated values (.csv)"
3. Click **"Publish"**
4. Confirm by clicking "OK"

#### Step 3: Get Your Sheet ID

From the URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
                                        ^^^^^^^^^^^^^^^^
```

#### Step 4: Embed the Widget

```html
<!-- Container for the map widget -->
<div id="map" style="height: 600px;"></div>

<!-- Load widget script (CSS is automatically included) -->
<script src="https://unpkg.com/open-map-embed@latest/dist/open-map-embed.umd.js"></script>
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-public',
      sheetId: 'YOUR_SHEET_ID_HERE'
    }
  });
</script>
```

**✅ Done!** No API key, no security risks.

**Note:** Changes may take up to 5 minutes to appear (Google's cache).

---

### Setup Mode 2: Direct API

**⏱️ 10 minutes | ⚠️ Requires API key | 🔒 Medium security**

#### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create spreadsheet and add location data
3. Share → "Anyone with the link can view"

#### Step 2: Get Sheet ID

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is your Sheet ID
```

#### Step 3: Create Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable **Google Sheets API** (APIs & Services → Library)
4. Create API Key (Credentials → Create → API Key)

#### Step 4: Restrict API Key (CRITICAL)

**⚠️ Never skip this step!**

1. Click "Restrict Key"
2. **Application restrictions**:
   - Choose "HTTP referrers"
   - Add: `https://yourdomain.com/*`
3. **API restrictions**:
   - Choose "Restrict key"
   - Select only "Google Sheets API"
4. Save

#### Step 5: Embed the Widget

```html
<!-- Container for the map widget -->
<div id="map" style="height: 600px;"></div>

<!-- Load widget script (CSS is automatically included) -->
<script src="https://unpkg.com/open-map-embed@latest/dist/open-map-embed.umd.js"></script>
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets',
      sheetId: 'YOUR_SHEET_ID_HERE',
      apiKey: 'YOUR_RESTRICTED_API_KEY_HERE'
    }
  });
</script>
```

**⚠️ Security:** API key is visible in page source. See [Security Guide](./security-guide.md) for best practices.

---

### Setup Mode 3: Proxy

**⏱️ 30 minutes | 🔒 Maximum security | 🛡️ API key hidden**

#### Step 1: Create Your Google Sheet

Same as Mode 2 - create sheet and get Sheet ID

#### Step 2: Deploy Proxy Server

See [Security Guide - Proxy Mode](./security-guide.md#advanced-deployment-proxy---maximum-security) for detailed proxy setup instructions.

Quick example using Vercel:

```typescript
// api/sheets/[sheetId].ts
export default async function handler(req, res) {
  const { sheetId } = req.query;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
}
```

#### Step 3: Embed the Widget

```html
<!-- Container for the map widget -->
<div id="map" style="height: 600px;"></div>

<!-- Load widget script (CSS is automatically included) -->
<script src="https://unpkg.com/open-map-embed@latest/dist/open-map-embed.umd.js"></script>
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-proxy',
      proxyUrl: 'https://your-app.vercel.app/api/sheets',
      sheetId: 'YOUR_SHEET_ID_HERE'
    }
  });
</script>
```

**✅ Secure:** API key never exposed to client

---

## Example Data

Here's sample data showing different categories and optional fields:

| id | name | latitude | longitude | category | description | street | city | state | zip | phone | email | website | hours | images |
|----|------|----------|-----------|----------|-------------|--------|------|-------|-----|-------|-------|---------|-------|--------|
| amb-001 | John Smith | 37.7749 | -122.4194 | ambassador | Local cycling advocate with 10+ years experience | 123 Market St | San Francisco | CA | 94102 | (555) 123-4567 | john@example.com | https://johnsmith.com | By appointment | https://example.com/john.jpg |
| rental-001 | Bay Area Bikes | 37.8044 | -122.2712 | rental | Full-service rental shop with road and mountain bikes | 456 Main St | Oakland | CA | 94612 | (555) 234-5678 | info@bayareabikes.com | https://bayareabikes.com | Mon-Fri 9am-7pm, Sat-Sun 8am-8pm | https://example.com/shop1.jpg, https://example.com/shop2.jpg |
| trail-001 | Mount Tam Trail | 37.9235 | -122.5965 | trail | Scenic mountain biking trail with moderate difficulty | | Mill Valley | CA | 94941 | | | https://parks.gov/mt-tam | Dawn to Dusk | https://example.com/trail1.jpg |
| shop-001 | Pedal Power | 37.3861 | -122.0839 | shop | Bike shop specializing in electric bikes | 789 Castro St | Mountain View | CA | 94041 | (555) 345-6789 | sales@pedalpower.com | https://pedalpower.com | Tue-Sat 10am-6pm | |
| cafe-001 | Cyclist's Cafe | 37.4419 | -122.1430 | cafe | Bike-friendly cafe with secure bike parking | 321 University Ave | Palo Alto | CA | 94301 | (555) 456-7890 | hello@cyclistscafe.com | https://cyclistscafe.com | Daily 6am-6pm | https://example.com/cafe.jpg |

### Minimal Example (Required Fields Only)

| id | name | latitude | longitude | category |
|----|------|----------|-----------|----------|
| loc-001 | Location One | 37.7749 | -122.4194 | type-a |
| loc-002 | Location Two | 37.8044 | -122.2712 | type-b |
| loc-003 | Location Three | 37.9235 | -122.5965 | type-a |

This minimal example will work perfectly and demonstrate the auto-discovery and color assignment features!

---

## Troubleshooting

### Common Issues and Solutions

#### "Invalid API key or insufficient permissions"

**Cause**: The API key is incorrect or doesn't have access to the Google Sheets API.

**Solutions**:
1. Verify your API key is correct
2. Make sure the Google Sheets API is enabled in your Google Cloud project
3. Check if your API key has any restrictions that might be blocking access
4. Try creating a new API key

#### "Sheet not found. Check sheet ID and range"

**Cause**: The sheet ID is incorrect or the sheet isn't accessible.

**Solutions**:
1. Double-check the Sheet ID from the URL
2. Verify the sheet is shared (see Step 4 above)
3. Check the `range` parameter - it should match your sheet name (default is "Sheet1")
4. Make sure the sheet isn't deleted or in trash

#### "No data returned from Google Sheets"

**Cause**: The sheet is empty or has no data rows.

**Solutions**:
1. Make sure your sheet has at least one header row and one data row
2. Verify there are no empty rows at the top of your sheet
3. Check that all required columns are present

#### Locations Not Appearing on Map

**Cause**: Missing required fields or invalid coordinates.

**Solutions**:
1. Verify all required columns are present: `id`, `name`, `latitude`, `longitude`, `category`
2. Check that latitude values are between -90 and 90
3. Check that longitude values are between -180 and 180
4. Look for error messages in the browser console (F12)
5. Verify column names match exactly (case-insensitive, but spelling matters)

#### Categories Not Showing Correct Colors

**Cause**: Category names have inconsistent capitalization or whitespace.

**Solutions**:
1. Keep category names consistent (the widget normalizes them, but consistency is better)
2. Remove extra spaces before/after category names
3. Check for typos in category names

#### Widget Shows "Loading" Forever

**Cause**: Network issues or CORS problems.

**Solutions**:
1. Check browser console for error messages
2. Verify your website can access Google APIs (no firewall/proxy blocking)
3. Make sure you're not hitting API rate limits
4. Try clearing browser cache

#### Changes to Sheet Not Appearing

**Cause**: Data is cached for 5 minutes.

**Solutions**:
1. Wait 5 minutes for cache to expire
2. Refresh the page to trigger a new fetch
3. For development, you can clear cache by reinitializing the widget

---

## Best Practices

### Data Quality

1. **Use Unique IDs**: Make sure each location has a unique ID
   - Good: `rental-001`, `rental-002`, `amb-sf-001`
   - Bad: `1`, `1`, `2` (duplicates will cause issues)

2. **Validate Coordinates**: Use accurate latitude/longitude values
   - Test coordinates on [Google Maps](https://maps.google.com) first
   - Use decimal degrees format (not degrees/minutes/seconds)
   - Be consistent with precision (5-6 decimal places is ideal)

3. **Consistent Categories**: Use consistent category names
   - Good: `rental`, `rental`, `rental`
   - Bad: `rental`, `Rental`, `bike rental` (creates separate categories)

4. **Complete Addresses**: Fill in as many address fields as possible
   - Helps with search functionality
   - Improves user experience
   - Makes data more useful

5. **Keep Descriptions Concise**: Write clear, brief descriptions
   - Aim for 1-2 sentences
   - Focus on key information
   - Avoid very long text blocks

### Performance

1. **Limit Data Size**: Keep your sheet under 1000 rows for optimal performance
   - Widget handles pagination automatically
   - Consider splitting very large datasets

2. **Optimize Images**: Use optimized image URLs for better performance
   - **Use CDN-hosted images** when possible (faster loading)
   - **Compress images** before uploading (recommended: 80-90% quality)
   - **Dimensions**: 800×600px or smaller for gallery thumbnails
   - **Formats**: JPEG for photos, PNG for graphics, WebP for best compression
   - **File size**: Keep under 200KB per image for fast loading
   - **Multiple images**: Comma-separated URLs load in horizontal gallery
   - Images are lazy-loaded and failed images are automatically hidden

3. **Use Caching**: The widget caches data for 5 minutes
   - Don't fetch data more frequently than needed
   - This reduces API quota usage
   - Improves performance for users

### Security

1. **Restrict API Keys**: Always restrict your API keys
   - Use HTTP referrer restrictions
   - Limit to Google Sheets API only
   - Monitor usage in Google Cloud Console

2. **Don't Expose Sensitive Data**: Remember your sheet may be public
   - Don't include personal information (SSNs, credit cards, etc.)
   - Avoid sensitive business data
   - Use Option B (service account) for sensitive data

3. **Regular Audits**: Review your sheet sharing settings periodically
   - Remove unnecessary viewers
   - Check API key usage
   - Monitor for unauthorized access

### Maintenance

1. **Document Your Schema**: Keep notes about custom columns
   - What they mean
   - Valid values
   - How they're used

2. **Version Control**: Keep backups of your sheet
   - Use Google Sheets version history
   - Export CSV backups regularly
   - Document major changes

3. **Monitor Errors**: Check browser console for warnings
   - Fix data quality issues promptly
   - Test after major changes
   - Keep widget library up to date

4. **Test Changes**: Before updating production data
   - Make changes in a copy first
   - Test with the widget
   - Verify all features work correctly

---

## Additional Resources

- **Widget Documentation**: See main README for full widget features and configuration
- **Google Sheets API Docs**: [https://developers.google.com/sheets/api](https://developers.google.com/sheets/api)
- **API Key Best Practices**: [https://cloud.google.com/docs/authentication/api-keys](https://cloud.google.com/docs/authentication/api-keys)
- **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)

---

## Quick Start Checklist

- [ ] Create Google Sheet with required columns
- [ ] Add location data
- [ ] Get Sheet ID from URL
- [ ] Create Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Create and restrict API key
- [ ] Make sheet publicly accessible
- [ ] Initialize widget with Sheet ID and API key
- [ ] Test in browser
- [ ] Verify all locations appear correctly

---

**Need Help?** Check the Troubleshooting section above or review the example data to ensure your sheet is formatted correctly.
