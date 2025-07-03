// 多语言字典（添加所有必需的键）
const translations = {
  "app-title": {
    "zh": "通知系統",
    "en": "NotifSys"
  },
  
  "priority-high": {
    "zh": "紧急",
    "en": "High"
  },
  "priority-medium": {
    "zh": "迫切",
    "en": "Medium"
  },
  "priority-low": {
    "zh": "一般",
    "en": "Low"
  },
  "document": {
    "zh": "文件",
    "en": "Document"
  },
  "audio": {
    "zh": "音訊",
    "en": "Audio"
  },
  // 添加缺失的翻译键
  "error": {
    "zh": "錯誤",
    "en": "Error"
  },
  "success": {
    "zh": "成功",
    "en": "Success"
  },
  "uploading": {
    "zh":  "上傳中...",
    "en": "Uploading..."
  },
  "loading": {
    "zh":  "載入中...",
    "en": "Loading..."
  },
  "load-error": {
    "zh": "載入通知失敗",
    "en": "Failed to load notifications"
  },
  "no-notifications": {
    "zh":  "暫無通知",
    "en": "No notifications yet"
  },
  "weather-loading": {
    "zh": "正在加载天气...",
    "en": "Loading weather..."
  },
  "weather-error": {
    "zh": "天气加载失败",
    "en": "Failed to load weather"
  },
  "geolocation-error": {
    "zh": "获取地理位置失败，请允许位置权限或使用默认城市",
    "en": "Failed to get location. Please allow location permissions or use default city"
  },
  "current-location": {
    "zh": "当前位置",
    "en": "Current Location"
  },
  "search-city": {
    "zh": "搜索城市...",
    "en": "Search city..."
  },
  "weather-sunny": {
      "zh": "晴",
      "en": "Sunny"
    },
    "weather-moderate-rain": {
      "zh": "中雨",
      "en": "Moderate Rain"
    },
    "weather-thunderstorm-cloudy": {
      "zh": "雷阵雨转多云",
      "en": "Thunderstorm turning to Cloudy"
    },
    "weather-cloudy-thunderstorm": {
      "zh": "多云转雷阵雨",
      "en": "Cloudy turning to Thunderstorm"
    },
    "weather-sunny-cloudy": {
      "zh": "晴转多云",
      "en": "Sunny turning to Cloudy"
    },
    "weather-cloudy-sunny": {
      "zh": "多云转晴",
      "en": "Cloudy turning to Sunny"
    },
    "weather-heavy-rain": {
      "zh": "暴雨",
      "en": "Heavy Rain"
    },
    "weather-showers": {
      "zh": "阵雨",
      "en": "Showers"
    },
    "weather-overcast-cloudy": {
      "zh": "阴转多云",
      "en": "Overcast turning to Cloudy"
    },
  "weather-cloudy": {
    "zh": "多云",
    "en": "Cloudy"
  },
  "weather-sunny-to-cloudy": {
    "zh": "晴转多云",
    "en": "Sunny to Cloudy"
  },
  "weather-rainy": {
    "zh": "雨",
    "en": "Rainy"
  },
  "weather-overcast": {
    "zh": "阴",
    "en": "Overcast"
  },
  "weather-snowy": {
    "zh": "雪",
    "en": "Snowy"
  },
  "weather-light-rain": {
    "zh": "小雨",
    "en": "Light Rain"
  },
  "weather-heavy-rain": {
    "zh": "大雨",
    "en": "Heavy Rain"
  },
  "weather-thunderstorm": {
    "zh": "雷阵雨",
    "en": "Thunderstorm"
  },
  "weather-light-snow": {
    "zh": "小雪",
    "en": "Light Snow"
  },
  "weather-heavy-snow": {
    "zh": "大雪",
    "en": "Heavy Snow"
  },
  "weather-foggy": {
    "zh": "雾",
    "en": "Foggy"
  },
  "weather-unknown": {
    "zh": "未知",
    "en": "Unknown"
  },
  "add-record-title": {
    "zh": "添加新记录",
    "en": "Add New Record"
  },
  "record-title-label": {
    "zh": "标题",
    "en": "Title"
  },
  "record-content-label": {
    "zh": "内容",
    "en": "Content"
  },
  "priority-low-label": {
    "zh": "一般",
    "en": "Low"
  },
  "priority-medium-label": {
    "zh": "迫切",
    "en": "Medium"
  },
  "priority-high-label": {
    "zh": "紧急",
    "en": "High"
  },
  "submit-btn": {
    "zh": "提交",
    "en": "Submit"
  },
  "file-input-label": {
    "zh": "上传文件",
    "en": "Upload Files"
  },
  "preview-failed": {
    "zh": "预览失败，请尝试下载",
    "en": "Preview failed, please try to download"
  },
  "unsupported-preview": {
    "zh": "不支持直接预览此类型",
    "en": "Direct preview of this type is not supported"
  },
  "view-in-browser": {
    "zh": "在浏览器中预览",
    "en": "View in browser"
  },
  "default-city": {
    "zh": "苏州",
    "en": "苏州"
  },
  "network-error": {
    "zh": "网络响应异常",
    "en": "Network response was not ok"
  },
  "error-adding-notification": {
    "zh": "添加通知失败",
    "en": "Failed to add notification"
  },
  "unnamed-file": {
    "zh": "未命名文件",
    "en": "unknown file"
  }
};

// 优先从localStorage读取，否则使用浏览器语言
export const langState = {
  current: localStorage.getItem('preferredLang') || navigator.language.split('-')[0] || 'en'
};
// 确保只使用支持的语言
if (!['zh', 'en'].includes(langState.current)) {
  langState.current = 'en';
}

// 更新界面语言
function updateLanguage(lang) {
  langState.current = lang;
  localStorage.setItem('preferredLang', lang);
  
  // 设置HTML文档语言
  document.documentElement.lang = lang;
  
  // 更新文本
  Object.keys(translations).forEach(key => {
    const elements = document.querySelectorAll(`[id="${key}"]`);
    if (elements.length > 0 && translations[key][lang]) {
      elements.forEach(el => {
        if (el.tagName === 'INPUT' && el.placeholder) {
          el.placeholder = translations[key][lang];
        } else if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'P' || el.tagName === 'BUTTON' || el.tagName === 'LABEL') {
          el.textContent = translations[key][lang];
        }
      });
    }
  });
}

export { translations, updateLanguage };