// Content script for Image Reference Copy extension
console.log("Image Reference Copy content script loaded");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  
  if (request.action === "copyText") {
    console.log("Copying text:", request.text);
    
    // Copy text to clipboard
    navigator.clipboard.writeText(request.text).then(() => {
      console.log("Text copied successfully to clipboard");
      
      // Show notification
      showNotification(request.type === "figma" ? "Figma data copied!" : "Image reference copied!", "success");
      
      // Save to localStorage for Figma plugin
      if (request.type === "figma") {
        localStorage.setItem('figma_image_data', request.text);
        localStorage.setItem('figma_image_timestamp', Date.now().toString());
      }
      
      // Send response back to background script
      sendResponse({ success: true, message: "Text copied successfully" });
      
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
      showNotification("Copy failed!", "error");
      sendResponse({ success: false, error: err.message });
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
  
  if (request.action === "getImageData") {
    const imageData = localStorage.getItem('figma_image_data');
    const timestamp = localStorage.getItem('figma_image_timestamp');
    
    if (imageData && timestamp) {
      sendResponse({
        success: true,
        data: JSON.parse(imageData),
        timestamp: timestamp
      });
    } else {
      sendResponse({
        success: false,
        message: "No saved image data found."
      });
    }
  }
});

// Show notification function
function showNotification(message, type = "info") {
  // Remove existing notification
  const existingNotification = document.getElementById("image-copy-notification");
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create new notification
  const notification = document.createElement("div");
  notification.id = "image-copy-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
    transform: translateX(100%);
    opacity: 0;
  `;
  
  // Apply styles based on type
  if (type === "success") {
    notification.style.backgroundColor = "#10b981";
  } else if (type === "error") {
    notification.style.backgroundColor = "#ef4444";
  } else {
    notification.style.backgroundColor = "#3b82f6";
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animation effect
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
    notification.style.opacity = "1";
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}
  