import { initApp } from './appInitializer.js';
initApp();

// 所有功能已拆分至专用模块
// 应用初始化由appInitializer.js处理

  // 搜索过滤
  // 点击外部关闭下拉面板功能已迁移至uiModule.js

// 模态框关闭逻辑已迁移至modal.js

// 文件选择事件监听已迁移至upload.js

// 表单提交处理已迁移至notificationModule.js

// 通知加载和渲染逻辑已迁移至notificationModule.js

// 所有功能已拆分至专用模块
// 应用初始化由appInitializer.js处理
// 天气功能由weatherModule.js处理
// UI功能由uiModule.js处理
// 通知功能由notificationModule.js处理
// 文件上传功能由upload.js处理
// 模态框功能由modal.js处理
// 语言国际化由i18n.js处理