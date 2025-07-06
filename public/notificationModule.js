import { translations } from './i18n.js';
import { resetSelectedFiles, selectedFiles } from './upload.js';
import { langState } from './i18n.js';
import { bindEvents } from './notificationEvents.js';
import { loadNotifications } from './notificationApi.js';
import { renderNotifications } from './notificationRenderer.js';


let addRecordModal;
let addRecordForm;
let priorityBtns;
let currentPage = 1;
const itemsPerPage = 3; // 每页显示的通知数量

export { currentPage, itemsPerPage };

export function setCurrentPage(page) {
  currentPage = page;
}

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

