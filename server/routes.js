const db = require('./database');

const axios = require('axios');
const cheerio = require('cheerio');
console.log('天气模块依赖加载状态: axios=%s, cheerio=%s', !!axios, !!cheerio);

module.exports = (app, upload) => {
  
  // 创建通知
// 修改文件上传路径处理
app.post('/api/notifications', (req, res, next) => {
  upload.array('files[]')(req, res, (err) => {
    if (err) {      
      console.error('文件上传错误详情:', 
        { message: err.message, code: err.code, stack: err.stack });      
        return res.status(400).json({ error: err.message, code: err.code });    
      }
    next();
  });
}, async (req, res) => {
  try {
    const { title = '', content = '', priority = 'low' } = req.body;
    const files = req.files || [];
    console.log('接收到的文件数量:', files.length);
    files.forEach((file, index) => {
      console.log(`文件 ${index + 1}:`, file.originalname, file.mimetype);
    });
    
    // 插入通知
    const notificationId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO notifications (title, content, priority) VALUES (?, ?, ?)',
        [title, content, priority],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // 处理附件
    if (files.length > 0) {
      const stmt = db.prepare(
        'INSERT INTO attachments (notification_id, type, path, original_name, uploaded_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
      );
      
      const promises = files.map(file => {
        return new Promise((resolve, reject) => {
          let fileType = 'unknown';
          if (file.mimetype.startsWith('image/')) fileType = 'image';
          else if (file.mimetype.startsWith('video/')) fileType = 'video';
          else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
          else if (file.mimetype === 'application/pdf') fileType = 'document';
          
          stmt.run(notificationId, fileType, file.filename, file.decodedOriginalName || file.originalname || 0, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      
      await Promise.all(promises);
      stmt.finalize();
    }
    
    res.status(201).json({ id: notificationId, message: '通知创建成功' });
  } catch (err) {
    console.error('创建通知错误:', err);
    res.status(500).json({ error: '创建通知失败: ' + err.message });
  }
});
  
  // 获取所有通知
  app.get('/api/notifications', (req, res) => {
    db.all(`
      SELECT n.*, 
        (SELECT COUNT(*) FROM attachments WHERE notification_id = n.id) as attachment_count 
      FROM notifications n
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END, 
        created_at DESC
    `, [], (err, notifications) => {
      if (err) {
        console.error('查询通知错误:', err);
        return res.status(500).json({ error: '获取通知失败' });
      }
      
      // 获取每个通知的附件
      const promises = notifications.map(notification => {
        return new Promise((resolve) => {
          db.all(
            'SELECT id, type, path, original_name FROM attachments WHERE notification_id = ?',
            [notification.id],
            (err, attachments) => {
              if (!err) notification.attachments = attachments || [];
              resolve();
            }
          );
        });
      });
      
      Promise.all(promises).then(() => {
        res.json(notifications);
      });
    });
  });
  
  // 获取单个通知
  app.get('/api/notifications/:id', (req, res) => {
    const id = req.params.id;
    
    db.get(
      'SELECT * FROM notifications WHERE id = ?',
      [id],
      (err, notification) => {
        if (err || !notification) {
          return res.status(404).json({ error: '通知未找到' });
        }
        
        db.all(
          'SELECT id, type, path, original_name FROM attachments WHERE notification_id = ?',
          [id],
          (err, attachments) => {
            notification.attachments = attachments || [];
            res.json(notification);
          }
        );
      }
    );
  });
  
  // 获取当前语言
  app.get('/api/language', (req, res) => {
    res.json({ lang: res.getLocale() });
  });

  // 获取维护日志
  app.get('/api/maintenance/logs', (req, res) => {
    const { limit = 10 } = req.query;
    db.all(
      'SELECT * FROM maintenance_log ORDER BY check_time DESC LIMIT ?',
      [parseInt(limit)],
      (err, logs) => {
        if (err) {
          console.error('获取维护日志错误:', err);
          return res.status(500).json({ error: '获取维护日志失败' });
        }
        res.json(logs);
      }
    );
  });

  // 导入天气服务
  const weatherService = require('./weatherService');
  const { findNearestCity } = weatherService;

  // 获取天气数据
  app.get('/api/weather', async (req, res) => {
    try {
      console.log('收到天气请求:', req.method, req.originalUrl);
      console.log('天气请求参数:', req.query);
      const { days } = req.query;
      const result = await weatherService.getWeatherData(days);
      console.log('天气数据获取成功:', result);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取天气数据失败:', error);
      // 根据错误类型返回适当的状态码
      const statusCode = error.message.includes('暂不支持该城市') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

};