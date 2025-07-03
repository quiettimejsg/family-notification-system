import { handleFileClick } from './modal.js';

window.selectedFiles = [];
  let isProgrammaticUpdate = false;
  // 存储对象URL用于后续释放
  let objectUrlMap = new WeakMap();
    let filePreviews, fileInput;

  // 等待DOM完全加载后再初始化
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded事件触发，开始初始化文件上传元素');
    filePreviews = document.getElementById('filePreviews');
    fileInput = document.getElementById('fileInput');
    console.log('文件上传元素初始化结果:', { filePreviewsExists: !!filePreviews, fileInputExists: !!fileInput });
    if (!fileInput) console.error('无法找到fileInput元素，请检查HTML中的ID是否为"fileInput"');

    if (fileInput) {
      fileInput.addEventListener('change', handleFileSelect);
    } else {
      console.error('fileInput元素未找到');
    }

    if (!filePreviews) {
      console.error('filePreviews容器未找到');
    }
  });
// 允许的文件类型和大小限制（与后端保持一致）
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'video/mp4', 'video/x-m4v', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac'
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB



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

// 最大预览尺寸限制 (与上传限制一致)
const MAX_PREVIEW_SIZE = MAX_FILE_SIZE; // 100MB

function handleFileSelect(event) {
  console.log('handleFileSelect函数被调用');
  console.log('原始文件数量:', event.target.files.length);
  console.log('文件选择事件触发', event);
  if (isProgrammaticUpdate) return;
  
  const newFiles = Array.from(event.target.files).filter(file => {
    console.log(`检查文件: ${file.name}, 类型: ${file.type}, 大小: ${file.size}`);
  // 验证文件类型
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.warn(`文件 ${file.name} 类型不支持: ${file.type}`);
    alert(`不支持的文件类型: ${file.name}`);
    return false;
  }
  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    console.warn(`文件 ${file.name} 超过大小限制: ${file.size} > ${MAX_FILE_SIZE}`);
    alert(`文件 ${file.name} 过大，请上传小于100MB的文件`);
    return false;
  }
  return true;
});
  
  console.log('验证通过的文件数量:', newFiles.length, '文件类型:', newFiles.map(f => f.type));
  if (newFiles.length === 0) return;

  // 添加新文件到选中文件列表
  window.selectedFiles = [...window.selectedFiles, ...newFiles];
  console.log('更新后选中的文件总数:', window.selectedFiles.length);

  // 创建DataTransfer对象
  const dataTransfer = new DataTransfer();
  window.selectedFiles.forEach(file => dataTransfer.items.add(file));

  // 批量预览新文件（异步分块处理）
  console.log('开始批量预览文件');
  batchPreviewFiles(newFiles);

  // 更新文件输入框
  isProgrammaticUpdate = true;
  fileInput.files = dataTransfer.files;
}

function batchPreviewFiles(files) {
  const previewContainer = document.getElementById('filePreviews');
  console.log('预览容器是否存在:', !!previewContainer);
  console.log('准备为', files.length, '个文件创建预览');
  // 分块处理避免UI阻塞
  const CHUNK_SIZE = 3; // 每次处理3个文件
  let index = 0;
  
  function processChunk() {
    const chunk = files.slice(index, index + CHUNK_SIZE);
    chunk.forEach(file => previewFile(file, previewContainer));
    index += CHUNK_SIZE;
    
    if (index < files.length) {
      // 下一帧继续处理
      requestAnimationFrame(processChunk);
    }
  }
  
  processChunk();
}

function previewFile(file, container) {
  const preview = createPreviewElement(file, objectUrl, container);
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
  
  if (container) {
    container.appendChild(preview);
    console.log('预览元素已添加到容器');
  } else {
    console.error('无法添加预览元素：预览容器不存在');
    return;
  }
  
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
  console.log('开始创建视频缩略图:', file.name);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  
  // 设置截取第一帧
  video.addEventListener('loadeddata', function() {
    console.log('视频loadeddata事件触发，准备截取帧');
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
  
  video.addEventListener('error', (e) => {
    console.error('视频加载错误:', e, '错误代码:', video.error.code);
    finalizeIconPreview(file, preview);
  });
  
  video.src = objectUrl;
  console.log('视频源已设置，开始加载:', objectUrl);
  video.load();
  console.log('视频load()已调用');
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

// 移除重复声明

function removeFilePreview(file, preview) {
  // 释放对象URL资源
  const objectUrl = objectUrlMap.get(preview);
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrlMap.delete(preview);
  }
  
  // 从选中文件列表中移除
  window.selectedFiles = window.selectedFiles.filter(f => 
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
  window.selectedFiles.forEach(f => dataTransfer.items.add(f));
  
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
  window.selectedFiles.length = 0;
  updateFileInput();
}

// 在文件底部修改导出部分
export { 
  filePreviews, 
  handleFileSelect, 
  resetSelectedFiles,
  addFiles // 新增这个导出
};

// 同时添加这个函数（用于外部添加文件）
function addFiles(files) {
  const validFiles = files.filter(file => {
    const ext = getFileExtension(file.name);
    const allowedExtensions = ['mp4', 'm4v', 'flac', 'mp3', 'wav', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !allowedExtensions.includes(ext)) {
      console.warn(`文件 ${file.name} 类型不支持: ${file.type}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`文件 ${file.name} 超过大小限制`);
      return false;
    }
    return true;
  });

  if (validFiles.length > 0) {
    window.selectedFiles = [...window.selectedFiles, ...validFiles];
    console.log('添加文件后全局文件列表:', window.selectedFiles);
    console.log('添加文件后全局文件数量:', window.selectedFiles.length);
    batchPreviewFiles(validFiles);
    updateFileInput();
  }
  return validFiles;
  return true;
}
