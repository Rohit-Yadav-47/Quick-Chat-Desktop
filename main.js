// Import required Electron components
const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// Enable global shortcuts on Linux (Wayland/X11)
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');

// Keep a global reference of the window objects to prevent automatic garbage collection
let chatbotWindow;
let tray = null;

// Function to create the chatbot window
function createChatbotWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 700;
  const windowHeight = 400;

  // Position at top-center of screen (like Spotlight/Raycast)
  const x = Math.round((screenWidth - windowWidth) / 2);
  const y = Math.round(screenHeight * 0.15); // 15% from top

  // If the window already exists, just focus it and show it
  if (chatbotWindow) {
    chatbotWindow.show();
    chatbotWindow.setPosition(x, y);
    chatbotWindow.focus();
    chatbotWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    return;
  }

  // Create a new browser window for the chatbot
  chatbotWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    title: 'AI Assistant',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    transparent: true,
    resizable: true,
    frame: false,
    alwaysOnTop: true,
    show: false, // Don't show immediately
    skipTaskbar: true,
    hasShadow: true,
    roundedCorners: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    type: 'toolbar', // Makes it behave like an overlay on Linux
    focusable: true,
    movable: true
  });

  // Load the chatbot HTML file
  chatbotWindow.loadFile('chatbot.html');

  // Show window after content loads
  chatbotWindow.once('ready-to-show', () => {
    chatbotWindow.show();
    chatbotWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    chatbotWindow.focus();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    chatbotWindow.webContents.openDevTools();
  }
  
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

// Create system tray icon
function createTray() {
  // Create a simple icon for the tray (you can replace this with an actual icon file later)
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGvSURBVFhH7ZaxSgNBEIZ3EyshEAyIhY2FhY2FjY2djYWFhY2NjY2NhY2FhZWFhZWVlZWVlZWVlZWdlZWVnZWVlZ2dnZWdnZ2V3czuJXfJJXfJXQyBfPCxw87szn/z784l/1fgH4E/QqgAh8MhHo/H2O/32O122Gq1cLvd4mazwebzOdbrNVarFZbLJRaLBWazGabTKSaTCSaTCcbjMUajEYbDIQaDAfr9Pvr9Pnq9Hnq9Hrrdbrfb6XQ6nU673W632+12u91ut9vtdjqdTqfT6XQ6nU6n0+l0Op1Op9PpdDqdTqfT6XQ6nU6n0+n+JkB/BPgJcDgc4vF4jP1+j91uh61WC7fbLTYajdVqhdVqhdVqhdVqhcVigdlshumfAPQJQJ8A9AlAnwD0CUCfAPQJQJ8A9AlAnwD0CUCfAPQJQJ8A9AlAnwD0CUCfAPQJQJ8A9P8PQJ8A9AlAnwD0CUD/90BnAH8E+AnQH0H+COCPAPwRgD8C8EcA/gjAHwH4IwB/BOCPAPwRgD8C8EcA/gjAHwH4IwB/BOCPAPwRgD8C8EcA/gjAHwH4IwB/BOCPAPwRgD8C8EcA/gjAHwH4I8D/E/gnBH4BnMdnN8wnzZIAAAAASUVORK5CYII=');

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide Chatbot',
      click: () => {
        if (chatbotWindow && chatbotWindow.isVisible()) {
          chatbotWindow.hide();
        } else {
          createChatbotWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('AI Assistant - Click to toggle');
  tray.setContextMenu(contextMenu);

  // Click on tray icon to toggle window
  tray.on('click', () => {
    if (chatbotWindow && chatbotWindow.isVisible()) {
      chatbotWindow.hide();
    } else {
      createChatbotWindow();
    }
  });

  console.log('✓ System tray icon created - Click tray icon to toggle chatbot');
}

// Create and register global shortcut when Electron has finished initialization
app.whenReady().then(() => {
  console.log('=== APP READY ===');
  console.log('Platform:', process.platform);

  // Create window on startup since global shortcuts don't work
  createChatbotWindow();

  // Create system tray icon
  try {
    createTray();
    console.log('✓ System tray icon created');
  } catch (e) {
    console.log('✗ Tray icon failed:', e.message);
  }

  console.log('\n=== HOW TO USE ===');
  console.log('• Press ESC inside window to hide it');
  console.log('• Click tray icon in system panel to show/hide');
  console.log('• Or use Alt+Tab to switch to the window');
  console.log('===================\n');
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
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const [width] = chatbotWindow.getSize();

    // Keep window centered at top
    const x = Math.round((screenWidth - width) / 2);
    const y = Math.round(screenHeight * 0.15);

    chatbotWindow.setBounds({ x, y, width, height });
    chatbotWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  }
});
