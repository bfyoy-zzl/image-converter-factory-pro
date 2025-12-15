const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    center: true,
    title: "图片格式转换工厂 Pro V2.1.1 Beta",
    icon: path.join(__dirname, 'icon.ico'),
    frame: false, // 【关键修改】隐藏原生标题栏和边框
    titleBarStyle: 'hidden', // 隐藏标题文字但保留红绿灯(Mac)，Windows下通常配合 frame: false
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false 
    },
    resizable: true
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error("❌ 错误：找不到 dist/index.html！请先运行 npm run build");
  }

  mainWindow.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
//              窗口控制逻辑 (IPC)
// ==========================================

ipcMain.on('window:minimize', () => mainWindow.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow.close());

// ==========================================
//              核心逻辑处理 (IPC)
// ==========================================

// 1. 打开文件/文件夹选择框
ipcMain.handle('dialog:open', async (_, type) => {
  const properties = type === 'folder' ? ['openDirectory'] : ['openFile', 'multiSelections'];
  const filters = type === 'file' ? [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp', 'tiff', 'bmp'] }] : [];
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: properties,
    filters: filters,
    title: type === 'folder' ? '选择文件夹' : '选择图片'
  });
  return result;
});

// 2. 读取文件夹内容
ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const files = await fs.promises.readdir(dirPath);
    const validExtensions = ['.jpg', '.png', '.jpeg', '.webp', '.tiff', '.bmp'];
    
    return files
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => path.join(dirPath, file));
  } catch (error) {
    console.error("读取文件夹失败:", error);
    return [];
  }
});

// 3. 图片转换核心逻辑
ipcMain.handle('image:convert', async (event, { filePath, rootPath, inputMode, targetFormat, quality, manualOutputPath }) => {
  try {
    const fileName = path.basename(filePath, path.extname(filePath));
    let outputDir;

    if (manualOutputPath) {
      if (inputMode === 'folder') {
        const folderName = path.basename(rootPath);
        outputDir = path.join(manualOutputPath, `${folderName}-已转换`);
      } else {
        outputDir = path.join(manualOutputPath, "已转换");
      }
    } else {
      if (inputMode === 'folder') {
        const parentDir = path.dirname(rootPath);
        const folderName = path.basename(rootPath);
        outputDir = path.join(parentDir, `${folderName}-已转换`);
      } else {
        outputDir = path.join(rootPath, "已转换");
      }
    }

    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true });
    }

    let outputPath = path.join(outputDir, `${fileName}.${targetFormat.toLowerCase()}`);

    if (path.resolve(filePath) === path.resolve(outputPath)) {
        outputPath = path.join(outputDir, `${fileName}_new.${targetFormat.toLowerCase()}`);
    }

    const image = sharp(filePath);
    
    const currentExt = path.extname(filePath).slice(1).toLowerCase();
    const targetExt = targetFormat.toLowerCase();
    const isJpeg = ['jpg', 'jpeg'].includes(currentExt) && ['jpg', 'jpeg'].includes(targetExt);
    const isSame = currentExt === targetExt || isJpeg;

    if (isSame && parseInt(quality) === 100) {
       await fs.promises.copyFile(filePath, outputPath);
       return { success: true, path: outputDir };
    }

    const formatConfig = {};
    if (targetExt === 'jpg' || targetExt === 'jpeg') {
      formatConfig.quality = parseInt(quality);
      formatConfig.mozjpeg = true; 
    } else if (targetExt === 'webp') {
      formatConfig.quality = parseInt(quality);
    } else if (targetExt === 'png') {
      formatConfig.quality = parseInt(quality); 
    }

    if (['jpg', 'jpeg', 'bmp'].includes(targetExt)) {
        image.flatten({ background: { r: 255, g: 255, b: 255 } });
    }

    await image
      .toFormat(targetExt === 'jpg' ? 'jpeg' : targetExt, formatConfig)
      .toFile(outputPath);

    return { success: true, path: outputDir };

  } catch (error) {
    console.error("转换单个文件失败:", error);
    return { success: false, error: error.message };
  }
});