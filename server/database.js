const sqlite3 = require('sqlite3').verbose();

// 数据库初始化
const db = new sqlite3.Database('./notifications.db', (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('成功连接到数据库');
  
  // 检查是否需要更新notifications表结构
    db.all(`PRAGMA table_info(notifications)`, (err, columns) => {
      if (err) {
        console.error('检查表结构错误:', err);
        return;
      }
      
      // 如果表不存在，则直接创建
      if (!columns.length) {
        db.run(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            priority TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        return;
      }
      
      // 检查title和content字段是否允许为NULL
      const titleColumn = columns.find(col => col.name === 'title');
      const contentColumn = columns.find(col => col.name === 'content');
      const needsMigration = 
        (titleColumn && titleColumn.notnull) || 
        (contentColumn && contentColumn.notnull);
      
      if (needsMigration) {
        // 通过创建新表迁移数据
        db.run(`
          CREATE TABLE IF NOT EXISTS notifications_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            priority TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('创建新表错误:', err);
            return;
          }
          
          db.run(`INSERT INTO notifications_new SELECT * FROM notifications`, (err) => {
          if (err) {
            console.error('迁移数据错误:', err);
            // 回滚：删除新表
            db.run(`DROP TABLE IF EXISTS notifications_new`);
            return;
          }
          
          db.run(`DROP TABLE notifications`, (err) => {
            if (err) {
              console.error('删除旧表错误:', err);
              // 回滚：删除新表
              db.run(`DROP TABLE IF EXISTS notifications_new`);
              return;
            }
            
            db.run(`ALTER TABLE notifications_new RENAME TO notifications`, (err) => {
              if (err) {
                console.error('重命名表错误:', err);
                // 回滚：重新创建旧表并从新表恢复数据
                db.run(`CREATE TABLE IF NOT EXISTS notifications AS SELECT * FROM notifications_new`);
                db.run(`DROP TABLE IF EXISTS notifications_new`);
                return;
              }
              console.log('通知表结构已更新，允许标题和内容为空');
            });
          });
        });
        });
      }
    });
  
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    )
  `);

  // 添加缺失的列（用于现有数据库）
  db.run(`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS size INTEGER NOT NULL DEFAULT 0`);
  db.run(`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  
});

module.exports = db;