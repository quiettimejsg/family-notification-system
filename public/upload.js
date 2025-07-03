const filePreviews = document.getElementById('filePreviews');
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);

import { handleFileClick } from './modal.js';

let selectedFiles = [];
let isProgrammaticUpdate = false;
// 存储对象URL用于后续释放
const objectUrlMap = new WeakMap();
// 文件类型图标映射
const FILE_ICONS = {
  pdf: 'picture_as_pdf',
  docx: 'description',
  doc: 'description',
  xlsx: 'grid_on',
  xls: 'grid_on',
  pptx: 'slideshow',
  ppt: 'slideshow',
  txt: 'text_fields',
  default: 'insert_drive_file'
};

// 最大预览尺寸限制 (移动端优化)
const MAX_PREVIEW_SIZE = 1024 * 1024 * 1024; // 1024MB

function handleFileSelect(event) {
  if (isProgrammaticUpdate) return;
  
  const newFiles = Array.from(event.target.files).filter(file => {
    // 跳过超大文件预览
    if (file.size > MAX_PREVIEW_SIZE) {
      console.warn(`文件 ${file.name} 超过预览大小限制，将不生成预览`);
      return false;
    }
    return true;
  });
  
  if (newFiles.length === 0) return;

  // 添加新文件到选中文件列表
  selectedFiles = [...selectedFiles, ...newFiles];

  // 创建DataTransfer对象
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => dataTransfer.items.add(file));

  // 批量预览新文件（异步分块处理）
  batchPreviewFiles(newFiles);

  // 更新文件输入框
  isProgrammaticUpdate = true;
  fileInput.files = dataTransfer.files;
}

function batchPreviewFiles(files) {
  // 分块处理避免UI阻塞
  const CHUNK_SIZE = 3; // 每次处理3个文件
  let index = 0;
  
  function processChunk() {
    const chunk = files.slice(index, index + CHUNK_SIZE);
    chunk.forEach(previewFile);
    index += CHUNK_SIZE;
    
    if (index < files.length) {
      // 下一帧继续处理
      requestAnimationFrame(processChunk);
    }
  }
  
  processChunk();
}

function previewFile(file) {
  const preview = document.createElement('div');
  preview.className = 'file-preview';
  
  // 创建对象URL并存储映射关系
  const objectUrl = URL.createObjectURL(file);
  objectUrlMap.set(preview, objectUrl);
  
  // 获取文件扩展名
  const ext = getFileExtension(file.name);
  
  // 初始占位内容
  preview.innerHTML = `
    <div class="preview-placeholder">
      <span class="material-icons">${FILE_ICONS[ext] || FILE_ICONS.default}</span>
      <div class="loading-spinner"></div>
    </div>
    <div class="file-type">${ext.toUpperCase()}</div>
    <button class="remove-file">
      <span class="material-icons">close</span>
    </button>
  `;
  
  filePreviews.appendChild(preview);
  
  // 绑定事件
  preview.addEventListener('click', () => handleFileClick([file], 0));
  preview.querySelector('.remove-file').addEventListener('click', (e) => {
    e.stopPropagation();
    removeFilePreview(file, preview);
  });
  
  // 根据文件类型异步加载预览内容
  loadPreviewContent(file, preview, objectUrl);
}

function loadPreviewContent(file, preview, objectUrl) {
  // 优先使用文件类型而非完整检查
  const ext = getFileExtension(file.name);
  
  // 图片文件 - 使用缩略图
  if (file.type.startsWith('image/')) {
    createImageThumbnail(file, preview, objectUrl);
  } 
  // 视频文件 - 仅显示第一帧
  else if (file.type.startsWith('video/')) {
    createVideoThumbnail(file, preview, objectUrl);
  }
  // 其他文件类型直接显示图标
  else {
    finalizePreview(preview, `
      <div class="icon">
        <span class="material-icons">${FILE_ICONS[ext] || FILE_ICONS.default}</span>
      </div>
    `);
  }
}

function createImageThumbnail(file, preview, objectUrl) {
  const img = new Image();
  img.onload = function() {
    // 创建缩略图
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置缩略图尺寸 (最大500px)
    const maxSize = 500;
    let width = img.width;
    let height = img.height;
    
    if (width > height && width > maxSize) {
      height *= maxSize / width;
      width = maxSize;
    } else if (height > maxSize) {
      width *= maxSize / height;
      height = maxSize;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制缩略图
    ctx.drawImage(img, 0, 0, width, height);
    
    // 使用缩略图DataURL
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
    
    // 更新预览
    finalizePreview(preview, `<img src="${thumbnailUrl}" alt="${file.name}">`);
    
    // 释放原图资源
    URL.revokeObjectURL(objectUrl);
    objectUrlMap.delete(preview);
  };
  
  img.onerror = () => {
    // 加载失败时回退到图标
    finalizeIconPreview(file, preview);
  };
  
  img.src = objectUrl;
}

function createVideoThumbnail(file, preview, objectUrl) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  
  // 设置截取第一帧
  video.addEventListener('loadeddata', function() {
    this.currentTime = Math.min(this.duration * 0.1, 1); // 取10%处或1秒
  });
  
  video.addEventListener('seeked', function() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 生成缩略图
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
    finalizePreview(preview, `<img src="${thumbnailUrl}" alt="Video thumbnail">`);
    
    // 释放资源
    URL.revokeObjectURL(objectUrl);
    objectUrlMap.delete(preview);
    video.src = '';
  });
  
  video.addEventListener('error', () => {
    finalizeIconPreview(file, preview);
  });
  
  video.src = objectUrl;
  video.load();
}

function finalizePreview(preview, contentHtml) {
  const placeholder = preview.querySelector('.preview-placeholder');
  if (placeholder) {
    placeholder.innerHTML = contentHtml;
    placeholder.classList.remove('preview-placeholder');
    placeholder.classList.add('preview-content');
  }
}

function finalizeIconPreview(file, preview) {
  const ext = getFileExtension(file.name);
  finalizePreview(preview, `
    <div class="icon">
      <span class="material-icons">${FILE_ICONS[ext] || FILE_ICONS.default}</span>
    </div>
  `);
}

function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function removeFilePreview(file, preview) {
  // 释放对象URL资源
  const objectUrl = objectUrlMap.get(preview);
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrlMap.delete(preview);
  }
  
  // 从选中文件列表中移除
  selectedFiles = selectedFiles.filter(f => 
    !(f.name === file.name && 
      f.size === file.size && 
      f.lastModified === file.lastModified)
  );
  
  // 更新文件输入框
  updateFileInput();
  
  // 从DOM移除
  preview.remove();
}

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(f => dataTransfer.items.add(f));
  
  isProgrammaticUpdate = true;
  fileInput.files = dataTransfer.files;
}

function resetSelectedFiles() {
  // 释放所有对象URL
  document.querySelectorAll('.file-preview').forEach(preview => {
    const objectUrl = objectUrlMap.get(preview);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
  
  // 清空映射
  objectUrlMap = new WeakMap();
  
  // 清空预览区域
  filePreviews.innerHTML = '';
  
  // 重置文件列表
  selectedFiles = [];
  updateFileInput();
}

// 在文件底部修改导出部分
export { 
  filePreviews, 
  handleFileSelect, 
  selectedFiles, 
  resetSelectedFiles,
  addFiles // 新增这个导出
};

// 同时添加这个函数（用于外部添加文件）
function addFiles(files) {
  const validFiles = files.filter(file => file.size <= MAX_PREVIEW_SIZE);
  if (validFiles.length === 0) return;

  selectedFiles = [...selectedFiles, ...validFiles];
  updateFileInput();
  batchPreviewFiles(validFiles);
}