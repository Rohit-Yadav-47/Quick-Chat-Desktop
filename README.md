# Electron Chatbot Application

This is a simple Electron application that runs in the background and provides a chatbot interface that can be opened with a keyboard shortcut (Ctrl+Q).

## Features

- Background running application with tray icon
- Global shortcut (Ctrl+Q) to open the chatbot window
- Simple chatbot interface
- Press Escape to close the chatbot window (the app continues running in the background)

## How to Use

1. Install dependencies:
   ```
   npm install
   ```

2. Start the application:
   ```
   npm start
   ```

3. The application will run in the background with a tray icon.
4. Press Ctrl+Q to open the chatbot window.
5. Type messages in the chatbot interface and press Enter or click Send.
6. Press Escape to close the chatbot window (the application continues running in the background).
7. To quit the application completely, right-click the tray icon and select "Quit".

## Technologies Used

- Electron
- HTML/CSS
- JavaScript

## How It Works

The application uses Electron's global shortcuts to register a keyboard combination (Ctrl+Q) that triggers the chatbot window to open. The window can be hidden using the Escape key, but the application continues to run in the background, accessible via the tray icon.
