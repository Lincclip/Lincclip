// Figma plugin main code
figma.showUI(__html__, { width: 400, height: 500 });

// State for communication with Chrome extension
var lastImageData = null;

// Receive messages from UI
figma.ui.onmessage = function(msg) {
  console.log('Received message from UI:', msg);
  
  if (msg.type === 'import-image-reference') {
    handleImageImport(msg.data);
  }
  
  // Fetch data directly from Chrome extension (network communication)
  if (msg.type === 'fetch-from-extension') {
    handleFetchFromExtension();
  }
  
  // Reuse last imported data
  if (msg.type === 'reimport-last') {
    handleReimportLast();
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Handle image import
function handleImageImport(imageData) {
  try {
    console.log('Importing image data:', imageData);
    lastImageData = imageData; // Save last data
    
    // Data validation
    if (!imageData.imageUrl) {
      throw new Error('Image URL is missing.');
    }
    
    // Create image from URL
    figma.createImageFromUrl(imageData.imageUrl).then(function(image) {
      console.log('Image created successfully:', image);
      
      // Create image frame
      var frame = figma.createFrame();
      frame.name = 'Image Reference - ' + (imageData.altText || 'Image');
      
      // Set image size (provide default values)
      var imageInfo = imageData.imageInfo || {};
      var width = imageInfo.naturalWidth || imageInfo.displayWidth || 300;
      var height = imageInfo.naturalHeight || imageInfo.displayHeight || 200;
      frame.resize(width, height);
      
      // Set image fill
      frame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL'
      }];
      
      // Create a container frame for image and reference info
      var container = figma.createFrame();
      container.name = 'Image Reference Container';
      container.layoutMode = 'HORIZONTAL';
      container.itemSpacing = 20;
      container.paddingLeft = 0;
      container.paddingRight = 0;
      container.paddingTop = 0;
      container.paddingBottom = 0;
      
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
      referenceFrame.resize(280, 200);
      referenceFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
      referenceFrame.cornerRadius = 8;
      
      // Add title
      var title = figma.createText();
      title.characters = '📋 Image Reference';
      title.fontSize = 16;
      title.fontWeight = 600;
      referenceFrame.appendChild(title);
      
      // Add reference details
      var details = figma.createText();
      var detailsText = '🖼️ Image URL:\n' + imageData.imageUrl + '\n\n' +
                       '🌐 Page URL:\n' + (imageData.pageUrl || 'N/A') + '\n\n' +
                       '📝 Description:\n' + (imageData.altText || 'No description') + '\n\n' +
                       '📏 Size: ' + width + ' x ' + height + 'px';
      
      if (imageInfo.naturalWidth && imageInfo.naturalHeight) {
        detailsText += '\n🖥️ Original: ' + imageInfo.naturalWidth + ' x ' + imageInfo.naturalHeight + 'px';
      }
      
      details.characters = detailsText;
      details.fontSize = 11;
      details.lineHeight = { value: 16, unit: 'PIXELS' };
      referenceFrame.appendChild(details);
      
      // Add timestamp if available
      if (imageData.timestamp) {
        var timestamp = figma.createText();
        var date = new Date(imageData.timestamp);
        timestamp.characters = '🕒 Copied: ' + date.toLocaleString();
        timestamp.fontSize = 10;
        timestamp.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        referenceFrame.appendChild(timestamp);
      }
      
      // Add reference frame to container
      container.appendChild(referenceFrame);
      
      // Load fonts for text elements
      figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(function() {
        title.fontName = { family: "Inter", style: "Regular" };
        details.fontName = { family: "Inter", style: "Regular" };
        timestamp.fontName = { family: "Inter", style: "Regular" };
      }).catch(function(fontError) {
        console.log('Font loading failed, using default font:', fontError);
      });
      
      // Position container
      container.x = figma.viewport.center.x - container.width / 2;
      container.y = figma.viewport.center.y - container.height / 2;
      
      // Select the container
      figma.currentPage.selection = [container];
      figma.viewport.scrollAndZoomIntoView([container]);
      
      // Send success message to UI
      figma.ui.postMessage({ 
        type: 'success', 
        message: 'Image reference imported successfully!' 
      });
      
    }).catch(function(error) {
      console.error('Image creation failed:', error);
      handleImportError(error);
    });
    
  } catch (error) {
    console.error('Import process failed:', error);
    handleImportError(error);
  }
}

// Handle import errors
function handleImportError(error) {
  console.error('Image import failed:', error);
  
  // Provide more detailed error messages
  var errorMessage = 'Image import failed.';
  
  if (error.message.indexOf('CORS') !== -1) {
    errorMessage = 'Cannot fetch image due to CORS policy. Try a different image.';
  } else if (error.message.indexOf('404') !== -1) {
    errorMessage = 'Image not found. Please check the URL.';
  } else if (error.message.indexOf('network') !== -1) {
    errorMessage = 'Network error occurred. Please check your internet connection.';
  } else {
    errorMessage = 'Image import failed: ' + error.message;
  }
  
  figma.ui.postMessage({ type: 'error', message: errorMessage });
}

// Handle fetch from extension
function handleFetchFromExtension() {
  console.log('Fetching data from Chrome extension...');
  
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
  console.log('Reimporting last data:', lastImageData);
  if (lastImageData) {
    handleImageImport(lastImageData);
  } else {
    figma.ui.postMessage({ type: 'error', message: 'No previously imported data found.' });
  }
}

// Initial message when plugin starts
figma.ui.postMessage({ type: 'init', message: 'Image Reference Importer is ready.' });
