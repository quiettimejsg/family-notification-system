import { translations } from './i18n.js';
import { langState } from './i18n.js';
import { resetSelectedFiles, renderFileList } from './upload.js';

let addRecordModal;

// 初始化UI模块
export function initUI() {
  // 获取DOM元素
  addRecordModal = document.getElementById('add-record-modal');

  // 绑定UI事件
  bindUIEvents();

  // 显示当前日期
  displayCurrentDate();

  // 监听语言变化事件更新日期
  window.addEventListener('languagechange', displayCurrentDate);

  // 初始化时间显示并设置更新间隔
  updateCurrentTime();
  setInterval(updateCurrentTime, 10);
}

// 绑定UI事件处理函数
function bindUIEvents() {
  // 添加记录按钮事件
  document.getElementById('add-record-btn')?.addEventListener('click', () => {
    addRecordModal.style.display = 'flex';
    resetSelectedFiles();
  });

  // 关闭模态框事件
  document.getElementById('close-modal')?.addEventListener('click', () => {
    addRecordModal.style.display = 'none';
  });

  // 点击模态框外部关闭
  addRecordModal?.addEventListener('click', (e) => {
    if (e.target === addRecordModal) {
      addRecordModal.style.display = 'none';
    }
  });

  // 表单重置事件
  document.getElementById('add-record-form')?.addEventListener('reset', () => {
    setTimeout(() => {
      resetSelectedFiles();
      const filePreviewContainer = document.getElementById('file-preview-container');
      if (filePreviewContainer) filePreviewContainer.innerHTML = '';
    }, 0);
  });
}

// 显示当前日期
export function displayCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (!dateElement) return;

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateString = new Date().toLocaleDateString(langState.current, options);
  dateElement.textContent = dateString;
}

// 显示当前时间（带毫秒）
function updateCurrentTime() {
  const timeElement = document.getElementById('system-current-time');
  if (!timeElement) return;

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const timeString = new Date().toLocaleTimeString(langState.current, options);
  timeElement.textContent = timeString;
}