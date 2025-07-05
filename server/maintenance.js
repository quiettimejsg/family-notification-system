const db = require('./database');

// 定义检查时间点（北京时间）
const CHECK_TIMES = ['00:00', '00:30', '01:00'];
const MAX_CHECK_INTERVAL_HOURS = 1;

// 获取当前北京时间
function getBeijingTime() {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + 8 * 3600000); // UTC+8
}

// 处理UTF-8乱码和16进制字符串转换
function convertHexFileName(encodedString) {
  try {
    // 尝试修复UTF-8编码错误（常见于数据库存储不当的中文）
    const utf8Fixed = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      new Uint8Array(encodedString.split('').map(c => c.charCodeAt(0)))
    );
    console.log('UTF-8修复前:', encodedString);
    console.log('UTF-8修复后:', utf8Fixed);
    encodedString = utf8Fixed;
  } catch (e) {
    console.log('UTF-8修复失败，原始字符串:', encodedString);
    // UTF-8修复失败，继续尝试16进制转换
  }

  try {
    // 仅匹配较长的16进制序列（至少4个字符），避免误转换短序列
    return encodedString.replace(/([0-9a-fA-F]{4,})/g, (match) => {
      try {
        // 确保匹配长度为偶数
        const evenMatch = match.length % 2 === 0 ? match : match.slice(0, -1);
        const converted = decodeURIComponent('%' + evenMatch.match(/.{2}/g).join('%'));
        console.log('转换前:', evenMatch);
        console.log('转换后:', converted);
        // 检查转换结果是否包含中日文字符
        if (/[一-鿿ぁ-んァ-ン]/u.test(converted)) {
          console.log('转换成功，原始匹配:', match);
          return converted;
        } else {
          console.log('转换失败，原始匹配:', match);
          return match;
        }
      } catch (e) {
        console.log('转换异常，原始匹配:', match);
        return match;
      }
    });
  } catch (e) {
    return encodedString;
  }
}

// 计算下次执行时间
function calculateNextRunTime(targetTime) {
  const [hours, minutes] = targetTime.split(':').map(Number);
  const now = getBeijingTime();
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}

// 安排每日任务
function scheduleDailyTask(targetTime, task) {
  function runTask() {
    task();
    const nextRun = calculateNextRunTime(targetTime);
    const delay = nextRun - getBeijingTime();
    setTimeout(runTask, delay);
  }

  const initialDelay = calculateNextRunTime(targetTime) - getBeijingTime();
  setTimeout(runTask, initialDelay);
}

// 获取上次维护记录
function getLastMaintenanceLog() {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM maintenance_log ORDER BY check_time DESC LIMIT 1',
      (err, row) => err ? reject(err) : resolve(row)
    );
  });
}

// 检查是否需要执行修复
async function checkAndRepairIfNeeded() {
  try {
    const lastLog = await getLastMaintenanceLog();
    const now = getBeijingTime();

    // 检查条件：上次检查不存在或超过72小时
    const needRepair = !lastLog || 
      (now - new Date(lastLog.check_time)) / (1000 * 60 * 60) >= MAX_CHECK_INTERVAL_HOURS;

    if (needRepair) {
      await performRepair();
    }
  } catch (error) {
    console.error('维护检查失败:', error);
  }
}

// 执行修复操作
async function performRepair() {
  const startTime = getBeijingTime();
  let totalCount = 0;
  let fixedCount = 0;
  const errors = [];

  try {
    // 获取可能需要修复的记录
    const attachments = await new Promise((resolve, reject) => {
      db.all('SELECT id, original_name FROM attachments', (err, rows) => {
        if (err) reject(err);
        resolve(rows); // 处理所有记录，由convertHexFileName函数判断是否需要修复
      });
    });

    totalCount = attachments.length;

    // 修复每条记录
    for (const attachment of attachments) {
      try {
        const decodedName = convertHexFileName(attachment.original_name);
        // 验证解码结果是否包含中文字符
        if (/[\u4e00-\u9fa5]/.test(decodedName)) {
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE attachments SET original_name = ? WHERE id = ?',
              [decodedName, attachment.id],
              err => err ? reject(err) : resolve()
            );
          });
          fixedCount++;
        }
      } catch (error) {
        errors.push({
          attachmentId: attachment.id,
          originalName: attachment.original_name,
          error: error.message
        });
      }
    }

    // 保存修复报告
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO maintenance_log (
          check_time, total_records, fixed_records, errors, error_details
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          startTime.toISOString(),
          totalCount,
          fixedCount,
          errors.length,
          JSON.stringify(errors)
        ],
        err => err ? reject(err) : resolve()
      );
    });

    console.log(`[${startTime.toLocaleString()}] 修复完成: 检查${totalCount}条，修复${fixedCount}条，错误${errors.length}条`);
  } catch (error) {
    console.error('修复过程失败:', error);
  }
}

// 初始化维护任务
function initMaintenance() {
  // 创建维护日志表（如果不存在）
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      check_time DATETIME NOT NULL,
      total_records INTEGER NOT NULL DEFAULT 0,
      fixed_records INTEGER NOT NULL DEFAULT 0,
      errors INTEGER NOT NULL DEFAULT 0,
      error_details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建维护日志表失败:', err);
    } else {
      console.log('维护日志表初始化成功');
      // 立即检查一次
      checkAndRepairIfNeeded();
      // 设置定时任务
      CHECK_TIMES.forEach(time => scheduleDailyTask(time, checkAndRepairIfNeeded));
    }
  });
}

module.exports = { initMaintenance };