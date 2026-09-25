const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 雷达服务器配置
const RADAR_HTTP = 'http://radar.pupcheat.com';
const RADAR_WS_HOST = '120.46.141.224';
const RADAR_WS_PORT = 8000;
const RADAR_WS_PATH = '/915001';

// 代理雷达 HTTP 资源（页面、JS、CSS、图片）
app.use('/cs2', createProxyMiddleware({
  target: RADAR_HTTP,
  changeOrigin: true,
  secure: false,
  onProxyRes: (proxyRes) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
}));

// 代理地图图片
app.use('/maps', createProxyMiddleware({
  target: RADAR_HTTP + '/cs2/maps',
  changeOrigin: true,
  secure: false,
  pathRewrite: { '^/maps': '' },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
}));

// WebSocket 代理
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  // 连接到雷达 WebSocket
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
    console.log('Disconnected from radar WebSocket');
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });
  
  targetWs.on('error', (err) => {
    console.error('Radar WebSocket error:', err);
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

// 首页：代理雷达页面
app.get('/', (req, res) => {
  const radarUrl = `${RADAR_HTTP}/cs2/radar?ip=120.46.141.224&port=8000&password=915001`;
  
  https.get(radarUrl, (radarRes) => {
    let html = '';
    radarRes.on('data', (chunk) => html += chunk);
    radarRes.on('end', () => {
      // 替换 WebSocket URL
      const publicUrl = `wss://${req.get('host')}/ws`;
      html = html.replace(/ws:\/\/[0-9.]+:\d+\/\w+/g, publicUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    });
  }).on('error', (err) => {
    res.status(500).send('Failed to load radar page');
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//（注：内容由AI生成）
