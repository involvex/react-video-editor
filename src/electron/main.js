const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, dialog, shell, clipboard, desktopCapturer, screen } = electron;
const path = require('path');
const isDev = require('electron-is-dev');
const Node_ENV = process.env.NODE_ENV || 'production';

if (process.env.NODE_ENV === 'development') {
  console.log('Enabling DevTools for Electron');
    BrowserWindow.fromWebContents.BrowserWindowOptions = {
        webPreferences: {
            devTools: true,
        },
    };
}

   function createWindow() {
       const win = new BrowserWindow({
            width: 1500,
            height: 900,
            minWidth: 600,
            minHeight: 700,
           webPreferences: {
              nodeIntegration: true,
              contextIsolation: true,
              preload: path.join(__dirname, 'preload.js'),
              webSecurity: true, // Keep security enabled but allow local resources
              allowRunningInsecureContent: false,
           },
       });

       win.loadURL('http://localhost:3000'); // Load your Next.js app
   }

   app.whenReady().then(createWindow); 