const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVersion: () => ipcRenderer.invoke('api:version'),
  getItems: (query) => ipcRenderer.invoke('api:items', query),
  getPrice: (query) => ipcRenderer.invoke('api:price', query),
  getMarketDetails: (query) => ipcRenderer.invoke('api:market-details', query),
  getExchangeRates: () => ipcRenderer.invoke('api:exchange-rates'),
  getStash: () => ipcRenderer.invoke('api:stash'),
  onUpdateAvailable: (callback) => ipcRenderer.on('updater:update-available', (_, info) => callback(info)),
  onUpdateProgress: (callback) => ipcRenderer.on('updater:download-progress', (_, percent) => callback(percent)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('updater:update-downloaded', () => callback()),
  onSaveFileChanged: (callback) => ipcRenderer.on('save-file-changed', () => callback()),
  startUpdateDownload: () => ipcRenderer.invoke('updater:start-download'),
  installUpdate: () => ipcRenderer.invoke('updater:install-update')
});
