let selectedFiles = [];
  let isProgrammaticUpdate = false;

    let filePreviews, fileInput;

// 初始化文件上传功能
export function initFileUpload() {
  console.log('开始初始化文件上传元素');
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
}

function handleFileSelect(event) {
  console.log('handleFileSelect函数被调用，isProgrammaticUpdate:', isProgrammaticUpdate);
  console.log('原始文件数量:', event.target.files.length);
  console.log('文件选择事件触发', event);
  if (isProgrammaticUpdate) return;
  
  // 使用for循环代替Array.from确保正确获取文件
  const newFiles = [];
  for (let i = 0; i < event.target.files.length; i++) {
    newFiles.push(event.target.files[i]);
  }
  console.log('选择的文件数量:', newFiles.length);
  newFiles.forEach((file, index) => {
    console.log(`文件 ${index + 1}:`, file.name, file.size, file.type);
  });
  if (newFiles.length === 0) return;

  // 添加新文件到选中文件列表
  selectedFiles = [...selectedFiles, ...newFiles];
  console.log('更新后选中的文件总数:', selectedFiles.length);
  console.log('更新后选中的文件内容:', selectedFiles);

  // 创建DataTransfer对象
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => dataTransfer.items.add(file));

  // 更新文件输入框
  isProgrammaticUpdate = true;
  try {
    fileInput.files = dataTransfer.files;
  } finally {
    isProgrammaticUpdate = false;
  }
  renderFileList();
}

function renderFileList() {
  const container = document.getElementById('filePreviews');
  console.log('filePreviews容器获取结果:', container);
  if (!container) {
    console.log('filePreviews容器不存在，无法渲染文件列表');
    return;
  }
  console.log('开始渲染文件列表，文件数量:', selectedFiles.length);
  
  container.innerHTML = ''; // 清空现有内容
  
  selectedFiles.forEach(file => {
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
  selectedFiles.forEach(f => dataTransfer.items.add(f));
  
  isProgrammaticUpdate = true;
  try {
    fileInput.files = dataTransfer.files;
  } finally {
    isProgrammaticUpdate = false; // 确保标志始终被重置
  }
}

function resetSelectedFiles() {
  console.log('resetSelectedFiles被调用');
  // 清空预览区域
  const filePreviews = document.querySelector('.file-preview-container');
  if (filePreviews) filePreviews.innerHTML = '';
  
  // 重置文件列表
  selectedFiles = [];
  updateFileInput();
}

// 同时添加这个函数（用于外部添加文件）
function addFiles(files) {
  const validFiles = files;
  if (validFiles.length > 0) {
    selectedFiles = [...selectedFiles, ...validFiles];
    console.log('添加文件后文件列表:', selectedFiles);
    console.log('添加文件后文件数量:', selectedFiles.length);
    renderFileList();
    updateFileInput();
  }
  return validFiles;
}

// 在文件底部修改导出部分
export { 
  filePreviews, 
  handleFileSelect, 
  resetSelectedFiles,
  addFiles, 
  selectedFiles, // 导出selectedFiles数组
  renderFileList // 导出文件列表渲染函数
};
