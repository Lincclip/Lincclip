// Network service for Chrome extension communication
class NetworkService {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.endpoints = {
      getImageData: '/get-image-data',
      storeImageData: '/store-image-data',
      clearImageData: '/clear-image-data',
      health: '/health'
    };
  }

  // Check if network APIs are available
  checkNetworkAvailability() {
    if (typeof fetch !== 'function') {
      throw new Error('Fetch API not available in this Figma version.');
    }
    return true;
  }

  // Fetch data from Chrome extension
  async fetchFromExtension() {
    console.log('=== FETCHING FROM EXTENSION ===');
    
    try {
      this.checkNetworkAvailability();
      
      const response = await fetch(this.baseUrl + this.endpoints.getImageData, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Cannot connect to Chrome extension. Status: ' + response.status);
      }
      
      const data = await response.json();
      console.log('Received data from server:', data);
      
      if (data.success && data.imageData) {
        return data.imageData;
      } else {
        throw new Error('No data found from Chrome extension.');
      }
      
    } catch (error) {
      console.error('Fetch failed:', error);
      throw error;
    }
  }

  // Store image data to server
  async storeImageData(imageData) {
    try {
      this.checkNetworkAvailability();
      
      const response = await fetch(this.baseUrl + this.endpoints.storeImageData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageData,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to store image data. Status: ' + response.status);
      }
      
      const result = await response.json();
      console.log('Image data stored successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Store image data failed:', error);
      throw error;
    }
  }

  // Clear stored image data
  async clearImageData() {
    try {
      this.checkNetworkAvailability();
      
      const response = await fetch(this.baseUrl + this.endpoints.clearImageData, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear image data. Status: ' + response.status);
      }
      
      const result = await response.json();
      console.log('Image data cleared successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Clear image data failed:', error);
      throw error;
    }
  }

  // Check server health
  async checkHealth() {
    try {
      this.checkNetworkAvailability();
      
      const response = await fetch(this.baseUrl + this.endpoints.health, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Server health check failed. Status: ' + response.status);
      }
      
      const result = await response.json();
      console.log('Server health check successful:', result);
      return result;
      
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Test connection to Chrome extension
  async testConnection() {
    try {
      await this.checkHealth();
      return {
        success: true,
        message: 'Connection to Chrome extension successful'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection to Chrome extension failed: ' + error.message
      };
    }
  }

  // Get server status
  async getServerStatus() {
    try {
      const health = await this.checkHealth();
      return {
        status: 'online',
        health: health,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetworkService;
} else {
  // For Figma plugin environment
  window.NetworkService = NetworkService;
}
