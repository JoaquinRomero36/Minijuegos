const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  let startPath;

  if (process.env.ELECTRON_START_URL) {
    // DEV: usar Angular ng serve
    startPath = process.env.ELECTRON_START_URL;
  } else {
    // PROD: usar dist empaquetado
    startPath = path.join(__dirname, 'dist/browser/browser/index.html');

    if (!fs.existsSync(startPath)) {
      console.error('No se encontró index.html en producción:', startPath);
      return;
    }
  }

  console.log('Cargando:', startPath);

  // Cargar app
  win.loadFile(startPath);

  // Ocultar menú
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
