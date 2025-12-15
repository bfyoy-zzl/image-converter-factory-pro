图片格式转换工厂 Pro (Image Converter Factory Pro)

一个基于 Electron + React 的现代化、高性能图片格式转换工具。支持批量处理、拖拽操作、多主题切换以及智能输出路径管理。

✨ 功能特性

多格式互转：支持 JPG, PNG, WEBP, BMP, TIFF 等常见格式。

现代 UI：内置 3 套精美主题（扁平极简风、新拟物风、未来科技风），界面设计时尚现代，支持拖拽交互。

智能交互：

支持文件/文件夹混合拖拽载入。

智能识别文件列表，自动去重。

无损复制：同格式且 100% 质量时直接流复制，速度极快且画质无损。

灵活输出：

支持手动指定统一输出目录。

支持智能自动目录（文件旁创建 已转换 文件夹）。

高性能：底层使用 sharp 库，处理速度极快。

🚀 快速开始 (如何运行源码)

如果你从 GitHub 下载了本项目的源码，请按照以下步骤配置环境。

1. 环境准备

确保你的电脑上已经安装了 Node.js (推荐 LTS 版本 v18+)。

2. 安装依赖

打开终端（Terminal）进入项目目录，运行以下命令安装所需的库（React, Electron, Sharp 等）：

# 设置国内镜像源 (可选，推荐国内用户执行，防止下载失败)
npm config set registry [https://registry.npmmirror.com](https://registry.npmmirror.com)

# 安装依赖
npm install


3. 启动开发模式

依赖安装完成后，运行以下命令启动软件（开发预览模式）：

npm start


📦 如何打包 (生成 .exe)

如果你想生成可以在 Windows 上安装或直接运行的 .exe 文件：

编译前端资源：

npm run build


(这一步会生成 dist 文件夹，包含编译后的 index.html 和 js/css)

打包应用程序：

npm run dist


获取结果：
打包完成后，请查看项目目录下的 release 文件夹：

ImageConverterFactoryPro-Setup-2.1.1.exe: 安装包版本。

ImageConverterFactoryPro-Portable-2.1.1.exe: 便捷免安装版。


🛠️ 技术栈

Core: Electron

UI: React 18 + Tailwind CSS

Build Tool: Vite

Image Processing: Sharp

Packaging: Electron Builder

👤 作者

伯符yoy