/**
 * Google Sheets API adapter (Direct API Mode)
 * Fetches location data from Google Sheets using API key directly
 *
 * ⚠️ SECURITY WARNING ⚠️
 * This adapter exposes your API key in client-side code. To use securely:
 *
 * 1. Restrict your API key in Google Cloud Console:
 *    - Set HTTP referrer restrictions to your domain(s)
 *    - Restrict to Google Sheets API only
 *    - Set usage quotas and billing alerts
 *
 * 2. Consider more secure alternatives:
 *    - PublicSheetsAdapter: No API key (use published sheets)
 *    - GoogleSheetsProxyAdapter: API key hidden in backend
 *
 * 3. Monitor your API usage regularly in Google Cloud Console
 *
 * See docs/security-guide.md for detailed security recommendations
 */

import axios from 'axios';
import type {
  DataAdapter,
  Location,
  GoogleSheetsDataSource,
  GoogleSheetsResponse,
  Address,
  Contact,
} from '../types';
import { validateLocations } from '../utils/validation';

export class GoogleSheetsAdapter implements DataAdapter {
  private sheetId: string;
  private apiKey: string;
  private range: string;
  private cache: Location[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: GoogleSheetsDataSource) {
    this.sheetId = config.sheetId;
    this.apiKey = config.apiKey;
    this.range = config.range || 'Sheet1'; // Default to first sheet

    // Security warning for development environments
    if (this.isInsecureEnvironment()) {
      console.warn(
        '⚠️ SECURITY WARNING: Google Sheets API key detected in client-side code.\n' +
        'Your API key is visible to anyone who views this page.\n\n' +
        'To secure your API key:\n' +
        '1. Set HTTP referrer restrictions in Google Cloud Console\n' +
        '2. Restrict to Google Sheets API only\n' +
        '3. Set usage quotas and billing alerts\n\n' +
        'For maximum security, consider:\n' +
        '- PublicSheetsAdapter (no API key needed)\n' +
        '- GoogleSheetsProxyAdapter (API key hidden in backend)\n\n' +
        'See: https://console.cloud.google.com/apis/credentials'
      );
    }
  }

  /**
   * Check if running in an insecure environment
   */
  private isInsecureEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    const location = window.location;

    // Warn on localhost or file:// protocol
    return (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.protocol === 'file:' ||
      location.hostname === ''
    );
  }

  /**
   * Fetch locations from Google Sheets
   */
  async fetchLocations(): Promise<Location[]> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      console.log('Returning cached location data');
      return this.cache;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`;

      const response = await axios.get<GoogleSheetsResponse>(url);

      if (!response.data || !response.data.values) {
        throw new Error('No data returned from Google Sheets');
      }

      const rawLocations = this.parseSheetData(response.data.values);
      const validatedLocations = this.validateSchema(rawLocations);

      // Update cache
      this.cache = validatedLocations;
      this.cacheTime = Date.now();

      return validatedLocations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Invalid API key or insufficient permissions');
        } else if (error.response?.status === 404) {
          throw new Error('Sheet not found. Check sheet ID and range');
        } else {
          throw new Error(`Failed to fetch data: ${error.message}`);
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
      console.warn('Sheet has no data rows');
      return [];
    }

    const [headers, ...rows] = values;
    const headerMap = this.createHeaderMap(headers);

    return rows.map((row, index) => {
      try {
        return this.parseRow(row, headerMap);
      } catch (error) {
        console.warn(`Error parsing row ${index + 2}:`, error);
        return null;
      }
    }).filter((loc): loc is Partial<Location> => loc !== null);
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
  private parseRow(row: string[], headerMap: Record<string, number>): Partial<Location> | null {
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
      console.warn('Row missing required fields');
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
      ? imagesStr.split(',').map(url => url.trim()).filter(Boolean)
      : undefined;

    // Custom fields - look for columns that aren't standard fields
    const customFields: Record<string, string | number | boolean> = {};
    const standardFields = new Set([
      'id', 'name', 'latitude', 'lat', 'longitude', 'lng', 'lon',
      'category', 'type', 'description', 'street', 'address', 'city',
      'state', 'zip', 'zipcode', 'postal_code', 'country', 'phone',
      'email', 'website', 'url', 'images', 'image', 'hours',
      'last_updated', 'lastupdated'
    ]);

    Object.entries(headerMap).forEach(([header, index]) => {
      if (!standardFields.has(header) && row[index]?.trim()) {
        customFields[header] = row[index].trim();
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
