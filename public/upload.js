import { handleFileClick } from './modal.js';

window.selectedFiles = [];
  let isProgrammaticUpdate = false;

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

  // 更新文件输入框
  isProgrammaticUpdate = true;
  fileInput.files = dataTransfer.files;
}

function renderFileList() {
  const container = document.getElementById('filePreviews');
  if (!container) return;
  
  container.innerHTML = ''; // 清空现有内容
  
  window.selectedFiles.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.textContent = file.name;
    container.appendChild(fileItem);
  });
}

function uploadFiles() {
  const formData = new FormData();
  
  window.selectedFiles.forEach(file => {
    formData.append('files', file);
  });
  
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error('上传失败');
    return response.json();
  })
  .then(data => {
    console.log('上传成功:', data);
    alert('文件上传成功');
  })
  .catch(error => {
    console.error('上传错误:', error);
    alert('文件上传失败: ' + error.message);
  });
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
    renderFileList();
    uploadFiles();
    updateFileInput();
  }
  return validFiles;
  return true;
}
