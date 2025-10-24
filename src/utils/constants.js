// constants.js - Application configuration and constants

const CONSTANTS = {
    // Application
    APP_NAME: 'Quick Chat',
    APP_VERSION: '2.0.0',

    // Storage keys
    STORAGE_KEYS: {
        SETTINGS: 'raycast-chatbot-settings',
        CONVERSATIONS: 'raycast-chatbot-conversations',
        CURRENT_CONVERSATION: 'raycast-chatbot-current',
    },

    // Default settings
    DEFAULT_SETTINGS: {
        apiKey: '',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2048,
        theme: 'dark',
        autoSave: true,
    },

    // Available models
    MODELS: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Fast and efficient' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Most capable' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Balanced performance' },
        { value: 'gemini-1.5-pro-002', label: 'Gemini 2.5 Pro', description: 'Latest pro model' },
        { value: 'gemini-1.5-flash-002', label: 'Gemini 2.5 Flash', description: 'Latest flash model' },
    ],

    // UI Configuration
    UI: {
        MAX_MESSAGE_LENGTH: 10000,
        TYPING_INDICATOR_DELAY: 100,
        AUTO_SCROLL_DELAY: 50,
        ANIMATION_DURATION: 200,
        NOTIFICATION_DURATION: 3000,
    },

    // Window sizes
    WINDOW: {
        MIN_HEIGHT: 400,
        MAX_HEIGHT: 600,
        DEFAULT_HEIGHT: 400,
        WIDTH: 700,
    },

    // Error messages
    ERRORS: {
        NO_API_KEY: 'Please configure your API key in settings',
        API_ERROR: 'Failed to get response from AI. Please check your API key and try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        INVALID_RESPONSE: 'Received invalid response from AI. Please try again.',
        RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
    },

    // API Configuration
    API: {
        TIMEOUT: 30000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}
