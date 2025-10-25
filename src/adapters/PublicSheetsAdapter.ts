/**
 * Public Google Sheets adapter
 * Fetches data from published Google Sheets (CSV export) - no API key required
 *
 * How to publish a Google Sheet:
 * 1. File → Share → Publish to web
 * 2. Choose "Entire Document" or specific sheet
 * 3. Format: "Comma-separated values (.csv)"
 * 4. Click "Publish"
 *
 * Security: No API key exposure - uses public CSV export URL
 * Trade-off: 5-minute cache delay on Google's side
 */

import axios from 'axios';
import type {
  DataAdapter,
  Location,
  GoogleSheetsPublicDataSource,
  Address,
  Contact,
} from '../types';
import { validateLocations } from '../utils/validation';

export class PublicSheetsAdapter implements DataAdapter {
  private sheetId: string;
  private gid: string;
  private cache: Location[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: GoogleSheetsPublicDataSource) {
    this.sheetId = config.sheetId;
    this.gid = config.gid || '0'; // Default to first sheet (gid=0)
    // Note: range parameter is not used in public sheets (entire sheet is exported as CSV)
    // It's in the interface for consistency with other adapters
  }

  /**
   * Fetch locations from published Google Sheet
   */
  async fetchLocations(): Promise<Location[]> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      console.log('Returning cached location data');
      return this.cache;
    }

    try {
      // Public CSV export URL format
      const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv&gid=${this.gid}`;

      const response = await axios.get<string>(url, {
        responseType: 'text',
      });

      if (!response.data) {
        throw new Error('No data returned from published Google Sheet');
      }

      const rawLocations = this.parseCSV(response.data);
      const validatedLocations = this.validateSchema(rawLocations);

      // Update cache
      this.cache = validatedLocations;
      this.cacheTime = Date.now();

      return validatedLocations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(
            'Sheet not found. Make sure your Google Sheet is published to web: File → Share → Publish to web → CSV'
          );
        } else if (error.response?.status === 403) {
          throw new Error(
            'Access denied. Ensure your Google Sheet is published publicly.'
          );
        } else {
          throw new Error(`Failed to fetch data: ${error.message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Parse CSV data into Location objects
   */
  private parseCSV(csvData: string): Partial<Location>[] {
    const lines = csvData.trim().split('\n');

    if (lines.length < 2) {
      console.warn('CSV has no data rows');
      return [];
    }

    const [headerLine, ...dataLines] = lines;
    const headers = this.parseCSVLine(headerLine);
    const headerMap = this.createHeaderMap(headers);

    return dataLines
      .map((line, index) => {
        try {
          const values = this.parseCSVLine(line);
          return this.parseRow(values, headerMap);
        } catch (error) {
          console.warn(`Error parsing CSV row ${index + 2}:`, error);
          return null;
        }
      })
      .filter((loc): loc is Partial<Location> => loc !== null);
  }

  /**
   * Parse a CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last value
    values.push(current.trim());

    return values;
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
    headerMap: Record<string, number>
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
