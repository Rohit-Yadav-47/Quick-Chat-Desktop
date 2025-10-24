// gemini.js - Gemini API integration with error handling and retry logic

const { GoogleGenAI } = require('@google/genai');
const CONSTANTS = require('../utils/constants.js');

/**
 * Gemini API Manager with retry logic and error handling
 */
class GeminiAPI {
    constructor() {
        this.client = null;
        this.apiKey = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the Gemini AI client
     */
    initialize(apiKey) {
        if (!apiKey) {
            throw new Error(CONSTANTS.ERRORS.NO_API_KEY);
        }

        try {
            this.apiKey = apiKey;
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
            this.isInitialized = true;
            console.log('Gemini API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Gemini API:', error);
            this.isInitialized = false;
            throw new Error(CONSTANTS.ERRORS.API_ERROR);
        }
    }

    /**
     * Check if API is ready
     */
    isReady() {
        return this.isInitialized && this.client !== null;
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Parse error message to user-friendly format
     */
    parseError(error) {
        const errorMessage = error.message || error.toString();

        if (errorMessage.includes('API key')) {
            return CONSTANTS.ERRORS.NO_API_KEY;
        }

        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            return CONSTANTS.ERRORS.RATE_LIMIT;
        }

        if (errorMessage.includes('network') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('timeout')) {
            return CONSTANTS.ERRORS.NETWORK_ERROR;
        }

        if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
            return CONSTANTS.ERRORS.INVALID_RESPONSE;
        }

        // Return the original error message if no specific pattern matches
        return `Error: ${errorMessage}`;
    }

    /**
     * Generate content with retry logic
     */
    async generateContent(options, retryCount = 0) {
        if (!this.isReady()) {
            throw new Error(CONSTANTS.ERRORS.NO_API_KEY);
        }

        try {
            const response = await this.client.models.generateContent({
                model: options.model || CONSTANTS.DEFAULT_SETTINGS.model,
                contents: options.contents,
                generationConfig: {
                    temperature: options.temperature || CONSTANTS.DEFAULT_SETTINGS.temperature,
                    maxOutputTokens: options.maxTokens || CONSTANTS.DEFAULT_SETTINGS.maxTokens,
                },
            });

            // Validate response
            if (!response || !response.text) {
                throw new Error(CONSTANTS.ERRORS.INVALID_RESPONSE);
            }

            return response.text;
        } catch (error) {
            console.error(`API request failed (attempt ${retryCount + 1}/${CONSTANTS.API.MAX_RETRIES}):`, error);

            // Retry logic
            if (retryCount < CONSTANTS.API.MAX_RETRIES - 1) {
                const delay = CONSTANTS.API.RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
                console.log(`Retrying in ${delay}ms...`);
                await this.sleep(delay);
                return this.generateContent(options, retryCount + 1);
            }

            // All retries exhausted
            throw new Error(this.parseError(error));
        }
    }

    /**
     * Send a message and get a response
     */
    async sendMessage(message, settings) {
        if (!message || !message.trim()) {
            throw new Error('Message cannot be empty');
        }

        const options = {
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            contents: [{
                role: 'user',
                parts: [{ text: message }],
            }],
        };

        return await this.generateContent(options);
    }

    /**
     * Send message with conversation history (for context)
     */
    async sendMessageWithContext(message, conversationHistory, settings) {
        if (!message || !message.trim()) {
            throw new Error('Message cannot be empty');
        }

        // Convert conversation history to Gemini format
        const contents = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Add the current message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        const options = {
            model: settings.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            contents: contents,
        };

        return await this.generateContent(options);
    }

    /**
     * Reset the API client
     */
    reset() {
        this.client = null;
        this.apiKey = null;
        this.isInitialized = false;
    }
}

// Export singleton instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new GeminiAPI();
}
