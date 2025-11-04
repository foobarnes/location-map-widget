# OpenMapEmbed

An embeddable, customizable location map widget with dynamic category support and Google Sheets integration.

[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://foobarnes.github.io/openmapembed/)
[![Bundle Size](https://img.shields.io/badge/bundle-218KB_gzipped-blue)](./dist)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🎨 **Dynamic Categories** - Auto-discovers categories from data with 8-color palette
- 📊 **Google Sheets Integration** - Use any Google Sheet as your data source
- 🗺️ **Interactive Maps** - Leaflet-powered with clustering and geolocation
- 🖼️ **Image Galleries** - Display location photos in tooltips and table view
- 📱 **Fully Responsive** - Works on any device, height controlled by container
- 🌓 **Dark Mode** - Full dark mode support with auto-detection
- 🔍 **Powerful Filters** - Search, category, and distance-based filtering
- 📋 **Table View** - Alternate view with pagination
- ⚡ **Lightweight** - Only 218 KB gzipped

## 🚀 Quick Start

### CDN (Simplest)

Hosted on GitHub Pages - automatically updated on every push to main:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://foobarnes.github.io/openmapembed/dist/openmapembed.css">
</head>
<body>
  <div id="map" style="height: 600px;"></div>

  <script src="https://foobarnes.github.io/openmapembed/dist/openmapembed.umd.js"></script>
  <script>
    OpenMapEmbed.init({
      container: '#map',
      dataSource: {
        type: 'google-sheets-public',
        sheetId: 'YOUR_SHEET_ID'
      },
      config: {
        theme: 'light',
        defaultView: 'map'
      }
    });
  </script>
</body>
</html>
```

### NPM

```bash
npm install openmapembed
# or
pnpm add openmapembed
```

```javascript
import { init } from 'openmapembed';
import 'openmapembed/dist/openmapembed.css';

init({
  container: '#map',
  dataSource: {
    type: 'google-sheets',
    sheetId: 'YOUR_SHEET_ID',
    apiKey: 'YOUR_API_KEY'
  }
});
```

## 📚 Documentation

- **[Embedding Guide](./docs/embedding-guide.md)** - Complete integration guide with examples
- **[Google Sheets Template](./docs/google-sheets-template.md)** - Set up your data source
- **[Live Demo](https://foobarnes.github.io/openmapembed/)** - See it in action

## 🎨 Category Customization

Categories are auto-discovered from your data! Just add any category names to your Google Sheet and they'll automatically get colors.

### Default Behavior
```javascript
// Categories auto-discovered: ambassador, rental, trail
// Automatically assigned: Blue, Green, Orange
```

### Custom Colors
```javascript
init({
  // ...
  config: {
    categoryConfig: {
      'Restaurant': {
        color: '#FF5733',
        bg: 'lmw-bg-yellow-100',
        text: 'lmw-text-yellow-800'
      },
      'Hotel': {
        color: '#3498db'
      }
    }
  }
});
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Project Structure

```
openmapembed/
├── src/
│   ├── components/     # React components
│   ├── adapters/       # Data source adapters
│   ├── stores/         # Zustand state management
│   ├── utils/          # Utilities (including category auto-discovery)
│   └── types/          # TypeScript definitions
├── docs/               # Documentation
├── dist/               # Build output
└── demo.html           # GitHub Pages demo
```

## 🚢 GitHub Pages Deployment & CDN

This project uses GitHub Pages for both the demo site and as a CDN for the widget files:

**Demo Site**: `https://foobarnes.github.io/openmapembed/`
**CDN URLs**:
- CSS: `https://foobarnes.github.io/openmapembed/dist/openmapembed.css`
- JS: `https://foobarnes.github.io/openmapembed/dist/openmapembed.umd.js`

### Setup

1. **Enable GitHub Pages**:
   - Go to Repository Settings > Pages
   - Source: "GitHub Actions"

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Automatic deployment**:
   - GitHub Actions will build and deploy
   - Files are automatically available via CDN
   - Updates within minutes of pushing to main

The workflow (`.github/workflows/deploy.yml`) automatically:
- Builds the library
- Creates demo site with built assets
- Deploys to GitHub Pages (serving as CDN)

### PR Preview Builds

Pull requests automatically trigger a preview build via `.github/workflows/pr-preview.yml`:
- Builds the demo site for the PR
- Uploads as a downloadable artifact (available for 7 days)
- Posts a comment on the PR with download instructions

This allows you to test changes before merging to main.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built for [Ablebodied.org](https://ablebodied.org) to help connect adaptive cycling communities.

## 💬 Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/foobarnes/openmapembed/issues)
- 💡 [Feature Requests](https://github.com/foobarnes/openmapembed/issues)

---

Made with ❤️ for the adaptive cycling community
