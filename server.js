const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8080;
const DIR = __dirname;
const MIME = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf','.wav':'audio/wav'};
const server = http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url;
  let fp = path.join(DIR, url);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    let ext = path.extname(fp);
    res.writeHead(200, {'Content-Type': MIME[ext]||'text/html'});
    res.end(data);
  });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('CyberSec Hub running at http://localhost:' + PORT);
});
