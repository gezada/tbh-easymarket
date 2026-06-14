const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // We will expose safe IPC methods here as we migrate features
});
