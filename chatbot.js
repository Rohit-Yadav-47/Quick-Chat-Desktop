// chatbot.js - Enhanced Raycast-style AI Chatbot with Gemini API

const { GoogleGenAI } = require('@google/genai');

const conversations = [];
let isWaitingForResponse = false;
let geminiAI = null;
let settings = {
    apiKey: '',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 2048
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - JavaScript is running');
    const input = document.getElementById('raycast-input');
    const conversation = document.getElementById('raycast-conversation');
    const loader = document.querySelector('.raycast-loader');
    const results = document.getElementById('raycast-results');
    const container = document.getElementById('raycast-container');
    const modelSelect = document.getElementById('raycast-model-select');
    const sendBtn = document.getElementById('raycast-send-btn');
    const clearBtn = document.getElementById('raycast-clear-btn');
    const settingsBtn = document.getElementById('raycast-settings-btn');

    console.log('All elements found:', {
        input: !!input,
        settingsBtn: !!settingsBtn,
        sendBtn: !!sendBtn,
        clearBtn: !!clearBtn
    });

    // Load settings from localStorage
    loadSettings();
    
    // Initialize Gemini AI if API key exists
    if (settings.apiKey) {
        initializeGeminiAI();
    }

    // Focus on input when the window loads
    input.focus();

    // SETTINGS FUNCTIONALITY - COMPLETELY NEW IMPLEMENTATION
    if (settingsBtn) {
        // Remove any existing event listeners by cloning the node
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
        
        // Add fresh click event
        newSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('SETTINGS CLICKED - NEW HANDLER');
            openSettingsPanel();
        });
        
        console.log('Settings button click handler added successfully');
    } else {
        console.error('Settings button not found!');
    }

    // Simple settings panel function
    function openSettingsPanel() {
        console.log('Opening settings panel...');
        
        // Remove existing panel if any
        const existingPanel = document.getElementById('settings-modal');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create settings panel
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: #1c1c1e;
            border-radius: 12px;
            padding: 24px;
            width: 400px;
            max-width: 90vw;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: white; margin: 0; font-size: 18px;">⚙️ Settings</h2>
                <button id="close-settings" style="background: none; border: none; color: #999; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px;">Gemini API Key</label>
                <input type="password" id="api-key-input" placeholder="Enter your API key" 
                       value="${settings.apiKey}" 
                       style="width: 100%; padding: 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
                <small style="color: #999; font-size: 12px; display: block; margin-top: 4px;">
                    Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: #FF6363;">Google AI Studio</a>
                </small>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px;">Model</label>
                <select id="model-select" style="width: 100%; padding: 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
                    <option value="gemini-2.0-flash" ${settings.model === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro" ${settings.model === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash" ${settings.model === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash</option>
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <button id="save-settings" style="width: 100%; padding: 12px; background: #FF6363; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; font-weight: 500;">
                    Save Settings
                </button>
            </div>

            <div id="settings-message" style="display: none; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; margin-top: 12px;"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        // Add event handlers
        document.getElementById('close-settings').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            const apiKey = document.getElementById('api-key-input').value.trim();
            const model = document.getElementById('model-select').value;
            
            if (!apiKey) {
                showMessage('Please enter your API key', true);
                return;
            }

            settings.apiKey = apiKey;
            settings.model = model;
            saveSettings();
            initializeGeminiAI();
            
            showMessage('Settings saved successfully!', false);
            setTimeout(() => modal.remove(), 1500);
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Focus API key input
        setTimeout(() => {
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput && !apiKeyInput.value) {
                apiKeyInput.focus();
            }
        }, 100);

        function showMessage(text, isError) {
            const msgDiv = document.getElementById('settings-message');
            msgDiv.textContent = text;
            msgDiv.style.display = 'block';
            msgDiv.style.background = isError ? '#ff4444' : '#4CAF50';
            msgDiv.style.color = 'white';
        }
    }

    // Process input when Enter is pressed
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const message = input.value.trim();
            if (message && !isWaitingForResponse) {
                handleUserMessage(message);
                input.value = '';
            }
            e.preventDefault();
        }
    });

    // Send button click handler
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            const message = input.value.trim();
            if (message && !isWaitingForResponse) {
                handleUserMessage(message);
                input.value = '';
            }
        });
    }

    // Model selector change handler
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            settings.model = modelSelect.value;
            saveSettings();
            if (settings.apiKey) {
                initializeGeminiAI();
            }
        });
    }

    // Update UI when user types
    input.addEventListener('input', function() {
        updateSearchBarUI();
    });

    // Clear button click handler
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearConversation();
        });
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to close window
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            
            // Close settings panel if it's open
            const settingsPanel = document.getElementById('settings-modal');
            if (settingsPanel) {
                settingsPanel.remove();
                return;
            }
            
            // Add closing animation class
            container.classList.add('closing');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                resetWindowSize();
                if (window.electron?.hideWindow) {
                    window.electron.hideWindow();
                } else {
                    window.close();
                }
                container.classList.remove('closing');
            }, 200);
        }
        
        // Ctrl+, to open settings
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Ctrl+, pressed - opening settings');
            openSettingsPanel();
        }
        
        // Ctrl+L to clear conversation
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            e.stopPropagation();
            clearConversation();
        }
    }, true);

    // Show or hide UI elements based on state
    function updateSearchBarUI() {
        const hasInput = input.value.trim().length > 0;
        const hasConversation = conversations.length > 0;

        if (hasInput || hasConversation) {
            // Expanded view
            if (modelSelect) modelSelect.style.display = 'block';
            if (sendBtn) sendBtn.style.display = 'flex';
            if (clearBtn) clearBtn.style.display = hasConversation ? 'flex' : 'none';
            const shortcut = document.querySelector('.raycast-shortcut');
            if (shortcut) shortcut.style.display = 'none';
        } else {
            // Minimal view
            if (modelSelect) modelSelect.style.display = 'none';
            if (sendBtn) sendBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            const shortcut = document.querySelector('.raycast-shortcut');
            if (shortcut) shortcut.style.display = 'flex';
        }
    }

    // Load settings from localStorage
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('raycast-chatbot-settings');
            if (savedSettings) {
                settings = { ...settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            localStorage.setItem('raycast-chatbot-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    // Initialize Gemini AI
    function initializeGeminiAI() {
        if (!settings.apiKey) {
            return;
        }

        try {
            geminiAI = new GoogleGenAI({ apiKey: settings.apiKey });
            console.log('Gemini AI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
            geminiAI = null;
        }
    }

    // Handle user message
    async function handleUserMessage(message) {
        if (!settings.apiKey) {
            openSettingsPanel();
            return;
        }

        // Add user message to conversation
        addMessageToConversation('user', message);

        // Show loading indicator
        isWaitingForResponse = true;
        if (loader) loader.style.display = 'block';
        
        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await getGeminiResponse(message);
            removeTypingIndicator();
            addMessageToConversation('ai', response);
        } catch (error) {
            removeTypingIndicator();
            console.error('Error getting AI response:', error);
            addMessageToConversation('ai', `Sorry, I encountered an error: ${error.message}`);
        } finally {
            if (loader) loader.style.display = 'none';
            isWaitingForResponse = false;
        }
    }

    // Get response from Gemini AI
    async function getGeminiResponse(message) {
        if (!geminiAI) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        const response = await geminiAI.models.generateContent({
            model: settings.model,
            contents: [{
                role: 'user',
                parts: [{ text: message }]
            }],
            generationConfig: {
                temperature: settings.temperature,
                maxOutputTokens: settings.maxTokens,
            }
        });

        return response.text || 'I apologize, but I couldn\'t generate a response. Please try again.';
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingContainer = document.createElement('div');
        typingContainer.className = 'raycast-message-container';
        typingContainer.id = 'typing-indicator';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'raycast-message raycast-ai-message raycast-typing';
        typingIndicator.innerHTML = `
            <span class="raycast-typing-dot"></span>
            <span class="raycast-typing-dot"></span>
            <span class="raycast-typing-dot"></span>
        `;

        typingContainer.appendChild(typingIndicator);
        conversation.appendChild(typingContainer);
        
        // Scroll to the typing indicator
        conversation.scrollTop = conversation.scrollHeight;
        
        // Adjust window size to accommodate typing indicator
        adjustWindowSize();
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Add a message to the conversation display
    function addMessageToConversation(role, content) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'raycast-message-container';

        const message = document.createElement('div');
        message.className = `raycast-message ${role === 'user' ? 'raycast-user-message' : 'raycast-ai-message'}`;
        
        // Format message content
        let formattedContent = formatMessage(content);
        message.innerHTML = formattedContent;

        messageContainer.appendChild(message);
        conversation.appendChild(messageContainer);

        // Store in conversations array
        conversations.push({
            role: role,
            content: content,
            timestamp: new Date()
        });
        
        // Update UI
        updateSearchBarUI();
        if (results) results.style.display = 'block';
        
        // Adjust window size
        adjustWindowSize();
        
        // Scroll to bottom
        setTimeout(() => {
            conversation.scrollTop = conversation.scrollHeight;
        }, 50);
    }

    // Format message with markdown-like syntax
    function formatMessage(text) {
        // Handle code blocks with backticks
        text = text.replace(/```([^`]*?)```/g, function(match, code) {
            return `<div class="raycast-code">
                <div class="raycast-code-header">
                    <span>Code</span>
                    <button class="raycast-copy-btn" onclick="copyToClipboard(this)">Copy</button>
                </div>
                <pre>${escapeHtml(code)}</pre>
            </div>`;
        });

        // Handle inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold text with asterisks
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Simple line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    // Escape HTML to prevent injection
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Copy code to clipboard
    window.copyToClipboard = function(button) {
        const codeBlock = button.closest('.raycast-code');
        const codeText = codeBlock.querySelector('pre').textContent;
        
        navigator.clipboard.writeText(codeText).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 2000);
        });
    };

    // Reset window size
    function resetWindowSize() {
        const fixedHeight = 400;
        if (window.electron?.resizeWindow) {
            window.electron.resizeWindow(fixedHeight);
        }
        container.style.height = fixedHeight + 'px';
        
        if (conversations.length === 0) {
            if (results) results.style.display = 'none';
        } else {
            if (results) results.style.display = 'block';
        }
    }

    // Adjust window size based on content
    function adjustWindowSize() {
        if (conversations.length > 0) {
            if (results) results.style.display = 'block';
            
            const contentHeight = Math.min(600, Math.max(300, conversation.scrollHeight + 100));
            if (window.electron?.resizeWindow) {
                window.electron.resizeWindow(contentHeight);
            }
            
            // Auto-scroll to the bottom of the conversation
            conversation.scrollTop = conversation.scrollHeight;
        } else {
            resetWindowSize();
        }
    }

    // Clear conversation function
    function clearConversation() {
        conversations.length = 0;
        conversation.innerHTML = '';
        if (results) results.style.display = 'none';
        input.value = '';
        updateSearchBarUI();
        resetWindowSize();
        input.focus();
    }

    // Initialize
    resetWindowSize();
    updateSearchBarUI();
    input.focus();

    console.log('Chatbot initialized successfully');
});
