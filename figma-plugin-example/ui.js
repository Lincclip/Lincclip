// UI script for Figma plugin
console.log('=== UI SCRIPT LOADING ===');

// Global variables
var imageDataTextarea, statusDiv;

// Initialize when DOM is ready
function initializeUI() {
    console.log('=== INITIALIZING UI ===');
    
    // Get DOM elements
    imageDataTextarea = document.getElementById('imageData');
    statusDiv = document.getElementById('status');
    
    console.log('DOM elements found:');
    console.log('- imageDataTextarea:', imageDataTextarea);
    console.log('- statusDiv:', statusDiv);
    
    // Setup tab switching
    setupTabs();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup paste detection
    setupPasteDetection();
    
    console.log('=== UI INITIALIZATION COMPLETE ===');
    
    // Test message sending
    setTimeout(function() {
        sendMessageToFigma({
            type: 'init',
            message: 'UI loaded successfully'
        });
    }, 500);
}

// Setup tab switching
function setupTabs() {
    var methodTabs = document.querySelectorAll('.method-tab');
    var methodContents = document.querySelectorAll('.method-content');
    
    for (var i = 0; i < methodTabs.length; i++) {
        methodTabs[i].addEventListener('click', function() {
            var method = this.getAttribute('data-method');
            console.log('Switching to method:', method);
            
            // Activate tab
            for (var j = 0; j < methodTabs.length; j++) {
                methodTabs[j].classList.remove('active');
            }
            this.classList.add('active');
            
            // Switch content
            for (var k = 0; k < methodContents.length; k++) {
                methodContents[k].classList.remove('active');
                if (methodContents[k].id === method + '-method') {
                    methodContents[k].classList.add('active');
                }
            }
        });
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            console.log('Keyboard shortcut: Import');
            handleImport();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            console.log('Keyboard shortcut: Clear');
            handleClear();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            console.log('Keyboard shortcut: Reimport');
            handleReimport();
        }
    });
}

// Setup paste detection
function setupPasteDetection() {
    if (imageDataTextarea) {
        imageDataTextarea.addEventListener('paste', function(e) {
            console.log('Paste event detected');
            setTimeout(function() {
                var pastedData = imageDataTextarea.value.trim();
                if (pastedData) {
                    try {
                        var parsed = JSON.parse(pastedData);
                        if (parsed.type === 'image_reference') {
                            showStatus('Valid image data detected!', 'success');
                            setTimeout(hideStatus, 2000);
                        } else {
                            showStatus('Not image reference data. Please use "Copy for Figma" from Chrome extension.', 'error');
                            setTimeout(hideStatus, 4000);
                        }
                    } catch (error) {
                        console.error('Paste validation error:', error);
                        showStatus('Not JSON format. Please copy again from Chrome extension.', 'error');
                        setTimeout(hideStatus, 4000);
                    }
                }
            }, 100);
        });
    }
}

// Send message to Figma
function sendMessageToFigma(message) {
    console.log('=== SENDING MESSAGE TO FIGMA ===');
    console.log('Message:', message);
    
    try {
        if (parent && parent.postMessage) {
            parent.postMessage({
                pluginMessage: message
            }, '*');
            console.log('✅ Message sent via parent.postMessage');
            return true;
        }
    } catch (e) {
        console.error('❌ parent.postMessage failed:', e);
    }
    
    try {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({
                pluginMessage: message
            }, '*');
            console.log('✅ Message sent via window.parent.postMessage');
            return true;
        }
    } catch (e) {
        console.error('❌ window.parent.postMessage failed:', e);
    }
    
    console.error('❌ All message sending methods failed');
    return false;
}

// Handle import button click
function handleImport() {
    console.log('=== IMPORT BUTTON CLICKED ===');
    
    var jsonData = imageDataTextarea.value.trim();
    console.log('Textarea value length:', jsonData.length);
    
    if (!jsonData) {
        showStatus('Please enter image data.', 'error');
        return;
    }
    
    try {
        var imageData = JSON.parse(jsonData);
        console.log('✅ Parsed image data:', imageData);
        
        // Data validation
        if (!imageData.type || imageData.type !== 'image_reference') {
            showStatus('Invalid image reference data. Please use "Copy for Figma" from Chrome extension.', 'error');
            return;
        }
        
        if (!imageData.imageUrl) {
            showStatus('Image URL is missing.', 'error');
            return;
        }
        
        // URL validation
        try {
            new URL(imageData.imageUrl);
        } catch (urlError) {
            showStatus('Invalid image URL.', 'error');
            return;
        }
        
        // Send data to Figma
        console.log('Sending data to Figma:', imageData);
        var messageSent = sendMessageToFigma({
            type: 'import-image-reference',
            data: imageData
        });
        
        if (messageSent) {
            showStatus('Importing image...', 'info');
        } else {
            showStatus('Failed to send message to Figma. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('❌ JSON parsing error:', error);
        showStatus('Invalid JSON format. Please copy again from Chrome extension.', 'error');
    }
}

// Handle clear button click
function handleClear() {
    console.log('Clear button clicked');
    imageDataTextarea.value = '';
    hideStatus();
}

// Handle reimport button click
function handleReimport() {
    console.log('Reimport button clicked');
    var messageSent = sendMessageToFigma({
        type: 'reimport-last'
    });
    
    if (messageSent) {
        showStatus('Reimporting last data...', 'info');
    } else {
        showStatus('Failed to send message to Figma. Please try again.', 'error');
    }
}

// Handle fetch button click
function handleFetch() {
    console.log('Fetch button clicked');
    var messageSent = sendMessageToFigma({
        type: 'fetch-from-extension'
    });
    
    if (messageSent) {
        showStatus('Fetching data from Chrome extension...', 'info');
    } else {
        showStatus('Failed to send message to Figma. Please try again.', 'error');
    }
}

// Show status message
function showStatus(message, type) {
    console.log('Showing status:', type, message);
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        if (type === 'error') {
            setTimeout(function() {
                if (statusDiv.style.display === 'block') {
                    statusDiv.style.opacity = '0.7';
                }
            }, 5000);
        }
    }
}

// Hide status message
function hideStatus() {
    console.log('Hiding status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
        statusDiv.style.opacity = '1';
    }
}

// Receive messages from Figma
window.onmessage = function(event) {
    console.log('=== RECEIVED MESSAGE FROM FIGMA ===');
    console.log('Event data:', event.data);
    var message = event.data.pluginMessage;
    
    if (message) {
        console.log('Plugin message:', message);
        if (message.type === 'success') {
            showStatus(message.message, 'success');
            setTimeout(hideStatus, 3000);
        } else if (message.type === 'error') {
            showStatus(message.message, 'error');
            setTimeout(hideStatus, 8000);
        } else if (message.type === 'init') {
            showStatus(message.message, 'info');
            setTimeout(hideStatus, 2000);
        } else if (message.type === 'info') {
            showStatus(message.message, 'info');
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    initializeUI();
}

console.log('=== UI SCRIPT LOADED ===');
