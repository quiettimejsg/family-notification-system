import { translations } from './i18n.js';
import { langState } from './i18n.js';
import { loadNotifications } from './notificationApi.js';


// 渲染通知列表
export function renderNotifications(notifications, totalPages, currentPage) {
  const container = document.getElementById('notificationsContainer');
  if (!container) return;

  if (!notifications || notifications.length === 0) {
    container.innerHTML = `<div class="empty">${translations['no-notifications'][langState.current] || 'No notifications yet'}</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

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

    // 创建通知项容器
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${priorityClass}`;

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
            ${att.type === 'image' ? `<img src="/uploads/${att.path}" alt="${att.original_name}" loading="lazy">` : `<div class="icon"><span class="material-icons">${iconMap[att.type] || 'description'}</span></div>`}
            <div class="file-type">${fileType}</div>
          </div>
        `;
      });
      filesHtml += '</div>';
    }

    // 设置通知项内容
    notificationItem.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">${noti.title}</div>
        <div class="notification-priority ${priorityClass}">${priorityLabel}</div>
      </div>
      <div class="notification-content">${noti.content}</div>
      ${filesHtml}

      <div class="notification-meta">
        <div class="time">${date}</div>
      </div>
    `;

    // 添加到文档片段
    fragment.appendChild(notificationItem);
  });

  // 清空容器并添加所有通知项
  container.innerHTML = '';
  container.appendChild(fragment);

  // 移除旧的分页控件
  const oldPagination = document.querySelector('.pagination');
  if (oldPagination) oldPagination.remove();
  
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
          const page = parseInt(e.currentTarget.dataset.page);
          if (page >= 1 && page <= totalPages) {
            loadNotifications(page);
          }
        });
    });
  }
}