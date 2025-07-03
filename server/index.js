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

// 设置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 修改文件类型过滤
const fileFilter = (req, file, cb) => {
  // 允许所有文件类型上传
  cb(null, true);
  

};

const upload = multer({ 
  storage,
  fileFilter
});

// 中间件
// 添加全局请求日志中间件
app.use((req, res, next) => {
  console.log(`[请求日志] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());
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

// 启动服务器
console.log('准备启动服务器...');
app.listen(3000, '0.0.0.0', () => {
  console.log('服务器启动成功，正在监听端口 3000');
  console.log('服务器地址: http://0.0.0.0:3000');
  console.log('数据库连接状态: 已连接');
  console.log('准备初始化保持活跃定时器...');
  try {
    const intervalId = setInterval(() => {
      console.log('[保持活跃] 定时器执行中... intervalId:', intervalId);
    }, 1000);
    console.log('定时器初始化成功，ID:', intervalId);
    console.log('定时器类型:', typeof intervalId);
  } catch (error) {
    console.error('定时器初始化失败:', error);
  }
});