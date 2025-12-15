@echo off
chcp 65001
echo ==========================================
echo       正在初始化“图片格式转换工厂Pro”项目结构...
echo ==========================================

REM 创建文件夹
if not exist "src" mkdir src

REM 创建根目录核心文件
type nul > main.js
type nul > preload.js
type nul > vite.config.js
type nul > index.html
type nul > .gitignore

REM 创建源码目录文件
type nul > src\main.jsx
type nul > src\App.jsx
type nul > src\index.css

echo.
echo ==========================================
echo       结构生成完毕！
echo ==========================================
echo.
echo 请回到 VS Code，您会发现所有文件都已就位。
echo 接下来请依次填入代码。
echo.
pause