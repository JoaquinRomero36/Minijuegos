// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // oculta la menubar
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Ruta del index.html
  const startPath = process.env.ELECTRON_START_URL
    ? process.env.ELECTRON_START_URL
     : path.join(__dirname, 'dist/browser/browser/index.html');

  // Verificar que exista
  if (!fs.existsSync(startPath)) {
    console.error('Error: no se encontró index.html en:', startPath);
    return;
  }

  console.log('Cargando:', startPath);

  // Cargar la app
  win.loadFile(startPath);

  // Eliminar menú completamente
  win.setMenu(null);
  win.maximize();
  win.show();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
