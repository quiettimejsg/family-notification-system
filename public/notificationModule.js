import { translations } from './i18n.js';
import { resetSelectedFiles } from './upload.js';
import { langState } from './i18n.js';


let addRecordModal;
let addRecordForm;
let priorityBtns;

// 初始化通知模块
export function initNotifications() {
  // 获取DOM元素
  addRecordModal = document.getElementById('add-record-modal');
  addRecordForm = document.getElementById('add-record-form');
  priorityBtns = document.querySelectorAll('.priority-btn');

  // 绑定事件
  bindEvents();

  // 初始加载通知
  loadNotifications();

  // 监听语言变化事件
  window.addEventListener('languagechange', () => {
    loadNotifications();
  });
}

// 绑定事件处理函数
function bindEvents() {
  if (addRecordForm) {
    addRecordForm.addEventListener('submit', handleFormSubmit);
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
    e.preventDefault();
    const title = document.getElementById('record-title')?.value;
  const content = document.getElementById('record-content')?.value;
  const priority = document.querySelector('.priority-btn.active')?.dataset.priority || 'low';

  // 允许空标题和内容
  // if (!title || !content) {
  //   showStatus(translations['form-error'][langState.current], 'error');
  //   return;
  // }

  // 创建FormData对象
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('priority', priority);

  // 添加所有选中的文件
  console.log('提交时的文件列表:', window.selectedFiles);
    console.log('提交时的文件数量:', window.selectedFiles.length);
    window.selectedFiles.forEach((file, index) => {
      console.log(`提交的文件 ${index + 1}:`, file.name, file.type, file.size);
    });
  window.selectedFiles.forEach((file, index) => {
    console.log(`添加文件 ${index + 1}:`, file.name, file.size);
    formData.append('files', file);
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
          loadNotifications(); // 刷新通知列表
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

// 加载通知列表
export async function loadNotifications() {
  try {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    container.innerHTML = `<div class="loading-text">${translations['loading'][langState.current] || 'Loading...'}</div>`;

    const response = await fetch('/api/notifications');
    if (!response.ok) throw new Error(translations['network-error'][langState.current]);

    const notifications = await response.json();
    renderNotifications(notifications);
  } catch (error) {
    console.error('加载通知错误:', error);
    const container = document.getElementById('notificationsContainer');
    if (container) {
      container.innerHTML = `<div class="error">${translations['load-error'][langState.current] || 'Failed to load notifications'}</div>`;
    }
  }
}

// 渲染通知列表
function renderNotifications(notifications) {
  const container = document.getElementById('notificationsContainer');
  if (!container) return;

  if (!notifications || notifications.length === 0) {
    container.innerHTML = `<div class="empty">${translations['no-notifications'][langState.current] || 'No notifications yet'}</div>`;
    return;
  }

  let html = '';

  notifications.forEach(noti => {
    let priorityLabel = '';
    let priorityClass = '';

    switch (noti.priority) {
      case 'high':
        priorityLabel = translations['priority-high'][langState.current] || 'High Priority';
        priorityClass = 'priority-high';
        break;
      case 'medium':
        priorityLabel = translations['priority-medium'][langState.current] || 'Medium Priority';
        priorityClass = 'priority-medium';
        break;
      default:
        priorityLabel = translations['priority-low'][langState.current] || 'Low Priority';
        priorityClass = 'priority-low';
    }

    // 格式化日期
    const date = new Date(noti.created_at + 'Z').toLocaleString(langState.current, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // 渲染附件
    let filesHtml = '';
    if (noti.attachments && noti.attachments.length > 0) {
      filesHtml += '<div class="notification-files">';
      noti.attachments.forEach((att, index) => {
        const fileType = att.original_name.split('.').pop().toUpperCase();
        const iconMap = {
          'image': 'image',
          'video': 'play_circle_filled',
          'audio': 'music_note',
          'document': 'description'
        };

        filesHtml += `
          <div class="file-preview notification-file" 
               data-path="${att.path}" 
               data-type="${att.type}" 
               data-original-name="${att.original_name}" 
               data-attachments='${JSON.stringify(noti.attachments)}' 
               onclick="handleFileClick(JSON.parse(this.dataset.attachments), ${index})">
            ${att.type === 'image' ? `<img src="/uploads/${att.path}" alt="${att.original_name}">` : `<div class="icon"><span class="material-icons">${iconMap[att.type] || 'description'}</span></div>`}
            <div class="file-type">${fileType}</div>
          </div>
        `;
      });
      filesHtml += '</div>';
    }

    html += `
      <div class="notification-item ${priorityClass}">
        <div class="notification-header">
          <div class="notification-title">${noti.title}</div>
          <div class="notification-priority ${priorityClass}">${priorityLabel}</div>
        </div>
        <div class="notification-content">${noti.content}</div>
        ${filesHtml}
        <div class="notification-meta">
          <div class="time">${date}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 显示状态信息
function showStatus(message, type) {
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