// Reference information builder utilities
class ReferenceBuilder {
  constructor() {
    this.defaultFont = { family: "Inter", style: "Regular" };
  }

  // Create reference information with proper font loading
  async createReferenceInfoWithFonts(frame, imageData, width, height) {
    console.log('=== CREATING REFERENCE INFO WITH FONTS ===');
    
    try {
      // First, load fonts before creating any text
      await figma.loadFontAsync(this.defaultFont);
      console.log('✅ Fonts loaded successfully, now creating reference info');
      return this.createReferenceInfo(frame, imageData, width, height);
    } catch (fontError) {
      console.log('⚠️ Font loading failed, using default font:', fontError);
      // Still create reference info with default font
      return this.createReferenceInfo(frame, imageData, width, height);
    }
  }

  // Create reference information
  createReferenceInfo(frame, imageData, width, height) {
    console.log('=== CREATING REFERENCE INFO ===');
    
    // Create a container frame for image and reference info
    const container = figma.createFrame();
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
    const referenceFrame = this.createReferenceFrame(imageData, width, height);
    
    // Add reference frame to container
    container.appendChild(referenceFrame);
    
    console.log('✅ Reference frame created successfully');
    
    // Set font names after text creation (fonts should already be loaded)
    this.setFontNames(referenceFrame);
    
    // Position container
    container.x = figma.viewport.center.x - container.width / 2;
    container.y = figma.viewport.center.y - container.height / 2;
    
    // Select the container
    figma.currentPage.selection = [container];
    figma.viewport.scrollAndZoomIntoView([container]);
    
    console.log('✅ Container positioned and selected successfully');
    return container;
  }

  // Create reference frame
  createReferenceFrame(imageData, width, height) {
    const referenceFrame = figma.createFrame();
    referenceFrame.name = 'Reference Information';
    referenceFrame.layoutMode = 'VERTICAL';
    referenceFrame.itemSpacing = 8;
    referenceFrame.paddingLeft = 16;
    referenceFrame.paddingRight = 16;
    referenceFrame.paddingTop = 16;
    referenceFrame.paddingBottom = 16;
    referenceFrame.resize(300, 200);
    referenceFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
    referenceFrame.cornerRadius = 8;
    
    // Add title
    const title = this.createTitle();
    referenceFrame.appendChild(title);
    
    // Add reference details
    const details = this.createDetails(imageData, width, height);
    referenceFrame.appendChild(details);
    
    // Add timestamp if available
    if (imageData.timestamp) {
      const timestamp = this.createTimestamp(imageData.timestamp);
      referenceFrame.appendChild(timestamp);
    }
    
    // Add source indicator
    if (imageData.metadata && imageData.metadata.originalSource) {
      const sourceIndicator = this.createSourceIndicator(imageData.metadata.originalSource);
      referenceFrame.appendChild(sourceIndicator);
    }
    
    return referenceFrame;
  }

  // Create title text
  createTitle() {
    const title = figma.createText();
    title.characters = '📋 Image Reference';
    title.fontSize = 16;
    title.fontWeight = 600;
    return title;
  }

  // Create details text
  createDetails(imageData, width, height) {
    const details = figma.createText();
    let detailsText = '🖼️ Image URL:\n' + imageData.imageUrl + '\n\n' +
                     '🌐 Page URL:\n' + (imageData.pageUrl || 'N/A') + '\n\n' +
                     '📝 Description:\n' + (imageData.altText || 'No description') + '\n\n' +
                     '📏 Size: ' + width + ' x ' + height + 'px';
    
    const imageInfo = imageData.imageInfo || {};
    if (imageInfo.naturalWidth && imageInfo.naturalHeight) {
      detailsText += '\n🖥️ Original: ' + imageInfo.naturalWidth + ' x ' + imageInfo.naturalHeight + 'px';
    }
    
    details.characters = detailsText;
    details.fontSize = 11;
    details.lineHeight = { value: 16, unit: 'PIXELS' };
    return details;
  }

  // Create timestamp text
  createTimestamp(timestamp) {
    const timestampText = figma.createText();
    const date = new Date(timestamp);
    timestampText.characters = '🕒 Copied: ' + date.toLocaleString();
    timestampText.fontSize = 10;
    timestampText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    return timestampText;
  }

  // Create source indicator text
  createSourceIndicator(originalSource) {
    const sourceIndicator = figma.createText();
    sourceIndicator.characters = '✅ ' + originalSource;
    sourceIndicator.fontSize = 10;
    sourceIndicator.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 0.2 } }];
    return sourceIndicator;
  }

  // Set font names for all text elements
  setFontNames(referenceFrame) {
    try {
      // Get all text nodes in the reference frame
      const textNodes = this.getAllTextNodes(referenceFrame);
      
      // Set font for each text node
      textNodes.forEach(textNode => {
        if (textNode && textNode.fontName !== undefined) {
          textNode.fontName = this.defaultFont;
        }
      });
      
      console.log('✅ Font names set successfully');
    } catch (fontError) {
      console.log('⚠️ Font name setting failed, using default font:', fontError);
    }
  }

  // Get all text nodes recursively
  getAllTextNodes(node) {
    const textNodes = [];
    
    if (node.type === 'TEXT') {
      textNodes.push(node);
    }
    
    if (node.children) {
      node.children.forEach(child => {
        textNodes.push(...this.getAllTextNodes(child));
      });
    }
    
    return textNodes;
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReferenceBuilder;
} else {
  // For Figma plugin environment
  window.ReferenceBuilder = ReferenceBuilder;
}
