const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const RADAR_HTTP = 'http://radar.pupcheat.com';
const RADAR_WS_HOST = '120.46.141.224';
const RADAR_WS_PORT = 8000;
const RADAR_WS_PATH = '/915001';

// 代理雷达所有静态资源（页面、JS、CSS、图片）
app.use('/cs2', createProxyMiddleware({
  target: RADAR_HTTP,
  changeOrigin: true,
  secure: false,
}));

// WebSocket 代理
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (clientWs) => {
  console.log('Client connected');
  const targetWs = new WebSocket(`ws://${RADAR_WS_HOST}:${RADAR_WS_PORT}${RADAR_WS_PATH}`);

  targetWs.on('open', () => console.log('Connected to radar'));
  targetWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data);
  });
  targetWs.on('close', () => {
    console.log('Radar disconnected');
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });
  targetWs.on('error', (err) => {
    console.error('Radar WS error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  clientWs.on('message', (data) => {
    if (targetWs.readyState === WebSocket.OPEN) targetWs.send(data);
  });
  clientWs.on('close', () => {
    console.log('Client disconnected');
    targetWs.close();
  });
});

// 首页：直接重定向到雷达页面
app.get('/', (req, res) => {
  res.redirect('/cs2/radar?ip=120.46.141.224&port=8000&password=915001');
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//（注：内容由AI生成）
