// chatbot.js - Main script for the chatbot functionality

const conversations = [];
let isWaitingForResponse = false;

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('raycast-input');
    const conversation = document.getElementById('raycast-conversation');
    const loader = document.querySelector('.raycast-loader');
    const results = document.getElementById('raycast-results');
    const container = document.getElementById('raycast-container');

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
            // Add closing animation class
            container.classList.add('closing');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                resetWindowSize();
                window.electron.hideWindow();
                // Remove the class for next time
                container.classList.remove('closing');
            }, 200);
            
            e.preventDefault();
        }
    });    // Reset window size to a reasonable height
    function resetWindowSize() {

        window.electron.resizeWindow(150); // Set to full height to show entire popup
        results.style.display = 'block';
        
        // Make sure container allows scrolling
        if (container) {
            container.style.overflow = 'auto';
        }
    }
      // Adjust window size based on content
    function adjustWindowSize() {
        if (conversations.length > 0) {
            results.style.display = 'block';
            
            // Keep the window at full height to show all content
            const contentHeight = 600; // Full height for better visibility
            window.electron.resizeWindow(contentHeight);
            
            // Auto-scroll to the bottom of the conversation
            conversation.scrollTop = conversation.scrollHeight;
        } else {
            resetWindowSize();
        }
    }// Handle user message
    function handleUserMessage(message) {
        // Add user message to conversation
        addMessageToConversation('user', message);

        // Show loading indicator
        isWaitingForResponse = true;
        loader.style.display = 'block';
        
        // Show typing indicator
        showTypingIndicator();

        // Simulate AI thinking (replace with actual AI call in a real app)
        setTimeout(() => {
            removeTypingIndicator();
            generateResponse(message);
        }, 1500);
    }    // Show typing indicator
    function showTypingIndicator() {
        const typingContainer = document.createElement('div');
        typingContainer.className = 'raycast-message-container';
        typingContainer.id = 'typing-indicator';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'raycast-message raycast-ai-message raycast-typing';
        typingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
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
    }    // Add a message to the conversation display
    function addMessageToConversation(role, content) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'raycast-message-container';
        
        // Add additional class for message type styling
        if (role === 'user') {
            messageContainer.classList.add('user-container');
        } else {
            messageContainer.classList.add('ai-container');
        }

        const message = document.createElement('div');
        message.className = `raycast-message ${role === 'user' ? 'raycast-user-message' : 'raycast-ai-message'}`;
        
        // Format message content - handle code blocks
        let formattedContent = formatMessage(content);
        message.innerHTML = formattedContent;

        messageContainer.appendChild(message);
        conversation.appendChild(messageContainer);

        // Store in conversations array
        conversations.push({
            role: role,
            content: content
        });
        
        // Adjust window size after adding message
        adjustWindowSize();
        
        // Use a small delay before scrolling to handle any rendering delays
        setTimeout(() => {
            // Ensure we scroll to the very bottom
            conversation.scrollTop = conversation.scrollHeight;
        }, 50);
    }    // Format message with markdown-like syntax
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
            // Show success state
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('success');
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 2000);
        });
    };

    // Generate a response from the AI
    function generateResponse(userMessage) {
        // Simple demo responses - in a real app, this would call an AI API
        let response;
          if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
            response = "**Hello!** How can I assist you today?";
        } else if (userMessage.toLowerCase().includes('help')) {
            response = "I'm your **AI assistant**. You can ask me questions, and I'll do my best to help you with:\n\n- General queries\n- Code examples\n- Technical assistance\n- Project guidance";
        } else if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('example')) {
            response = "Here's a simple example of JavaScript code:\n\n```\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('world'));\n```\n\nYou can use `console.log()` for debugging.";
        } else if (userMessage.toLowerCase().includes('feature') || userMessage.toLowerCase().includes('function')) {
            response = "**What specific feature would you like to implement?** I can help with:\n\n1. Adding keyboard shortcuts\n2. Implementing new UI components\n3. Setting up API connections\n4. Improving the existing codebase";
        } else {
            response = "I'm still learning. Can you try asking something else? You can type `help` to see what I can do.";
        }

        // Hide loading indicator
        loader.style.display = 'none';
        isWaitingForResponse = false;
        
        // Add AI response to conversation
        addMessageToConversation('ai', response);
    }

    // Initialize window with just the search bar
    resetWindowSize();
});
