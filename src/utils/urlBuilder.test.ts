import { describe, it, expect } from 'vitest';
import { buildEmbedURL, generateIframeCode, EmbedURLExamples } from './urlBuilder';
import type { DataSourceConfig, EmbedOptions } from '../types';

describe('buildEmbedURL', () => {
  const baseUrl = 'https://example.com/embed.html';

  describe('Data Source Parameters', () => {
    it('should build URL for google-sheets data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets',
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=google-sheets');
      expect(url).toContain('sheetId=test-sheet-id');
      expect(url).toContain('apiKey=test-api-key');
    });

    it('should build URL for google-sheets with range', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets',
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key',
        range: 'Sheet1!A1:Z100',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('range=Sheet1%21A1%3AZ100'); // URL encoded
    });

    it('should build URL for google-sheets-public data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=google-sheets-public');
      expect(url).toContain('sheetId=public-sheet-id');
      expect(url).not.toContain('apiKey');
    });

    it('should build URL for google-sheets-public with gid', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-public',
        sheetId: 'public-sheet-id',
        gid: '123',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('gid=123');
    });

    it('should build URL for google-sheets-proxy data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-proxy',
        proxyUrl: 'https://proxy.example.com/api/sheets',
        sheetId: 'proxy-sheet-id',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=google-sheets-proxy');
      expect(url).toContain('proxyUrl=https%3A%2F%2Fproxy.example.com%2Fapi%2Fsheets');
      expect(url).toContain('sheetId=proxy-sheet-id');
    });

    it('should build URL for csv data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'csv',
        url: 'https://example.com/data.csv',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=csv');
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fdata.csv');
    });

    it('should build URL for json data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'json',
        url: 'https://api.example.com/locations.json',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=json');
      expect(url).toContain('url=https%3A%2F%2Fapi.example.com%2Flocations.json');
    });

    it('should build URL for mock data source', () => {
      const dataSource: DataSourceConfig = {
        type: 'mock',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=mock');
      expect(url).not.toContain('url=');
      expect(url).not.toContain('sheetId=');
    });
  });

  describe('Embed Options Parameters', () => {
    const dataSource: DataSourceConfig = {
      type: 'mock',
    };

    it('should add visual options', () => {
      const embedOptions: EmbedOptions = {
        height: '800px',
        width: '100%',
        theme: 'dark',
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('height=800px');
      expect(url).toContain('width=100%25'); // % is encoded
      expect(url).toContain('theme=dark');
    });

    it('should add feature toggle options', () => {
      const embedOptions: EmbedOptions = {
        hideSearch: true,
        hideTable: false,
        hideFilters: true,
        hideGeolocation: false,
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('hideSearch=true');
      expect(url).toContain('hideTable=false');
      expect(url).toContain('hideFilters=true');
      expect(url).toContain('hideGeolocation=false');
    });

    it('should add defaultView option', () => {
      const embedOptions: EmbedOptions = {
        defaultView: 'table',
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('defaultView=table');
    });

    it('should add initial state options', () => {
      const embedOptions: EmbedOptions = {
        lat: 40.7128,
        lng: -74.006,
        zoom: 12,
        category: 'restaurant',
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('lat=40.7128');
      expect(url).toContain('lng=-74.006');
      expect(url).toContain('zoom=12');
      expect(url).toContain('category=restaurant');
    });

    it('should handle all embed options together', () => {
      const embedOptions: EmbedOptions = {
        height: '700px',
        width: '1200px',
        theme: 'dark',
        hideSearch: true,
        hideFilters: false,
        defaultView: 'map',
        lat: 34.0522,
        lng: -118.2437,
        zoom: 11,
        category: 'hotel',
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('height=700px');
      expect(url).toContain('theme=dark');
      expect(url).toContain('hideSearch=true');
      expect(url).toContain('hideFilters=false');
      expect(url).toContain('defaultView=map');
      expect(url).toContain('lat=34.0522');
      expect(url).toContain('lng=-118.2437');
      expect(url).toContain('zoom=11');
      expect(url).toContain('category=hotel');
    });

    it('should not add undefined embed options', () => {
      const embedOptions: EmbedOptions = {
        height: '600px',
        // Other options undefined
      };

      const url = buildEmbedURL(baseUrl, dataSource, embedOptions);

      expect(url).toContain('height=600px');
      expect(url).not.toContain('theme=');
      expect(url).not.toContain('hideSearch=');
      expect(url).not.toContain('lat=');
    });
  });

  describe('URL Building', () => {
    it('should preserve existing base URL parameters', () => {
      const baseUrlWithParams = 'https://example.com/embed.html?existing=param';
      const dataSource: DataSourceConfig = {
        type: 'mock',
      };

      const url = buildEmbedURL(baseUrlWithParams, dataSource);

      expect(url).toContain('existing=param');
      expect(url).toContain('type=mock');
    });

    it('should return valid URL object', () => {
      const dataSource: DataSourceConfig = {
        type: 'mock',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      // Should be parseable as URL
      expect(() => new URL(url)).not.toThrow();
    });

    it('should properly encode special characters', () => {
      const dataSource: DataSourceConfig = {
        type: 'csv',
        url: 'https://example.com/data.csv?key=value&foo=bar',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      // URL should be encoded
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fdata.csv%3Fkey%3Dvalue%26foo%3Dbar');
    });
  });

  describe('Without Embed Options', () => {
    it('should build URL without embed options parameter', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-public',
        sheetId: 'test-sheet-id',
      };

      const url = buildEmbedURL(baseUrl, dataSource);

      expect(url).toContain('type=google-sheets-public');
      expect(url).toContain('sheetId=test-sheet-id');
      // Should not have any embed option parameters
      expect(url).not.toContain('theme=');
      expect(url).not.toContain('height=');
    });
  });
});

describe('generateIframeCode', () => {
  const embedUrl = 'https://example.com/embed.html?type=mock';

  it('should generate basic iframe code', () => {
    const iframeCode = generateIframeCode(embedUrl);

    expect(iframeCode).toContain('<iframe');
    expect(iframeCode).toContain(`src="${embedUrl}"`);
    expect(iframeCode).toContain('</iframe>');
  });

  it('should use default width and height', () => {
    const iframeCode = generateIframeCode(embedUrl);

    expect(iframeCode).toContain('width="100%"');
    expect(iframeCode).toContain('height="600px"');
  });

  it('should use default title', () => {
    const iframeCode = generateIframeCode(embedUrl);

    expect(iframeCode).toContain('title="Interactive Map"');
  });

  it('should use default frameborder', () => {
    const iframeCode = generateIframeCode(embedUrl);

    expect(iframeCode).toContain('frameborder="0"');
  });

  it('should not include allowfullscreen by default', () => {
    const iframeCode = generateIframeCode(embedUrl);

    expect(iframeCode).not.toContain('allowfullscreen');
  });

  it('should use custom width and height', () => {
    const iframeCode = generateIframeCode(embedUrl, {
      width: '800px',
      height: '400px',
    });

    expect(iframeCode).toContain('width="800px"');
    expect(iframeCode).toContain('height="400px"');
  });

  it('should use custom title', () => {
    const iframeCode = generateIframeCode(embedUrl, {
      title: 'My Custom Map',
    });

    expect(iframeCode).toContain('title="My Custom Map"');
  });

  it('should use custom frameborder', () => {
    const iframeCode = generateIframeCode(embedUrl, {
      frameBorder: '1',
    });

    expect(iframeCode).toContain('frameborder="1"');
  });

  it('should include allowfullscreen when enabled', () => {
    const iframeCode = generateIframeCode(embedUrl, {
      allowFullScreen: true,
    });

    expect(iframeCode).toContain('allowfullscreen');
  });

  it('should generate valid HTML', () => {
    const iframeCode = generateIframeCode(embedUrl, {
      width: '1200px',
      height: '800px',
      title: 'Test Map',
      frameBorder: '0',
      allowFullScreen: true,
    });

    expect(iframeCode).toMatch(/<iframe\s+[^>]+><\/iframe>/);
    expect(iframeCode).toContain('src=');
    expect(iframeCode).toContain('width=');
    expect(iframeCode).toContain('height=');
    expect(iframeCode).toContain('title=');
    expect(iframeCode).toContain('frameborder=');
    expect(iframeCode).toContain('allowfullscreen');
  });

  it('should properly escape special characters in URL', () => {
    const urlWithSpecialChars = 'https://example.com/embed?foo=bar&baz=qux';
    const iframeCode = generateIframeCode(urlWithSpecialChars);

    expect(iframeCode).toContain(`src="${urlWithSpecialChars}"`);
  });
});

describe('EmbedURLExamples', () => {
  const baseUrl = 'https://example.com/embed.html';

  describe('publicGoogleSheet', () => {
    it('should generate URL for public Google Sheet', () => {
      const url = EmbedURLExamples.publicGoogleSheet(baseUrl, 'test-sheet-id');

      expect(url).toContain('type=google-sheets-public');
      expect(url).toContain('sheetId=test-sheet-id');
    });

    it('should include gid when provided', () => {
      const url = EmbedURLExamples.publicGoogleSheet(baseUrl, 'test-sheet-id', '123');

      expect(url).toContain('gid=123');
    });

    it('should not include gid when not provided', () => {
      const url = EmbedURLExamples.publicGoogleSheet(baseUrl, 'test-sheet-id');

      expect(url).not.toContain('gid=');
    });
  });

  describe('csv', () => {
    it('should generate URL for CSV data source', () => {
      const csvUrl = 'https://example.com/data.csv';
      const url = EmbedURLExamples.csv(baseUrl, csvUrl);

      expect(url).toContain('type=csv');
      expect(url).toContain('url=');
    });
  });

  describe('darkTheme', () => {
    it('should generate URL with dark theme', () => {
      const dataSource: DataSourceConfig = {
        type: 'mock',
      };
      const url = EmbedURLExamples.darkTheme(baseUrl, dataSource);

      expect(url).toContain('type=mock');
      expect(url).toContain('theme=dark');
    });

    it('should work with any data source type', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-public',
        sheetId: 'test-sheet-id',
      };
      const url = EmbedURLExamples.darkTheme(baseUrl, dataSource);

      expect(url).toContain('type=google-sheets-public');
      expect(url).toContain('sheetId=test-sheet-id');
      expect(url).toContain('theme=dark');
    });
  });

  describe('customPosition', () => {
    it('should generate URL with custom position', () => {
      const dataSource: DataSourceConfig = {
        type: 'mock',
      };
      const url = EmbedURLExamples.customPosition(baseUrl, dataSource, 40.7128, -74.006, 12);

      expect(url).toContain('type=mock');
      expect(url).toContain('lat=40.7128');
      expect(url).toContain('lng=-74.006');
      expect(url).toContain('zoom=12');
    });

    it('should work with any data source type', () => {
      const dataSource: DataSourceConfig = {
        type: 'google-sheets-public',
        sheetId: 'test-sheet-id',
      };
      const url = EmbedURLExamples.customPosition(baseUrl, dataSource, 34.0522, -118.2437, 10);

      expect(url).toContain('type=google-sheets-public');
      expect(url).toContain('sheetId=test-sheet-id');
      expect(url).toContain('lat=34.0522');
      expect(url).toContain('lng=-118.2437');
      expect(url).toContain('zoom=10');
    });
  });
});
