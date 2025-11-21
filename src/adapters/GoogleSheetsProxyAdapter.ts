/**
 * Google Sheets Proxy adapter
 * Fetches location data via a user-hosted proxy endpoint
 *
 * Security: API key is stored server-side in the proxy, never exposed to client
 *
 * Proxy endpoint requirements:
 * - Accepts GET requests to: /api/sheets/{sheetId}
 * - Optional query params: ?range=Sheet1
 * - Returns Google Sheets API response format
 * - Manages API key securely via environment variables
 *
 * Example proxy URL: https://your-app.vercel.app/api/sheets
 * Full request: https://your-app.vercel.app/api/sheets/SHEET_ID?range=Sheet1
 */

import axios from 'axios';
import type {
  DataAdapter,
  Location,
  GoogleSheetsProxyDataSource,
  GoogleSheetsResponse,
  Address,
  Contact,
} from '../types';
import { validateLocations } from '../utils/validation';

export class GoogleSheetsProxyAdapter implements DataAdapter {
  private proxyUrl: string;
  private sheetId: string;
  private debug: boolean;
  private range: string;
  private cache: Location[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: GoogleSheetsProxyDataSource) {
    // Remove trailing slash from proxy URL
    this.proxyUrl = config.proxyUrl.replace(/\/$/, '');
    this.sheetId = config.sheetId;
    this.range = config.range || 'Sheet1';
    // Enable debug mode via config or URL parameter
    this.debug = config.debug || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'));
  }

  /**
   * Fetch locations from Google Sheets via proxy
   */
  async fetchLocations(): Promise<Location[]> {
    const startTime = Date.now();

    // Return cached data if still valid
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      const cacheAge = Math.round((Date.now() - this.cacheTime) / 1000);
      console.log(`📦 Returning cached location data (${this.cache.length} locations, cached ${cacheAge}s ago)`);
      return this.cache;
    }

    try {
      // Construct proxy request URL
      const url = `${this.proxyUrl}/${this.sheetId}`;
      const params = new URLSearchParams();
      if (this.range) {
        params.append('range', this.range);
      }

      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;

      console.log(`📊 Fetching from proxy: ${fullUrl}`);

      const response = await axios.get<GoogleSheetsResponse>(fullUrl, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.data || !response.data.values) {
        throw new Error('No data returned from proxy');
      }

      if (this.debug) {
        console.log(`[DEBUG] Received ${response.data.values.length} rows from proxy`);
      }

      const rawLocations = this.parseSheetData(response.data.values);
      const validatedLocations = this.validateSchema(rawLocations);

      const timeElapsed = Date.now() - startTime;
      console.log(
        `✓ Successfully loaded data:\n` +
        `  Total rows parsed: ${rawLocations.length}\n` +
        `  Valid locations: ${validatedLocations.length}\n` +
        `  Failed validation: ${rawLocations.length - validatedLocations.length}\n` +
        `  Time taken: ${timeElapsed}ms`
      );

      // Update cache
      this.cache = validatedLocations;
      this.cacheTime = Date.now();

      return validatedLocations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error(
            'Proxy authentication failed. Check your proxy API key configuration.'
          );
        } else if (error.response?.status === 404) {
          throw new Error(
            `Sheet not found via proxy. Check sheet ID: ${this.sheetId}`
          );
        } else if (error.response?.status === 500) {
          throw new Error(
            'Proxy server error. Check your proxy logs for details.'
          );
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Proxy request timed out. Check your proxy URL.');
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          throw new Error(
            `Cannot reach proxy at ${this.proxyUrl}. Check proxy URL and CORS settings.`
          );
        } else {
          throw new Error(`Proxy error: ${error.message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Parse Google Sheets data into Location objects
   * Expects first row to be headers
   */
  private parseSheetData(values: string[][]): Partial<Location>[] {
    if (values.length < 2) {
      console.warn('⚠ Sheet has no data rows (only header or empty)');
      return [];
    }

    const [headers, ...rows] = values;
    const originalHeaders = headers; // Preserve original case
    const headerMap = this.createHeaderMap(headers);

    // Log header information
    const requiredColumns = {
      id: headerMap.id !== undefined,
      name: headerMap.name !== undefined,
      'latitude/lat': headerMap.latitude !== undefined || headerMap.lat !== undefined,
      'longitude/lng/lon': headerMap.longitude !== undefined || headerMap.lng !== undefined || headerMap.lon !== undefined,
      'category/type': headerMap.category !== undefined || headerMap.type !== undefined,
    };

    const allRequiredPresent = Object.values(requiredColumns).every(present => present);

    if (this.debug) {
      console.log(
        `[DEBUG] Detected ${headers.length} columns:\n` +
        `  Original headers: [${headers.join(', ')}]\n` +
        `  Required columns status:\n` +
        `    - id: ${requiredColumns.id ? '✓' : '✗'}\n` +
        `    - name: ${requiredColumns.name ? '✓' : '✗'}\n` +
        `    - latitude/lat: ${requiredColumns['latitude/lat'] ? '✓' : '✗'}\n` +
        `    - longitude/lng/lon: ${requiredColumns['longitude/lng/lon'] ? '✓' : '✗'}\n` +
        `    - category/type: ${requiredColumns['category/type'] ? '✓' : '✗'}`
      );
    } else {
      console.log(`📋 Detected ${headers.length} columns${allRequiredPresent ? ', all required fields present ✓' : ' - some required fields may be missing!'}`);
    }

    if (!allRequiredPresent) {
      const missing = Object.entries(requiredColumns)
        .filter(([_, present]) => !present)
        .map(([name, _]) => name);
      console.warn(`⚠ Missing required column(s): ${missing.join(', ')}`);
    }

    return rows
      .map((row, index) => {
        try {
          return this.parseRow(row, headerMap, originalHeaders, index + 2); // +2 because row 1 is header, index starts at 0
        } catch (error) {
          console.warn(`⚠ Error parsing row ${index + 2}:`, error);
          return null;
        }
      })
      .filter((loc): loc is Partial<Location> => loc !== null);
  }

  /**
   * Create a map of header names to column indices
   */
  private createHeaderMap(headers: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    headers.forEach((header, index) => {
      // Normalize header names (lowercase, trim, remove spaces)
      const normalized = header.toLowerCase().trim().replace(/\s+/g, '_');
      map[normalized] = index;
    });
    return map;
  }

  /**
   * Parse a single row into a Location object
   */
  private parseRow(
    row: string[],
    headerMap: Record<string, number>,
    originalHeaders: string[],
    rowNumber?: number
  ): Partial<Location> | null {
    const getValue = (key: string): string | undefined => {
      const index = headerMap[key];
      return index !== undefined ? row[index]?.trim() : undefined;
    };

    const getNumber = (key: string): number | undefined => {
      const value = getValue(key);
      if (!value) return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Required fields
    const id = getValue('id');
    const name = getValue('name');
    const latitude = getNumber('latitude') ?? getNumber('lat');
    const longitude = getNumber('longitude') ?? getNumber('lng') ?? getNumber('lon');
    const category = getValue('category') ?? getValue('type');

    if (!id || !name || latitude === undefined || longitude === undefined || !category) {
      // Determine which specific fields are missing
      const missingFields: string[] = [];
      if (!id) missingFields.push('id');
      if (!name) missingFields.push('name');
      if (latitude === undefined) missingFields.push('latitude/lat');
      if (longitude === undefined) missingFields.push('longitude/lng/lon');
      if (!category) missingFields.push('category/type');

      const rowLabel = rowNumber ? `Row ${rowNumber}` : 'Row';

      if (this.debug) {
        console.warn(
          `⚠ ${rowLabel} missing required fields: ${missingFields.join(', ')}\n` +
          `  Found values: ${JSON.stringify({ id, name, latitude, longitude, category })}\n` +
          `  Available columns: ${Object.keys(headerMap).join(', ')}\n` +
          `  Row data: [${row.slice(0, 5).join(', ')}${row.length > 5 ? '...' : ''}]`
        );
      } else {
        console.warn(`⚠ ${rowLabel} missing required fields: ${missingFields.join(', ')}`);
      }

      return null;
    }

    // Address
    const address: Address = {
      street: getValue('street') ?? getValue('address'),
      city: getValue('city') ?? '',
      state: getValue('state') ?? '',
      zip: getValue('zip') ?? getValue('zipcode') ?? getValue('postal_code'),
      country: getValue('country'),
    };

    // Contact
    const contact: Contact | undefined = (() => {
      const phone = getValue('phone');
      const email = getValue('email');
      const website = getValue('website');

      if (!phone && !email && !website) return undefined;

      return {
        phone,
        email,
        website,
      };
    })();

    // Images - handle comma-separated URLs
    const imagesStr = getValue('images') ?? getValue('image');
    const images = imagesStr
      ? imagesStr.split(',').map((url) => url.trim()).filter(Boolean)
      : undefined;

    // Custom fields - look for columns that aren't standard fields
    const customFields: Record<string, string | number | boolean> = {};
    const standardFields = new Set([
      'id',
      'name',
      'latitude',
      'lat',
      'longitude',
      'lng',
      'lon',
      'category',
      'type',
      'description',
      'street',
      'address',
      'city',
      'state',
      'zip',
      'zipcode',
      'postal_code',
      'country',
      'phone',
      'email',
      'website',
      'url',
      'images',
      'image',
      'hours',
      'last_updated',
      'lastupdated',
    ]);

    // Use original headers for custom field keys (preserves case)
    originalHeaders.forEach((originalHeader, index) => {
      const normalizedHeader = originalHeader.toLowerCase().trim().replace(/\s+/g, '_');
      if (!standardFields.has(normalizedHeader) && row[index]?.trim()) {
        customFields[originalHeader] = row[index].trim();
      }
    });

    const location: Partial<Location> = {
      id,
      name,
      latitude,
      longitude,
      category,
      description: getValue('description') ?? '',
      address,
      contact,
      url: getValue('url'),
      images,
      hours: getValue('hours'),
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      lastUpdated: getValue('last_updated') ?? getValue('lastupdated'),
    };

    return location;
  }

  /**
   * Validate schema of parsed data
   */
  validateSchema(data: Partial<Location>[]): Location[] {
    return validateLocations(data);
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}
