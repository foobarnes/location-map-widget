/**
 * Google Sheets Proxy Endpoint for Vercel Edge Functions
 *
 * This serverless function acts as a secure proxy between your widget
 * and the Google Sheets API, keeping your API key hidden from clients.
 *
 * Setup:
 * 1. Deploy to Vercel: `vercel`
 * 2. Add environment variable: `vercel env add GOOGLE_SHEETS_API_KEY`
 * 3. Use proxy URL in widget: https://your-app.vercel.app/api/sheets
 *
 * Security features:
 * - API key stored securely in environment variables
 * - CORS restrictions (configure for your domain)
 * - Rate limiting (optional - see below)
 * - Error handling without exposing internals
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple in-memory rate limiter
 * For production, consider using Vercel KV or Upstash Redis
 */
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(
  ip: string,
  maxRequests = 100,
  windowMs = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];

  // Remove old requests outside window
  const recentRequests = requests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    for (const [key, times] of rateLimiter.entries()) {
      const recent = times.filter((time) => now - time < windowMs);
      if (recent.length === 0) {
        rateLimiter.delete(key);
      } else {
        rateLimiter.set(key, recent);
      }
    }
  }

  return true;
}

/**
 * Main proxy handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers - IMPORTANT: Restrict to your domain in production!
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000', // For development
    'http://localhost:5173', // Vite dev server
  ];

  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported',
    });
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string) ||
                   (req.headers['x-real-ip'] as string) ||
                   'unknown';

  if (!checkRateLimit(clientIp, 100, 60000)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
    });
  }

  // Get parameters
  const { sheetId } = req.query;
  const range = (req.query.range as string) || 'Sheet1';

  // Validate sheet ID
  if (!sheetId || typeof sheetId !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Sheet ID is required',
    });
  }

  // Get API key from environment
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_SHEETS_API_KEY environment variable not set');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'API key not configured. Please contact the administrator.',
    });
  }

  try {
    // Fetch from Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Handle Google API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error('Google Sheets API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Return user-friendly error without exposing API details
      if (response.status === 403) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Unable to access the requested sheet. Check sheet sharing settings.',
        });
      } else if (response.status === 404) {
        return res.status(404).json({
          error: 'Sheet not found',
          message: 'The requested sheet could not be found. Verify the sheet ID.',
        });
      } else {
        return res.status(response.status).json({
          error: 'API error',
          message: 'Failed to fetch sheet data. Please try again later.',
        });
      }
    }

    // Forward successful response
    const data = await response.json();

    // Add cache headers (optional)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // 5 min cache

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}
