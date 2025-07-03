console.log('[客户端] ====== appInitializer.js 开始加载 ======');
console.log('[客户端] 加载时间:', new Date().toISOString());

// 导入依赖模块
import { translations, updateLanguage } from './i18n.js';
import { handleFileClick } from './modal.js';
import { selectedFiles, resetSelectedFiles } from './upload.js';
import { langState } from './i18n.js';

// 全局暴露必要方法
window.handleFileClick = handleFileClick;

// 模块级变量
let currentCity;
let addRecordModal;

// 应用初始化函数
export function initApp() {
  document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言
    updateLanguage(langState.current);
    addRecordModal = document.getElementById('add-record-modal');

    // 初始化语言切换按钮
    initLanguageSwitcher();

    // 初始化核心功能
    initCoreFeatures();
  });
}

// 初始化语言切换功能
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const newLang = langState.current === 'zh' ? 'en' : 'zh';
      localStorage.setItem('preferredLang', newLang);
      updateLanguage(newLang);
      // 刷新需要翻译的内容
      window.loadNotifications?.();
      window.displayCurrentDate?.();
      window.fetchWeather?.(currentCity);
      // 更新按钮状态
      langButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      this.textContent = newLang === 'zh' ? 'A/文' : '文/A';
    });
  });
}

// 初始化核心功能模块
function initCoreFeatures() {
  // 延迟加载其他功能模块以提高初始加载速度
  Promise.all([
    import('./notificationModule.js'),
    import('./weatherModule.js'),
    import('./uiModule.js')
  ]).then(([notificationModule, weatherModule, uiModule]) => {
    // 初始化通知模块
    notificationModule.initNotifications();
    
    // 初始化天气模块
    weatherModule.initWeather();
    
    // 初始化UI模块
    uiModule.initUI();
  }).catch(error => {
    console.error('核心功能模块加载失败:', error);
  });
}