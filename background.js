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
          console.log("Finding original source for image:", imgElement);
          
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            console.log("Detected Google Images search page");
            
            // Method 1: Look for data-lpage attribute in parent elements
            let element = imgElement;
            for (let i = 0; i < 15; i++) { // Search up to 15 levels up
              if (element && element.getAttribute('data-lpage')) {
                console.log("Found data-lpage in parent:", element.getAttribute('data-lpage'));
                return element.getAttribute('data-lpage');
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Method 2: Look for any element with data-lpage that contains our image
            const elementsWithLpage = document.querySelectorAll('[data-lpage]');
            console.log("Found", elementsWithLpage.length, "elements with data-lpage");
            
            for (let el of elementsWithLpage) {
              const imagesInEl = el.querySelectorAll('img');
              for (let img of imagesInEl) {
                if (img.src === imageUrl) {
                  console.log("Found matching image in element with data-lpage:", el.getAttribute('data-lpage'));
                  return el.getAttribute('data-lpage');
                }
              }
            }
            
            // Method 3: Look for imgrefurl in the page URL or nearby elements
            const urlParams = new URLSearchParams(window.location.search);
            const imgrefurl = urlParams.get('imgrefurl');
            if (imgrefurl) {
              console.log("Found imgrefurl in URL params:", imgrefurl);
              return decodeURIComponent(imgrefurl);
            }
            
            // Method 4: Look for any link that might contain the original URL
            const links = document.querySelectorAll('a[href*="http"]');
            for (let link of links) {
              const href = link.getAttribute('href');
              if (href && !href.includes('google.com') && !href.includes('imgres')) {
                // Check if this link is near our image
                const linkRect = link.getBoundingClientRect();
                const imgRect = imgElement.getBoundingClientRect();
                
                // If link is close to image (within 100px)
                if (Math.abs(linkRect.top - imgRect.top) < 100 && 
                    Math.abs(linkRect.left - imgRect.left) < 100) {
                  console.log("Found nearby link:", href);
                  return href;
                }
              }
            }
            
            // Method 5: Look for any text that looks like a URL near the image
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let textNode;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent;
              if (text.includes('http') && !text.includes('google.com')) {
                const urlMatch = text.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                  const url = urlMatch[0];
                  // Check if this text is near our image
                  const textRect = textNode.parentElement.getBoundingClientRect();
                  const imgRect = imgElement.getBoundingClientRect();
                  
                  if (Math.abs(textRect.top - imgRect.top) < 200 && 
                      Math.abs(textRect.left - imgRect.left) < 200) {
                    console.log("Found URL in nearby text:", url);
                    return url;
                  }
                }
              }
            }
            
            // Method 6: Look for specific Google Images structure
            // Find the container that holds the image and look for source information
            let container = imgElement;
            for (let i = 0; i < 10; i++) {
              if (container && container.classList.contains('eA0Zlc')) {
                console.log("Found eA0Zlc container");
                // Look for any link or text that might contain the source
                const sourceElements = container.querySelectorAll('a[href*="http"], span, div');
                for (let el of sourceElements) {
                  const text = el.textContent || el.getAttribute('href') || '';
                  if (text.includes('http') && !text.includes('google.com') && !text.includes('imgres')) {
                    const urlMatch = text.match(/https?:\/\/[^\s]+/);
                    if (urlMatch) {
                      console.log("Found URL in container:", urlMatch[0]);
                      return urlMatch[0];
                    }
                  }
                }
                break;
              }
              if (container && container.parentElement) {
                container = container.parentElement;
              } else {
                break;
              }
            }
            
            // Method 7: Look for any element with jsdata that might contain URL info
            const jsdataElements = document.querySelectorAll('[jsdata]');
            for (let el of jsdataElements) {
              const jsdata = el.getAttribute('jsdata');
              if (jsdata && jsdata.includes('http')) {
                const urlMatch = jsdata.match(/https?:\/\/[^\s;]+/);
                if (urlMatch && !urlMatch[0].includes('google.com')) {
                  console.log("Found URL in jsdata:", urlMatch[0]);
                  return urlMatch[0];
                }
              }
            }
          }
          
          console.log("Could not find original source, using current page URL");
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
          console.log("Finding original source for image:", imgElement);
          
          // Check if we're on Google Images
          if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/search')) {
            console.log("Detected Google Images search page");
            
            // Method 1: Look for data-lpage attribute in parent elements
            let element = imgElement;
            for (let i = 0; i < 15; i++) { // Search up to 15 levels up
              if (element && element.getAttribute('data-lpage')) {
                console.log("Found data-lpage in parent:", element.getAttribute('data-lpage'));
                return element.getAttribute('data-lpage');
              }
              if (element && element.parentElement) {
                element = element.parentElement;
              } else {
                break;
              }
            }
            
            // Method 2: Look for any element with data-lpage that contains our image
            const elementsWithLpage = document.querySelectorAll('[data-lpage]');
            console.log("Found", elementsWithLpage.length, "elements with data-lpage");
            
            for (let el of elementsWithLpage) {
              const imagesInEl = el.querySelectorAll('img');
              for (let img of imagesInEl) {
                if (img.src === imageUrl) {
                  console.log("Found matching image in element with data-lpage:", el.getAttribute('data-lpage'));
                  return el.getAttribute('data-lpage');
                }
              }
            }
            
            // Method 3: Look for imgrefurl in the page URL or nearby elements
            const urlParams = new URLSearchParams(window.location.search);
            const imgrefurl = urlParams.get('imgrefurl');
            if (imgrefurl) {
              console.log("Found imgrefurl in URL params:", imgrefurl);
              return decodeURIComponent(imgrefurl);
            }
            
            // Method 4: Look for any link that might contain the original URL
            const links = document.querySelectorAll('a[href*="http"]');
            for (let link of links) {
              const href = link.getAttribute('href');
              if (href && !href.includes('google.com') && !href.includes('imgres')) {
                // Check if this link is near our image
                const linkRect = link.getBoundingClientRect();
                const imgRect = imgElement.getBoundingClientRect();
                
                // If link is close to image (within 100px)
                if (Math.abs(linkRect.top - imgRect.top) < 100 && 
                    Math.abs(linkRect.left - imgRect.left) < 100) {
                  console.log("Found nearby link:", href);
                  return href;
                }
              }
            }
            
            // Method 5: Look for any text that looks like a URL near the image
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let textNode;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent;
              if (text.includes('http') && !text.includes('google.com')) {
                const urlMatch = text.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                  const url = urlMatch[0];
                  // Check if this text is near our image
                  const textRect = textNode.parentElement.getBoundingClientRect();
                  const imgRect = imgElement.getBoundingClientRect();
                  
                  if (Math.abs(textRect.top - imgRect.top) < 200 && 
                      Math.abs(textRect.left - imgRect.left) < 200) {
                    console.log("Found URL in nearby text:", url);
                    return url;
                  }
                }
              }
            }
            
            // Method 6: Look for specific Google Images structure
            // Find the container that holds the image and look for source information
            let container = imgElement;
            for (let i = 0; i < 10; i++) {
              if (container && container.classList.contains('eA0Zlc')) {
                console.log("Found eA0Zlc container");
                // Look for any link or text that might contain the source
                const sourceElements = container.querySelectorAll('a[href*="http"], span, div');
                for (let el of sourceElements) {
                  const text = el.textContent || el.getAttribute('href') || '';
                  if (text.includes('http') && !text.includes('google.com') && !text.includes('imgres')) {
                    const urlMatch = text.match(/https?:\/\/[^\s]+/);
                    if (urlMatch) {
                      console.log("Found URL in container:", urlMatch[0]);
                      return urlMatch[0];
                    }
                  }
                }
                break;
              }
              if (container && container.parentElement) {
                container = container.parentElement;
              } else {
                break;
              }
            }
            
            // Method 7: Look for any element with jsdata that might contain URL info
            const jsdataElements = document.querySelectorAll('[jsdata]');
            for (let el of jsdataElements) {
              const jsdata = el.getAttribute('jsdata');
              if (jsdata && jsdata.includes('http')) {
                const urlMatch = jsdata.match(/https?:\/\/[^\s;]+/);
                if (urlMatch && !urlMatch[0].includes('google.com')) {
                  console.log("Found URL in jsdata:", urlMatch[0]);
                  return urlMatch[0];
                }
              }
            }
          }
          
          console.log("Could not find original source, using current page URL");
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
  