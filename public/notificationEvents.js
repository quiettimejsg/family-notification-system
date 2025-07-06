import { translations } from './i18n.js';
import { resetSelectedFiles, selectedFiles } from './upload.js';
import { langState } from './i18n.js';
import { loadNotifications } from './notificationApi.js';

let addRecordModal;
let addRecordForm;
let priorityBtns;

// 绑定事件处理函数
export function bindEvents() {
  addRecordModal = document.getElementById('add-record-modal');
  addRecordForm = document.getElementById('add-record-form');
  priorityBtns = document.querySelectorAll('.priority-btn');

  if (addRecordForm) {
    addRecordForm.addEventListener('submit', handleFormSubmit);
    console.log('表单提交事件监听器已成功绑定');
  } else {
    console.error('addRecordForm元素未找到，无法绑定提交事件监听器');
  }

  // 优先级按钮事件
  priorityBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      priorityBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // 默认选中低优先级
  document.querySelector('.low-priority-btn')?.classList.add('active');

  // 刷新按钮事件
  document.getElementById('refreshBtn')?.addEventListener('click', loadNotifications);
}

// 表单提交处理
async function handleFormSubmit(e) {
  console.log('handleFormSubmit called, event received:', e);
  e.preventDefault();
  // 显式移除必填验证
  const titleInput = document.getElementById('record-title');
  const contentInput = document.getElementById('record-content');
  if (titleInput) titleInput.required = false;
  if (contentInput) contentInput.required = false;
  console.log('已移除标题和内容输入框的required属性');
  console.log('表单提交事件触发，handleFormSubmit开始执行');
  console.log('selectedFiles数量:', selectedFiles.length);
  console.log('selectedFiles内容:', selectedFiles);
  const title = document.getElementById('record-title')?.value;
  const content = document.getElementById('record-content')?.value;
  const priority = document.querySelector('.priority-btn.active')?.dataset.priority || 'low';

  // 创建FormData对象
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('priority', priority);
  console.log('FormData内容:');
  formData.forEach((value, key) => {
    if (key === 'files') {
      console.log(`${key}:`, value.name);
    } else {
      console.log(`${key}:`, value);
    }
  });

  // 添加所有选中的文件
  console.log('提交时的文件列表:', selectedFiles);
  console.log('提交时的文件数量:', selectedFiles.length);
  selectedFiles.forEach((file, index) => {
    console.log(`提交的文件 ${index + 1}:`, file.name, file.type);
  });
  selectedFiles.forEach((file, index) => {
    console.log(`添加文件 ${index + 1}:`, file.name);
    formData.append('files[]', file);
  });

  try {
    // 创建进度条元素
    const progressContainer = document.createElement('div');
    progressContainer.className = 'upload-progress-container';
    progressContainer.innerHTML = `
      <div class="progress-bar"></div>
      <div class="progress-text">0%</div>
    `;
    document.body.appendChild(progressContainer);
    const progressBar = progressContainer.querySelector('.progress-bar');
    const progressText = progressContainer.querySelector('.progress-text');

    // 使用XMLHttpRequest实现进度监听
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/notifications');
    xhr.withCredentials = true;

    // 上传进度监听
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
      }
    });

    // 完成处理
    xhr.addEventListener('load', () => {
      document.body.removeChild(progressContainer);
      if (xhr.status >= 200 && xhr.status < 300) {
        showStatus(translations['success'][langState.current], 'success');
        addRecordModal.style.display = 'none';
        addRecordForm.reset();
        resetSelectedFiles();
        priorityBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('.low-priority-btn')?.classList.add('active');
        loadNotifications(1); // 刷新通知列表并返回第一页
      } else {
        let errorMessage = translations['error-adding-notification'][langState.current];
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = xhr.responseText.substring(0, 100);
        }
        throw new Error(errorMessage);
      }
    });

    // 错误处理
    xhr.addEventListener('error', () => {
      document.body.removeChild(progressContainer);
      throw new Error(translations['network-error'][langState.current]);
    });

    xhr.send(formData);
  } catch (error) {
    showStatus(error.message || translations['error'][langState.current], 'error');
    console.error('Error adding notification:', error);
  }
}

// 显示状态信息
export function showStatus(message, type) {
  const statusEl = document.getElementById('formStatus');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'form-status';
  statusEl.classList.add(type);

  if (type !== 'loading') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}