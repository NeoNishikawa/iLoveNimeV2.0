const { app, BrowserWindow, shell, session, ipcMain, globalShortcut } = require("electron");
const path = require("node:path");
const { app: expressApp } = require("../server");

const DEFAULT_PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 3099;
let httpServer;
let mainWindow;

// Keep the embedded browser quiet when the application is idle.
app.commandLine.appendSwitch("disable-background-networking");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-features", "Translate,MediaRouter");
app.commandLine.appendSwitch("no-default-browser-check");

function startLocalServer() {
  return new Promise((resolve, reject) => {
    httpServer = expressApp.listen(DEFAULT_PORT, "127.0.0.1", () => resolve(DEFAULT_PORT));
    httpServer.once("error", (error) => {
      if (error.code !== "EADDRINUSE") return reject(error);
      // A second app instance may already own the configured development port.
      httpServer = expressApp.listen(0, "127.0.0.1", () => resolve(httpServer.address().port));
      httpServer.once("error", reject);
    });
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false,
    backgroundColor: "#101018",
    autoHideMenuBar: true,
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://127.0.0.1:${port}`)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.webContents.on("did-finish-load", () => mainWindow.webContents.executeJavaScript("window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0;", true));
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  ipcMain.handle("toggle-fullscreen", () => { if (!mainWindow) return false; const next = !mainWindow.isKiosk(); mainWindow.setMenuBarVisibility(false); mainWindow.setKiosk(next); mainWindow.setFullScreen(next); return next; });
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  const port = await startLocalServer();
  createWindow(port);
  globalShortcut.register("F11", () => { if (!mainWindow) return; const next = !mainWindow.isKiosk(); mainWindow.setMenuBarVisibility(false); mainWindow.setKiosk(next); mainWindow.setFullScreen(next); });
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(port); });
}).catch((error) => {
  console.error("ILoveNime desktop gagal dimulai:", error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  globalShortcut.unregisterAll();
  if (httpServer) httpServer.close();
});
