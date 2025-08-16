// Image processing utilities
class ImageProcessor {
  constructor() {
    this.supportedMethods = [
      'createImageFromUrl',
      'createImage',
      'createImageFromBytes'
    ];
  }

  // Create image with multiple fallback methods
  async createImageWithFallback(imageData) {
    console.log('=== TRYING IMAGE CREATION METHODS ===');
    
    // Method 1: Try figma.createImageFromUrl (newer API)
    if (typeof figma.createImageFromUrl === 'function') {
      console.log('✅ Trying figma.createImageFromUrl...');
      try {
        const image = await figma.createImageFromUrl(imageData.imageUrl);
        console.log('✅ Image created successfully with createImageFromUrl:', image);
        return image;
      } catch (error) {
        console.error('❌ createImageFromUrl failed:', error);
      }
    }
    
    // Method 2: Try figma.createImage (older API)
    if (typeof figma.createImage === 'function') {
      console.log('✅ Trying figma.createImage...');
      try {
        const image = figma.createImage(imageData.imageUrl);
        console.log('✅ Image created successfully with createImage:', image);
        return image;
      } catch (error) {
        console.error('❌ createImage failed:', error);
      }
    }
    
    // Method 3: Try using fetch to get image data
    console.log('❌ Direct image creation APIs not available, trying fetch method...');
    return await this.createImageWithFetch(imageData);
  }

  // Create image using fetch method
  async createImageWithFetch(imageData) {
    console.log('=== TRYING FETCH METHOD ===');
    
    // Check if fetch is available
    if (typeof fetch !== 'function') {
      console.log('❌ Fetch not available, throwing error');
      throw new Error('No image creation methods available');
    }
    
    try {
      // Try to fetch the image
      const response = await fetch(imageData.imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image: ' + response.status);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('✅ Image fetched successfully, size:', arrayBuffer.byteLength);
      
      // Try to create image from array buffer
      if (typeof figma.createImageFromBytes === 'function') {
        const image = figma.createImageFromBytes(new Uint8Array(arrayBuffer));
        console.log('✅ Image created from bytes:', image);
        return image;
      } else {
        throw new Error('createImageFromBytes not available');
      }
    } catch (error) {
      console.error('❌ Fetch method failed:', error);
      throw error;
    }
  }

  // Process successfully created image
  processImage(image, imageData) {
    console.log('=== PROCESSING IMAGE ===');
    console.log('Image dimensions:', image.width, 'x', image.height);
    
    // Create image frame
    const frame = figma.createFrame();
    frame.name = 'Image Reference - ' + (imageData.altText || 'Image');
    
    // Set image size based on imageInfo or use image dimensions
    const imageInfo = imageData.imageInfo || {};
    let width = imageInfo.naturalWidth || imageInfo.displayWidth || image.width || 300;
    let height = imageInfo.naturalHeight || imageInfo.displayHeight || image.height || 200;
    
    // Ensure minimum size
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    
    console.log('Setting frame size to:', width, 'x', height);
    frame.resize(width, height);
    
    // Set image fill
    frame.fills = [{
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: 'FILL'
    }];
    
    console.log('✅ Image frame created successfully');
    return { frame, width, height };
  }

  // Create alternative image (placeholder)
  createImageAlternative(imageData) {
    console.log('=== TRYING ALTERNATIVE IMAGE CREATION ===');
    
    // Create a simple frame with image URL as reference
    const frame = figma.createFrame();
    frame.name = 'Image Reference - ' + (imageData.altText || 'Image');
    
    // Set image size based on imageInfo
    const imageInfo = imageData.imageInfo || {};
    let width = imageInfo.naturalWidth || imageInfo.displayWidth || 300;
    let height = imageInfo.naturalHeight || imageInfo.displayHeight || 200;
    
    // Ensure minimum size
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    
    console.log('Setting frame size to:', width, 'x', height);
    frame.resize(width, height);
    
    // Create a placeholder rectangle with the image URL as a note
    const placeholder = figma.createRectangle();
    placeholder.name = 'Image Placeholder';
    placeholder.resize(width, height);
    placeholder.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    placeholder.cornerRadius = 4;
    
    // Add the placeholder to the frame
    frame.appendChild(placeholder);
    
    console.log('✅ Alternative image creation completed');
    return { frame, width, height };
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessor;
} else {
  // For Figma plugin environment
  window.ImageProcessor = ImageProcessor;
}
