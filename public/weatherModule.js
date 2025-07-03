import { translations } from './i18n.js';
import { langState } from './i18n.js';

let currentCity;
let useCelsius = true;

// 天气状况图标映射
const weatherIcons = {
  'clear': 'wb_sunny',
  'clouds': 'cloud',
  'rain': 'umbrella',
  'snow': 'ac_unit',
  'thunderstorm': 'flash_on',
  'mist': 'cloud_queue',
  'fog': 'cloud_queue',
  'haze': 'cloud_queue',
  'default': 'help_outline'
};

// 初始化天气模块
export function initWeather() {
  // 从localStorage加载温度单位偏好
  const savedUnit = localStorage.getItem('tempUnit');
  if (savedUnit) {
    useCelsius = savedUnit === 'celsius';
  }

  // 获取默认城市
  currentCity = translations['default-city'][langState.current];

  // 绑定温度单位切换事件
  const tempUnitToggle = document.getElementById('tempUnitToggle');
  if (tempUnitToggle) {
    tempUnitToggle.textContent = useCelsius ? '°C' : '°F';
    tempUnitToggle.addEventListener('click', toggleTemperatureUnit);
  }

  // 初始加载天气
  fetchWeather(currentCity);

  // 监听语言变化事件
  window.addEventListener('languagechange', () => {
    fetchWeather(currentCity);
  });
}

// 切换温度单位
function toggleTemperatureUnit() {
  useCelsius = !useCelsius;
  localStorage.setItem('tempUnit', useCelsius ? 'celsius' : 'fahrenheit');
  document.getElementById('tempUnitToggle').textContent = useCelsius ? '°C' : '°F';
  fetchWeather(currentCity); // 重新获取并显示天气
}

// 获取并显示天气
export async function fetchWeather(city) {
  if (!city) return;

  const weatherContainer = document.getElementById('weather-info');
  if (!weatherContainer) return;

  weatherContainer.innerHTML = `<div class="loading-text">${translations['weather-loading'][langState.current] || 'Loading weather...'}</div>`;

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error(translations['weather-load-error']?.[langState.current] || 'Failed to load weather');

    const weatherData = await response.json();
    displayWeather(weatherData);
  } catch (error) {
    console.error('获取天气错误:', error);
    weatherContainer.innerHTML = `<div class="error">${translations['weather-load-error']?.[langState.current] || 'Failed to load weather'}</div>`;
  }
}

// 显示天气信息
function displayWeather(data) {
  const weatherContainer = document.getElementById('weather-info');
  if (!weatherContainer || !data) return;

  // 检查必要的数据字段
  if (!data.main || !data.weather || !data.weather[0]) {
    weatherContainer.innerHTML = `<div class="error">${translations['weather-load-error']?.[langState.current] || 'Failed to load weather'}</div>`;
    return;
  }

  // 转换温度单位
  const temp = useCelsius ? data.main.temp : (data.main.temp * 9/5 + 32).toFixed(1);
  const feelsLike = useCelsius ? data.main.feels_like : (data.main.feels_like * 9/5 + 32).toFixed(1);

  // 获取天气图标
  const weatherCondition = data.weather[0].main.toLowerCase();
  const icon = weatherIcons[weatherCondition] || weatherIcons['default'];

  // 构建天气HTML
  const weatherHtml = `
    <div class="weather-info">
      <div class="location">${data.name}, ${data.sys.country}</div>
      <div class="temperature">
        <span class="material-icons weather-icon">${icon}</span>
        <span class="temp-value">${temp}</span>
        <span class="temp-unit" id="tempUnitToggle">${useCelsius ? '°C' : '°F'}</span>
      </div>
      <div class="condition">${translations[`weather-${weatherCondition}`][langState.current] || data.weather[0].description}</div>
      <div class="details">${translations['feels-like'][langState.current]}: ${feelsLike}${useCelsius ? '°C' : '°F'} | ${translations['humidity'][langState.current]}: ${data.main.humidity}%</div>
    </div>
  `;

  weatherContainer.innerHTML = weatherHtml;

  // 重新绑定温度单位切换事件
  const tempUnitToggle = document.getElementById('tempUnitToggle');
  if (tempUnitToggle) {
    tempUnitToggle.addEventListener('click', toggleTemperatureUnit);
  }
}