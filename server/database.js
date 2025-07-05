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
    };
  });
});

module.exports = db;

  // 在notifications表创建完成后再创建attachments表
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      uploaded_at DATETIME,
      FOREIGN KEY(notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('创建attachments表错误:', err);
      return;
    }
    console.log('attachments表创建成功或已存在');

    // 检查并添加缺失的列（用于现有数据库）
    db.all(`PRAGMA table_info(attachments)`, (err, columns) => {
    if (err) {
      console.error('获取附件表结构错误:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    
    // 添加uploaded_at列（如果不存在）
    if (!columnNames.includes('uploaded_at')) {
      // SQLite不允许添加带非常量默认值的列，分两步处理
      db.run(`ALTER TABLE attachments ADD COLUMN uploaded_at DATETIME`, (err) => {
        if (err) {
          console.error('添加uploaded_at列错误:', err);
          return;
        }
        // 设置现有行的默认值
        db.run(`UPDATE attachments SET uploaded_at = CURRENT_TIMESTAMP WHERE uploaded_at IS NULL`, (err) => {
          if (err) console.error('更新uploaded_at默认值错误:', err);
          else console.log('成功添加并初始化uploaded_at列');
        });
      });
    }
  });
  });

module.exports = db;