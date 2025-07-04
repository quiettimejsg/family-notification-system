import { initApp } from './appInitializer.js';
initApp();

// 所有功能已拆分至专用模块
// 应用初始化由appInitializer.js处理
// 天气功能由weatherModule.js处理
// UI功能由uiModule.js处理
// 通知功能由notificationModule.js处理
// 文件上传功能由upload.js处理
// 模态框功能由modal.js处理
// 语言国际化由i18n.js处理