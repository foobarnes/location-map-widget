# Proxy Server Examples

Secure backend proxies for the Location Map Widget that hide your Google Sheets API key from client-side code.

## Why Use a Proxy?

**Security Benefits:**
- ✅ API key never exposed to clients
- ✅ Full control over access and rate limiting
- ✅ Can add authentication, logging, analytics
- ✅ Production-grade security for enterprises

**Trade-offs:**
- ⚠️ Requires backend deployment (but free on Vercel/Cloudflare)
- ⚠️ Slightly more complex setup

## Available Implementations

### 1. Vercel Edge Functions (Recommended)

**Location:** `./vercel/`

**Features:**
- Serverless (no server management)
- Global edge network
- Free tier: 100GB bandwidth, 100k requests/month
- Easy deployment

**Deploy:**
```bash
cd vercel
npm install -g vercel
vercel
vercel env add GOOGLE_SHEETS_API_KEY
```

**Use in Widget:**
```javascript
OpenMapEmbed.init({
  dataSource: {
    type: 'google-sheets-proxy',
    proxyUrl: 'https://your-app.vercel.app/api/sheets',
    sheetId: 'YOUR_SHEET_ID'
  }
});
```

### 2. Cloudflare Workers (Coming Soon)

Ultra-fast edge workers with generous free tier.

### 3. AWS Lambda (Coming Soon)

For users already on AWS.

### 4. Express.js (Coming Soon)

Self-hosted Node.js server option.

## Quick Start: Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Copy the Proxy Code

Copy the `vercel/` folder to your project:

```bash
cp -r examples/proxy-server/vercel /path/to/your/project/
cd /path/to/your/project/vercel
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts to create a new project.

### Step 4: Add Environment Variable

```bash
vercel env add GOOGLE_SHEETS_API_KEY
```

Paste your Google Sheets API key when prompted.

Select:
- **Production**: Yes
- **Preview**: Yes (optional)
- **Development**: Yes (optional)

### Step 5: Redeploy

```bash
vercel --prod
```

### Step 6: Get Your Proxy URL

Vercel will output your deployment URL:
```
https://your-app-name.vercel.app
```

Your proxy endpoint is:
```
https://your-app-name.vercel.app/api/sheets
```

### Step 7: Update CORS Settings

Edit `api/sheets/[sheetId].ts` and update allowed origins:

```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

### Step 8: Redeploy

```bash
vercel --prod
```

### Step 9: Use in Widget

```html
<script>
  OpenMapEmbed.init({
    container: '#map',
    dataSource: {
      type: 'google-sheets-proxy',
      proxyUrl: 'https://your-app-name.vercel.app/api/sheets',
      sheetId: 'YOUR_GOOGLE_SHEET_ID'
    }
  });
</script>
```

## Configuration

### Rate Limiting

The default implementation includes simple in-memory rate limiting:
- **100 requests per minute** per IP address

To adjust:

```typescript
if (!checkRateLimit(clientIp, 200, 60000)) {
  // Now allows 200 requests per minute
}
```

For production, consider using persistent storage:
- **Vercel KV**: Redis-compatible key-value store
- **Upstash Redis**: Serverless Redis

### CORS

Restrict access to your domain(s):

```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://*.yourdomain.com', // Wildcard subdomains
];
```

### Caching

The proxy adds cache headers:

```typescript
res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
// 5 minutes cache, serve stale while revalidating
```

Adjust as needed for your use case.

## Security Checklist

Before going to production:

- [ ] Deploy proxy to Vercel/Cloudflare
- [ ] Add `GOOGLE_SHEETS_API_KEY` environment variable
- [ ] Update CORS `allowedOrigins` to your domain(s)
- [ ] Test from your production domain
- [ ] Verify API key is not in client-side code
- [ ] Set up monitoring/alerts (Vercel Analytics)
- [ ] Document proxy URL for your team

## Monitoring

### Vercel Analytics

Enable analytics in Vercel dashboard:
1. Go to your project
2. Click "Analytics" tab
3. Enable Web Analytics

### Custom Logging

Add logging to track usage:

```typescript
console.log('Request:', {
  sheetId,
  range,
  ip: clientIp,
  timestamp: new Date().toISOString(),
});
```

View logs:
```bash
vercel logs your-app-name
```

## Troubleshooting

### "CORS Error" in Browser

**Fix:** Add your domain to `allowedOrigins` in the proxy code

### "API key not configured"

**Fix:** Add environment variable:
```bash
vercel env add GOOGLE_SHEETS_API_KEY
```

### "Rate limit exceeded"

**Fix:** Increase rate limits or wait 1 minute

### "Sheet not found"

**Fix:** Verify:
- Sheet ID is correct
- Sheet is shared ("Anyone with link can view")
- Google Sheets API is enabled in Google Cloud

## Cost

### Vercel Free Tier

- ✅ 100GB bandwidth
- ✅ 100,000 serverless function executions
- ✅ Unlimited team members
- ✅ HTTPS included

**Typical usage:**
- Small site (1,000 visitors/month): **$0/month**
- Medium site (10,000 visitors/month): **$0-5/month**
- Large site (100,000 visitors/month): **$20-50/month**

### Cloudflare Workers Free Tier

- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ Global edge network

## Support

For questions or issues:
- [Security Guide](../../docs/security-guide.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## Contributing

Have a proxy implementation for another platform? PRs welcome!

Planned implementations:
- Cloudflare Workers
- AWS Lambda
- Express.js
- Next.js API Routes
- Netlify Functions
