// storage.js - Secure localStorage operations with encryption

const CONSTANTS = require('./constants.js');

/**
 * Simple XOR-based encryption for API keys
 * Note: This is basic obfuscation. For production, consider using crypto libraries
 */
class StorageManager {
    constructor() {
        this.encryptionKey = 'QuickChatSecure2024'; // In production, generate this dynamically
    }

    /**
     * Encrypt sensitive data
     */
    encrypt(text) {
        if (!text) return '';

        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result); // Base64 encode
    }

    /**
     * Decrypt sensitive data
     */
    decrypt(encrypted) {
        if (!encrypted) return '';

        try {
            const decoded = atob(encrypted); // Base64 decode
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

    /**
     * Save settings to localStorage with encryption for sensitive data
     */
    saveSettings(settings) {
        try {
            const settingsToSave = { ...settings };

            // Encrypt API key before saving
            if (settingsToSave.apiKey) {
                settingsToSave.apiKey = this.encrypt(settingsToSave.apiKey);
                settingsToSave._encrypted = true;
            }

            localStorage.setItem(
                CONSTANTS.STORAGE_KEYS.SETTINGS,
                JSON.stringify(settingsToSave)
            );
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * Load settings from localStorage with decryption
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.SETTINGS);
            if (!saved) {
                return { ...CONSTANTS.DEFAULT_SETTINGS };
            }

            const settings = JSON.parse(saved);

            // Decrypt API key if it was encrypted
            if (settings._encrypted && settings.apiKey) {
                settings.apiKey = this.decrypt(settings.apiKey);
                delete settings._encrypted;
            }

            // Merge with defaults to ensure all properties exist
            return { ...CONSTANTS.DEFAULT_SETTINGS, ...settings };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return { ...CONSTANTS.DEFAULT_SETTINGS };
        }
    }

    /**
     * Save current conversation to localStorage
     */
    saveConversation(messages) {
        try {
            localStorage.setItem(
                CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION,
                JSON.stringify(messages)
            );
            return true;
        } catch (error) {
            console.error('Failed to save conversation:', error);
            return false;
        }
    }

    /**
     * Load current conversation from localStorage
     */
    loadConversation() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load conversation:', error);
            return [];
        }
    }

    /**
     * Clear current conversation
     */
    clearConversation() {
        try {
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.CURRENT_CONVERSATION);
            return true;
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            return false;
        }
    }

    /**
     * Export conversation in different formats
     */
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
                        markdown += `### ${role} *(${timestamp})*\n\n`;
                        markdown += `${msg.content}\n\n---\n\n`;
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

    /**
     * Save all conversations history
     */
    saveConversationHistory(conversations) {
        try {
            localStorage.setItem(
                CONSTANTS.STORAGE_KEYS.CONVERSATIONS,
                JSON.stringify(conversations)
            );
            return true;
        } catch (error) {
            console.error('Failed to save conversation history:', error);
            return false;
        }
    }

    /**
     * Load all conversations history
     */
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CONVERSATIONS);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load conversation history:', error);
            return [];
        }
    }
}

// Export singleton instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new StorageManager();
}
