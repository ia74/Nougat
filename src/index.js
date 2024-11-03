const {app, BrowserWindow} = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1450,
    height: 1200,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('app/index.html');
}

app.on('ready', createWindow);

const http = require('http');

const hostname = '127.0.0.1';
const port = 5765;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});