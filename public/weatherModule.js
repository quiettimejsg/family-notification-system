import { translations } from './i18n.js';
import { langState } from './i18n.js';

let useCelsius = true;

// 天气状况图标映射（中文）
const weatherIcons = {
  '晴': 'wb_sunny',
  '多云': 'cloud',
  '阴': 'cloud',
  '雨': 'umbrella',
  '雪': 'ac_unit',
  '雷': 'flash_on',
  '雾': 'cloud_queue',
  '霾': 'cloud_queue',
  'default': 'help_outline'
};

// 初始化天气模块
export function initWeather() {
  // 从localStorage加载温度单位偏好
  const savedUnit = localStorage.getItem('tempUnit');
  if (savedUnit) {
    useCelsius = savedUnit === 'celsius';
  } else {
    // 根据语言自动设置默认单位
    useCelsius = langState.current === 'zh'; // 中文默认摄氏度，英文默认华氏度
  }

  // 获取默认城市
  // 绑定温度单位切换事件
  const tempUnitToggle = document.getElementById('tempUnitToggle');
  if (tempUnitToggle) {
    tempUnitToggle.textContent = useCelsius ? '°C' : '°F';
    tempUnitToggle.addEventListener('click', toggleTemperatureUnit);
  }

  // 初始加载天气
  fetchWeather();

  // 监听语言变化事件
  window.addEventListener('languagechange', () => {
    // 切换语言时，根据新语言设置单位，并保存到localStorage
    useCelsius = langState.current === 'zh';
    localStorage.setItem('tempUnit', useCelsius ? 'celsius' : 'fahrenheit');
    const tempUnitToggle = document.getElementById('tempUnitToggle');
    if (tempUnitToggle) {
      tempUnitToggle.textContent = useCelsius ? '°C' : '°F';
    }
    fetchWeather();
  });
}

// 切换温度单位
function toggleTemperatureUnit() {
  useCelsius = !useCelsius;
  localStorage.setItem('tempUnit', useCelsius ? 'celsius' : 'fahrenheit');
  document.getElementById('tempUnitToggle').textContent = useCelsius ? '°C' : '°F';
  fetchWeather(); // 重新获取并显示天气
}

// 获取并显示天气
export async function fetchWeather() {
  const weatherContainer = document.getElementById('weather-info');
  if (!weatherContainer) return;

  weatherContainer.innerHTML = `<div class="loading-text">${translations['weather-loading']?.[langState.current] || 'Loading weather...'}</div>`;

  try {
    const response = await fetch(`/api/weather`);
    if (!response.ok) throw new Error(translations['weather-load-error']?.[langState.current] || 'Failed to load weather');

    const responseData = await response.json();
const weatherData = responseData.success ? responseData.data : null;
displayWeather(weatherData);
  } catch (error) {
    console.error('获取天气错误:', error);
    weatherContainer.innerHTML = `<div class="error">${translations['weather-load-error']?.[langState.current] || 'Failed to load weather'}</div>`;
  }
}

// 显示天气信息
function displayWeather(data) {
  const weatherContainer = document.getElementById('weather-info');
  if (!weatherContainer || !data || !data.data || !data.data.length) {
    weatherContainer.innerHTML = `<div class="error">${translations['weather-load-error']?.[langState.current] || 'Failed to load weather'}</div>`;
    return;
  }

  // 转换温度单位
  const todayWeather = data.data[0];
  // 提取温度数值并转换单位
  const tempValue = parseFloat(todayWeather.temperature.replace('℃', ''));
  const temp = useCelsius ? `${tempValue}℃` : `${(tempValue * 9/5 + 32).toFixed(1)}°F`;

  // 获取天气图标
  const weatherCondition = todayWeather.weather.toLowerCase();
  const icon = weatherIcons[weatherCondition] || weatherIcons['default'];

  // 构建天气HTML
  const weatherHtml = `
    <div class="weather-info" style="display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; white-space: nowrap;">
    <div class="temperature" style="display: flex; align-items: center; flex: none;">
      <span class="material-icons weather-icon">${icon}</span>
      <span class="temp-value">${temp}</span>
    </div>
    <div class="condition" style="flex: none;">${translations[`weather-${weatherCondition}`]?.[langState.current] || todayWeather.weather}</div>
  </div>
  `;

  weatherContainer.innerHTML = weatherHtml;

  // 重新绑定温度单位切换事件
  const tempUnitToggle = document.getElementById('tempUnitToggle');
  if (tempUnitToggle) {
    tempUnitToggle.addEventListener('click', toggleTemperatureUnit);
  }
}