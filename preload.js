const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getItems: (query) => ipcRenderer.invoke('api:items', query),
  getPrice: (query) => ipcRenderer.invoke('api:price', query),
  getMarketDetails: (query) => ipcRenderer.invoke('api:market-details', query),
  getExchangeRates: () => ipcRenderer.invoke('api:exchange-rates'),
  getStash: () => ipcRenderer.invoke('api:stash')
});
