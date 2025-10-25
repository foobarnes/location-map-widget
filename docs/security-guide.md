# Security Guide - Location Map Widget

A comprehensive guide to securely deploying the Location Map Widget with Google Sheets integration.

## Table of Contents

- [Security Overview](#security-overview)
- [Three Deployment Modes](#three-deployment-modes)
- [Quick Start (Public Sheets - Most Secure & Easiest)](#quick-start-public-sheets---most-secure--easiest)
- [Standard Deployment (Direct API - Like Google Maps)](#standard-deployment-direct-api---like-google-maps)
- [Advanced Deployment (Proxy - Maximum Security)](#advanced-deployment-proxy---maximum-security)
- [Security Comparison](#security-comparison)
- [Best Practices](#best-practices)
- [Common Security Mistakes](#common-security-mistakes)

---

## Security Overview

The Location Map Widget offers **three deployment modes** with different security trade-offs:

| Mode | Security Level | Setup Time | API Key Exposure | Best For |
|------|---------------|------------|------------------|----------|
| **Public Sheets** | ✅ High | 2 min | None (no API key) | Most users, demos, non-technical |
| **Direct API** | ⚠️ Medium | 10 min | Client-side (with restrictions) | Users comfortable with Google Cloud |
| **Proxy** | ✅ Maximum | 30 min | None (server-side) | Enterprises, security-critical |

---

## Three Deployment Modes

### Mode 1: Public Sheets (Recommended for Most Users)

**No API key required!** Uses Google's published sheet feature.

```html
<script>
  LocationMapWidget.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-public',
      sheetId: 'YOUR_SHEET_ID'
    }
  });
</script>
```

**Pros:**
- ✅ Zero API key management
- ✅ No security risks
- ✅ Free forever
- ✅ Easiest setup

**Cons:**
- ⚠️ 5-minute cache delay (Google's limitation)
- ⚠️ Sheet must be published publicly

**When to use:** Most websites, personal projects, demos, non-sensitive data

---

### Mode 2: Direct API (Like Google Maps)

Uses Google Sheets API directly with client-side API key (following Google's model).

```html
<script>
  LocationMapWidget.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets',
      sheetId: 'YOUR_SHEET_ID',
      apiKey: 'YOUR_API_KEY'
    }
  });
</script>
```

**Pros:**
- ✅ Real-time updates (no 5-min delay)
- ✅ Flexible (can use private sheets)
- ✅ Still embeddable via CDN

**Cons:**
- ⚠️ API key visible in page source
- ⚠️ Requires Google Cloud setup
- ⚠️ Needs monitoring and restrictions

**When to use:** Need real-time updates, willing to manage API security

---

### Mode 3: Proxy (Maximum Security)

API key hidden in backend proxy, never exposed to client.

```html
<script>
  LocationMapWidget.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-proxy',
      proxyUrl: 'https://your-app.vercel.app/api/sheets',
      sheetId: 'YOUR_SHEET_ID'
    }
  });
</script>
```

**Pros:**
- ✅ API key completely hidden
- ✅ Full control over access
- ✅ Can add rate limiting, auth
- ✅ Production-grade security

**Cons:**
- ⚠️ Requires backend deployment
- ⚠️ More complex setup

**When to use:** Enterprises, security-critical apps, compliance requirements

---

## Quick Start (Public Sheets - Most Secure & Easiest)

### Step 1: Publish Your Google Sheet

1. Open your Google Sheet
2. Click **File → Share → Publish to web**
3. Choose:
   - **Document to publish**: "Entire Document" or specific sheet
   - **Format**: "Comma-separated values (.csv)"
4. Click **"Publish"**
5. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
                                          ^^^^^^^^^^^^^^
   ```

### Step 2: Embed the Widget

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/location-map-widget@latest/dist/location-map-widget.css">
</head>
<body>
  <div id="map" style="height: 600px;"></div>

  <script src="https://unpkg.com/location-map-widget@latest/dist/location-map-widget.umd.js"></script>
  <script>
    LocationMapWidget.init({
      container: '#map',
      dataSource: {
        type: 'google-sheets-public',
        sheetId: 'YOUR_SHEET_ID'  // Paste your Sheet ID here
      }
    });
  </script>
</body>
</html>
```

### Step 3: Done!

No API key, no security risks, no configuration needed.

**Note:** Changes to your sheet may take up to 5 minutes to appear (Google's cache).

---

## Standard Deployment (Direct API - Like Google Maps)

This mode follows Google Maps' approach: client-side API key with restrictions.

### Step 1: Create Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Library
   - Search "Google Sheets API"
   - Click "Enable"
4. Create API Key:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy the API key

### Step 2: Restrict Your API Key (CRITICAL)

**⚠️ NEVER skip this step!**

1. Click "Restrict Key" or edit your API key
2. Set **Application Restrictions**:
   - Choose "HTTP referrers (web sites)"
   - Add your domain(s):
     ```
     https://yourdomain.com/*
     https://*.yourdomain.com/*
     ```
   - For development, add:
     ```
     http://localhost:*
     http://127.0.0.1:*
     ```
3. Set **API Restrictions**:
   - Choose "Restrict key"
   - Select only "Google Sheets API"
4. Click "Save"

### Step 3: Set Usage Quotas

1. Go to **APIs & Services → Quotas**
2. Find "Google Sheets API"
3. Set reasonable limits:
   - Read requests per day: 10,000 (adjust as needed)
   - Requests per 100 seconds: 100
4. Enable **billing alerts** in Billing section

### Step 4: Make Sheet Publicly Readable

1. Open your Google Sheet
2. Click "Share" (top right)
3. Change to: **"Anyone with the link can view"**
4. Copy the Sheet ID from URL

### Step 5: Embed the Widget

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/location-map-widget@latest/dist/location-map-widget.css">
</head>
<body>
  <div id="map" style="height: 600px;"></div>

  <script src="https://unpkg.com/location-map-widget@latest/dist/location-map-widget.umd.js"></script>
  <script>
    LocationMapWidget.init({
      container: '#map',
      dataSource: {
        type: 'google-sheets',
        sheetId: 'YOUR_SHEET_ID',
        apiKey: 'YOUR_RESTRICTED_API_KEY'
      }
    });
  </script>
</body>
</html>
```

### Step 6: Monitor Usage

1. Check [Google Cloud Console → APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Monitor for unusual activity
3. Set up email alerts for quota warnings

---

## Advanced Deployment (Proxy - Maximum Security)

### Architecture

```
User Browser → Widget (no API key) → Your Proxy → Google Sheets API
```

Your API key never leaves the server.

### Step 1: Create Proxy Endpoint

Create a simple Edge Function (Vercel example):

**File: `api/sheets/[sheetId].ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sheetId } = req.query;
  const range = (req.query.range as string) || 'Sheet1';
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch sheet data' });
  }
}
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add GOOGLE_SHEETS_API_KEY
# Paste your API key when prompted
```

### Step 3: Embed the Widget

```html
<script>
  LocationMapWidget.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-proxy',
      proxyUrl: 'https://your-app.vercel.app/api/sheets',
      sheetId: 'YOUR_SHEET_ID'
    }
  });
</script>
```

### Advanced: Add Rate Limiting

```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];

  // Remove old requests outside window
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}

// Use in handler
const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
if (!checkRateLimit(clientIp as string)) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

---

## Security Comparison

### What Each Mode Protects Against

| Threat | Public Sheets | Direct API (Restricted) | Proxy |
|--------|--------------|-------------------------|-------|
| **API key theft** | ✅ N/A (no key) | ⚠️ Key visible but restricted | ✅ Key hidden |
| **Quota abuse** | ✅ Free, unlimited | ⚠️ Protected by restrictions | ✅ Server controls |
| **Unauthorized access** | ⚠️ Sheet must be public | ⚠️ Sheet must be public | ✅ Can be private |
| **Data exfiltration** | ⚠️ Anyone can download CSV | ⚠️ Anyone can read sheet | ✅ Proxy controls access |
| **DoS attacks** | ✅ Google's infrastructure | ⚠️ Quota limits | ✅ Rate limiting |

### Cost Comparison

| Mode | Cost | Notes |
|------|------|-------|
| **Public Sheets** | $0 | Free forever |
| **Direct API** | $0 | Free tier: 500 requests/day |
| **Proxy** | $0-$20/mo | Free tier covers most use cases |

---

## Best Practices

### For All Modes

1. **Don't store sensitive data** in publicly accessible sheets
2. **Use HTTPS** always
3. **Monitor for changes** in your sheet access patterns
4. **Keep backups** of your sheet data
5. **Document your setup** for team members

### For Direct API Mode

1. **Always restrict API keys** - Never use unrestricted keys
2. **Rotate keys periodically** (every 90 days recommended)
3. **Set quota alerts** at 80% of your limit
4. **Use separate keys** for dev/staging/production
5. **Monitor usage daily** in first week after deployment
6. **Test restrictions** before going live

### For Proxy Mode

1. **Use environment variables** for secrets
2. **Enable CORS** only for your domains
3. **Add rate limiting** to prevent abuse
4. **Log requests** for monitoring
5. **Set up alerts** for errors and unusual traffic
6. **Keep dependencies updated**

---

## Common Security Mistakes

### ❌ Mistake #1: Unrestricted API Key

**Bad:**
```javascript
// API key with no restrictions
apiKey: 'AIzaSyDZXYZ123...'  // Works from anywhere!
```

**Good:**
```javascript
// Same key, but restricted in Google Cloud Console to:
// - Your domain only
// - Google Sheets API only
// - Reasonable quotas
```

---

### ❌ Mistake #2: Hardcoding Sensitive Sheets

**Bad:**
```javascript
// Private financial data with public API key
sheetId: '1private-financial-data-xyz'
```

**Good:**
```javascript
// Use public sheets mode for public data only
// For private data, use proxy mode
```

---

### ❌ Mistake #3: Ignoring Quota Limits

**Bad:**
```javascript
// No quotas set - could cost $$$$ if abused
```

**Good:**
```javascript
// Set in Google Cloud Console:
// - Requests per day: 10,000
// - Billing alerts at $10
```

---

### ❌ Mistake #4: Forgetting HTTPS

**Bad:**
```html
<!-- HTTP site with API key in source -->
<script src="http://example.com/...">
```

**Good:**
```html
<!-- HTTPS only -->
<script src="https://example.com/...">
```

---

### ❌ Mistake #5: No Monitoring

**Bad:**
```
// Deploy and forget
```

**Good:**
```
// Check Google Cloud Console weekly
// Set up email alerts
// Review access logs
```

---

## Security Checklist

### Before Going Live

- [ ] Chosen appropriate deployment mode for security needs
- [ ] If using Direct API:
  - [ ] API key is restricted to your domain(s)
  - [ ] API key is restricted to Google Sheets API only
  - [ ] Usage quotas are set
  - [ ] Billing alerts are configured
  - [ ] Sheet is set to "Anyone with link can view"
- [ ] If using Proxy:
  - [ ] API key is in environment variables
  - [ ] CORS is configured for your domain
  - [ ] Rate limiting is enabled
  - [ ] Error logging is set up
- [ ] Site uses HTTPS
- [ ] No sensitive data in publicly accessible sheets
- [ ] Tested on production domain
- [ ] Team knows how to rotate keys

### After Launch

- [ ] Monitor usage for first week daily
- [ ] Check for unusual access patterns
- [ ] Verify quotas are not exceeded
- [ ] Set calendar reminder for key rotation (90 days)
- [ ] Document setup for team

---

## Getting Help

- **Documentation**: [Embedding Guide](./embedding-guide.md)
- **Google Cloud Console**: https://console.cloud.google.com
- **API Credentials**: https://console.cloud.google.com/apis/credentials
- **Usage Dashboard**: https://console.cloud.google.com/apis/dashboard

---

**Remember**: Security is a spectrum, not a binary. Choose the mode that balances your security needs with ease of deployment. For most users, **Public Sheets mode** offers the best combination of security and simplicity.
