// Figma plugin main code
figma.showUI(__html__, { width: 400, height: 500 });

// State for communication with Chrome extension
var lastImageData = null;

// Receive messages from UI
figma.ui.onmessage = function(msg) {
  console.log('=== FIGMA PLUGIN: Received message from UI ===');
  console.log('Message:', msg);
  console.log('Message type:', msg.type);
  
  if (msg.type === 'import-image-reference') {
    console.log('Handling import-image-reference message');
    handleImageImport(msg.data);
  }
  
  // Fetch data directly from Chrome extension (network communication)
  if (msg.type === 'fetch-from-extension') {
    console.log('Handling fetch-from-extension message');
    handleFetchFromExtension();
  }
  
  // Reuse last imported data
  if (msg.type === 'reimport-last') {
    console.log('Handling reimport-last message');
    handleReimportLast();
  }
  
  if (msg.type === 'close') {
    console.log('Handling close message');
    figma.closePlugin();
  }
  
  if (msg.type === 'init') {
    console.log('Handling init message:', msg.message);
    figma.ui.postMessage({ type: 'success', message: 'Plugin initialized successfully!' });
  }
  
  if (msg.type === 'add-domain') {
    console.log('Handling add-domain message:', msg.domain);
    figma.ui.postMessage({ 
      type: 'info', 
      message: 'To add domain "' + msg.domain + '" to allowed list, please update manifest.json and reload the plugin.' 
    });
  }
};

// Handle image import
function handleImageImport(imageData) {
  try {
    console.log('=== STARTING IMAGE IMPORT ===');
    console.log('Image data:', imageData);
    lastImageData = imageData; // Save last data
    
    // Data validation
    if (!imageData.imageUrl) {
      throw new Error('Image URL is missing.');
    }
    
    console.log('Image URL:', imageData.imageUrl);
    
    // Show loading message
    figma.ui.postMessage({ type: 'info', message: 'Loading image from URL...' });
    
    // Try different methods to create image
    createImageWithFallback(imageData);
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
    handleImportError(error);
  }
}

// Create image with fallback methods
function createImageWithFallback(imageData) {
  console.log('=== TRYING IMAGE CREATION METHODS ===');
  
  // Method 1: Try figma.createImageFromUrl (newer API)
  if (typeof figma.createImageFromUrl === 'function') {
    console.log('✅ Trying figma.createImageFromUrl...');
    figma.createImageFromUrl(imageData.imageUrl).then(function(image) {
      console.log('✅ Image created successfully with createImageFromUrl:', image);
      processImage(image, imageData);
    }).catch(function(error) {
      console.error('❌ createImageFromUrl failed:', error);
      // Try alternative method
      createImageWithFetch(imageData);
    });
  }
  // Method 2: Try using fetch to get image data
  else {
    console.log('❌ Direct image creation APIs not available, trying fetch method...');
    createImageWithFetch(imageData);
  }
}

// Create image using fetch method
function createImageWithFetch(imageData) {
  console.log('=== TRYING FETCH METHOD ===');
  
  // Check if fetch is available
  if (typeof fetch !== 'function') {
    console.log('❌ Fetch not available, using alternative method');
    createImageAlternative(imageData);
    return;
  }
  
  // Try to fetch the image with proxy fallback
  var imageUrl = imageData.imageUrl;
  
  // First try direct fetch
  fetch(imageUrl)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to fetch image: ' + response.status);
      }
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      console.log('✅ Image fetched successfully, size:', arrayBuffer.byteLength);
      
      // Try to create image from array buffer
      if (typeof figma.createImageFromBytes === 'function') {
        return figma.createImageFromBytes(new Uint8Array(arrayBuffer));
      } else if (typeof figma.createImage === 'function') {
        return figma.createImage(new Uint8Array(arrayBuffer));
      } else {
        throw new Error('No image creation API available');
      }
    })
    .then(function(image) {
      console.log('✅ Image created from bytes:', image);
      processImage(image, imageData);
    })
    .catch(function(error) {
      console.error('❌ Direct fetch failed:', error);
      
      // Check if it's a CSP error and try proxy
      if (error.message.includes('CSP') || error.message.includes('Content Security Policy') || 
          error.message.includes('Failed to fetch') || error.message.includes('not in the list of allowed domains')) {
        console.log('⚠️ CSP violation detected, trying proxy...');
        
        // Try proxy services
        var proxyUrls = [
          'https://cors-anywhere.herokuapp.com/',
          'https://api.allorigins.win/raw?url=',
          'https://thingproxy.freeboard.io/fetch/',
          'https://corsproxy.io/?'
        ];
        
        tryProxyServices(imageData, proxyUrls, 0);
      } else {
        figma.ui.postMessage({ 
          type: 'warning', 
          message: 'Image fetch failed. Creating reference placeholder instead.' 
        });
        createImageAlternative(imageData);
      }
    });
}

// Try proxy services for image fetching
function tryProxyServices(imageData, proxyUrls, index) {
  if (index >= proxyUrls.length) {
    console.log('❌ All proxy services failed, using alternative method');
    figma.ui.postMessage({ 
      type: 'warning', 
      message: 'All proxy services failed. Creating reference placeholder instead.' 
    });
    createImageAlternative(imageData);
    return;
  }
  
  var proxyUrl = proxyUrls[index];
  var fullUrl = proxyUrl + encodeURIComponent(imageData.imageUrl);
  
  console.log('🔄 Trying proxy service:', proxyUrl);
  
  fetch(fullUrl)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Proxy service failed: ' + response.status);
      }
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      console.log('✅ Image fetched successfully via proxy, size:', arrayBuffer.byteLength);
      
      // Try to create image from array buffer
      if (typeof figma.createImageFromBytes === 'function') {
        return figma.createImageFromBytes(new Uint8Array(arrayBuffer));
      } else if (typeof figma.createImage === 'function') {
        return figma.createImage(new Uint8Array(arrayBuffer));
      } else {
        throw new Error('No image creation API available');
      }
    })
    .then(function(image) {
      console.log('✅ Image created from proxy bytes:', image);
      processImage(image, imageData);
    })
    .catch(function(error) {
      console.error('❌ Proxy service failed:', proxyUrl, error);
      // Try next proxy service
      tryProxyServices(imageData, proxyUrls, index + 1);
    });
}

// Alternative image creation method
function createImageAlternative(imageData) {
  console.log('=== TRYING ALTERNATIVE IMAGE CREATION ===');
  
  try {
    // Create a simple frame with image URL as reference
    var frame = figma.createFrame();
    frame.name = 'Image Reference - ' + (imageData.altText || 'Image');
    
    // Set image size based on imageInfo with better fallbacks
    var imageInfo = imageData.imageInfo || {};
    var width = imageInfo.naturalWidth || imageInfo.displayWidth || imageInfo.width || 300;
    var height = imageInfo.naturalHeight || imageInfo.displayHeight || imageInfo.height || 200;
    
    // Log the image info for debugging
    console.log('Image info:', imageInfo);
    console.log('Calculated dimensions:', width, 'x', height);
    
    // Ensure minimum size and reasonable aspect ratio
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    
    // If we have a very wide image, cap the width and adjust height proportionally
    if (width > 2000) {
      var aspectRatio = width / height;
      width = 2000;
      height = Math.round(width / aspectRatio);
    }
    
    console.log('Setting frame size to:', width, 'x', height);
    frame.resize(width, height);
    
    // Create a placeholder rectangle with the image URL as a note
    var placeholder = figma.createRectangle();
    placeholder.name = 'Image Placeholder';
    placeholder.resize(width, height);
    placeholder.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    placeholder.cornerRadius = 4;
    
    // Add the placeholder to the frame
    frame.appendChild(placeholder);
    
    // Create reference information with font loading
    createReferenceInfoWithFonts(frame, imageData, width, height);
    
    // Position and select
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
    
    console.log('✅ Alternative image creation completed');
    
    // Send success message
    figma.ui.postMessage({ 
      type: 'success', 
      message: '✅ Image reference created successfully! Size: ' + width + 'x' + height + 'px. URL: ' + imageData.imageUrl 
    });
    
  } catch (error) {
    console.error('❌ Alternative image creation failed:', error);
    handleImportError(error);
  }
}

// Process successfully created image
function processImage(image, imageData) {
  console.log('=== PROCESSING IMAGE ===');
  console.log('Image dimensions:', image.width, 'x', image.height);
  
  // Create image frame
  var frame = figma.createFrame();
  frame.name = 'Image Reference - ' + (imageData.altText || 'Image');
  
  // Set image size based on imageInfo or use image dimensions
  var imageInfo = imageData.imageInfo || {};
  var width = imageInfo.naturalWidth || imageInfo.displayWidth || imageInfo.width || image.width || 300;
  var height = imageInfo.naturalHeight || imageInfo.displayHeight || imageInfo.height || image.height || 200;
  
  // Log the image info for debugging
  console.log('Image info:', imageInfo);
  console.log('Image dimensions:', image.width, 'x', image.height);
  console.log('Calculated dimensions:', width, 'x', height);
  
  // Ensure minimum size and reasonable aspect ratio
  width = Math.max(width, 100);
  height = Math.max(height, 100);
  
  // If we have a very wide image, cap the width and adjust height proportionally
  if (width > 2000) {
    var aspectRatio = width / height;
    width = 2000;
    height = Math.round(width / aspectRatio);
  }
  
  console.log('Setting frame size to:', width, 'x', height);
  frame.resize(width, height);
  
  // Set image fill
  frame.fills = [{
    type: 'IMAGE',
    imageHash: image.hash,
    scaleMode: 'FILL'
  }];
  
  console.log('✅ Image frame created successfully');
  
  // Create reference information with font loading
  createReferenceInfoWithFonts(frame, imageData, width, height);
  
  // Position and select
  frame.x = figma.viewport.center.x - frame.width / 2;
  frame.y = figma.viewport.center.y - frame.height / 2;
  
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  
  console.log('✅ Image processing completed successfully');
  
  // Send success message to UI
  figma.ui.postMessage({ 
    type: 'success', 
    message: 'Image reference imported successfully!' 
  });
}

// Create reference information with proper font loading
function createReferenceInfoWithFonts(frame, imageData, width, height) {
  console.log('=== CREATING REFERENCE INFO WITH FONTS ===');
  
  // Load fonts before creating any text
  figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(function() {
    console.log('✅ Fonts loaded successfully, now creating reference info');
    createReferenceInfo(frame, imageData, width, height);
  }).catch(function(fontError) {
    console.log('⚠️ Font loading failed, using default font:', fontError);
    // Still create reference info with default font
    createReferenceInfo(frame, imageData, width, height);
  });
}

// Create reference information
function createReferenceInfo(frame, imageData, width, height) {
  console.log('=== CREATING REFERENCE INFO ===');
  
  // Create a container frame for image and reference info
  var container = figma.createFrame();
  container.name = 'Image Reference Container';
  container.layoutMode = 'HORIZONTAL';
  container.itemSpacing = 20;
  container.paddingLeft = 0;
  container.paddingRight = 0;
  container.paddingTop = 0;
  container.paddingBottom = 0;
  
  // Set container height to match image height
  container.resize(width + 320, height); // 320 = reference frame width + spacing
  
  // Add image frame to container
  container.appendChild(frame);
  
  // Create reference information section
  var referenceFrame = figma.createFrame();
  referenceFrame.name = 'Reference Information';
  referenceFrame.layoutMode = 'VERTICAL';
  referenceFrame.itemSpacing = 8;
  referenceFrame.paddingLeft = 16;
  referenceFrame.paddingRight = 16;
  referenceFrame.paddingTop = 16;
  referenceFrame.paddingBottom = 16;
  referenceFrame.resize(300, height); // Match container height
  referenceFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  referenceFrame.cornerRadius = 8;
  
  // Add title
  var title = figma.createText();
  title.characters = '📋 Image Reference';
  title.fontSize = 16;
  referenceFrame.appendChild(title);
  
  // Add reference details
  var details = figma.createText();
  var detailsText = '🖼️ Image URL:\n' + imageData.imageUrl + '\n\n' +
                   '🌐 Page URL:\n' + (imageData.pageUrl || 'N/A') + '\n\n' +
                   '📝 Description:\n' + (imageData.altText || 'No description') + '\n\n' +
                   '📏 Size: ' + width + ' x ' + height + 'px';
  
  var imageInfo = imageData.imageInfo || {};
  if (imageInfo.naturalWidth && imageInfo.naturalHeight) {
    detailsText += '\n🖥️ Original: ' + imageInfo.naturalWidth + ' x ' + imageInfo.naturalHeight + 'px';
  }
  
  details.characters = detailsText;
  details.fontSize = 11;
  referenceFrame.appendChild(details);
  
  // Add timestamp if available
  var timestamp = null;
  if (imageData.timestamp) {
    timestamp = figma.createText();
    var date = new Date(imageData.timestamp);
    timestamp.characters = '🕒 Copied: ' + date.toLocaleString();
    timestamp.fontSize = 10;
    referenceFrame.appendChild(timestamp);
  }
  
  // Add source indicator
  var sourceIndicator = null;
  if (imageData.metadata && imageData.metadata.originalSource) {
    sourceIndicator = figma.createText();
    sourceIndicator.characters = '✅ ' + imageData.metadata.originalSource;
    sourceIndicator.fontSize = 10;
    referenceFrame.appendChild(sourceIndicator);
  }
  
  // Add reference frame to container
  container.appendChild(referenceFrame);
  
  console.log('✅ Reference frame created successfully');
  
  // Set font names after text creation (fonts should already be loaded)
  // Skip font setting to avoid errors
  console.log('✅ Using default fonts to avoid font setting errors');
  
  // Position container
  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  
  // Select the container
  figma.currentPage.selection = [container];
  figma.viewport.scrollAndZoomIntoView([container]);
  
  console.log('✅ Container positioned and selected successfully');
}

// Handle import errors
function handleImportError(error) {
  console.error('=== HANDLING IMPORT ERROR ===');
  console.error('Error:', error);
  console.error('Error message:', error.message);
  
  // Provide more detailed error messages
  var errorMessage = 'Image import failed.';
  
  if (error.message.indexOf('CORS') !== -1 || error.message.indexOf('Content Security Policy') !== -1) {
    errorMessage = 'Image blocked by security policy. Domain not in allowed list. Creating reference placeholder instead.';
  } else if (error.message.indexOf('404') !== -1) {
    errorMessage = 'Image not found. Please check the URL.';
  } else if (error.message.indexOf('network') !== -1) {
    errorMessage = 'Network error occurred. Please check your internet connection.';
  } else if (error.message.indexOf('403') !== -1) {
    errorMessage = 'Access denied. The image may be protected.';
  } else if (error.message.indexOf('500') !== -1) {
    errorMessage = 'Server error. Please try again later.';
  } else if (error.message.indexOf('not a function') !== -1) {
    errorMessage = 'Figma API not available. Please update Figma or try a different approach.';
  } else if (error.message.indexOf('unloaded font') !== -1) {
    errorMessage = 'Font loading issue. Please try again.';
  } else if (error.message.indexOf('no setter for property') !== -1) {
    errorMessage = 'Font setting issue. Using default font.';
  } else if (error.message.indexOf('Uint8Array') !== -1) {
    errorMessage = 'Image format issue. Using placeholder mode.';
  } else if (error.message.indexOf('Failed to fetch') !== -1) {
    errorMessage = 'Image fetch failed. Domain may not be allowed. Creating reference placeholder.';
  } else {
    errorMessage = 'Image import failed: ' + error.message;
  }
  
  console.error('Sending error message to UI:', errorMessage);
  figma.ui.postMessage({ type: 'error', message: errorMessage });
}

// Handle fetch from extension
function handleFetchFromExtension() {
  console.log('=== FETCHING FROM EXTENSION ===');
  
  // Check if fetch is available
  if (typeof fetch !== 'function') {
    console.error('❌ Fetch API not available');
    figma.ui.postMessage({ type: 'error', message: 'Network API not available in this Figma version.' });
    return;
  }
  
  fetch('http://localhost:3000/get-image-data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Cannot connect to Chrome extension.');
    }
  }).then(function(data) {
    console.log('Received data from server:', data);
    if (data.success && data.imageData) {
      // Import image with received data
      handleImageImport(data.imageData);
    } else {
      figma.ui.postMessage({ type: 'error', message: 'No data found from Chrome extension.' });
    }
  }).catch(function(error) {
    console.error('Fetch failed:', error);
    figma.ui.postMessage({ type: 'error', message: 'Network communication failed: ' + error.message });
  });
}

// Handle reimport last data
function handleReimportLast() {
  console.log('=== REIMPORTING LAST DATA ===');
  console.log('Last image data:', lastImageData);
  
  if (lastImageData) {
    handleImageImport(lastImageData);
  } else {
    figma.ui.postMessage({ type: 'error', message: 'No previously imported data found.' });
  }
}

// Initial message when plugin starts
console.log('=== FIGMA PLUGIN STARTED ===');
figma.ui.postMessage({ type: 'init', message: 'Image Reference Importer is ready.' });
