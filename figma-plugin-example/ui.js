// Figma plugin UI JavaScript
document.addEventListener('DOMContentLoaded', function() {
    var imageDataTextarea = document.getElementById('imageData');
    var importBtn = document.getElementById('importBtn');
    var clearBtn = document.getElementById('clearBtn');
    var reimportBtn = document.getElementById('reimportBtn');
    var fetchBtn = document.getElementById('fetchBtn');
    var reimportBtn2 = document.getElementById('reimportBtn2');
    var statusDiv = document.getElementById('status');
    
    // Tab switching functionality
    var methodTabs = document.querySelectorAll('.method-tab');
    var methodContents = document.querySelectorAll('.method-content');
    
    for (var i = 0; i < methodTabs.length; i++) {
        methodTabs[i].addEventListener('click', function() {
            var method = this.getAttribute('data-method');
            
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
    
    // Image import button click event
    importBtn.addEventListener('click', function() {
        var jsonData = imageDataTextarea.value.trim();
        
        if (!jsonData) {
            showStatus('Please enter image data.', 'error');
            return;
        }
        
        try {
            var imageData = JSON.parse(jsonData);
            
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
            parent.postMessage({
                pluginMessage: {
                    type: 'import-image-reference',
                    data: imageData
                }
            }, '*');
            
            showStatus('Importing image...', 'info');
            
        } catch (error) {
            console.error('JSON parsing error:', error);
            showStatus('Invalid JSON format. Please copy again from Chrome extension.', 'error');
        }
    });
    
    // Clear button click event
    clearBtn.addEventListener('click', function() {
        imageDataTextarea.value = '';
        hideStatus();
    });
    
    // Reimport last data buttons
    reimportBtn.addEventListener('click', function() {
        parent.postMessage({
            pluginMessage: {
                type: 'reimport-last'
            }
        }, '*');
        showStatus('Reimporting last data...', 'info');
    });
    
    reimportBtn2.addEventListener('click', function() {
        parent.postMessage({
            pluginMessage: {
                type: 'reimport-last'
            }
        }, '*');
        showStatus('Reimporting last data...', 'info');
    });
    
    // Auto fetch from Chrome extension
    fetchBtn.addEventListener('click', function() {
        parent.postMessage({
            pluginMessage: {
                type: 'fetch-from-extension'
            }
        }, '*');
        showStatus('Fetching data from Chrome extension...', 'info');
    });
    
    // Show status message function
    function showStatus(message, type) {
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
    }
    
    // Hide status message function
    function hideStatus() {
        statusDiv.style.display = 'none';
        statusDiv.style.opacity = '1';
    }
    
    // Receive messages from Figma
    window.onmessage = function(event) {
        var message = event.data.pluginMessage;
        
        if (message) {
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
            }
        }
    };
    
    // Auto paste detection from clipboard
    imageDataTextarea.addEventListener('paste', function(e) {
        // Wait a bit after paste then auto validate
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
        if (statusDiv.textContent.indexOf('Paste JSON data') !== -1) {
            hideStatus();
        }
    });
    
    // Keyboard shortcuts support
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to import
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            importBtn.click();
        }
        
        // Ctrl/Cmd + K to clear text area
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearBtn.click();
        }
        
        // Ctrl/Cmd + R to reimport last data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            reimportBtn.click();
        }
    });
});
