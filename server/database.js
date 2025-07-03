const sqlite3 = require('sqlite3').verbose();

// 数据库初始化
const db = new sqlite3.Database('./notifications.db', (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      FOREIGN KEY(notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;