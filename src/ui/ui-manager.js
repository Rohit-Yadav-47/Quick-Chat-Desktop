// ui-manager.js - Centralized UI state management and interactions

const CONSTANTS = require('../utils/constants.js');
const formatter = require('../utils/formatter.js');

/**
 * UI Manager for handling all UI interactions and state
 */
class UIManager {
    constructor() {
        this.elements = {};
        this.state = {
            isWaitingForResponse: false,
            hasConversation: false,
            isSettingsOpen: false,
        };
    }

    /**
     * Initialize UI elements
     */
    initialize() {
        this.elements = {
            input: document.getElementById('raycast-input'),
            conversation: document.getElementById('raycast-conversation'),
            loader: document.querySelector('.raycast-loader'),
            results: document.getElementById('raycast-results'),
            container: document.getElementById('raycast-container'),
            modelSelect: document.getElementById('raycast-model-select'),
            sendBtn: document.getElementById('raycast-send-btn'),
            clearBtn: document.getElementById('raycast-clear-btn'),
            settingsBtn: document.getElementById('raycast-settings-btn'),
            shortcut: document.querySelector('.raycast-shortcut'),
        };

        // Validate all elements
        const missing = [];
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) missing.push(key);
        }

        if (missing.length > 0) {
            console.error('Missing UI elements:', missing);
            return false;
        }

        console.log('UI Manager initialized successfully');
        return true;
    }

    /**
     * Focus on input
     */
    focusInput() {
        if (this.elements.input) {
            this.elements.input.focus();
        }
    }

    /**
     * Get input value
     */
    getInputValue() {
        return this.elements.input?.value?.trim() || '';
    }

    /**
     * Set input value
     */
    setInputValue(value) {
        if (this.elements.input) {
            this.elements.input.value = value || '';
        }
    }

    /**
     * Clear input
     */
    clearInput() {
        this.setInputValue('');
        this.focusInput();
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        const hasInput = this.getInputValue().length > 0;
        const { hasConversation } = this.state;

        // Show/hide elements based on state
        if (hasInput || hasConversation) {
            // Expanded view
            this.show(this.elements.modelSelect);
            this.show(this.elements.sendBtn);
            this.show(this.elements.clearBtn, hasConversation);
            this.hide(this.elements.shortcut);
        } else {
            // Minimal view
            this.hide(this.elements.modelSelect);
            this.hide(this.elements.sendBtn);
            this.hide(this.elements.clearBtn);
            this.show(this.elements.shortcut);
        }
    }

    /**
     * Show element
     */
    show(element, condition = true) {
        if (element && condition) {
            element.style.display = element.classList.contains('raycast-model-select') ? 'block' : 'flex';
        }
    }

    /**
     * Hide element
     */
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.state.isWaitingForResponse = true;
        this.show(this.elements.loader);
        this.showTypingIndicator();
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.state.isWaitingForResponse = false;
        this.hide(this.elements.loader);
        this.removeTypingIndicator();
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.removeTypingIndicator(); // Remove any existing indicator

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
        this.elements.conversation.appendChild(typingContainer);

        this.scrollToBottom();
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Add message to conversation
     */
    addMessage(role, content, timestamp) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'raycast-message-container';

        const message = document.createElement('div');
        message.className = `raycast-message ${role === 'user' ? 'raycast-user-message' : 'raycast-ai-message'}`;

        // Format the content
        const formattedContent = formatter.format(content);
        message.innerHTML = formattedContent;

        // Add timestamp if needed (optional, can be uncommented)
        // const timeEl = document.createElement('div');
        // timeEl.className = 'raycast-message-time';
        // timeEl.textContent = formatter.formatTimestamp(timestamp);
        // messageContainer.appendChild(timeEl);

        messageContainer.appendChild(message);
        this.elements.conversation.appendChild(messageContainer);

        this.state.hasConversation = true;
        this.show(this.elements.results);
        this.updateUI();
        this.scrollToBottom();
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.elements.conversation) {
            this.elements.conversation.innerHTML = '';
        }
        this.state.hasConversation = false;
        this.hide(this.elements.results);
        this.updateUI();
    }

    /**
     * Scroll to bottom of conversation
     */
    scrollToBottom() {
        setTimeout(() => {
            if (this.elements.conversation) {
                this.elements.conversation.scrollTop = this.elements.conversation.scrollHeight;
            }
        }, CONSTANTS.UI.AUTO_SCROLL_DELAY);
    }

    /**
     * Show notification/toast message
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `raycast-notification raycast-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#4CAF50' : '#666'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, CONSTANTS.UI.NOTIFICATION_DURATION);
    }

    /**
     * Show error message
     */
    showError(error) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        this.showNotification(errorMessage, 'error');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Get current model selection
     */
    getSelectedModel() {
        return this.elements.modelSelect?.value || CONSTANTS.DEFAULT_SETTINGS.model;
    }

    /**
     * Set model selection
     */
    setSelectedModel(model) {
        if (this.elements.modelSelect) {
            this.elements.modelSelect.value = model;
        }
    }

    /**
     * Restore conversation from saved data
     */
    restoreConversation(messages) {
        this.clearMessages();

        if (!messages || messages.length === 0) {
            return;
        }

        messages.forEach(msg => {
            this.addMessage(msg.role, msg.content, msg.timestamp);
        });

        this.state.hasConversation = true;
        this.show(this.elements.results);
        this.updateUI();
    }

    /**
     * Close window with animation
     */
    closeWindow() {
        this.elements.container.classList.add('closing');

        setTimeout(() => {
            if (window.electron?.hideWindow) {
                window.electron.hideWindow();
            } else {
                window.close();
            }
            this.elements.container.classList.remove('closing');
        }, CONSTANTS.UI.ANIMATION_DURATION);
    }

    /**
     * Check if currently waiting for response
     */
    isWaiting() {
        return this.state.isWaitingForResponse;
    }
}

// Export singleton instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new UIManager();
}
