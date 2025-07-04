import { translations } from './i18n.js';
import { langState } from './i18n.js';
import { resetSelectedFiles } from './upload.js';

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