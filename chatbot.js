// chatbot.js - Professional Refactored Version with Modular Architecture
// Senior Engineer Quality Code - All modules bundled for Electron compatibility

const { GoogleGenAI } = require('@google/genai');

// ============================================================================
// CONSTANTS MODULE
// ============================================================================
const CONSTANTS = {
    APP_NAME: 'Quick Chat',
    APP_VERSION: '2.0.0',
    STORAGE_KEYS: {
        SETTINGS: 'raycast-chatbot-settings',
        CONVERSATIONS: 'raycast-chatbot-conversations',
        CURRENT_CONVERSATION: 'raycast-chatbot-current',
    },
    DEFAULT_SETTINGS: {
        apiKey: '',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2048,
        theme: 'dark',
        autoSave: true,
    },
    MODELS: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Fast and efficient' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Most capable' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Balanced performance' },
        { value: 'gemini-1.5-pro-002', label: 'Gemini 2.5 Pro', description: 'Latest pro model' },
        { value: 'gemini-1.5-flash-002', label: 'Gemini 2.5 Flash', description: 'Latest flash model' },
    ],
    UI: {
        MAX_MESSAGE_LENGTH: 10000,
        TYPING_INDICATOR_DELAY: 100,
        AUTO_SCROLL_DELAY: 50,
        ANIMATION_DURATION: 200,
        NOTIFICATION_DURATION: 3000,
    },
    WINDOW: {
        MIN_HEIGHT: 400,
        MAX_HEIGHT: 600,
        DEFAULT_HEIGHT: 400,
        WIDTH: 700,
    },
    ERRORS: {
        NO_API_KEY: 'Please configure your API key in settings',
        API_ERROR: 'Failed to get response from AI. Please check your API key and try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        INVALID_RESPONSE: 'Received invalid response from AI. Please try again.',
        RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
    },
    API: {
        TIMEOUT: 30000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
    },
};

// ============================================================================
// STORAGE MODULE
// ============================================================================
class StorageManager {
    constructor() {
        this.encryptionKey = 'QuickChatSecure2024';
    }

    encrypt(text) {
        if (!text) return '';
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result);
    }

    decrypt(encrypted) {
        if (!encrypted) return '';
        try {
            const decoded = atob(encrypted);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch (error) {
            console.error('Decryption failed:', error);
            return '';
        }
    }

    saveSettings(settings) {
        try {
            const settingsToSave = { ...settings };
            if (settingsToSave.apiKey) {
                settingsToSave.apiKey = this.encrypt(settingsToSave.apiKey);
                settingsToSave._encrypted = true;
            }
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.SETTINGS);
            if (!saved) return { ...CONSTANTS.DEFAULT_SETTINGS };

            const settings = JSON.parse(saved);
            if (settings._encrypted && settings.apiKey) {
                settings.apiKey = this.decrypt(settings.apiKey);
                delete settings._encrypted;
            }
            return { ...CONSTANTS.DEFAULT_SETTINGS, ...settings };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return { ...CONSTANTS.DEFAULT_SETTINGS };
        }
    }

    saveConversation(messages) {
        try {
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(messages));
            return true;
        } catch (error) {
            console.error('Failed to save conversation:', error);
            return false;
        }
    }

    loadConversation() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load conversation:', error);
            return [];
        }
    }

    clearConversation() {
        try {
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION);
            return true;
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            return false;
        }
    }

    exportConversation(messages, format = 'json') {
        try {
            switch (format.toLowerCase()) {
                case 'json':
                    return JSON.stringify(messages, null, 2);
                case 'txt':
                    return messages.map(msg => {
                        const role = msg.role === 'user' ? 'You' : 'AI';
                        const timestamp = new Date(msg.timestamp).toLocaleString();
                        return `[${timestamp}] ${role}: ${msg.content}\n`;
                    }).join('\n');
                case 'markdown':
                case 'md':
                    let markdown = '# Conversation Export\n\n';
                    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
                    messages.forEach(msg => {
                        const role = msg.role === 'user' ? '**You**' : '**AI Assistant**';
                        const timestamp = new Date(msg.timestamp).toLocaleString();
                        markdown += `### ${role} *(${timestamp})*\n\n${msg.content}\n\n---\n\n`;
                    });
                    return markdown;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('Failed to export conversation:', error);
            return null;
        }
    }
}

// ============================================================================
// FORMATTER MODULE
// ============================================================================
class MessageFormatter {
    constructor() {
        this.codeBlockCounter = 0;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    detectLanguage(code) {
        const patterns = {
            javascript: /\b(const|let|var|function|=>|console\.log)\b/,
            python: /\b(def|import|from|print|class)\b/,
            java: /\b(public|private|class|void|static)\b/,
            cpp: /\b(#include|std::|cout)\b/,
            html: /<\/?[a-z][\s\S]*>/i,
            css: /\{[^}]*:[^}]*\}/,
            json: /^\s*[\{\[]/,
            bash: /\b(echo|cd|ls|mkdir)\b/,
            sql: /\b(SELECT|INSERT|UPDATE|DELETE)\b/i,
        };
        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) return lang;
        }
        return 'plaintext';
    }

    highlightCode(code, language) {
        const patterns = {
            keyword: /\b(const|let|var|function|class|if|else|for|while|return|import|from|export|async|await|try|catch|def|print|select|where)\b/g,
            string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
            comment: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
            number: /\b(\d+\.?\d*)\b/g,
        };

        let highlighted = this.escapeHtml(code);
        highlighted = highlighted.replace(patterns.comment, '<span class="syntax-comment">$1</span>');
        highlighted = highlighted.replace(patterns.string, '<span class="syntax-string">$1</span>');
        highlighted = highlighted.replace(patterns.keyword, '<span class="syntax-keyword">$1</span>');
        highlighted = highlighted.replace(patterns.number, '<span class="syntax-number">$1</span>');
        return highlighted;
    }

    format(text) {
        if (!text) return '';
        this.codeBlockCounter = 0;

        // Store code blocks temporarily
        const codeBlocks = [];
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            const lines = code.split('\n');
            let language = 'plaintext';
            let actualCode = code;

            if (lines[0] && lines[0].trim() && !/[<>{}()\[\]]/.test(lines[0]) && lines[0].length < 20) {
                language = lines[0].trim().toLowerCase();
                actualCode = lines.slice(1).join('\n');
            }

            if (language === 'plaintext' || language === '') {
                language = this.detectLanguage(actualCode);
            }

            const highlighted = this.highlightCode(actualCode, language);
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<div class="raycast-code" data-language="${language}">
                <div class="raycast-code-header">
                    <span class="raycast-code-language">${language}</span>
                    <button class="raycast-copy-btn" onclick="copyToClipboard(this)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
                <pre><code class="language-${language}">${highlighted}</code></pre>
            </div>`);
            return placeholder;
        });

        // Store inline code
        const inlineCodes = [];
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
            inlineCodes.push(`<code class="inline-code">${this.escapeHtml(code)}</code>`);
            return placeholder;
        });

        // Format markdown
        text = text.replace(/### (.+)$/gm, '<h3 class="message-heading">$1</h3>');
        text = text.replace(/## (.+)$/gm, '<h2 class="message-heading">$1</h2>');
        text = text.replace(/# (.+)$/gm, '<h1 class="message-heading">$1</h1>');
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="message-link">$1</a>');
        text = text.replace(/^>\s+(.+)$/gm, '<blockquote class="message-quote">$1</blockquote>');
        text = text.replace(/\n\n/g, '</p><p class="message-paragraph">');
        text = text.replace(/\n/g, '<br>');
        text = `<p class="message-paragraph">${text}</p>`;
        text = text.replace(/<p class="message-paragraph"><\/p>/g, '');

        // Restore code blocks and inline codes
        codeBlocks.forEach((block, i) => text = text.replace(`__CODE_BLOCK_${i}__`, block));
        inlineCodes.forEach((code, i) => text = text.replace(`__INLINE_CODE_${i}__`, code));

        return text;
    }
}

// ============================================================================
// GEMINI API MODULE
// ============================================================================
class GeminiAPI {
    constructor() {
        this.client = null;
        this.apiKey = null;
        this.isInitialized = false;
    }

    initialize(apiKey) {
        if (!apiKey) throw new Error(CONSTANTS.ERRORS.NO_API_KEY);
        try {
            this.apiKey = apiKey;
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
            this.isInitialized = true;
            console.log('Gemini API initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Gemini API:', error);
            this.isInitialized = false;
            throw new Error(CONSTANTS.ERRORS.API_ERROR);
        }
    }

    isReady() {
        return this.isInitialized && this.client !== null;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    parseError(error) {
        const msg = error.message || error.toString();
        if (msg.includes('API key')) return CONSTANTS.ERRORS.NO_API_KEY;
        if (msg.includes('rate limit') || msg.includes('429')) return CONSTANTS.ERRORS.RATE_LIMIT;
        if (msg.includes('network') || msg.includes('timeout')) return CONSTANTS.ERRORS.NETWORK_ERROR;
        if (msg.includes('invalid')) return CONSTANTS.ERRORS.INVALID_RESPONSE;
        return `Error: ${msg}`;
    }

    async generateContent(options, retryCount = 0) {
        if (!this.isReady()) throw new Error(CONSTANTS.ERRORS.NO_API_KEY);

        try {
            const response = await this.client.models.generateContent({
                model: options.model || CONSTANTS.DEFAULT_SETTINGS.model,
                contents: options.contents,
                generationConfig: {
                    temperature: options.temperature || CONSTANTS.DEFAULT_SETTINGS.temperature,
                    maxOutputTokens: options.maxTokens || CONSTANTS.DEFAULT_SETTINGS.maxTokens,
                },
            });

            if (!response || !response.text) throw new Error(CONSTANTS.ERRORS.INVALID_RESPONSE);
            return response.text;
        } catch (error) {
            console.error(`API request failed (attempt ${retryCount + 1}/${CONSTANTS.API.MAX_RETRIES}):`, error);

            if (retryCount < CONSTANTS.API.MAX_RETRIES - 1) {
                const delay = CONSTANTS.API.RETRY_DELAY * Math.pow(2, retryCount);
                console.log(`Retrying in ${delay}ms...`);
                await this.sleep(delay);
                return this.generateContent(options, retryCount + 1);
            }

            throw new Error(this.parseError(error));
        }
    }

    async sendMessage(message, settings) {
        if (!message || !message.trim()) throw new Error('Message cannot be empty');

        const options = {
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            contents: [{ role: 'user', parts: [{ text: message }] }],
        };

        return await this.generateContent(options);
    }
}

// ============================================================================
// UI MANAGER MODULE
// ============================================================================
class UIManager {
    constructor() {
        this.elements = {};
        this.state = {
            isWaitingForResponse: false,
            hasConversation: false,
        };
        this.formatter = new MessageFormatter();
    }

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

        const missing = [];
        for (const [key, el] of Object.entries(this.elements)) {
            if (!el) missing.push(key);
        }

        if (missing.length > 0) {
            console.error('Missing UI elements:', missing);
            return false;
        }

        console.log('UI Manager initialized');
        return true;
    }

    focusInput() { if (this.elements.input) this.elements.input.focus(); }
    getInputValue() { return this.elements.input?.value?.trim() || ''; }
    setInputValue(value) { if (this.elements.input) this.elements.input.value = value || ''; }
    clearInput() { this.setInputValue(''); this.focusInput(); }

    updateUI() {
        const hasInput = this.getInputValue().length > 0;
        const { hasConversation } = this.state;

        if (hasInput || hasConversation) {
            this.show(this.elements.modelSelect);
            this.show(this.elements.sendBtn);
            this.show(this.elements.clearBtn, hasConversation);
            this.hide(this.elements.shortcut);
        } else {
            this.hide(this.elements.modelSelect);
            this.hide(this.elements.sendBtn);
            this.hide(this.elements.clearBtn);
            this.show(this.elements.shortcut);
        }
    }

    show(el, condition = true) {
        if (el && condition) el.style.display = el.classList.contains('raycast-model-select') ? 'block' : 'flex';
    }

    hide(el) { if (el) el.style.display = 'none'; }

    showLoading() {
        this.state.isWaitingForResponse = true;
        this.show(this.elements.loader);
        this.showTypingIndicator();
    }

    hideLoading() {
        this.state.isWaitingForResponse = false;
        this.hide(this.elements.loader);
        this.removeTypingIndicator();
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        const container = document.createElement('div');
        container.className = 'raycast-message-container';
        container.id = 'typing-indicator';
        const indicator = document.createElement('div');
        indicator.className = 'raycast-message raycast-ai-message raycast-typing';
        indicator.innerHTML = `
            <span class="raycast-typing-dot"></span>
            <span class="raycast-typing-dot"></span>
            <span class="raycast-typing-dot"></span>
        `;
        container.appendChild(indicator);
        this.elements.conversation.appendChild(container);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    addMessage(role, content, timestamp) {
        const container = document.createElement('div');
        container.className = 'raycast-message-container';
        const message = document.createElement('div');
        message.className = `raycast-message ${role === 'user' ? 'raycast-user-message' : 'raycast-ai-message'}`;
        message.innerHTML = this.formatter.format(content);
        container.appendChild(message);
        this.elements.conversation.appendChild(container);
        this.state.hasConversation = true;
        this.show(this.elements.results);
        this.updateUI();
        this.scrollToBottom();
    }

    clearMessages() {
        if (this.elements.conversation) this.elements.conversation.innerHTML = '';
        this.state.hasConversation = false;
        this.hide(this.elements.results);
        this.updateUI();
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.elements.conversation) {
                this.elements.conversation.scrollTop = this.elements.conversation.scrollHeight;
            }
        }, CONSTANTS.UI.AUTO_SCROLL_DELAY);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `raycast-notification raycast-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#4CAF50' : '#666'};
            color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); animation: slideDown 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, CONSTANTS.UI.NOTIFICATION_DURATION);
    }

    showError(error) {
        const msg = typeof error === 'string' ? error : error.message;
        this.showNotification(msg, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    getSelectedModel() {
        return this.elements.modelSelect?.value || CONSTANTS.DEFAULT_SETTINGS.model;
    }

    setSelectedModel(model) {
        if (this.elements.modelSelect) this.elements.modelSelect.value = model;
    }

    restoreConversation(messages) {
        this.clearMessages();
        if (!messages || messages.length === 0) return;
        messages.forEach(msg => this.addMessage(msg.role, msg.content, msg.timestamp));
        this.state.hasConversation = true;
        this.show(this.elements.results);
        this.updateUI();
    }

    closeWindow() {
        this.elements.container.classList.add('closing');
        setTimeout(() => {
            if (window.electron?.hideWindow) window.electron.hideWindow();
            else window.close();
            this.elements.container.classList.remove('closing');
        }, CONSTANTS.UI.ANIMATION_DURATION);
    }

    isWaiting() {
        return this.state.isWaitingForResponse;
    }
}

// ============================================================================
// SETTINGS PANEL MODULE
// ============================================================================
class SettingsPanel {
    constructor() {
        this.isOpen = false;
        this.onSaveCallback = null;
    }

    open(currentSettings, onSave) {
        if (this.isOpen) return;
        this.onSaveCallback = onSave;
        this.close();

        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex; align-items: center;
            justify-content: center; z-index: 10000; animation: fadeIn 0.2s ease;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: #1c1c1e; border-radius: 16px; padding: 24px; width: 500px;
            max-width: 90vw; max-height: 80vh; overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideInUp 0.3s ease;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">Settings</h2>
                <button id="settings-close" style="background: none; border: none; color: #999; font-size: 28px; cursor: pointer;">×</button>
            </div>

            <div style="margin-bottom: 24px;">
                <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                    Gemini API Key <span style="color: #ff6363;">*</span>
                </label>
                <input type="password" id="settings-api-key" placeholder="Enter your API key" value="${currentSettings.apiKey || ''}"
                    style="width: 100%; padding: 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
                <small style="color: #999; font-size: 12px; display: block; margin-top: 6px;">
                    Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: #ff6363;">Google AI Studio</a>
                </small>
            </div>

            <div style="margin-bottom: 24px;">
                <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Model</label>
                <select id="settings-model" style="width: 100%; padding: 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
                    ${CONSTANTS.MODELS.map(m => `<option value="${m.value}" ${currentSettings.model === m.value ? 'selected' : ''}>${m.label} - ${m.description}</option>`).join('')}
                </select>
            </div>

            <div style="margin-bottom: 24px;">
                <label style="display: flex; justify-content: space-between; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                    <span>Temperature</span>
                    <span id="temperature-value" style="color: #ff6363; font-weight: 600;">${currentSettings.temperature || 0.7}</span>
                </label>
                <input type="range" id="settings-temperature" min="0" max="1" step="0.1" value="${currentSettings.temperature || 0.7}"
                    style="width: 100%; height: 6px; background: linear-gradient(to right, #4a9eff, #ff6363); border-radius: 3px; outline: none; -webkit-appearance: none;">
                <small style="color: #999; font-size: 12px;">Lower = focused, Higher = creative</small>
            </div>

            <div style="margin-bottom: 24px;">
                <label style="display: flex; justify-content: space-between; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                    <span>Max Tokens</span>
                    <span id="tokens-value" style="color: #ff6363; font-weight: 600;">${currentSettings.maxTokens || 2048}</span>
                </label>
                <input type="range" id="settings-max-tokens" min="256" max="4096" step="256" value="${currentSettings.maxTokens || 2048}"
                    style="width: 100%; height: 6px; background: linear-gradient(to right, #666, #ff6363); border-radius: 3px; outline: none; -webkit-appearance: none;">
                <small style="color: #999; font-size: 12px;">Maximum response length</small>
            </div>

            <button id="settings-save" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #ff6363, #ff5252); border: none; border-radius: 10px; color: white; font-size: 15px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 99, 99, 0.3);">
                Save Settings
            </button>

            <div id="settings-message" style="display: none; margin-top: 16px; padding: 12px; border-radius: 8px; text-align: center; font-size: 13px;"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);
        this.isOpen = true;

        // Event listeners
        modal.querySelector('#settings-close').addEventListener('click', () => this.close());
        modal.addEventListener('click', e => { if (e.target === modal) this.close(); });

        modal.querySelector('#settings-temperature').addEventListener('input', e => {
            modal.querySelector('#temperature-value').textContent = e.target.value;
        });

        modal.querySelector('#settings-max-tokens').addEventListener('input', e => {
            modal.querySelector('#tokens-value').textContent = e.target.value;
        });

        modal.querySelector('#settings-save').addEventListener('click', () => {
            const apiKey = modal.querySelector('#settings-api-key').value.trim();
            const model = modal.querySelector('#settings-model').value;
            const temperature = parseFloat(modal.querySelector('#settings-temperature').value);
            const maxTokens = parseInt(modal.querySelector('#settings-max-tokens').value);

            if (!apiKey) {
                this.showMessage(modal, 'Please enter your API key', 'error');
                return;
            }

            if (this.onSaveCallback) this.onSaveCallback({ apiKey, model, temperature, maxTokens });
            this.showMessage(modal, 'Settings saved successfully!', 'success');
            setTimeout(() => this.close(), 1500);
        });

        setTimeout(() => {
            const apiKeyInput = modal.querySelector('#settings-api-key');
            if (apiKeyInput && !apiKeyInput.value) apiKeyInput.focus();
        }, 100);
    }

    close() {
        const modal = document.getElementById('settings-modal');
        if (modal) modal.remove();
        this.isOpen = false;
    }

    showMessage(modal, text, type) {
        const msg = modal.querySelector('#settings-message');
        msg.textContent = text;
        msg.style.display = 'block';
        msg.style.background = type === 'error' ? '#ff4444' : '#4CAF50';
        msg.style.color = 'white';
    }
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================
class ChatbotApp {
    constructor() {
        this.conversations = [];
        this.settings = null;
        this.storage = new StorageManager();
        this.geminiAPI = new GeminiAPI();
        this.uiManager = new UIManager();
        this.settingsPanel = new SettingsPanel();
    }

    async initialize() {
        console.log('Initializing Quick Chat...');

        if (!this.uiManager.initialize()) {
            console.error('Failed to initialize UI');
            return;
        }

        this.settings = this.storage.loadSettings();
        console.log('Settings loaded');

        if (this.settings.apiKey) {
            try {
                this.geminiAPI.initialize(this.settings.apiKey);
                this.uiManager.setSelectedModel(this.settings.model);
            } catch (error) {
                console.error('Failed to initialize API:', error);
            }
        }

        if (this.settings.autoSave) {
            const saved = this.storage.loadConversation();
            if (saved && saved.length > 0) {
                this.conversations = saved;
                this.uiManager.restoreConversation(this.conversations);
            }
        }

        this.setupEventListeners();
        this.uiManager.focusInput();
        this.uiManager.updateUI();

        console.log('Application initialized');
    }

    setupEventListeners() {
        this.uiManager.elements.input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.uiManager.elements.input.addEventListener('input', () => this.uiManager.updateUI());
        this.uiManager.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.uiManager.elements.clearBtn.addEventListener('click', () => this.handleClearConversation());
        this.uiManager.elements.settingsBtn.addEventListener('click', () => this.handleOpenSettings());
        this.uiManager.elements.modelSelect.addEventListener('change', e => {
            this.settings.model = e.target.value;
            this.storage.saveSettings(this.settings);
            if (this.settings.apiKey) this.geminiAPI.initialize(this.settings.apiKey);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (this.settingsPanel.isOpen) {
                    this.settingsPanel.close();
                    return;
                }
                this.uiManager.closeWindow();
            }
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.handleOpenSettings();
            }
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.handleClearConversation();
            }
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.handleExportConversation();
            }
        }, true);
    }

    async handleSendMessage() {
        const message = this.uiManager.getInputValue();
        if (!message || this.uiManager.isWaiting()) return;

        if (!this.settings.apiKey) {
            this.handleOpenSettings();
            this.uiManager.showError(CONSTANTS.ERRORS.NO_API_KEY);
            return;
        }

        this.uiManager.addMessage('user', message, new Date());
        this.uiManager.clearInput();

        this.conversations.push({ role: 'user', content: message, timestamp: new Date() });
        if (this.settings.autoSave) this.storage.saveConversation(this.conversations);

        this.uiManager.showLoading();

        try {
            const response = await this.geminiAPI.sendMessage(message, this.settings);
            this.uiManager.hideLoading();
            this.uiManager.addMessage('ai', response, new Date());
            this.conversations.push({ role: 'ai', content: response, timestamp: new Date() });
            if (this.settings.autoSave) this.storage.saveConversation(this.conversations);
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error:', error);
            const errorMsg = error.message || CONSTANTS.ERRORS.API_ERROR;
            this.uiManager.showError(errorMsg);
            this.uiManager.addMessage('ai', `Sorry, error: ${errorMsg}`, new Date());
        }
    }

    handleClearConversation() {
        if (this.conversations.length === 0) return;
        if (!confirm('Clear conversation?')) return;
        this.conversations = [];
        this.uiManager.clearMessages();
        this.storage.clearConversation();
        this.uiManager.clearInput();
        this.uiManager.showSuccess('Conversation cleared');
    }

    handleOpenSettings() {
        this.settingsPanel.open(this.settings, newSettings => this.handleSaveSettings(newSettings));
    }

    handleSaveSettings(newSettings) {
        const oldKey = this.settings.apiKey;
        this.settings = { ...this.settings, ...newSettings };
        this.storage.saveSettings(this.settings);

        if (oldKey !== newSettings.apiKey) {
            try {
                this.geminiAPI.initialize(this.settings.apiKey);
                this.uiManager.showSuccess('Settings saved!');
            } catch (error) {
                this.uiManager.showError('Failed to initialize AI');
            }
        } else {
            this.uiManager.showSuccess('Settings saved!');
        }

        this.uiManager.setSelectedModel(this.settings.model);
    }

    handleExportConversation() {
        if (this.conversations.length === 0) {
            this.uiManager.showError('No conversation to export');
            return;
        }

        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #1c1c1e; border-radius: 12px; padding: 20px; z-index: 10001;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        menu.innerHTML = `
            <h3 style="color: white; margin: 0 0 16px 0;">Export Conversation</h3>
            <button class="export-btn" data-format="json" style="display: block; width: 100%; padding: 12px; margin-bottom: 8px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; cursor: pointer;">JSON</button>
            <button class="export-btn" data-format="txt" style="display: block; width: 100%; padding: 12px; margin-bottom: 8px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; cursor: pointer;">Text</button>
            <button class="export-btn" data-format="md" style="display: block; width: 100%; padding: 12px; margin-bottom: 8px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; cursor: pointer;">Markdown</button>
            <button id="export-cancel" style="display: block; width: 100%; padding: 12px; background: #444; border: none; border-radius: 8px; color: white; cursor: pointer;">Cancel</button>
        `;

        document.body.appendChild(menu);

        menu.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                this.exportConversation(e.target.dataset.format);
                menu.remove();
            });
        });

        menu.querySelector('#export-cancel').addEventListener('click', () => menu.remove());
    }

    exportConversation(format) {
        const content = this.storage.exportConversation(this.conversations, format);
        if (!content) {
            this.uiManager.showError('Export failed');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.uiManager.showSuccess(`Exported as ${format.toUpperCase()}`);
    }
}

// Global function for code copy button
window.copyToClipboard = function(button) {
    const codeBlock = button.closest('.raycast-code');
    const codeText = codeBlock.querySelector('pre code').textContent;

    navigator.clipboard.writeText(codeText).then(() => {
        const original = button.innerHTML;
        button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        button.style.color = '#4CAF50';
        setTimeout(() => {
            button.innerHTML = original;
            button.style.color = '';
        }, 2000);
    }).catch(err => console.error('Copy failed:', err));
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ChatbotApp();
    app.initialize();
});
