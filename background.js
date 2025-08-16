// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, creating context menus...");
  
  chrome.contextMenus.create({
    id: "copyImageWithReference",
    title: "Copy Image + Reference",
    contexts: ["image"]
  });
  
  chrome.contextMenus.create({
    id: "copyImageForFigma",
    title: "Copy for Figma",
    contexts: ["image"]
  });
  
  console.log("Context menus created successfully");
});

// Handle context menu click events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  console.log("Image URL:", info.srcUrl);
  console.log("Page URL:", tab.url);
  
  if (info.menuItemId === "copyImageWithReference") {
    console.log("Executing copyImageWithReference...");
    
    // Execute script to get original source URL
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: (imageUrl, pageUrl, altText) => {
        // Function to find the actual source URL for Google Images
        function findOriginalSourceUrl(imgElement) {
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            // Look for the parent container with data-lpage attribute
            let element = imgElement;
            for (let i = 0; i < 10; i++) { // Search up to 10 levels up
              if (element && element.getAttribute('data-lpage')) {
                return element.getAttribute('data-lpage');
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Alternative: look for any element with data-lpage in the page
            const elementsWithLpage = document.querySelectorAll('[data-lpage]');
            for (let el of elementsWithLpage) {
              // Check if this element contains our image
              if (el.querySelector('img') && el.querySelector('img').src === imageUrl) {
                return el.getAttribute('data-lpage');
              }
            }
          }
          return pageUrl; // Fallback to current page URL
        }
        
        // Find the image element and get original source
        const imageElements = document.querySelectorAll('img');
        let originalSourceUrl = pageUrl;
        
        for (let img of imageElements) {
          if (img.src === imageUrl) {
            originalSourceUrl = findOriginalSourceUrl(img);
            break;
          }
        }
        
        // Create text with original source URL
        const text = `Image URL: ${imageUrl}\nPage URL: ${originalSourceUrl}\nImage Description: ${altText || "Image"}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
          console.log("Text copied successfully");
          // Show notification
          const notification = document.createElement("div");
          notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background-color: #10b981; color: white; border-radius: 8px;
            font-family: -apple-system, sans-serif; font-size: 14px;
            z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          `;
          notification.textContent = "Image reference copied!";
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }).catch(err => {
          console.error("Clipboard copy failed:", err);
        });
      },
      args: [info.srcUrl, tab.url, info.altText || "Image"]
    });
  }
  
  if (info.menuItemId === "copyImageForFigma") {
    console.log("Executing copyImageForFigma...");
    
    // Execute script to get detailed image information including original source
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: (imageUrl, pageUrl, altText) => {
        // Function to find the actual source URL for Google Images
        function findOriginalSourceUrl(imgElement) {
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            // Look for the parent container with data-lpage attribute
            let element = imgElement;
            for (let i = 0; i < 10; i++) { // Search up to 10 levels up
              if (element && element.getAttribute('data-lpage')) {
                return element.getAttribute('data-lpage');
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Alternative: look for any element with data-lpage in the page
            const elementsWithLpage = document.querySelectorAll('[data-lpage]');
            for (let el of elementsWithLpage) {
              // Check if this element contains our image
              if (el.querySelector('img') && el.querySelector('img').src === imageUrl) {
                return el.getAttribute('data-lpage');
              }
            }
          }
          return pageUrl; // Fallback to current page URL
        }
        
        // Find the image element
        const imageElements = document.querySelectorAll('img');
        let targetImage = null;
        let originalSourceUrl = pageUrl;
        
        for (let img of imageElements) {
          if (img.src === imageUrl) {
            targetImage = img;
            originalSourceUrl = findOriginalSourceUrl(img);
            break;
          }
        }
        
        // Collect detailed image information
        let imageInfo = {
          src: imageUrl,
          alt: altText || "",
          naturalWidth: 0,
          naturalHeight: 0,
          displayWidth: 0,
          displayHeight: 0,
          className: "",
          id: "",
          title: "",
          style: {}
        };
        
        if (targetImage) {
          imageInfo = {
            src: targetImage.src,
            alt: targetImage.alt || "",
            naturalWidth: targetImage.naturalWidth || 0,
            naturalHeight: targetImage.naturalHeight || 0,
            displayWidth: targetImage.width || 0,
            displayHeight: targetImage.height || 0,
            className: targetImage.className || "",
            id: targetImage.id || "",
            title: targetImage.title || "",
            style: {
              width: targetImage.style.width || "",
              height: targetImage.style.height || "",
              objectFit: targetImage.style.objectFit || "",
              borderRadius: targetImage.style.borderRadius || ""
            }
          };
        }
        
        const figmaData = {
          type: "image_reference",
          version: "1.0",
          imageUrl: imageUrl,
          pageUrl: originalSourceUrl, // Use the original source URL
          altText: altText,
          imageInfo: imageInfo,
          timestamp: new Date().toISOString(),
          source: "chrome_extension",
          metadata: {
            extension: "Image Reference Copy",
            version: "1.0",
            originalSource: originalSourceUrl !== pageUrl ? "Found original source" : "Using current page"
          }
        };
        
        const jsonString = JSON.stringify(figmaData, null, 2);
        
        // Copy to clipboard
        navigator.clipboard.writeText(jsonString).then(() => {
          console.log("Figma data copied successfully");
          // Show notification
          const notification = document.createElement("div");
          notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background-color: #10b981; color: white; border-radius: 8px;
            font-family: -apple-system, sans-serif; font-size: 14px;
            z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          `;
          notification.textContent = "Figma data copied!";
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }).catch(err => {
          console.error("Clipboard copy failed:", err);
        });
      },
      args: [info.srcUrl, tab.url, info.altText || "Image"]
    });
  }
});
  