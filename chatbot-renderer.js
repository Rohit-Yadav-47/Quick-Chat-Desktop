// Renderer process code for chatbot window

window.addEventListener('DOMContentLoaded', () => {
  console.log('Chatbot window loaded');
  
  // Focus the input field when the window is shown
  const messageInput = document.getElementById('raycast-input');
  if (messageInput) {
    messageInput.focus();
    
    // Always focus the input when clicking anywhere in the window
    document.addEventListener('click', () => {
      messageInput.focus();
    });
  }
  
  // Add Escape key to hide the chatbot window with animation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const container = document.getElementById('raycast-container');
      
      // Add closing animation class
      if (container) {
        container.classList.add('closing');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
          window.electron.hideWindow();
          // Remove the class for next time
          container.classList.remove('closing');
        }, 200);
      } else {
        window.electron.hideWindow();
      }
    }
  });
  
  // Handle scroll events on conversation to prevent losing focus
  const conversationContainer = document.getElementById('raycast-conversation');
  if (conversationContainer) {
    conversationContainer.addEventListener('scroll', (e) => {
      // Prevent default to avoid any issues with scrolling
      e.stopPropagation();
    });
  }
  
  // Add effect to make the window appear more polished
  const container = document.getElementById('raycast-container');
  if (container) {
    // Force a reflow to ensure the animation plays properly
    void container.offsetWidth;
  }
});

// You can extend this file to include more advanced chatbot functionality
// For example, connecting to an AI service API, saving chat history, etc.
