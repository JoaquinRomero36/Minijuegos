const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const https = require('https');

const STORY_DIR = path.join(os.tmpdir(), 'embajador-totem');
const FIXED_PORT_START = 4343;
const MAX_PORT_ATTEMPTS = 10;
const UPLOAD_TTL = '24h';
const UPLOAD_TIMEOUT = 20000;

let server = null;
let serverPort = 0;
let lanIps = [];
let lanIp = 'localhost';

const VIRTUAL_MARKERS = [
  'virtualbox', 'vmware', 'vmnet', 'vbox', 'vethernet', 'hyper-v', 'hyperv',
  'wsl', 'isatap', 'tap-', 'tun-', 'npcap', 'loopback', 'bluetooth',
  'pseudo', 'docker', 'vpn', 'zerotier', 'tailscale', 'hamachi',
  'wan miniport', 'teredo', '6to4', 'localhost', 'microsoft wi-fi direct'
];

function isVirtualAdapter(name) {
  const n = (name || '').toLowerCase();
  return VIRTUAL_MARKERS.some(m => n.includes(m));
}

function isPrivateIpv4(addr) {
  return /^192\.168\./.test(addr) ||
         /^10\./.test(addr) ||
         /^172\.(1[6-9]|2\d|3[01])\./.test(addr);
}

function ipScore(addr) {
  if (addr.startsWith('192.168.')) return 0;
  if (addr.startsWith('10.')) return 1;
  return 2;
}

function getLanCandidates() {
  const nets = os.networkInterfaces();
  const candidates = [];
  const fallback = [];
  for (const name of Object.keys(nets)) {
    if (isVirtualAdapter(name)) continue;
    const list = nets[name] || [];
    for (const net of list) {
      const isV4 = net.family === 'IPv4' || net.family === 4;
      if (!isV4 || net.internal) continue;
      const addr = net.address;
      if (isPrivateIpv4(addr)) {
        candidates.push(addr);
      } else {
        fallback.push(addr);
      }
    }
  }
  const best = candidates.length ? candidates : fallback;
  best.sort((a, b) => ipScore(a) - ipScore(b));
  return best;
}

function listenWithRetry() {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const candidate = FIXED_PORT_START + n;
      const onError = (err) => {
        server.removeListener('error', onError);
        if (err.code === 'EADDRINUSE' && n < MAX_PORT_ATTEMPTS) {
          attempt(n + 1);
        } else {
          reject(err);
        }
      };
      server.once('error', onError);
      server.listen(candidate, '0.0.0.0', () => {
        server.removeListener('error', onError);
        serverPort = candidate;
        resolve();
      });
    };
    attempt(0);
  });
}

async function startServer() {
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

  try {
    await listenWithRetry();
  } catch (err) {
    console.warn('Puertos 4343+ ocupados, usando puerto aleatorio:', err.code || err);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '0.0.0.0', () => {
        server.removeAllListeners('error');
        serverPort = server.address().port;
        resolve();
      });
    });
  }

  lanIps = getLanCandidates();
  lanIp = lanIps[0] || 'localhost';
  console.log('Credenciales disponibles en http://' + lanIp + ':' + serverPort);
  if (lanIps.length > 1) {
    console.log('IPs alternativas: ' + lanIps.map(ip => 'http://' + ip + ':' + serverPort).join(', '));
  }
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

function uploadToLitterbox(filePath) {
  return new Promise((resolve, reject) => {
    let file;
    try {
      file = fs.readFileSync(filePath);
    } catch (e) {
      reject(e);
      return;
    }
    const boundary = '----emb' + Date.now() + Math.random().toString(36).slice(2, 8);
    const parts = [];
    const addField = (name, value) => {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
    };
    const addFile = (name, filename, data) => {
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
        `Content-Type: image/png\r\n\r\n`
      ));
      parts.push(data);
      parts.push(Buffer.from('\r\n'));
    };
    addField('reqtype', 'fileupload');
    addField('time', UPLOAD_TTL);
    addFile('fileToUpload', path.basename(filePath), file);
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    const body = Buffer.concat(parts);

    const req = https.request({
      hostname: 'litterbox.catbox.moe',
      path: '/resources/internals/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        const url = data.trim();
        if (res.statusCode === 200 && /^https:\/\/\S+$/.test(url)) {
          resolve(url);
        } else {
          reject(new Error('litterbox status ' + res.statusCode + ': ' + url));
        }
      });
    });
    req.setTimeout(UPLOAD_TIMEOUT, () => req.destroy(new Error('upload timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function uploadToTmpfiles(filePath) {
  return new Promise((resolve, reject) => {
    let file;
    try {
      file = fs.readFileSync(filePath);
    } catch (e) {
      reject(e);
      return;
    }
    const filename = path.basename(filePath);
    const boundary = '----emb' + Date.now() + Math.random().toString(36).slice(2, 8);
    const parts = [];
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    ));
    parts.push(file);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    const body = Buffer.concat(parts);

    const req = https.request({
      hostname: 'tmpfiles.org',
      path: '/api/v1/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          reject(new Error('tmpfiles status ' + res.statusCode + ': ' + data.slice(0, 120)));
          return;
        }
        const pageUrl = parsed && parsed.data && parsed.data.url;
        if (res.statusCode === 200 && /^https:\/\/tmpfiles\.org\/\S+$/.test(pageUrl || '')) {
          resolve(pageUrl);
        } else {
          reject(new Error('tmpfiles status ' + res.statusCode + ': ' + data.slice(0, 120)));
        }
      });
    });
    req.setTimeout(UPLOAD_TIMEOUT, () => req.destroy(new Error('tmpfiles upload timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getTmpfilesDlUrl(pageUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(pageUrl);
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        const m = data.match(/href="(https:\/\/tmpfiles\.org\/dl\/[^"]+)"/);
        if (res.statusCode === 200 && m) {
          resolve(m[1]);
        } else {
          reject(new Error('tmpfiles dl status ' + res.statusCode));
        }
      });
    });
    req.setTimeout(UPLOAD_TIMEOUT, () => req.destroy(new Error('tmpfiles dl timeout')));
    req.on('error', reject);
    req.end();
  });
}

ipcMain.handle('save-story-png', async (event, { fileName, dataUrl }) => {
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    return { url: null };
  }
  if (serverPort === 0) {
    return { url: null };
  }
  const safeName = path.basename(fileName);
  fs.mkdirSync(STORY_DIR, { recursive: true });
  const base64 = dataUrl.split(',')[1];
  const rawPath = path.join(STORY_DIR, safeName);
  fs.writeFileSync(rawPath, base64, 'base64');

  const host = 'http://' + lanIp + ':' + serverPort;
  const lanUrl = host + '/' + encodeURIComponent(safeName);

  if (process.env.EMBAJADOR_UPLOAD === '0') {
    return { url: lanUrl, host };
  }

  try {
    const pageUrl = await uploadToTmpfiles(rawPath);
    const dlUrl = await getTmpfilesDlUrl(pageUrl);
    fs.rmSync(rawPath, { force: true });
    console.log('Credencial pública en ' + dlUrl + ' (tmpfiles)');
    return { url: dlUrl, host: 'tmpfiles', public: true };
  } catch (e) {
    console.warn('Subida a tmpfiles falló, probando litterbox:', e.message);
    try {
      const publicUrl = await uploadToLitterbox(rawPath);
      fs.rmSync(rawPath, { force: true });
      console.log('Credencial pública en ' + publicUrl + ' (litterbox)');
      return { url: publicUrl, host: 'litterbox', public: true };
    } catch (e2) {
      console.warn('Subida a litterbox falló, usando URL LAN:', e2.message);
      return { url: lanUrl, host };
    }
  }
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
