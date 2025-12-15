import React, { useState, useEffect, useRef } from 'react';
import { Palette, FolderOpen, RefreshCw, Upload, ChevronDown, Trash2, FileImage, Minus, Square, X } from 'lucide-react';

const THEMES = [
  { id: 'flat', name: '扁平极简风', color: '#ffffff' },
  { id: 'neumorphism', name: '新拟物风', color: '#e0e5ec' },
  { id: 'tech', name: '未来科技风', color: '#0b0c15' },
];

const App = () => {
  // --- 状态管理 ---
  const [tasks, setTasks] = useState([]);
  const [format, setFormat] = useState('JPG');
  const [quality, setQuality] = useState(95);
  const [manualOutputPath, setManualOutputPath] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('准备就绪');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // 默认主题设置为 'flat'，或从本地存储读取
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'flat');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // 切换主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // --- 窗口控制逻辑 ---
  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  // --- 文件逻辑 ---
  const addFiles = async (filePaths, type = 'file') => {
    let newTasks = [];
    for (const p of filePaths) {
      if (tasks.some(t => t.path === p)) continue;
      
      if (type === 'folder') {
        const filesInFolder = await window.electronAPI.readDir(p);
        filesInFolder.forEach(f => {
           if (!tasks.some(t => t.path === f)) newTasks.push({ path: f, type: 'folder', root: p });
        });
      } else {
        const parentDir = p.substring(0, p.lastIndexOf((window.navigator.platform.startsWith('Win') ? '\\' : '/')));
        newTasks.push({ path: p, type: 'file', root: parentDir });
      }
    }
    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
      setStatusText(`已添加 ${newTasks.length} 个文件`);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).map(f => f.path);
    const validFiles = droppedFiles.filter(p => /\.(jpg|png|jpeg|webp|bmp|tiff)$/i.test(p));
    
    if (validFiles.length > 0) {
        addFiles(validFiles, 'file');
    } else {
        for (const p of droppedFiles) {
            const files = await window.electronAPI.readDir(p);
            if (files.length > 0) {
                files.forEach(f => {
                    if (!tasks.some(t => t.path === f)) {
                        setTasks(prev => [...prev, { path: f, type: 'folder', root: p }]);
                    }
                });
            }
        }
    }
  };

  const handleSelect = async (type) => {
    const result = await window.electronAPI.openDialog(type);
    if (!result.canceled && result.filePaths.length > 0) addFiles(result.filePaths, type);
  };

  const handleSelectOutput = async () => {
    const result = await window.electronAPI.openDialog('folder');
    if (!result.canceled && result.filePaths.length > 0) setManualOutputPath(result.filePaths[0]);
  };

  const handleRemoveTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
    if (newTasks.length === 0) {
      setStatusText("列表已清空");
      setProgress(0);
    } else {
      setStatusText(`剩余 ${newTasks.length} 项`);
    }
  };

  const startConvert = async () => {
    if (tasks.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      setStatusText(`正在转换 (${i + 1}/${tasks.length}): ${task.path.split(/[\\/]/).pop()}`);
      const result = await window.electronAPI.convertImage({
        filePath: task.path, rootPath: task.root, inputMode: task.type,
        targetFormat: format, quality: quality, manualOutputPath: manualOutputPath
      });
      if (result.success) successCount++;
      setProgress(((i + 1) / tasks.length) * 100);
    }
    setIsProcessing(false);
    setStatusText(`✅ 转换完成！成功 ${successCount} 张`);
    setTimeout(() => { setStatusText("准备就绪"); setProgress(0); }, 2000);
  };

  const handleReset = () => {
    setTasks([]);
    setManualOutputPath('');
    setProgress(0);
    setStatusText("列表已重置");
  };

  // 动态样式对象
  const cardStyle = { 
    boxShadow: 'var(--shadow-card)', 
    borderWidth: 'var(--border-width)' 
  };
  const inputStyle = { 
    boxShadow: 'var(--shadow-input)', 
    borderWidth: 'var(--border-width)' 
  };

  return (
    // 【修改点 1】: 将圆角和去边框逻辑应用到最外层
    // rounded-[40px]: 整个软件的大圆角
    // border-0: 确保最外层没有描边
    <div 
      className="h-screen w-full flex flex-col p-6 font-sans bg-skin-bg text-skin-main transition-colors duration-500 overflow-hidden rounded-[40px] border-0"
      style={{ WebkitAppRegion: "drag" }}
    >
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 relative z-50 shrink-0">
        
        {/* Left: Title */}
        <div className="flex items-center gap-2 select-none">
          <h1 className="text-2xl font-extrabold tracking-tight text-skin-main">
            图片转换工厂
          </h1>
          <span className="text-2xl font-light text-skin-primary">Pro</span>
          <span className="text-xs bg-skin-primary/10 text-skin-primary border border-skin-primary/20 px-2 py-0.5 rounded ml-2 font-medium">
            v2.1.1
          </span>
        </div>

        {/* Right: Controls (no-drag 确保按钮可点击) */}
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" }}>
          
          {/* 主题切换 */}
          <div className="relative">
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-skin-card border border-skin-border hover:border-skin-primary transition-all shadow-sm active:scale-95"
              style={cardStyle}
            >
              <Palette size={18} className="text-skin-primary" />
              <span className="text-xs font-bold">{THEMES.find(t => t.id === currentTheme)?.name}</span>
              <ChevronDown size={14} className={`text-skin-sub transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)}></div>
                <div className="absolute right-0 top-full mt-3 w-40 bg-skin-card border border-skin-border rounded-xl overflow-hidden z-20 animate-pop" style={cardStyle}>
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => { setCurrentTheme(theme.id); setShowThemeMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-medium flex items-center gap-3 hover:bg-skin-bg transition-colors ${currentTheme === theme.id ? 'text-skin-primary bg-skin-bg' : 'text-skin-main'}`}
                    >
                      <span className="w-3 h-3 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.color }}></span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 窗口控制按钮 */}
          <div className="flex items-center bg-skin-card border border-skin-border rounded-lg overflow-hidden h-9" style={cardStyle}>
            <button onClick={handleMinimize} className="h-full px-3 hover:bg-skin-border/50 text-skin-sub hover:text-skin-main transition-colors"><Minus size={14} /></button>
            <button onClick={handleMaximize} className="h-full px-3 hover:bg-skin-border/50 text-skin-sub hover:text-skin-main transition-colors"><Square size={12} /></button>
            <button onClick={handleClose} className="h-full px-3 hover:bg-red-500 hover:text-white text-skin-sub transition-colors"><X size={14} /></button>
          </div>

        </div>
      </header>

      {/* Main Card */}
      {/* 【修改点 2】: 恢复内部卡片的正常圆角和边框样式 (因为现在外层已经是圆的了，里面不需要再强制去边框) */}
      <div 
        className="flex-1 bg-skin-card rounded-3xl border-skin-border flex flex-col overflow-hidden relative transition-all duration-500"
        style={{ ...cardStyle, WebkitAppRegion: "no-drag" }}
      >
        
        {/* Drag & Drop Area */}
        <div 
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 flex flex-col ${isDragOver ? 'bg-skin-primary/10 border-2 border-dashed border-skin-primary' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {tasks.length === 0 ? (
            <div 
              className="flex-1 flex flex-col items-center justify-center text-skin-sub border-2 border-dashed border-skin-border rounded-2xl bg-skin-input/30 transition-all hover:border-skin-primary/50 cursor-pointer"
              onClick={() => handleSelect('file')}
            >
              <Upload size={56} className="mb-6 text-skin-primary opacity-80 animate-bounce" />
              <p className="text-xl font-bold text-skin-main">拖拽文件或文件夹到此处</p>
              <p className="text-xs mt-2 opacity-60 font-medium tracking-wide">JPG • PNG • WEBP • BMP • TIFF</p>
              
              <div className="flex gap-4 mt-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleSelect('file')} 
                  className="px-6 py-2.5 bg-skin-bg hover:bg-skin-input border border-skin-border rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 text-skin-main"
                  style={cardStyle}
                >
                  选择文件
                </button>
                <button onClick={() => handleSelect('folder')} 
                  className="px-6 py-2.5 bg-skin-bg hover:bg-skin-input border border-skin-border rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 text-skin-main"
                  style={cardStyle}
                >
                  选择文件夹
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in w-full">
              {tasks.map((task, idx) => (
                <div key={idx} 
                  className="flex items-center bg-skin-bg p-3 rounded-xl border border-skin-border hover:border-skin-primary transition-all group hover:translate-x-1"
                  style={inputStyle}
                >
                  {task.type === 'folder' ? (
                    <span className="mr-3 text-2xl filter drop-shadow-sm">📁</span>
                  ) : (
                    <FileImage className="mr-3 w-6 h-6 text-skin-primary" />
                  )}
                  
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-bold truncate text-skin-main">{task.path.split(/[\\/]/).pop()}</p>
                    <p className="text-[10px] text-skin-sub truncate opacity-70 font-mono">{task.path}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] px-2 py-1 bg-skin-card border border-skin-border rounded-md text-skin-sub font-medium">
                      {task.type === 'folder' ? 'DIR' : 'FILE'}
                    </span>
                    <button onClick={() => handleRemoveTask(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-skin-sub hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="px-6 py-2 bg-skin-bg/30 border-t border-b border-skin-border flex justify-between items-center text-[10px] font-medium text-skin-sub shrink-0">
          <span>待处理: {tasks.length} 项</span>
          {tasks.length > 0 && (
            <button onClick={handleReset} className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <RefreshCw size={10} /> 重置列表
            </button>
          )}
        </div>

        {/* Settings Area */}
        <div className="p-6 bg-skin-card space-y-6 transition-colors duration-500 shrink-0">
          <div className="flex gap-6">
            {/* Format */}
            <div className="flex-1">
              <label className="block text-xs font-bold mb-3 text-skin-sub uppercase tracking-wider">目标格式</label>
              <div className="flex bg-skin-input p-1.5 rounded-xl border border-skin-border" style={inputStyle}>
                {['JPG', 'PNG', 'WEBP', 'BMP'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                      format === fmt 
                        ? 'bg-skin-card shadow-sm text-skin-primary' // 选中态凸起
                        : 'text-skin-sub hover:text-skin-main'
                    }`}
                    style={format === fmt && currentTheme !== 'flat' ? { boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' } : {}}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="flex-1">
              <div className="flex justify-between mb-3">
                <label className="block text-xs font-bold text-skin-sub uppercase tracking-wider">输出画质</label>
                <span className="text-xs font-mono font-bold text-skin-primary bg-skin-primary/10 px-2 py-0.5 rounded">{quality}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full h-1.5 bg-skin-input rounded-lg appearance-none cursor-pointer accent-skin-primary"
              />
            </div>
          </div>

          {/* Output Path */}
          <div>
            <label className="block text-xs font-bold mb-3 text-skin-sub uppercase tracking-wider">输出路径</label>
            <div className="flex gap-3">
              <input 
                type="text" readOnly 
                value={manualOutputPath || "默认: 智能创建子文件夹 (推荐)"}
                className="flex-1 px-4 py-3 bg-skin-input border border-skin-border rounded-xl text-xs font-medium text-skin-main outline-none focus:border-skin-primary transition-colors"
                style={inputStyle}
              />
              <button 
                onClick={handleSelectOutput}
                className="px-4 bg-skin-input border border-skin-border hover:bg-skin-bg hover:border-skin-primary rounded-xl transition-all text-skin-main"
                title="选择手动输出路径"
                style={cardStyle}
              >
                <FolderOpen size={18} />
              </button>
            </div>
          </div>

          <button 
            onClick={startConvert}
            disabled={isProcessing || tasks.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-[0.98] ${
              isProcessing || tasks.length === 0
                ? 'bg-gray-300 cursor-not-allowed shadow-none opacity-50' 
                : 'bg-skin-primary hover:bg-skin-primary-hover hover:shadow-skin-primary/40'
            }`}
          >
            {isProcessing ? '正在转换中...' : '开始批量转换'}
          </button>

          {/* Progress */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-skin-input rounded-full overflow-hidden" style={inputStyle}>
              <div className="h-full bg-skin-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className={`text-[10px] font-bold ${statusText.includes('✅') ? 'text-green-500' : 'text-skin-sub'}`}>
                {statusText}
              </span>
              <span className="text-[9px] text-skin-sub font-medium tracking-widest pointer-events-none select-none">
                BY: 伯符YOY
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;