// Error handling utilities
class ErrorHandler {
  constructor() {
    this.errorMessages = {
      cors: 'Cannot fetch image due to CORS policy. Try a different image.',
      notFound: 'Image not found. Please check the URL.',
      network: 'Network error occurred. Please check your internet connection.',
      forbidden: 'Access denied. The image may be protected.',
      serverError: 'Server error. Please try again later.',
      apiNotAvailable: 'Figma API not available. Please update Figma or try a different approach.',
      fontLoading: 'Font loading issue. Please try again.',
      fontSetting: 'Font setting issue. Using default font.',
      noImageMethods: 'No image creation methods available.',
      noData: 'No previously imported data found.',
      networkCommunication: 'Network communication failed: ',
      default: 'Image import failed: '
    };
  }

  // Handle import errors
  handleImportError(error) {
    console.error('=== HANDLING IMPORT ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    
    const errorMessage = this.getErrorMessage(error.message);
    console.error('Sending error message to UI:', errorMessage);
    
    return {
      type: 'error',
      message: errorMessage
    };
  }

  // Get appropriate error message based on error type
  getErrorMessage(errorMessage) {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('cors')) {
      return this.errorMessages.cors;
    } else if (message.includes('404')) {
      return this.errorMessages.notFound;
    } else if (message.includes('network')) {
      return this.errorMessages.network;
    } else if (message.includes('403')) {
      return this.errorMessages.forbidden;
    } else if (message.includes('500')) {
      return this.errorMessages.serverError;
    } else if (message.includes('not a function')) {
      return this.errorMessages.apiNotAvailable;
    } else if (message.includes('unloaded font')) {
      return this.errorMessages.fontLoading;
    } else if (message.includes('no setter for property')) {
      return this.errorMessages.fontSetting;
    } else if (message.includes('no image creation methods available')) {
      return this.errorMessages.noImageMethods;
    } else {
      return this.errorMessages.default + errorMessage;
    }
  }

  // Handle fetch errors
  handleFetchError(error) {
    console.error('Fetch failed:', error);
    return {
      type: 'error',
      message: this.errorMessages.networkCommunication + error.message
    };
  }

  // Handle network API availability check
  checkNetworkAPI() {
    if (typeof fetch !== 'function') {
      console.error('❌ Fetch API not available');
      return {
        type: 'error',
        message: 'Network API not available in this Figma version.'
      };
    }
    return null; // No error
  }

  // Handle missing data errors
  handleMissingDataError(dataType) {
    const errorMessages = {
      imageData: 'No data found from Chrome extension.',
      lastData: 'No previously imported data found.',
      imageUrl: 'Image URL is missing.',
      invalidData: 'Invalid image reference data. Please use "Copy for Figma" from Chrome extension.'
    };
    
    return {
      type: 'error',
      message: errorMessages[dataType] || 'Data is missing.'
    };
  }

  // Validate image data
  validateImageData(imageData) {
    if (!imageData) {
      throw new Error('Image data is missing.');
    }
    
    if (!imageData.imageUrl) {
      throw new Error('Image URL is missing.');
    }
    
    if (!imageData.type || imageData.type !== 'image_reference') {
      throw new Error('Invalid image reference data. Please use "Copy for Figma" from Chrome extension.');
    }
    
    // Validate URL format
    try {
      new URL(imageData.imageUrl);
    } catch (urlError) {
      throw new Error('Invalid image URL.');
    }
    
    return true;
  }

  // Log error with context
  logError(context, error) {
    console.error(`=== ERROR IN ${context.toUpperCase()} ===`);
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }

  // Create user-friendly error message
  createUserFriendlyMessage(error, context = '') {
    const baseMessage = this.getErrorMessage(error.message);
    return context ? `${context}: ${baseMessage}` : baseMessage;
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
} else {
  // For Figma plugin environment
  window.ErrorHandler = ErrorHandler;
}
