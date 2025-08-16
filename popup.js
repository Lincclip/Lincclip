// Execute when popup loads
document.addEventListener('DOMContentLoaded', function() {
    // Figma link click event
    const figmaLink = document.getElementById('figmaLink');
    figmaLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Navigate to Figma plugin marketplace
        chrome.tabs.create({
            url: 'https://www.figma.com/community/search?model_type=plugins&q=image%20reference%20copy'
        });
    });
    
    // Get current tab information
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (currentTab) {
            updateStatus(currentTab.url);
        }
    });
});

// Update status function
function updateStatus(url) {
    const statusElement = document.querySelector('.status');
    
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
        statusElement.textContent = 'Cannot be used on this page';
        statusElement.style.color = '#ff6b6b';
    } else {
        statusElement.textContent = 'Right-click on images to use';
        statusElement.style.color = '#4ecdc4';
    }
}

// Display extension version
chrome.management.getSelf(function(extensionInfo) {
    const version = extensionInfo.version;
    const statusElement = document.querySelector('.status');
    statusElement.textContent += ` (v${version})`;
});
