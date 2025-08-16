# Image Reference Copy Chrome Extension

A Chrome extension that allows you to copy images with their reference information by right-clicking on images. Integrates with Figma plugins for design workflow.

## Key Features

- **Image + Reference Copy**: Copy image URL and page URL together
- **Figma Data Copy**: Copy in JSON format for use in Figma plugins
- **Image Information Extraction**: Collect detailed information like size, description, style
- **User-Friendly Notifications**: Visual feedback for copy success/failure
- **Auto Sync**: Network communication between Chrome extension and Figma plugin (optional)

## Installation

### 1. Chrome Extension Installation

1. Go to `chrome://extensions/` in Chrome browser
2. Enable "Developer mode" in top right
3. Click "Load unpacked"
4. Select this project folder

### 2. Figma Plugin Installation (Optional)

1. Open plugin menu in Figma
2. Go to "Development" → "Import plugin from manifest..."
3. Select `figma-plugin-example` folder

### 3. Auto Sync Server Installation (Optional)

To use auto sync functionality, run the local server:

```bash
# Install dependencies
npm install

# Start server
npm start

# Or run in development mode (auto restart)
npm run dev
```

Server runs at `http://localhost:3000`.

## Usage

### Basic Usage (Manual)

1. Right-click on any image on a webpage
2. Select from context menu:
   - **"Copy Image + Reference"**: Copy in text format
   - **"Copy for Figma"**: Copy in JSON format (for Figma plugins)
3. Paste copied data in Figma plugin

### Auto Sync Usage

1. Start local server (`npm start`)
2. Right-click on image in Chrome → "Copy for Figma"
3. Select "Auto Sync" tab in Figma plugin
4. Click "Fetch from Chrome Extension" button
5. Image and reference information automatically created in Figma

## File Structure

```
chome_ex/
├── manifest.json              # Extension configuration
├── background.js              # Background script (context menu handling)
├── content_script.js          # Content script (webpage execution)
├── popup.html                # Popup interface
├── popup.js                  # Popup script
├── icon16.png                # Extension icon (16x16)
├── icon48.png                # Extension icon (48x48)
├── icon128.png               # Extension icon (128x128)
├── icon.svg                  # SVG icon source
├── generate_icons.html       # Icon generation tool
├── test.html                 # Test page
├── server.js                 # Auto sync server
├── package.json              # Server dependency management
├── README.md                 # Project documentation
└── figma-plugin-example/     # Figma plugin example
    ├── manifest.json         # Plugin configuration
    ├── code.js               # Plugin main code
    ├── ui.html               # Plugin UI
    └── ui.js                 # Plugin UI script
```

## Data Format

### General Copy Format
```
Image URL: https://example.com/image.jpg
Page URL: https://example.com/page
Image Description: Example image
```

### Figma JSON Format
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
    "displayHeight": 300,
    "className": "example-image",
    "id": "main-image",
    "title": "Example image",
    "style": {
      "width": "400px",
      "height": "300px",
      "objectFit": "cover",
      "borderRadius": "8px"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "chrome_extension",
  "metadata": {
    "extension": "Image Reference Copy",
    "version": "1.0"
  }
}
```

## API Endpoints (Auto Sync Server)

### POST /store-image-data
Store image data from Chrome extension

**Request:**
```json
{
  "imageData": {
    "type": "image_reference",
    "imageUrl": "https://example.com/image.jpg",
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image data stored successfully.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /get-image-data
Get stored image data for Figma plugin

**Response:**
```json
{
  "success": true,
  "imageData": {
    "type": "image_reference",
    "imageUrl": "https://example.com/image.jpg",
    ...
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /clear-image-data
Clear stored image data

### GET /health
Server health check

## Permissions

### Chrome Extension Permissions
- `contextMenus`: Add right-click menu to images
- `clipboardWrite`: Copy data to clipboard
- `activeTab`: Execute scripts in active tab
- `scripting`: Execute content scripts
- `notifications`: Show copy completion notifications
- `tabs`: Access tab information (for popup)
- `management`: Access extension information (for popup)

### Figma Plugin Permissions
- `networkAccess`: Load images from external URLs
- `allowedDomains`: ["*"] Allow loading images from all domains

## Development Info

- **Manifest Version**: 3
- **Chrome Version**: 88+ (Manifest V3 support)
- **Figma API**: 1.0.0
- **Node.js**: 14+ (for server)

## Keyboard Shortcuts

### Figma Plugin
- **Ctrl/Cmd + Enter**: Execute image import
- **Ctrl/Cmd + K**: Clear text area
- **Ctrl/Cmd + R**: Reimport last data

## Troubleshooting

### Extension Not Working
1. Check if developer mode is enabled
2. Reload the extension
3. Clear browser cache

### Figma Plugin Integration Issues
1. Verify JSON data format is correct
2. Check if image URL is accessible
3. Reinstall Figma plugin
4. Verify Network Access permission is set

### Auto Sync Server Issues
1. Check if server is running (`npm start`)
2. Verify port 3000 is available
3. Check firewall settings
4. Check for CORS errors in browser developer tools

## License

MIT License

## Contributing

Please report bugs or suggest features by creating an issue.
