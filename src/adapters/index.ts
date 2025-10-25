/**
 * Data adapters for different data sources
 */

export { GoogleSheetsAdapter } from './GoogleSheetsAdapter';
export { PublicSheetsAdapter } from './PublicSheetsAdapter';
export { GoogleSheetsProxyAdapter } from './GoogleSheetsProxyAdapter';
export { MockDataAdapter } from './MockDataAdapter';

import type { DataAdapter, DataSourceConfig } from '../types';
import { GoogleSheetsAdapter } from './GoogleSheetsAdapter';
import { PublicSheetsAdapter } from './PublicSheetsAdapter';
import { GoogleSheetsProxyAdapter } from './GoogleSheetsProxyAdapter';
import { MockDataAdapter } from './MockDataAdapter';

/**
 * Factory function to create the appropriate data adapter
 */
export function createDataAdapter(config: DataSourceConfig): DataAdapter {
  // Use mock data if explicitly requested
  if (config.type === 'mock') {
    console.log('🎭 Using mock data adapter for development');
    return new MockDataAdapter();
  }

  // Use mock data if API key is placeholder or missing (for backward compatibility)
  if (
    config.type === 'google-sheets' &&
    (!config.apiKey || config.apiKey.includes('YOUR_') || config.apiKey === '')
  ) {
    console.warn('⚠️  Using mock data adapter (invalid Google Sheets credentials)');
    return new MockDataAdapter();
  }

  switch (config.type) {
    case 'google-sheets':
      console.log('📊 Using Google Sheets API adapter (Direct - API key exposed)');
      return new GoogleSheetsAdapter(config);

    case 'google-sheets-public':
      console.log('📊 Using Public Google Sheets adapter (Secure - no API key)');
      return new PublicSheetsAdapter(config);

    case 'google-sheets-proxy':
      console.log('🔒 Using Google Sheets Proxy adapter (Secure - API key hidden)');
      return new GoogleSheetsProxyAdapter(config);

    case 'csv':
      throw new Error('CSV adapter not yet implemented');

    case 'json':
      throw new Error('JSON adapter not yet implemented');

    default:
      throw new Error(`Unknown data source type: ${(config as any).type}`);
  }
}
