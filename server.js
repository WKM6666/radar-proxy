const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

const RADAR_HOST = 'radar.pupcheat.com';
const RADAR_WS_HOST = '120.46.141.224';
const RADAR_WS_PORT = 8000;
const RADAR_WS_PATH = '/915001';

// 通用HTTP代理
function proxyHttp(req, res) {
  const options = {
    hostname: RADAR_HOST,
    port: 80,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: RADAR_HOST }
  };
  
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxy.on('error', (err) => {
    res.status(502).send('Proxy error: ' + err.message);
  });
  
  req.pipe(proxy);
}

// 代理所有雷达资源
app.use('/cs2', proxyHttp);

// 首页重定向到雷达页面
app.get('/', (req, res) => {
  res.redirect('/cs2/radar?ip=120.46.141.224&port=8000&password=915001');
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket 代理
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  const targetWs = new WebSocket(`ws://${RADAR_WS_HOST}:${RADAR_WS_PORT}${RADAR_WS_PATH}`);
  
  targetWs.on('open', () => {
    console.log('Connected to radar WebSocket');
  });
  
  targetWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });
  
  targetWs.on('close', () => {
    console.log('Radar WebSocket closed');
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });
  
  targetWs.on('error', (err) => {
    console.error('Radar WebSocket error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });
  
  clientWs.on('message', (data) => {
    if (targetWs.readyState === WebSocket.OPEN) {
      targetWs.send(data);
    }
  });
  
  clientWs.on('close', () => {
    console.log('Client disconnected');
    targetWs.close();
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//（注：内容由AI生成）
