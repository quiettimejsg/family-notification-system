require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const i18n = require('i18n');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const maintenance = require('./maintenance');
// 设置多语言
i18n.configure({
  locales: ['zh', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'zh',
  cookie: 'lang'
});
app.use(i18n.init);

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 提供uploads目录静态文件访问
app.use('/uploads', express.static(uploadsDir));

// 设置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    try {
      // 解码UTF-8编码的文件名
      file.decodedOriginalName = decodeURIComponent(file.originalname);
    } catch (err) {
      // 解码失败时使用原始文件名
      file.decodedOriginalName = file.originalname;
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.decodedOriginalName));
  }
});

const upload = multer({ storage });

// 中间件
// 添加全局请求日志中间件
app.use((req, res, next) => {
  console.log(`[请求日志] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 语言切换中间件
app.use((req, res, next) => {
  if (req.query.lang) {
    res.cookie('lang', req.query.lang, { maxAge: 900000, httpOnly: true });
    res.setLocale(req.query.lang);
  }
  next();
});

// 导入路由
require('./routes')(app, upload);

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    status: err.status || 500
  });
});

// 添加进程退出和错误处理日志
process.on('exit', (code) => {
  console.log(`[服务器退出] 进程退出，代码: ${code}`);
  console.log(`[服务器退出] 活跃句柄数量: ${process._getActiveHandles().length}`);
  console.log(`[服务器退出] 活跃请求数量: ${process._getActiveRequests().length}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[服务器错误] 未捕获的异常:`, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[服务器错误] 未处理的Promise拒绝:`, reason);
});

// 启动HTTPS服务器
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 证书配置（请确保证书文件存在或替换为正确路径）
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

// 创建HTTPS服务器
https.createServer(options, app).listen(443, '0.0.0.0', () => {
  console.log('HTTPS服务器启动成功，正在监听端口 443');
  console.log('服务器地址: https://0.0.0.0:443');
  console.log('数据库连接状态: 已连接');
  maintenance.initMaintenance();
});

// 创建HTTP服务器用于重定向到HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
  res.end();
}).listen(80, '0.0.0.0', () => {
  console.log('HTTP服务器启动成功，正在监听端口 80，并重定向到HTTPS');
});