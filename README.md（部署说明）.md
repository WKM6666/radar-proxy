# CS2 雷达代理服务器部署说明

## 方案说明

在 Render 上部署一个 Node.js 代理服务器，把 HTTP 雷达和 WebSocket 转发为 HTTPS/WSS，这样手机浏览器打开在线链接就能正常显示雷达。

## 部署步骤

### 1. 准备 GitHub 仓库

1. 注册/登录 GitHub：https://github.com
2. 创建一个新仓库（比如叫 `radar-proxy`）
3. 把以下3个文件上传到仓库根目录：
   - `server.js`
   - `package.json`
   - `README.md`（就是这个文件）

### 2. 部署到 Render

1. 注册/登录 Render：https://render.com
2. 点击「New +」→「Web Service」
3. 选择「Deploy from a Git repository」
4. 连接你的 GitHub 仓库
5. 配置：
   - **Name**：随便起个名字（比如 `radar-proxy`）
   - **Region**：选 Singapore（离国内近）
   - **Branch**：main
   - **Runtime**：Node
   - **Build Command**：`npm install`
   - **Start Command**：`npm start`
6. 点击「Create Web Service」
7. 等待部署完成（约2-3分钟）

### 3. 获取访问地址

部署成功后，你会得到一个地址，比如：
`https://radar-proxy-xxxx.onrender.com`

### 4. 使用

把这个地址发给朋友，朋友打开后就能看到雷达页面，红点进框自动播报。

## 注意事项

- Render 免费版会在15分钟无访问后休眠，第一次访问需要等几秒唤醒
- 如果需要持续运行，升级到付费版（$7/月）
- 雷达服务器地址已硬编码在 server.js 中，如需修改请改代码后重新部署
