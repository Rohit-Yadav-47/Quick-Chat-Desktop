// Import required Electron components
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window objects to prevent automatic garbage collection
let chatbotWindow;

// Function to create the chatbot window
function createChatbotWindow() {
  // If the window already exists, just focus it and show it
  if (chatbotWindow) {
    chatbotWindow.show();
    chatbotWindow.focus();
    chatbotWindow.center();
    // Temporarily set always on top to bring it to front
    chatbotWindow.setAlwaysOnTop(true, 'floating');
    setTimeout(() => {
      chatbotWindow.setAlwaysOnTop(true); // Reset to normal always on top
    }, 100);
    return;
  }
    // Create a new browser window for the chatbot
  chatbotWindow = new BrowserWindow({
    width: 700,
    height: 400, // Fixed compact height
    title: 'AI Assistant',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    transparent: true,
    resizable: true, // Allow resize
    frame: false,
    alwaysOnTop: true,
    show: true,
    skipTaskbar: true,
    hasShadow: true,
    center: true, // Keep window centered horizontally
    roundedCorners: true,
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  // Load the chatbot HTML file
  chatbotWindow.loadFile('chatbot.html');
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    chatbotWindow.webContents.openDevTools();
  }
  
  // Focus on the window to ensure it's in the foreground
  chatbotWindow.focus();
  
  // Hide the window rather than close it when the user clicks the close button
  chatbotWindow.on('close', (event) => {
    event.preventDefault();
    chatbotWindow.hide();
    return false;
  });

  // Handle window being closed completely (app quit)
  chatbotWindow.on('closed', function () {
    chatbotWindow = null;
  });
}

// Create and register global shortcut when Electron has finished initialization
app.whenReady().then(() => {
  // Don't create a tray icon, just register the shortcut
  
  // Register global shortcut for Ctrl+Q to open the chatbot
  globalShortcut.register('CommandOrControl+Q', () => {
    createChatbotWindow();
  });
});

// Keep the app running even when all windows are closed
app.on('window-all-closed', function () {
  // Do nothing, we want to keep the app running in the background
});

// Unregister shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Handle IPC messages from renderer process
ipcMain.on('hide-window', () => {
  if (chatbotWindow) {
    chatbotWindow.hide();
  }
});

// Handle window resize requests from renderer
ipcMain.on('resize-window', (event, height) => {
  if (chatbotWindow) {
    const [width] = chatbotWindow.getSize();
    chatbotWindow.setSize(width, height);
    
    // Ensure the window stays centered horizontally when resizing
    const bounds = chatbotWindow.getBounds();
    const display = require('electron').screen.getPrimaryDisplay();
    const x = Math.round(display.workArea.width / 2 - width / 2);
    
    // Only change the x position to keep it centered
    chatbotWindow.setBounds({ x, y: bounds.y, width, height });
  }
});
