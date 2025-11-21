import { describe, it, expect } from 'vitest';
import { parseURLConfig, embedOptionsToWidgetConfig } from './urlConfig';
import type { EmbedOptions } from '../types';

describe('parseURLConfig', () => {
  describe('Data Source Parsing', () => {
    it('should parse google-sheets data source with all parameters', () => {
      const params = new URLSearchParams({
        type: 'google-sheets',
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key',
        range: 'Sheet1!A1:Z100',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'google-sheets',
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key',
        range: 'Sheet1!A1:Z100',
      });
    });

    it('should parse google-sheets-public data source with gid', () => {
      const params = new URLSearchParams({
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
        gid: '123',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
        gid: '123',
      });
    });

    it('should parse google-sheets-public data source without gid', () => {
      const params = new URLSearchParams({
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
      });
    });

    it('should parse google-sheets-proxy data source', () => {
      const params = new URLSearchParams({
        type: 'google-sheets-proxy',
        proxyUrl: 'https://proxy.example.com/api/sheets',
        sheetId: 'proxy-sheet-id',
        range: 'Data!A1:Z1000',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'google-sheets-proxy',
        proxyUrl: 'https://proxy.example.com/api/sheets',
        sheetId: 'proxy-sheet-id',
        range: 'Data!A1:Z1000',
      });
    });

    it('should parse csv data source', () => {
      const params = new URLSearchParams({
        type: 'csv',
        url: 'https://example.com/data.csv',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'csv',
        url: 'https://example.com/data.csv',
      });
    });

    it('should parse json data source', () => {
      const params = new URLSearchParams({
        type: 'json',
        url: 'https://api.example.com/locations.json',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'json',
        url: 'https://api.example.com/locations.json',
      });
    });

    it('should parse mock data source', () => {
      const params = new URLSearchParams({
        type: 'mock',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'mock',
      });
    });

    it('should return undefined dataSource for unknown type', () => {
      const params = new URLSearchParams({
        type: 'unknown-type',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toBeUndefined();
    });

    it('should return undefined dataSource when type is missing', () => {
      const params = new URLSearchParams({
        sheetId: 'test-sheet-id',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toBeUndefined();
    });

    it('should return undefined for google-sheets without required parameters', () => {
      const params = new URLSearchParams({
        type: 'google-sheets',
        sheetId: 'test-sheet-id',
        // Missing apiKey
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toBeUndefined();
    });
  });

  describe('Embed Options Parsing', () => {
    it('should parse visual options', () => {
      const params = new URLSearchParams({
        type: 'mock',
        height: '800px',
        width: '100%',
        theme: 'dark',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions).toEqual({
        height: '800px',
        width: '100%',
        theme: 'dark',
      });
    });

    it('should parse feature toggle options', () => {
      const params = new URLSearchParams({
        type: 'mock',
        hideSearch: 'true',
        hideTable: 'false',
        hideFilters: 'true',
        hideGeolocation: 'false',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions).toEqual({
        hideSearch: true,
        hideTable: false,
        hideFilters: true,
        hideGeolocation: false,
      });
    });

    it('should parse defaultView option', () => {
      const params = new URLSearchParams({
        type: 'mock',
        defaultView: 'table',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions?.defaultView).toBe('table');
    });

    it('should ignore invalid defaultView values', () => {
      const params = new URLSearchParams({
        type: 'mock',
        defaultView: 'invalid',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions?.defaultView).toBeUndefined();
    });

    it('should parse initial state options', () => {
      const params = new URLSearchParams({
        type: 'mock',
        lat: '40.7128',
        lng: '-74.0060',
        zoom: '12',
        category: 'restaurant',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions).toEqual({
        lat: 40.7128,
        lng: -74.006,
        zoom: 12,
        category: 'restaurant',
      });
    });

    it('should handle invalid numeric values', () => {
      const params = new URLSearchParams({
        type: 'mock',
        lat: 'invalid',
        lng: 'also-invalid',
        zoom: 'not-a-number',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions?.lat).toBeUndefined();
      expect(result.embedOptions?.lng).toBeUndefined();
      expect(result.embedOptions?.zoom).toBeUndefined();
    });

    it('should parse all theme values correctly', () => {
      const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];

      themes.forEach((theme) => {
        const params = new URLSearchParams({
          type: 'mock',
          theme,
        });

        const result = parseURLConfig(params);

        expect(result.embedOptions?.theme).toBe(theme);
      });
    });

    it('should ignore invalid theme values', () => {
      const params = new URLSearchParams({
        type: 'mock',
        theme: 'invalid-theme',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions?.theme).toBeUndefined();
    });

    it('should not set embedOptions when no options provided', () => {
      const params = new URLSearchParams({
        type: 'mock',
      });

      const result = parseURLConfig(params);

      expect(result.embedOptions).toBeUndefined();
    });
  });

  describe('Combined Data Source and Embed Options', () => {
    it('should parse both data source and embed options', () => {
      const params = new URLSearchParams({
        type: 'google-sheets-public',
        sheetId: 'test-sheet-id',
        theme: 'dark',
        hideSearch: 'true',
        lat: '40.7128',
        lng: '-74.0060',
        zoom: '10',
      });

      const result = parseURLConfig(params);

      expect(result.dataSource).toEqual({
        type: 'google-sheets-public',
        sheetId: 'test-sheet-id',
      });

      expect(result.embedOptions).toEqual({
        theme: 'dark',
        hideSearch: true,
        lat: 40.7128,
        lng: -74.006,
        zoom: 10,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty URLSearchParams', () => {
      const params = new URLSearchParams();

      const result = parseURLConfig(params);

      expect(result.dataSource).toBeUndefined();
      expect(result.embedOptions).toBeUndefined();
    });

    it('should handle window.location.search when no params provided', () => {
      // This test relies on the default behavior
      const result = parseURLConfig();

      // Should use window.location.search (which is empty in test environment)
      expect(result).toBeDefined();
    });
  });
});

describe('embedOptionsToWidgetConfig', () => {
  it('should convert height', () => {
    const embedOptions: EmbedOptions = {
      height: '700px',
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.height).toBe('700px');
  });

  it('should convert theme', () => {
    const embedOptions: EmbedOptions = {
      theme: 'dark',
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.theme).toBe('dark');
  });

  it('should convert defaultView', () => {
    const embedOptions: EmbedOptions = {
      defaultView: 'table',
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.defaultView).toBe('table');
  });

  it('should convert lat/lng to defaultCenter', () => {
    const embedOptions: EmbedOptions = {
      lat: 40.7128,
      lng: -74.006,
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.defaultCenter).toEqual([40.7128, -74.006]);
  });

  it('should not set defaultCenter if only lat is provided', () => {
    const embedOptions: EmbedOptions = {
      lat: 40.7128,
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.defaultCenter).toBeUndefined();
  });

  it('should not set defaultCenter if only lng is provided', () => {
    const embedOptions: EmbedOptions = {
      lng: -74.006,
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.defaultCenter).toBeUndefined();
  });

  it('should convert zoom to defaultZoom', () => {
    const embedOptions: EmbedOptions = {
      zoom: 15,
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.defaultZoom).toBe(15);
  });

  it('should invert hideSearch to enableSearch', () => {
    const embedOptions1: EmbedOptions = {
      hideSearch: true,
    };
    const result1 = embedOptionsToWidgetConfig(embedOptions1);
    expect(result1.enableSearch).toBe(false);

    const embedOptions2: EmbedOptions = {
      hideSearch: false,
    };
    const result2 = embedOptionsToWidgetConfig(embedOptions2);
    expect(result2.enableSearch).toBe(true);
  });

  it('should invert hideGeolocation to enableGeolocation', () => {
    const embedOptions1: EmbedOptions = {
      hideGeolocation: true,
    };
    const result1 = embedOptionsToWidgetConfig(embedOptions1);
    expect(result1.enableGeolocation).toBe(false);

    const embedOptions2: EmbedOptions = {
      hideGeolocation: false,
    };
    const result2 = embedOptionsToWidgetConfig(embedOptions2);
    expect(result2.enableGeolocation).toBe(true);
  });

  it('should invert hideFilters to enableFilters', () => {
    const embedOptions1: EmbedOptions = {
      hideFilters: true,
    };
    const result1 = embedOptionsToWidgetConfig(embedOptions1);
    expect(result1.enableFilters).toBe(false);

    const embedOptions2: EmbedOptions = {
      hideFilters: false,
    };
    const result2 = embedOptionsToWidgetConfig(embedOptions2);
    expect(result2.enableFilters).toBe(true);
  });

  it('should not set enable flags if hide flags are undefined', () => {
    const embedOptions: EmbedOptions = {};

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result.enableSearch).toBeUndefined();
    expect(result.enableGeolocation).toBeUndefined();
    expect(result.enableFilters).toBeUndefined();
  });

  it('should convert all options together', () => {
    const embedOptions: EmbedOptions = {
      height: '800px',
      theme: 'dark',
      defaultView: 'table',
      lat: 34.0522,
      lng: -118.2437,
      zoom: 11,
      hideSearch: true,
      hideFilters: false,
      hideGeolocation: true,
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result).toEqual({
      height: '800px',
      theme: 'dark',
      defaultView: 'table',
      defaultCenter: [34.0522, -118.2437],
      defaultZoom: 11,
      enableSearch: false,
      enableFilters: true,
      enableGeolocation: false,
    });
  });

  it('should ignore width (not used in widget config)', () => {
    const embedOptions: EmbedOptions = {
      width: '100%',
      height: '600px',
    };

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result).toEqual({
      height: '600px',
    });
    expect((result as any).width).toBeUndefined();
  });

  it('should handle empty embed options', () => {
    const embedOptions: EmbedOptions = {};

    const result = embedOptionsToWidgetConfig(embedOptions);

    expect(result).toEqual({});
  });
});
