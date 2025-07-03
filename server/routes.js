const db = require('./database');

const axios = require('axios');
const cheerio = require('cheerio');
console.log('天气模块依赖加载状态: axios=%s, cheerio=%s', !!axios, !!cheerio);

const multer = require('multer');
const path = require('path');

// 配置multer处理中文文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 使用原始文件名，避免编码转换导致的乱码
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// 允许上传多个文件，最多5个
const upload = multer({ storage: storage }).array('files', 20);

module.exports = (app) => {
  
  // 创建通知
// 修改文件上传路径处理
app.post('/api/notifications', upload, (req, res) => {
  const { title, content, priority } = req.body;
  const files = req.files || [];
  
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  
  db.run(
    'INSERT INTO notifications (title, content, priority) VALUES (?, ?, ?)',
    [title, content, priority],
    function(err) {
      if (err) {
        console.error('插入通知错误:', err);
        return res.status(500).json({ error: '创建通知失败' });
      }
      
      const notificationId = this.lastID;
      
      // 如果有文件，插入附件记录
      if (files.length > 0) {
        const stmt = db.prepare(
          'INSERT INTO attachments (notification_id, type, path, original_name) VALUES (?, ?, ?, ?)'
        );
        
        // 处理所有文件
        const promises = files.map(file => {
          return new Promise((resolve, reject) => {
            let fileType = 'unknown';
            if (file.mimetype.startsWith('image/')) fileType = 'image';
            else if (file.mimetype.startsWith('video/')) fileType = 'video';
            else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
            else if (file.mimetype === 'application/pdf') fileType = 'document';
            
            stmt.run(notificationId, fileType, file.filename, file.originalname, (err) => {
              if (err) {
                console.error('插入附件错误:', err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
        
        // 等待所有文件处理完成
        Promise.all(promises)
          .then(() => stmt.finalize())
          .then(() => {
            res.status(201).json({
              id: notificationId,
              message: '通知创建成功',
              files: files.map(f => f.filename)
            });
          })
          .catch(err => {
            stmt.finalize();
            res.status(500).json({ error: '保存附件失败' });
          });
      } else {
        res.status(201).json({
          id: notificationId,
          message: '通知创建成功'
        });
      }
    }
  );
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

  // 导入天气服务
  const weatherService = require('./weatherService');
  const { findNearestCity } = weatherService;

  // 获取天气数据
  app.get('/api/weather', async (req, res) => {
    try {
      console.log('收到天气请求:', req.method, req.originalUrl);
      console.log('天气请求参数:', req.query);
      const { city, days } = req.query;
      const result = await weatherService.getWeatherData(city || '苏州', days);
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

  // 获取支持的城市列表
  app.get('/api/weather/cities', (req, res) => {
    res.json({
      cities: weatherService.cityCodes
    });
  });

  // 地理编码API：将经纬度转换为城市名称（本地计算版）
  app.get('/api/geocode', (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: '缺少经纬度参数' });
    }
    
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('经纬度参数格式不正确');
      }
      
      // 使用本地算法查找最近的城市
      const city = findNearestCity(latitude, longitude);
      console.log(`[地理编码] 经纬度(${latitude}, ${longitude}) -> 最近城市: ${city}`);
      
      res.json({ city: city });
    } catch (error) {
      console.error('地理编码错误:', error);
      res.status(500).json({
        error: `无法获取城市信息: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // 设置测试数据
  app.post('/api/set-test-data', (req, res) => {
    db.run('DELETE FROM notifications', () => {
      const notifications = [
      ];
      
      const stmt = db.prepare(
        'INSERT INTO notifications (title, content, priority) VALUES (?, ?, ?)'
      );
      
      notifications.forEach(noti => {
        stmt.run(noti.title, noti.content, noti.priority, function(err) {
          if (err) return;
          
          noti.attachments.forEach((file, index) => {
            const fileType = file.endsWith('.mp4') ? 'video' : 
                             file.endsWith('.mp3') ? 'audio' :
                             file.endsWith('.pdf') ? 'document' : 'image';
            
            db.run(
              'INSERT INTO attachments (notification_id, type, path, original_name) VALUES (?, ?, ?, ?)',
              [this.lastID, fileType, `${file}`, file]
            );
          });
        });
      });
      
      stmt.finalize(() => {
        res.json({ message: '测试数据已添加' });
      });
    });
  });
};