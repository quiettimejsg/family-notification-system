import { translations } from './i18n.js';
import { resetSelectedFiles, selectedFiles } from './upload.js';
import { langState } from './i18n.js';


let addRecordModal;
let addRecordForm;
let priorityBtns;
let currentPage = 1;
const itemsPerPage = 1; // 每页显示的通知数量

// 初始化通知模块
export function initNotifications() {
  // 获取DOM元素
  addRecordModal = document.getElementById('add-record-modal');
  addRecordForm = document.getElementById('add-record-form');
  priorityBtns = document.querySelectorAll('.priority-btn');

  // 绑定事件
  bindEvents();

  // 初始加载通知
  loadNotifications(1);

  // 监听语言变化事件
  window.addEventListener('languagechange', () => {
    loadNotifications();
  });
}

// 绑定事件处理函数
function bindEvents() {
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

// 加载通知列表
export async function loadNotifications(page = currentPage) {
  try {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    container.innerHTML = `<div class="loading-text">${translations['loading'][langState.current] || 'Loading...'}</div>`;
    // 移除旧的分页控件
    const oldPagination = document.querySelector('.pagination');
    if (oldPagination) oldPagination.remove();

    // 获取所有通知数据进行前端分页
    const response = await fetch('/api/notifications');
    if (!response.ok) throw new Error(translations['network-error'][langState.current]);

    const allNotifications = await response.json();
    const totalNotifications = allNotifications.length;
    const totalPages = Math.ceil(totalNotifications / itemsPerPage);
    
    // 计算当前页数据的起始和结束索引
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageNotifications = allNotifications.slice(startIndex, endIndex);
    
    currentPage = page; // 更新当前页码
    renderNotifications(currentPageNotifications, totalPages);
  } catch (error) {
    console.error('加载通知错误:', error);
    const container = document.getElementById('notificationsContainer');
    if (container) {
      container.innerHTML = `<div class="error">${translations['load-error'][langState.current] || 'Failed to load notifications'}</div>`;
    }
  }
}

// 渲染通知列表
function renderNotifications(notifications, totalPages) {
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

  // 生成分页控件
  if (totalPages > 1) {
    const paginationHtml = `
      <div class="pagination">
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">
          ${translations['pagination-prev']?.[langState.current] || '<'}
        </button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
          <button class="page-btn ${currentPage === page ? 'active' : ''}" data-page="${page}">${page}</button>
        `).join('')}
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">
          ${translations['pagination-next']?.[langState.current] || '>'}
        </button>
      </div>
    `;
    container.insertAdjacentHTML('afterend', paginationHtml);

    // 绑定分页按钮事件
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        if (page >= 1 && page <= totalPages) {
          loadNotifications(page);
        }
      });
    });
  }
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