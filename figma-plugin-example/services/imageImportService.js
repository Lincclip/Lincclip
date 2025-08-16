// Image import service - main orchestrator
class ImageImportService {
  constructor() {
    this.imageProcessor = new ImageProcessor();
    this.referenceBuilder = new ReferenceBuilder();
    this.errorHandler = new ErrorHandler();
    this.networkService = new NetworkService();
    this.lastImageData = null;
  }

  // Main import method
  async handleImageImport(imageData) {
    try {
      console.log('=== STARTING IMAGE IMPORT ===');
      console.log('Image data:', imageData);
      
      // Save last data
      this.lastImageData = imageData;
      
      // Validate image data
      this.errorHandler.validateImageData(imageData);
      
      console.log('Image URL:', imageData.imageUrl);
      
      // Show loading message
      this.sendMessageToUI({ type: 'info', message: 'Loading image from URL...' });
      
      // Try to create image
      const image = await this.imageProcessor.createImageWithFallback(imageData);
      
      if (image) {
        // Process the image
        const { frame, width, height } = this.imageProcessor.processImage(image, imageData);
        
        // Create reference information
        await this.referenceBuilder.createReferenceInfoWithFonts(frame, imageData, width, height);
        
        console.log('✅ Image processing completed successfully');
        
        // Send success message to UI
        this.sendMessageToUI({ 
          type: 'success', 
          message: 'Image reference imported successfully!' 
        });
      } else {
        // Create alternative (placeholder)
        const { frame, width, height } = this.imageProcessor.createImageAlternative(imageData);
        
        // Create reference information
        await this.referenceBuilder.createReferenceInfoWithFonts(frame, imageData, width, height);
        
        console.log('✅ Alternative image creation completed');
        
        // Send success message
        this.sendMessageToUI({ 
          type: 'success', 
          message: 'Image reference created (placeholder mode). Image URL: ' + imageData.imageUrl 
        });
      }
      
    } catch (error) {
      console.error('❌ Import process failed:', error);
      const errorMessage = this.errorHandler.handleImportError(error);
      this.sendMessageToUI(errorMessage);
    }
  }

  // Handle fetch from extension
  async handleFetchFromExtension() {
    try {
      console.log('=== FETCHING FROM EXTENSION ===');
      
      const imageData = await this.networkService.fetchFromExtension();
      await this.handleImageImport(imageData);
      
    } catch (error) {
      console.error('Fetch from extension failed:', error);
      const errorMessage = this.errorHandler.handleFetchError(error);
      this.sendMessageToUI(errorMessage);
    }
  }

  // Handle reimport last data
  handleReimportLast() {
    console.log('=== REIMPORTING LAST DATA ===');
    console.log('Last image data:', this.lastImageData);
    
    if (this.lastImageData) {
      this.handleImageImport(this.lastImageData);
    } else {
      const errorMessage = this.errorHandler.handleMissingDataError('lastData');
      this.sendMessageToUI(errorMessage);
    }
  }

  // Handle close
  handleClose() {
    console.log('Handling close message');
    figma.closePlugin();
  }

  // Handle init
  handleInit(message) {
    console.log('Handling init message:', message);
    this.sendMessageToUI({ type: 'success', message: 'Plugin initialized successfully!' });
  }

  // Send message to UI
  sendMessageToUI(message) {
    figma.ui.postMessage(message);
  }

  // Get last image data
  getLastImageData() {
    return this.lastImageData;
  }

  // Set last image data
  setLastImageData(imageData) {
    this.lastImageData = imageData;
  }

  // Test network connection
  async testNetworkConnection() {
    try {
      const result = await this.networkService.testConnection();
      this.sendMessageToUI({
        type: result.success ? 'success' : 'error',
        message: result.message
      });
      return result;
    } catch (error) {
      const errorMessage = this.errorHandler.handleFetchError(error);
      this.sendMessageToUI(errorMessage);
      return { success: false, error: error.message };
    }
  }

  // Get server status
  async getServerStatus() {
    try {
      const status = await this.networkService.getServerStatus();
      return status;
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageImportService;
} else {
  // For Figma plugin environment
  window.ImageImportService = ImageImportService;
}
