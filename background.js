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
    
    // Simple text copy
    const text = `Image URL: ${info.srcUrl}\nPage URL: ${tab.url}\nImage Description: ${info.altText || "Image"}`;
    
    // Use chrome.tabs.sendMessage to communicate with content script
    chrome.tabs.sendMessage(tab.id, {
      action: "copyText",
      text: text,
      type: "reference"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        // Fallback: execute script directly
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          function: (text) => {
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
          args: [text]
        });
      } else {
        console.log("Message sent successfully:", response);
      }
    });
  }
  
  if (info.menuItemId === "copyImageForFigma") {
    console.log("Executing copyImageForFigma...");
    
    // Create Figma data
    const figmaData = {
      type: "image_reference",
      version: "1.0",
      imageUrl: info.srcUrl,
      pageUrl: tab.url,
      altText: info.altText || "Image",
      timestamp: new Date().toISOString(),
      source: "chrome_extension"
    };
    
    const jsonString = JSON.stringify(figmaData, null, 2);
    
    // Use chrome.tabs.sendMessage to communicate with content script
    chrome.tabs.sendMessage(tab.id, {
      action: "copyText",
      text: jsonString,
      type: "figma"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        // Fallback: execute script directly
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          function: (jsonString) => {
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
          args: [jsonString]
        });
      } else {
        console.log("Message sent successfully:", response);
      }
    });
  }
});
  