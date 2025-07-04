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

function handleFileSelect(event) {
  console.log('handleFileSelect函数被调用');
  console.log('原始文件数量:', event.target.files.length);
  console.log('文件选择事件触发', event);
  if (isProgrammaticUpdate) return;
  
  const newFiles = Array.from(event.target.files);
  console.log('选择的文件数量:', newFiles.length);
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
  renderFileList();
  isProgrammaticUpdate = false;
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
  // 清空预览区域
  const filePreviews = document.getElementById('filePreviews');
  if (filePreviews) filePreviews.innerHTML = '';
  
  // 重置文件列表
  window.selectedFiles = [];
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
  const validFiles = files;
  if (validFiles.length > 0) {
    window.selectedFiles = [...window.selectedFiles, ...validFiles];
    console.log('添加文件后全局文件列表:', window.selectedFiles);
    console.log('添加文件后全局文件数量:', window.selectedFiles.length);
    renderFileList();
    updateFileInput();
  }
  return validFiles;
}
