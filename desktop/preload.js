const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", Object.freeze({
  platform: process.platform,
  isDesktop: true,
  cursorMode: "three-dimensional",
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),
}));
