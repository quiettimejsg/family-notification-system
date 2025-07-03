@echo off
cd /d %~dp0
set NODE_ENV=production

echo ==============================================
echo          家庭通知系统 - 生产环境启动脚本
 echo ==============================================

echo [1/3] 验证Node.js环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js环境，请先安装Node.js
    pause
    exit /b 1
)

echo [2/3] 设置生产环境变量...
echo NODE_ENV=%NODE_ENV%

echo [3/3] 启动应用服务...
node server/index.js

if %errorlevel% neq 0 (
    echo ==============================================
    echo 启动失败！请检查以上错误信息
    echo ==============================================
    pause
    exit /b %errorlevel%
)

pause