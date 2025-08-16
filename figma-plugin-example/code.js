// Figma plugin main code - Entry point
figma.showUI(__html__, { width: 400, height: 500 });

// Initialize services
const imageImportService = new ImageImportService();

// Receive messages from UI
figma.ui.onmessage = function(msg) {
  console.log('=== FIGMA PLUGIN: Received message from UI ===');
  console.log('Message:', msg);
  console.log('Message type:', msg.type);
  
  // Route messages to appropriate handlers
  switch (msg.type) {
    case 'import-image-reference':
      console.log('Handling import-image-reference message');
      imageImportService.handleImageImport(msg.data);
      break;
      
    case 'fetch-from-extension':
      console.log('Handling fetch-from-extension message');
      imageImportService.handleFetchFromExtension();
      break;
      
    case 'reimport-last':
      console.log('Handling reimport-last message');
      imageImportService.handleReimportLast();
      break;
      
    case 'close':
      console.log('Handling close message');
      imageImportService.handleClose();
      break;
      
    case 'init':
      console.log('Handling init message:', msg.message);
      imageImportService.handleInit(msg.message);
      break;
      
    case 'test-connection':
      console.log('Handling test-connection message');
      imageImportService.testNetworkConnection();
      break;
      
    default:
      console.log('Unknown message type:', msg.type);
      break;
  }
};

// Initial message when plugin starts
console.log('=== FIGMA PLUGIN STARTED ===');
figma.ui.postMessage({ type: 'init', message: 'Image Reference Importer is ready.' });
