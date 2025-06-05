// chatbot.js - Main script for the chatbot functionality

const conversations = [];
let isWaitingForResponse = false;

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('raycast-input');
    const conversation = document.getElementById('raycast-conversation');
    const loader = document.querySelector('.raycast-loader');

    // Focus on input when the window loads
    input.focus();

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

    // Handle Escape key to close window
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.electron.hideWindow();
            e.preventDefault();
        }
    });

    // Handle user message
    function handleUserMessage(message) {
        // Add user message to conversation
        addMessageToConversation('user', message);

        // Show loading indicator
        isWaitingForResponse = true;
        loader.style.display = 'block';

        // Simulate AI thinking (replace with actual AI call in a real app)
        setTimeout(() => {
            generateResponse(message);
        }, 1000);
    }

    // Add a message to the conversation display
    function addMessageToConversation(role, content) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'raycast-message-container';

        const message = document.createElement('div');
        message.className = `raycast-message ${role === 'user' ? 'raycast-user-message' : 'raycast-ai-message'}`;
        
        // Format message content - handle code blocks
        let formattedContent = formatMessage(content);
        message.innerHTML = formattedContent;

        messageContainer.appendChild(message);
        conversation.appendChild(messageContainer);

        // Scroll to bottom of conversation
        conversation.scrollTop = conversation.scrollHeight;

        // Store in conversations array
        conversations.push({
            role: role,
            content: content
        });
    }

    // Format message with markdown-like syntax
    function formatMessage(text) {
        // Handle code blocks with backticks
        text = text.replace(/```([\s\S]*?)```/g, function(match, code) {
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
        
        // Simple line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    // Escape HTML to prevent injection    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Generate AI response (mock implementation)
    function generateResponse(userMessage) {
        // Simple responses - in a real app, this would call an AI API
        const responses = [
            "I'm here to help! What else would you like to know?",
            "That's an interesting question. Let me think about it...",
            "I understand what you're asking. Here's what I think...",
            "Let me explain that in a different way...",
            "Here's a simple example: ```\nconsole.log('Hello World');\n```",
            "I'd be happy to help with that. Could you provide more details?",
            "I can definitely help you with that request."
        ];

        // For this demo, just pick a random response
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add AI response to conversation
        loader.style.display = 'none';
        addMessageToConversation('assistant', aiResponse);
        isWaitingForResponse = false;
    }
    
    // Add initial greeting
    addMessageToConversation('assistant', 'Hi there! How can I help you today?');
    
    // Define copy to clipboard function
    window.copyToClipboard = function(button) {
        const codeBlock = button.closest('.raycast-code').querySelector('pre').textContent;
        navigator.clipboard.writeText(codeBlock).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    };

});  // Close the DOMContentLoaded event listener

// Empty implementation - all the code we need is already defined above
