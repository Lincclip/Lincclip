// Figma plugin main code
figma.showUI(__html__, { width: 400, height: 500 });

// State for communication with Chrome extension
var lastImageData = null;

// Receive messages from UI
figma.ui.onmessage = function(msg) {
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
    lastImageData = imageData; // Save last data
    
    // Data validation
    if (!imageData.imageUrl) {
      throw new Error('Image URL is missing.');
    }
    
    // Create image from URL
    figma.createImageFromUrl(imageData.imageUrl).then(function(image) {
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
      
      // Add reference information as note
      var note = figma.createText();
      var noteText = 'Image Reference\n\nImage URL: ' + imageData.imageUrl + '\nPage URL: ' + (imageData.pageUrl || 'N/A') + '\nDescription: ' + (imageData.altText || 'No description') + '\nSize: ' + width + ' x ' + height;
      note.characters = noteText;
      note.x = frame.x + frame.width + 20;
      note.y = frame.y;
      note.resize(250, 200);
      
      // Set text style
      figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(function() {
        note.fontName = { family: "Inter", style: "Regular" };
        note.fontSize = 12;
      }).catch(function(fontError) {
        // Use default font if font loading fails
        console.log('Font loading failed, using default font:', fontError);
      });
      
      // Select
      figma.currentPage.selection = [frame, note];
      figma.viewport.scrollAndZoomIntoView([frame, note]);
      
      figma.ui.postMessage({ type: 'success', message: 'Image reference imported successfully!' });
      
    }).catch(function(error) {
      handleImportError(error);
    });
    
  } catch (error) {
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
    if (data.success && data.imageData) {
      // Import image with received data
      figma.ui.postMessage({
        type: 'import-image-reference',
        data: data.imageData
      });
    } else {
      figma.ui.postMessage({ type: 'error', message: 'No data found from Chrome extension.' });
    }
  }).catch(function(error) {
    figma.ui.postMessage({ type: 'error', message: 'Network communication failed: ' + error.message });
  });
}

// Handle reimport last data
function handleReimportLast() {
  if (lastImageData) {
    figma.ui.postMessage({
      type: 'import-image-reference',
      data: lastImageData
    });
  } else {
    figma.ui.postMessage({ type: 'error', message: 'No previously imported data found.' });
  }
}

// Initial message when plugin starts
figma.ui.postMessage({ type: 'init', message: 'Image Reference Importer is ready.' });
