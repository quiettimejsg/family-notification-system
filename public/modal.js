import { translations, langState } from './i18n.js';

// 全屏模态框模块

// 模态框容器
const fullscreenModal = document.createElement('div');
fullscreenModal.className = 'fullscreen-modal';
fullscreenModal.style.display = 'none'; // 初始隐藏模态框
fullscreenModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-controls">
      <button class="control-btn" id="prev-file"><i class="material-icons">arrow_back</i></button>
      <button class="control-btn" id="next-file"><i class="material-icons">arrow_forward</i></button>
      <button class="control-btn" id="download-file"><i class="material-icons">file_download</i></button>
      <button class="control-btn" id="close-modal"><i class="material-icons">close</i></button>
    </div>
    <div class="file-name"></div>
    <div class="media-container"></div>
  </div>
`;
document.body.appendChild(fullscreenModal);

// 当前查看的文件索引
let currentFileIndex = 0;
let currentFiles = [];

// 显示文件到模态框
function showFileInModal(index) {
  const mediaContainer = fullscreenModal.querySelector('.media-container');
  const fileNameEl = fullscreenModal.querySelector('.file-name');
  mediaContainer.innerHTML = '';
  const file = currentFiles[index];
  if (!file) return; // 防止文件未定义时出错
  fileNameEl.textContent = file.original_name || translations['unnamed-file'][langState.current]; // 显示文件名（使用数据库attachments表original_name字段）

  // 定义预览处理函数
  const previewHandlers = {
  'document': (file, container) => {
    const embed = document.createElement('embed');
    embed.src = `/uploads/${encodeURIComponent(file.path)}`; // 对路径进行编码防止特殊字符问题
    embed.type = 'application/pdf';
    embed.onerror = () => {
      const errorDiv = document.createElement('div');
errorDiv.textContent = translations['preview-failed'][langState.current];
      errorDiv.classList.add('error');
      applyPreviewStyles(errorDiv);
      container.appendChild(errorDiv);
    };
    applyPreviewStyles(embed);
    container.appendChild(embed);
  },
  
  'text': (file, container) => {
    const pre = document.createElement('pre');
    applyPreviewStyles(pre);
    pre.classList.add('text-preview');
    
    fetch(`/uploads/${encodeURIComponent(file.path)}`) // 对路径进行编码防止特殊字符问题
      .then(response => {
        if (!response.ok) throw new Error('文件加载失败');
        return response.text();
      })
      .then(text => {
        pre.textContent = text;
      })
      .catch(error => {
        pre.textContent = `预览失败: ${error.message}`;
        pre.classList.add('error');
      });
    
    container.appendChild(pre);
  }
};

// 公共样式应用函数
function applyPreviewStyles(element) {
  element.style.width = '100%';
  element.style.height = '60vh';
  element.style.border = 'none';
  
  // 为不同元素添加特定样式
  if (element.tagName === 'IFRAME') {
    element.style.backgroundColor = '#fff';
  }
  if (element.tagName === 'PRE') {
    element.style.overflow = 'auto';
    element.style.padding = '12px';
    element.style.backgroundColor = '#f8f9fa';
    element.style.whiteSpace = 'pre-wrap';
  }
}

// 统一处理所有文件类型的预览逻辑
switch (file.type) {
  case 'image':
    const img = document.createElement('img');
    img.src = `/uploads/${file.path}`;
    img.alt = file.originalName;
    mediaContainer.appendChild(img);
    break;
  case 'video':
    const video = document.createElement('video');
    video.src = `/uploads/${file.path}`;
    video.controls = true;
    mediaContainer.appendChild(video);
    break;
  case 'audio':
    const audio = document.createElement('audio');
    audio.src = `/uploads/${file.path}`;
    audio.controls = true;
    mediaContainer.appendChild(audio);
    break;
  case 'document':
    previewHandlers['document'](file, mediaContainer);
    break;
  case 'text':
    previewHandlers['text'](file, mediaContainer);
    break;
  default:
    const fallback = document.createElement('div');
    fallback.className = 'unsupported-preview';
    fallback.innerHTML = `
      <div class="file-icon">${getFileIcon(file.type)}</div>
      <p>${translations['unsupported-preview'][langState.current]}</p>
<a href="/uploads/${file.path}" target="_blank">${translations['view-in-browser'][langState.current]}</a>
    `;
    mediaContainer.appendChild(fallback);
}
}

// 模态框控制按钮事件监听
fullscreenModal.querySelector('#prev-file').addEventListener('click', () => {
  currentFileIndex = Math.max(0, currentFileIndex - 1);
  showFileInModal(currentFileIndex);
});

fullscreenModal.querySelector('#next-file').addEventListener('click', () => {
  currentFileIndex = Math.min(currentFiles.length - 1, currentFileIndex + 1);
  showFileInModal(currentFileIndex);
});

fullscreenModal.querySelector('#close-modal').addEventListener('click', () => {
  fullscreenModal.classList.remove('active');
  // 监听过渡结束后隐藏模态框
  const handleTransitionEnd = () => {
    fullscreenModal.style.display = 'none';
    fullscreenModal.removeEventListener('transitionend', handleTransitionEnd);
  };
  fullscreenModal.addEventListener('transitionend', handleTransitionEnd);
});

fullscreenModal.querySelector('#download-file').addEventListener('click', () => {
  const file = currentFiles[currentFileIndex];
  const link = document.createElement('a');
  link.href = `/uploads/${file.path}`;
  link.download = file.originalName;
  link.click();
});

// 处理文件点击事件
function handleFileClick(files, index) {
  currentFiles = files;
  currentFileIndex = index;
  // 触发进入动画
fullscreenModal.style.display = 'block';
// 强制重绘以确保过渡生效
void fullscreenModal.offsetWidth;
fullscreenModal.classList.add('active');
  showFileInModal(index);
}


// 导出模态框相关方法
export {
  fullscreenModal,
  showFileInModal,
  currentFiles,
  currentFileIndex,
  handleFileClick
};