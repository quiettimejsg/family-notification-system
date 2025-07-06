import { translations } from './i18n.js';
import { langState } from './i18n.js';
import { renderNotifications } from './notificationRenderer.js';
import { setCurrentPage } from './notificationModule.js';
import { currentPage, itemsPerPage } from './notificationModule.js';

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
    setCurrentPage(page); // 使用setter更新页码
    
    renderNotifications(currentPageNotifications, totalPages, currentPage);
  } catch (error) {
    console.error('加载通知错误:', error);
    const container = document.getElementById('notificationsContainer');
    if (container) {
      container.innerHTML = `<div class="error">${translations['load-error'][langState.current] || 'Failed to load notifications'}</div>`;
    }
  }
}