const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use IPC
contextBridge.exposeInMainWorld('electron', {
  hideWindow: () => ipcRenderer.send('hide-window'),
  resizeWindow: (height) => ipcRenderer.send('resize-window', height)
});
