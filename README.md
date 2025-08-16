# 🖼️ Image Reference Copy - Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://chrome.google.com/webstore/)
[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-orange.svg)](https://www.figma.com/community/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A powerful Chrome extension that allows you to copy images with their reference links and seamlessly integrate with Figma plugins. Perfect for designers and developers who need to maintain image references in their design workflows.

## ✨ Features

- **Right-click Context Menu**: Copy image references with a simple right-click
- **Dual Copy Modes**: 
  - 📋 **Copy Image + Reference**: Simple text format with URLs
  - 🎨 **Copy for Figma**: JSON format for Figma plugin integration
- **Figma Integration**: Direct import into Figma with detailed image metadata
- **Auto-sync Server**: Optional local server for automatic data transfer
- **Beautiful Notifications**: User-friendly success/error notifications
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Chrome Extension Installation

1. **Download the Extension**:
   ```bash
   git clone https://github.com/[your-organization]/image-reference-copy-extension.git
   cd image-reference-copy-extension
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the extension folder
   - The extension icon should appear in your toolbar

3. **Usage**:
   - Right-click on any image on any webpage
   - Select "Copy Image + Reference" or "Copy for Figma"
   - Check your clipboard for the copied data

### Figma Plugin Installation

1. **Install the Plugin**:
   - Open Figma
   - Go to Plugins → Browse plugins in Community
   - Search for "Image Reference Importer" (or install manually)
   - Install the plugin

2. **Usage**:
   - Run the plugin in Figma
   - Paste the JSON data copied from Chrome extension
   - Click "Import Image" to create image frames with references

## 📁 Project Structure

```
image-reference-copy-extension/
├── manifest.json              # Chrome extension configuration
├── background.js              # Background service worker
├── content_script.js          # Content script for webpage interaction
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup functionality
├── icons/                     # Extension icons
├── figma-plugin-example/      # Figma plugin files
│   ├── manifest.json          # Figma plugin configuration
│   ├── code.js               # Main plugin logic
│   ├── ui.html               # Plugin UI
│   └── ui.js                 # UI functionality
├── server.js                 # Optional local server
├── test.html                 # Test page
├── debug.html                # Debug page
└── README.md                 # This file
```

## 🔧 Development

### Prerequisites

- Google Chrome browser
- Node.js (for local server)
- Figma account (for plugin testing)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/[your-organization]/image-reference-copy-extension.git
   cd image-reference-copy-extension
   ```

2. **Install dependencies** (for local server):
   ```bash
   npm install
   ```

3. **Start local server** (optional):
   ```bash
   npm start
   ```

4. **Load extension in Chrome**:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the project folder

### Testing

- Use `test.html` or `debug.html` for testing the extension
- Check browser console for debug messages
- Test Figma plugin integration with the provided example

## 📊 Data Format

### Copy Image + Reference Format
```
Image URL: https://example.com/image.jpg
Page URL: https://example.com/page
Image Description: Example image
```

### Copy for Figma Format (JSON)
```json
{
  "type": "image_reference",
  "version": "1.0",
  "imageUrl": "https://example.com/image.jpg",
  "pageUrl": "https://example.com/page",
  "altText": "Example image",
  "imageInfo": {
    "src": "https://example.com/image.jpg",
    "alt": "Example image",
    "naturalWidth": 800,
    "naturalHeight": 600,
    "displayWidth": 400,
    "displayHeight": 300
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "source": "chrome_extension"
}
```

## 🔌 API Endpoints (Local Server)

If using the optional local server:

- `POST /store-image-data` - Store image data from Chrome extension
- `GET /get-image-data` - Retrieve stored image data for Figma plugin
- `DELETE /clear-image-data` - Clear stored data
- `GET /health` - Server health check

## 🛠️ Configuration

### Chrome Extension Permissions

The extension requires the following permissions:
- `contextMenus` - For right-click context menu
- `clipboardWrite` - For copying to clipboard
- `activeTab` - For accessing current tab
- `scripting` - For executing scripts in tabs
- `notifications` - For showing notifications
- `tabs` - For tab management
- `management` - For extension management

### Figma Plugin Configuration

The Figma plugin includes:
- `networkAccess` - For fetching images and server communication
- `documentAccess` - For creating and modifying Figma elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions API documentation
- Figma Plugin API documentation
- Community contributors and testers

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/[your-organization]/image-reference-copy-extension/issues) page
2. Create a new issue with detailed information
3. Include browser version, extension version, and steps to reproduce

---

**Made with ❤️ for the design community**
