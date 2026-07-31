const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

const STORY_DIR = path.join(os.tmpdir(), 'embajador-totem');
let server = null;
let serverPort = 0;
let lanIp = 'localhost';

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const list = nets[name] || [];
    for (const net of list) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function startServer() {
  return new Promise((resolve) => {
    if (fs.existsSync(STORY_DIR)) {
      fs.rmSync(STORY_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(STORY_DIR, { recursive: true });

    server = http.createServer((req, res) => {
      const raw = decodeURIComponent(req.url.replace(/^\//, ''));
      const filePath = path.join(STORY_DIR, path.basename(raw));

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': data.length,
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
      });
    });

    server.listen(0, '0.0.0.0', () => {
      serverPort = server.address().port;
      lanIp = getLanIp();
      console.log('Credenciales disponibles en http://' + lanIp + ':' + serverPort);
      resolve();
    });
  });
}

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
    startPath = process.env.ELECTRON_START_URL;
  } else {
    startPath = path.join(__dirname, 'dist/browser/browser/index.html');

    if (!fs.existsSync(startPath)) {
      console.error('No se encontró index.html en producción:', startPath);
      return;
    }
  }

  console.log('Cargando:', startPath);

  win.loadFile(startPath);

  win.setMenu(null);
  win.maximize();
  win.show();
}

ipcMain.handle('save-story-png', (event, { fileName, dataUrl }) => {
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    return { url: null };
  }
  if (serverPort === 0) {
    return { url: null };
  }
  const safeName = path.basename(fileName);
  fs.mkdirSync(STORY_DIR, { recursive: true });
  const base64 = dataUrl.split(',')[1];
  fs.writeFileSync(path.join(STORY_DIR, safeName), base64, 'base64');
  return { url: 'http://' + lanIp + ':' + serverPort + '/' + encodeURIComponent(safeName) };
});

app.on('ready', () => {
  startServer().then(createWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
