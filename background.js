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
          console.log("=== STARTING ORIGINAL SOURCE SEARCH ===");
          console.log("Image element:", imgElement);
          console.log("Current page URL:", window.location.href);
          
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            console.log("✅ Detected Google Images search page");
            
            // Method 1: Direct search for data-lpage in the entire page
            console.log("🔍 Method 1: Searching for data-lpage attributes...");
            const allElementsWithLpage = document.querySelectorAll('[data-lpage]');
            console.log("Found", allElementsWithLpage.length, "elements with data-lpage");
            
            for (let i = 0; i < allElementsWithLpage.length; i++) {
              const el = allElementsWithLpage[i];
              const lpageUrl = el.getAttribute('data-lpage');
              console.log(`Element ${i}:`, el, "data-lpage:", lpageUrl);
              
              // Check if this element contains our target image
              const imagesInEl = el.querySelectorAll('img');
              for (let img of imagesInEl) {
                if (img.src === imageUrl) {
                  console.log("🎯 FOUND MATCH! Image found in element with data-lpage:", lpageUrl);
                  return lpageUrl;
                }
              }
            }
            
            // Method 2: Look for parent elements with data-lpage
            console.log("🔍 Method 2: Searching parent elements for data-lpage...");
            let element = imgElement;
            for (let i = 0; i < 20; i++) { // Search up to 20 levels up
              if (element && element.getAttribute('data-lpage')) {
                const lpageUrl = element.getAttribute('data-lpage');
                console.log("🎯 FOUND data-lpage in parent level", i, ":", lpageUrl);
                return lpageUrl;
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Method 3: Look for any link that contains the original URL
            console.log("🔍 Method 3: Searching for links with original URLs...");
            const allLinks = document.querySelectorAll('a[href*="http"]');
            console.log("Found", allLinks.length, "links with http");
            
            for (let link of allLinks) {
              const href = link.getAttribute('href');
              if (href && !href.includes('google.com') && !href.includes('imgres') && !href.includes('search')) {
                console.log("Found non-Google link:", href);
                
                // Check if this link is near our image
                try {
                  const linkRect = link.getBoundingClientRect();
                  const imgRect = imgElement.getBoundingClientRect();
                  
                  const distance = Math.sqrt(
                    Math.pow(linkRect.top - imgRect.top, 2) + 
                    Math.pow(linkRect.left - imgRect.left, 2)
                  );
                  
                  if (distance < 300) { // Within 300px
                    console.log("🎯 FOUND nearby link:", href, "distance:", distance);
                    return href;
                  }
                } catch (e) {
                  console.log("Error calculating distance:", e);
                }
              }
            }
            
            // Method 4: Look for any text that contains URLs
            console.log("🔍 Method 4: Searching for URL text...");
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let textNode;
            let urlCount = 0;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent;
              if (text.includes('http') && !text.includes('google.com')) {
                const urlMatches = text.match(/https?:\/\/[^\s]+/g);
                if (urlMatches) {
                  for (let url of urlMatches) {
                    urlCount++;
                    console.log(`URL ${urlCount}:`, url);
                    
                    try {
                      const textRect = textNode.parentElement.getBoundingClientRect();
                      const imgRect = imgElement.getBoundingClientRect();
                      
                      const distance = Math.sqrt(
                        Math.pow(textRect.top - imgRect.top, 2) + 
                        Math.pow(textRect.left - imgRect.left, 2)
                      );
                      
                      if (distance < 500) { // Within 500px
                        console.log("🎯 FOUND nearby URL text:", url, "distance:", distance);
                        return url;
                      }
                    } catch (e) {
                      console.log("Error calculating text distance:", e);
                    }
                  }
                }
              }
            }
            
            // Method 5: Look for specific Google Images structure
            console.log("🔍 Method 5: Searching for Google Images specific structure...");
            let container = imgElement;
            for (let i = 0; i < 15; i++) {
              if (container) {
                console.log(`Container level ${i}:`, container.className, container.id);
                
                // Look for any attribute that might contain a URL
                const attributes = container.attributes;
                for (let attr of attributes) {
                  if (attr.value && attr.value.includes('http') && !attr.value.includes('google.com')) {
                    const urlMatch = attr.value.match(/https?:\/\/[^\s;]+/);
                    if (urlMatch) {
                      console.log("🎯 FOUND URL in attribute", attr.name, ":", urlMatch[0]);
                      return urlMatch[0];
                    }
                  }
                }
                
                if (container.parentElement) {
                  container = container.parentElement;
                } else {
                  break;
                }
              }
            }
            
            console.log("❌ Could not find original source URL");
          } else {
            console.log("Not on Google Images, using current page URL");
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
        
        console.log("Final original source URL:", originalSourceUrl);
        
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
          console.log("=== STARTING ORIGINAL SOURCE SEARCH ===");
          console.log("Image element:", imgElement);
          console.log("Current page URL:", window.location.href);
          
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            console.log("✅ Detected Google Images search page");
            
            // Method 1: Direct search for data-lpage in the entire page
            console.log("🔍 Method 1: Searching for data-lpage attributes...");
            const allElementsWithLpage = document.querySelectorAll('[data-lpage]');
            console.log("Found", allElementsWithLpage.length, "elements with data-lpage");
            
            for (let i = 0; i < allElementsWithLpage.length; i++) {
              const el = allElementsWithLpage[i];
              const lpageUrl = el.getAttribute('data-lpage');
              console.log(`Element ${i}:`, el, "data-lpage:", lpageUrl);
              
              // Check if this element contains our target image
              const imagesInEl = el.querySelectorAll('img');
              for (let img of imagesInEl) {
                if (img.src === imageUrl) {
                  console.log("🎯 FOUND MATCH! Image found in element with data-lpage:", lpageUrl);
                  return lpageUrl;
                }
              }
            }
            
            // Method 2: Look for parent elements with data-lpage
            console.log("🔍 Method 2: Searching parent elements for data-lpage...");
            let element = imgElement;
            for (let i = 0; i < 20; i++) { // Search up to 20 levels up
              if (element && element.getAttribute('data-lpage')) {
                const lpageUrl = element.getAttribute('data-lpage');
                console.log("🎯 FOUND data-lpage in parent level", i, ":", lpageUrl);
                return lpageUrl;
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Method 3: Look for any link that contains the original URL
            console.log("🔍 Method 3: Searching for links with original URLs...");
            const allLinks = document.querySelectorAll('a[href*="http"]');
            console.log("Found", allLinks.length, "links with http");
            
            for (let link of allLinks) {
              const href = link.getAttribute('href');
              if (href && !href.includes('google.com') && !href.includes('imgres') && !href.includes('search')) {
                console.log("Found non-Google link:", href);
                
                // Check if this link is near our image
                try {
                  const linkRect = link.getBoundingClientRect();
                  const imgRect = imgElement.getBoundingClientRect();
                  
                  const distance = Math.sqrt(
                    Math.pow(linkRect.top - imgRect.top, 2) + 
                    Math.pow(linkRect.left - imgRect.left, 2)
                  );
                  
                  if (distance < 300) { // Within 300px
                    console.log("🎯 FOUND nearby link:", href, "distance:", distance);
                    return href;
                  }
                } catch (e) {
                  console.log("Error calculating distance:", e);
                }
              }
            }
            
            // Method 4: Look for any text that contains URLs
            console.log("🔍 Method 4: Searching for URL text...");
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let textNode;
            let urlCount = 0;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent;
              if (text.includes('http') && !text.includes('google.com')) {
                const urlMatches = text.match(/https?:\/\/[^\s]+/g);
                if (urlMatches) {
                  for (let url of urlMatches) {
                    urlCount++;
                    console.log(`URL ${urlCount}:`, url);
                    
                    try {
                      const textRect = textNode.parentElement.getBoundingClientRect();
                      const imgRect = imgElement.getBoundingClientRect();
                      
                      const distance = Math.sqrt(
                        Math.pow(textRect.top - imgRect.top, 2) + 
                        Math.pow(textRect.left - imgRect.left, 2)
                      );
                      
                      if (distance < 500) { // Within 500px
                        console.log("🎯 FOUND nearby URL text:", url, "distance:", distance);
                        return url;
                      }
                    } catch (e) {
                      console.log("Error calculating text distance:", e);
                    }
                  }
                }
              }
            }
            
            // Method 5: Look for specific Google Images structure
            console.log("🔍 Method 5: Searching for Google Images specific structure...");
            let container = imgElement;
            for (let i = 0; i < 15; i++) {
              if (container) {
                console.log(`Container level ${i}:`, container.className, container.id);
                
                // Look for any attribute that might contain a URL
                const attributes = container.attributes;
                for (let attr of attributes) {
                  if (attr.value && attr.value.includes('http') && !attr.value.includes('google.com')) {
                    const urlMatch = attr.value.match(/https?:\/\/[^\s;]+/);
                    if (urlMatch) {
                      console.log("🎯 FOUND URL in attribute", attr.name, ":", urlMatch[0]);
                      return urlMatch[0];
                    }
                  }
                }
                
                if (container.parentElement) {
                  container = container.parentElement;
                } else {
                  break;
                }
              }
            }
            
            console.log("❌ Could not find original source URL");
          } else {
            console.log("Not on Google Images, using current page URL");
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
        
        console.log("Final original source URL:", originalSourceUrl);
        
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
  