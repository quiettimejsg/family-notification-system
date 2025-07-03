[中文](#zh) * [English](#en)
<a id="zh"></a>
# 家庭通知系统（Family Notification System）

## 项目简介
家庭通知系统是一个用于家庭内部信息传递的轻量级Web应用，支持多语言切换、文件附件上传、通知优先级分类、天气信息显示等功能，帮助家庭成员高效共享重要信息。

## 功能特性
- **多语言支持**：支持中英文切换（通过顶部语言按钮）
- **通知优先级**：可设置紧急/迫切/一般三级优先级（不同颜色标识）
- **文件附件**：支持上传图片、文档、音视频等多种格式文件
- **实时刷新**：通过刷新按钮实时加载最新通知
- **响应式布局**：适配不同屏幕尺寸（PC/平板/手机）
- **天气信息**：显示当前城市天气状况及温度
- **城市选择**：支持搜索式城市选择及定位功能

## 技术栈
- 前端：HTML5/CSS3/JavaScript（ES6+）、Material Icons图标库
- 后端：Node.js（Express框架）、SQLite数据库
- 依赖管理：npm

## 安装与运行
### 前置条件
- Node.js（v14+）
- npm（随Node.js自动安装）

### 步骤
1. 克隆项目到本地
   ```bash
   git clone https://github.com/your-username/family-notification-system.git
   ```
2. 安装依赖（根目录执行）
   ```bash
   npm install
   ```
3. 启动服务
   ```bash
   npm start
   ```
4. 访问前端
   打开浏览器访问 `http://localhost:3000`

## 使用说明
### 添加通知
1. 填写标题和内容
2. 选择通知优先级（默认一般）
3. 点击「上传文件」添加附件（可选）
4. 点击「提交」发布通知

### 切换语言
点击顶部「A/文」按钮切换中英文界面

### 刷新通知
点击顶部刷新图标（↻）加载最新通知列表

### 查看天气
1. 点击顶部天气图标或城市名称打开城市选择器
2. 在搜索框输入城市名称或从列表中选择
3. 选择后系统将显示该城市的实时天气信息

## 配置说明
- 数据库配置：修改 `server/database.js` 调整SQLite连接参数
- 上传路径：默认存储在 `server/uploads` 目录（可修改 `server/routes.js` 中的 `uploadPath` 变量）
- 多语言文本：修改 `public/i18n.js` 中的 `translations` 对象扩展语言支持

## 贡献指南
1. 提交Issue描述功能需求或Bug
2. Fork项目并创建特性分支（如 `feature/new-feature`）
3. 提交Pull Request并关联对应Issue

## 许可证
AGPL-3.0 License
Copyright (c) 2025 quiettimejsg

---
<a id="en"></a>
# Family Notification System

## Project Introduction
Family Notification System is a lightweight web application for internal family communication, supporting multi-language switching, file attachment uploads, notification priority classification, weather information display, and other features to help family members efficiently share important information.

## Features
- **Multi-language Support**: Supports Chinese/English switching (via top language button)
- **Notification Priority**: Three levels of priority (urgent/important/normal) with different color indicators
- **File Attachments**: Supports uploading images, documents, audio, video and other formats
- **Real-time Refresh**: Loads latest notifications via refresh button
- **Responsive Design**: Adapts to different screen sizes (PC/tablet/mobile)
- **Weather Information**: Displays current city weather conditions and temperature
- **City Selection**: Supports searchable city selection and location function

## Technology Stack
- Frontend: HTML5/CSS3/JavaScript (ES6+), Material Icons
- Backend: Node.js (Express framework), SQLite database
- Dependency Management: npm

## Installation and Running
### Prerequisites
- Node.js (v14+)
- npm (automatically installed with Node.js)

### Steps
1. Clone the project to local
   ```bash
   git clone https://github.com/your-username/family-notification-system.git
   ```
2. Install dependencies (run in root directory)
   ```bash
   npm install
   ```
3. Start the service
   ```bash
   npm start
   ```
4. Access the frontend
   Open browser and visit `http://localhost:3000`

## Usage Instructions
### Adding Notifications
1. Fill in title and content
2. Select notification priority (default: normal)
3. Click "Upload File" to add attachments (optional)
4. Click "Submit" to publish notification

### Switching Languages
Click the top "A/文" button to switch between Chinese/English interfaces

### Refreshing Notifications
Click the top refresh icon (↻) to load the latest notification list

### Viewing Weather
1. Click the top weather icon or city name to open the city selector
2. Enter city name in the search box or select from the list
3. After selection, the system will display real-time weather information for that city

## Configuration Instructions
- Database Configuration: Modify `server/database.js` to adjust SQLite connection parameters
- Upload Path: Default storage in `server/uploads` directory (can modify `uploadPath` variable in `server/routes.js`)
- Multi-language Text: Modify `translations` object in `public/i18n.js` to extend language support

## Contribution Guidelines
1. Submit an Issue describing feature requests or bugs
2. Fork the project and create a feature branch (e.g., `feature/new-feature`)
3. Submit a Pull Request and link to the corresponding Issue

## License
AGPL-3.0 License
Copyright (c) 2025 quiettimejsg
