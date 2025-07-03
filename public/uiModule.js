import { translations } from './i18n.js';
import { langState } from './i18n.js';
import { resetSelectedFiles } from './upload.js';

let currentCity;
let citySearchInput;
let cityDropdown;
let cityListItems;
let addRecordModal;
let titleClickCount = 0;

// 初始化UI模块
export function initUI() {
  // 获取DOM元素
  citySearchInput = document.getElementById('city-search');
  cityDropdown = document.getElementById('city-dropdown');
  addRecordModal = document.getElementById('add-record-modal');

  // 绑定UI事件
  bindUIEvents();

  // 初始化城市列表
  initCityList();

  // 显示当前日期
  displayCurrentDate();

  // 监听语言变化事件更新日期
  window.addEventListener('languagechange', displayCurrentDate);
}

// 绑定UI事件处理函数
function bindUIEvents() {
  // 城市搜索事件
  if (citySearchInput) {
    citySearchInput.addEventListener('input', handleCitySearch);
  }

  // 点击空白处关闭城市下拉面板
  document.addEventListener('click', (e) => {
    if (!citySearchInput || !cityDropdown ||
        e.target !== citySearchInput && !cityDropdown.contains(e.target)) {
      cityDropdown?.classList.add('hidden');
    }
  });

  // 添加记录按钮事件
  document.getElementById('add-record-btn')?.addEventListener('click', () => {
    addRecordModal.style.display = 'flex';
    resetSelectedFiles();
  });

  // 关闭模态框事件
  document.getElementById('close-modal')?.addEventListener('click', () => {
    addRecordModal.style.display = 'none';
  });

  // 点击模态框外部关闭
  addRecordModal?.addEventListener('click', (e) => {
    if (e.target === addRecordModal) {
      addRecordModal.style.display = 'none';
    }
  });

  // 标题点击计数事件
  document.querySelector('.header-title')?.addEventListener('click', () => {
    titleClickCount++;
    if (titleClickCount >= 5) {
      alert(translations['easter-egg'][langState.current] || 'You found the easter egg!');
      titleClickCount = 0;
    }
  });

  // 表单重置事件
  document.getElementById('add-record-form')?.addEventListener('reset', () => {
    setTimeout(() => {
      resetSelectedFiles();
      const filePreviewContainer = document.getElementById('file-preview-container');
      if (filePreviewContainer) filePreviewContainer.innerHTML = '';
    }, 0);
  });
}

// 初始化城市列表
function initCityList() {
  // 从后端获取城市列表
  fetch('/api/weather/cities')
    .then(response => response.json())
    .then(data => {
      if (data && data.cities && data.cities.length) {
        const dropdownContent = document.querySelector('#city-dropdown .dropdown-content');
        if (dropdownContent) {
          // 清空现有选项
          dropdownContent.innerHTML = '';
          
          // 动态创建城市选项
          data.cities.forEach(city => {
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            cityItem.dataset.city = city.name;
            cityItem.textContent = city.name;
            
            // 绑定点击事件
            cityItem.addEventListener('click', () => {
              currentCity = city.name;
              citySearchInput.value = city.name;
              cityDropdown.classList.add('hidden');
              // 通知天气模块更新城市
              window.fetchWeather?.(currentCity);
            });
            
            dropdownContent.appendChild(cityItem);
          });
          
          // 更新城市列表引用
          cityListItems = document.querySelectorAll('#city-dropdown .city-item');
        }
      }
    })
    .catch(error => console.error('获取城市列表失败:', error));
}

// 处理城市搜索
function handleCitySearch() {
  const searchTerm = citySearchInput.value.toLowerCase();

  if (!searchTerm) {
    cityDropdown.classList.add('hidden');
    return;
  }

  let hasMatch = false;
  cityListItems.forEach(item => {
    const cityName = item.textContent.toLowerCase();
    if (cityName.includes(searchTerm)) {
      item.classList.remove('hidden');
      hasMatch = true;
    } else {
      item.classList.add('hidden');
    }
  });

  if (hasMatch) {
    cityDropdown.classList.remove('hidden');
  } else {
    cityDropdown.classList.add('hidden');
  }
}

// 显示当前日期
export function displayCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (!dateElement) return;

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateString = new Date().toLocaleDateString(langState.current, options);
  dateElement.textContent = dateString;
}