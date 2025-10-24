// settings-panel.js - Enhanced settings panel with more options

const CONSTANTS = require('../utils/constants.js');

/**
 * Settings Panel Manager
 */
class SettingsPanel {
    constructor() {
        this.isOpen = false;
        this.onSaveCallback = null;
    }

    /**
     * Create and open the settings panel
     */
    open(currentSettings, onSave) {
        if (this.isOpen) return;

        this.onSaveCallback = onSave;
        this.close(); // Remove any existing panel

        const modal = this.createModal(currentSettings);
        document.body.appendChild(modal);

        this.isOpen = true;
        this.attachEventListeners(modal, currentSettings);

        // Focus API key input if empty
        setTimeout(() => {
            const apiKeyInput = document.getElementById('settings-api-key');
            if (apiKeyInput && !apiKeyInput.value) {
                apiKeyInput.focus();
            }
        }, 100);
    }

    /**
     * Close the settings panel
     */
    close() {
        const existingModal = document.getElementById('settings-modal');
        if (existingModal) {
            existingModal.remove();
        }
        this.isOpen = false;
    }

    /**
     * Create modal structure
     */
    createModal(settings) {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal';
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
            animation: fadeIn 0.2s ease;
        `;

        const panel = this.createPanel(settings);
        modal.appendChild(panel);

        return modal;
    }

    /**
     * Create settings panel content
     */
    createPanel(settings) {
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.style.cssText = `
            background: #1c1c1e;
            border-radius: 16px;
            padding: 24px;
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideInUp 0.3s ease;
        `;

        panel.innerHTML = `
            <div class="settings-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">Settings</h2>
                <button id="settings-close" style="background: none; border: none; color: #999; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
            </div>

            <div class="settings-content">
                <!-- API Key Section -->
                <div class="setting-group" style="margin-bottom: 24px;">
                    <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                        Gemini API Key
                        <span style="color: #ff6363; margin-left: 4px;">*</span>
                    </label>
                    <div style="position: relative;">
                        <input
                            type="password"
                            id="settings-api-key"
                            placeholder="Enter your API key"
                            value="${settings.apiKey || ''}"
                            style="width: 100%; padding: 12px; padding-right: 40px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box; font-family: 'SF Mono', monospace;"
                        >
                        <button
                            id="toggle-api-key"
                            type="button"
                            style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #999; cursor: pointer; padding: 4px;"
                            title="Show/Hide API Key"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                    <small style="color: #999; font-size: 12px; display: block; margin-top: 6px;">
                        Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: #ff6363; text-decoration: none;">Google AI Studio</a>
                    </small>
                </div>

                <!-- Model Selection -->
                <div class="setting-group" style="margin-bottom: 24px;">
                    <label style="display: block; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Model</label>
                    <select id="settings-model" style="width: 100%; padding: 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box; cursor: pointer;">
                        ${CONSTANTS.MODELS.map(model => `
                            <option value="${model.value}" ${settings.model === model.value ? 'selected' : ''}>
                                ${model.label} - ${model.description}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Temperature Slider -->
                <div class="setting-group" style="margin-bottom: 24px;">
                    <label style="display: flex; justify-content: space-between; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                        <span>Temperature</span>
                        <span id="temperature-value" style="color: #ff6363; font-weight: 600;">${settings.temperature || 0.7}</span>
                    </label>
                    <input
                        type="range"
                        id="settings-temperature"
                        min="0"
                        max="1"
                        step="0.1"
                        value="${settings.temperature || 0.7}"
                        style="width: 100%; height: 6px; background: linear-gradient(to right, #4a9eff 0%, #ff6363 100%); border-radius: 3px; outline: none; -webkit-appearance: none;"
                    >
                    <small style="color: #999; font-size: 12px; display: block; margin-top: 6px;">
                        Lower = more focused, Higher = more creative
                    </small>
                </div>

                <!-- Max Tokens -->
                <div class="setting-group" style="margin-bottom: 24px;">
                    <label style="display: flex; justify-content: space-between; color: white; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                        <span>Max Tokens</span>
                        <span id="tokens-value" style="color: #ff6363; font-weight: 600;">${settings.maxTokens || 2048}</span>
                    </label>
                    <input
                        type="range"
                        id="settings-max-tokens"
                        min="256"
                        max="4096"
                        step="256"
                        value="${settings.maxTokens || 2048}"
                        style="width: 100%; height: 6px; background: linear-gradient(to right, #666 0%, #ff6363 100%); border-radius: 3px; outline: none; -webkit-appearance: none;"
                    >
                    <small style="color: #999; font-size: 12px; display: block; margin-top: 6px;">
                        Maximum length of AI responses
                    </small>
                </div>

                <!-- Save Button -->
                <div style="margin-top: 32px;">
                    <button
                        id="settings-save"
                        style="width: 100%; padding: 14px; background: linear-gradient(135deg, #ff6363 0%, #ff5252 100%); border: none; border-radius: 10px; color: white; font-size: 15px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255, 99, 99, 0.3);"
                    >
                        Save Settings
                    </button>
                </div>

                <!-- Message Display -->
                <div id="settings-message" style="display: none; margin-top: 16px; padding: 12px; border-radius: 8px; text-align: center; font-size: 13px;"></div>
            </div>
        `;

        return panel;
    }

    /**
     * Attach event listeners to the panel
     */
    attachEventListeners(modal, currentSettings) {
        // Close button
        const closeBtn = modal.querySelector('#settings-close');
        closeBtn.addEventListener('click', () => this.close());
        closeBtn.addEventListener('mouseenter', (e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = '#fff';
        });
        closeBtn.addEventListener('mouseleave', (e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#999';
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Toggle API key visibility
        const toggleBtn = modal.querySelector('#toggle-api-key');
        const apiKeyInput = modal.querySelector('#settings-api-key');
        toggleBtn.addEventListener('click', () => {
            const type = apiKeyInput.type === 'password' ? 'text' : 'password';
            apiKeyInput.type = type;
        });

        // Temperature slider
        const tempSlider = modal.querySelector('#settings-temperature');
        const tempValue = modal.querySelector('#temperature-value');
        tempSlider.addEventListener('input', (e) => {
            tempValue.textContent = e.target.value;
        });

        // Tokens slider
        const tokensSlider = modal.querySelector('#settings-max-tokens');
        const tokensValue = modal.querySelector('#tokens-value');
        tokensSlider.addEventListener('input', (e) => {
            tokensValue.textContent = e.target.value;
        });

        // Save button
        const saveBtn = modal.querySelector('#settings-save');
        saveBtn.addEventListener('click', () => this.handleSave(modal));
        saveBtn.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 99, 99, 0.4)';
        });
        saveBtn.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 99, 99, 0.3)';
        });

        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Handle save button click
     */
    handleSave(modal) {
        const apiKey = modal.querySelector('#settings-api-key').value.trim();
        const model = modal.querySelector('#settings-model').value;
        const temperature = parseFloat(modal.querySelector('#settings-temperature').value);
        const maxTokens = parseInt(modal.querySelector('#settings-max-tokens').value);

        // Validation
        if (!apiKey) {
            this.showMessage(modal, 'Please enter your API key', 'error');
            return;
        }

        const newSettings = {
            apiKey,
            model,
            temperature,
            maxTokens,
        };

        // Call the save callback
        if (this.onSaveCallback) {
            this.onSaveCallback(newSettings);
        }

        this.showMessage(modal, 'Settings saved successfully!', 'success');
        setTimeout(() => this.close(), 1500);
    }

    /**
     * Show message in the panel
     */
    showMessage(modal, text, type) {
        const msgDiv = modal.querySelector('#settings-message');
        msgDiv.textContent = text;
        msgDiv.style.display = 'block';
        msgDiv.style.background = type === 'error' ? '#ff4444' : '#4CAF50';
        msgDiv.style.color = 'white';
    }
}

// Export singleton instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new SettingsPanel();
}
