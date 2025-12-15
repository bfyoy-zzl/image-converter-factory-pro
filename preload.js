const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDialog: (type) => ipcRenderer.invoke('dialog:open', type),
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  convertImage: (data) => ipcRenderer.invoke('image:convert', data),
  on: (channel, callback) => ipcRenderer.on(channel, (_, data) => callback(data)),
  
  // 新增窗口控制 API
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
});