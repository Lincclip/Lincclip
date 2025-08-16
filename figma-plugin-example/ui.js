// Figma plugin UI JavaScript
console.log('=== UI SCRIPT LOADING ===');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CONTENT LOADED ===');
    
    // Get DOM elements
    var imageDataTextarea = document.getElementById('imageData');
    var importBtn = document.getElementById('importBtn');
    var clearBtn = document.getElementById('clearBtn');
    var reimportBtn = document.getElementById('reimportBtn');
    var fetchBtn = document.getElementById('fetchBtn');
    var reimportBtn2 = document.getElementById('reimportBtn2');
    var statusDiv = document.getElementById('status');
    
    console.log('DOM elements found:');
    console.log('- imageDataTextarea:', imageDataTextarea);
    console.log('- importBtn:', importBtn);
    console.log('- clearBtn:', clearBtn);
    console.log('- reimportBtn:', reimportBtn);
    console.log('- fetchBtn:', fetchBtn);
    console.log('- reimportBtn2:', reimportBtn2);
    console.log('- statusDiv:', statusDiv);
    
    // Tab switching functionality
    var methodTabs = document.querySelectorAll('.method-tab');
    var methodContents = document.querySelectorAll('.method-content');
    
    console.log('Found method tabs:', methodTabs.length);
    console.log('Found method contents:', methodContents.length);
    
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
    
    // Function to send message to Figma
    function sendMessageToFigma(message) {
        console.log('=== SENDING MESSAGE TO FIGMA ===');
        console.log('Message:', message);
        
        // Try multiple methods to send message
        try {
            // Method 1: parent.postMessage
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
            // Method 2: window.parent.postMessage
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
        
        try {
            // Method 3: top.postMessage
            if (top && top.postMessage) {
                top.postMessage({
                    pluginMessage: message
                }, '*');
                console.log('✅ Message sent via top.postMessage');
                return true;
            }
        } catch (e) {
            console.error('❌ top.postMessage failed:', e);
        }
        
        console.error('❌ All message sending methods failed');
        return false;
    }
    
    // Image import button click event
    if (importBtn) {
        console.log('Adding click listener to import button');
        importBtn.addEventListener('click', function(e) {
            console.log('=== IMPORT BUTTON CLICKED ===');
            e.preventDefault();
            e.stopPropagation();
            
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
        });
        
        // Also add mousedown event as backup
        importBtn.addEventListener('mousedown', function(e) {
            console.log('Import button mousedown event');
        });
        
        // Test if button is clickable
        console.log('Import button styles:', window.getComputedStyle(importBtn));
        console.log('Import button disabled:', importBtn.disabled);
    } else {
        console.error('❌ Import button not found!');
    }
    
    // Clear button click event
    if (clearBtn) {
        console.log('Adding click listener to clear button');
        clearBtn.addEventListener('click', function() {
            console.log('Clear button clicked');
            imageDataTextarea.value = '';
            hideStatus();
        });
    }
    
    // Reimport last data buttons
    if (reimportBtn) {
        console.log('Adding click listener to reimport button');
        reimportBtn.addEventListener('click', function() {
            console.log('Reimport button clicked');
            var messageSent = sendMessageToFigma({
                type: 'reimport-last'
            });
            
            if (messageSent) {
                showStatus('Reimporting last data...', 'info');
            } else {
                showStatus('Failed to send message to Figma. Please try again.', 'error');
            }
        });
    }
    
    if (reimportBtn2) {
        console.log('Adding click listener to reimport button 2');
        reimportBtn2.addEventListener('click', function() {
            console.log('Reimport button 2 clicked');
            var messageSent = sendMessageToFigma({
                type: 'reimport-last'
            });
            
            if (messageSent) {
                showStatus('Reimporting last data...', 'info');
            } else {
                showStatus('Failed to send message to Figma. Please try again.', 'error');
            }
        });
    }
    
    // Auto fetch from Chrome extension
    if (fetchBtn) {
        console.log('Adding click listener to fetch button');
        fetchBtn.addEventListener('click', function() {
            console.log('Fetch button clicked');
            var messageSent = sendMessageToFigma({
                type: 'fetch-from-extension'
            });
            
            if (messageSent) {
                showStatus('Fetching data from Chrome extension...', 'info');
            } else {
                showStatus('Failed to send message to Figma. Please try again.', 'error');
            }
        });
    }
    
    // Show status message function
    function showStatus(message, type) {
        console.log('Showing status:', type, message);
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
            statusDiv.style.display = 'block';
            
            // Error messages stay longer
            if (type === 'error') {
                setTimeout(function() {
                    if (statusDiv.style.display === 'block') {
                        statusDiv.style.opacity = '0.7';
                    }
                }, 5000);
            }
        } else {
            console.error('Status div not found!');
        }
    }
    
    // Hide status message function
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
                // Hide success message after 3 seconds
                setTimeout(hideStatus, 3000);
            } else if (message.type === 'error') {
                showStatus(message.message, 'error');
                // Hide error message after 8 seconds
                setTimeout(hideStatus, 8000);
            } else if (message.type === 'init') {
                showStatus(message.message, 'info');
                // Hide initial message after 2 seconds
                setTimeout(hideStatus, 2000);
            } else if (message.type === 'info') {
                showStatus(message.message, 'info');
            }
        }
    };
    
    // Auto paste detection from clipboard
    if (imageDataTextarea) {
        imageDataTextarea.addEventListener('paste', function(e) {
            console.log('Paste event detected');
            // Wait a bit after paste then auto validate
            setTimeout(function() {
                var pastedData = imageDataTextarea.value.trim();
                if (pastedData) {
                    try {
                        var parsed = JSON.parse(pastedData);
                        console.log('Pasted data validation:', parsed);
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
        
        // Text area focus guidance message
        imageDataTextarea.addEventListener('focus', function() {
            if (!imageDataTextarea.value.trim()) {
                showStatus('Paste JSON data copied from Chrome extension here.', 'info');
            }
        });
        
        // Hide status message when text area loses focus
        imageDataTextarea.addEventListener('blur', function() {
            if (statusDiv && statusDiv.textContent.indexOf('Paste JSON data') !== -1) {
                hideStatus();
            }
        });
    }
    
    // Keyboard shortcuts support
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to import
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            console.log('Keyboard shortcut: Import');
            if (importBtn) {
                importBtn.click();
            }
        }
        
        // Ctrl/Cmd + K to clear text area
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            console.log('Keyboard shortcut: Clear');
            if (clearBtn) {
                clearBtn.click();
            }
        }
        
        // Ctrl/Cmd + R to reimport last data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            console.log('Keyboard shortcut: Reimport');
            if (reimportBtn) {
                reimportBtn.click();
            }
        }
    });
    
    // Test message sending on load
    setTimeout(function() {
        console.log('=== TESTING MESSAGE SENDING ===');
        sendMessageToFigma({
            type: 'init',
            message: 'UI loaded successfully'
        });
    }, 1000);
    
    console.log('=== UI SETUP COMPLETED ===');
});

// Fallback for immediate execution
console.log('=== UI SCRIPT LOADED (IMMEDIATE) ===');
