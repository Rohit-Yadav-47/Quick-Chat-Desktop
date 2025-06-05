// Renderer process code
console.log('Hello from renderer process!');

// DOM event listeners
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  
  // Add information about the chatbot shortcut to the UI
  const infoDiv = document.querySelector('.info');
  if (infoDiv) {
    const shortcutInfo = document.createElement('p');
    shortcutInfo.innerHTML = '<strong>Tip:</strong> Press <kbd>Ctrl+Q</kbd> to open the AI Assistant chatbot anytime!';
    infoDiv.appendChild(shortcutInfo);
  }
});
