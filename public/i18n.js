// 多语言字典（添加所有必需的键）
const translations = {
"app-title": {
"zh": "家府通傳之制",
"en": "Þæs Hīredes Bodcræft"
},
"priority-high": {
"zh": "急",
"en": "Hēah"
},
"priority-medium": {
"zh": "迫",
"en": "Middling"
},
"priority-low": {
"zh": "常",
"en": "Lāg"
},
"document": {
"zh": "文牘",
"en": "Writ"
},
"audio": {
"zh": "音訊",
"en": "Sōnd"
},
"error": {
"zh": "謬",
"en": "Errour"
},
"success": {
"zh": "成",
"en": "Sið"
},
"uploading": {
"zh": "上傳中...",
"en": "Uplǣdan…"
},
"loading": {
"zh": "載入中...",
"en": "Lǣdan…"
},
"load-error": {
"zh": "載入告諭敗",
"en": "Lǣde tō notifys hæfde nǣt"
},
"no-notifications": {
"zh": "闕告諭",
"en": "Nǣnne notifs yǣt"
},
"weather-loading": {
"zh": "候氣載入中...",
"en": "Lǣdan weder…"
},
"weather-error": {
"zh": "候氣載入敗",
"en": "Weder lǣde wæs forworpen"
},
"weather-sunny": {
"zh": "暘",
"en": "Sunnig"
},
// 天象詞皆從簡化文言
"weather-moderate-rain": {
"zh": "霔",
"en": "Middel Ren"
},
"weather-thunderstorm-cloudy": {
"zh": "雷霔轉曇",
"en": "Þunorstorm wendþ tō Clūdlic"
},
"weather-cloudy-thunderstorm": {
"zh": "曇轉雷霔",
"en": "Clūdlic wendþ tō Þunorstorm"
},
"weather-sunny-cloudy": {
"zh": "暘轉曇",
"en": "Sunnig wendþ tō Clūdlic"
},
"weather-cloudy-sunny": {
"zh": "曇轉暘",
"en": "Clūdlic wendþ tō Sunnig"
},
"weather-heavy-rain": {
"zh": "澍",
"en": "Hefig Ren"
},
"weather-showers": {
"zh": "霂",
"en": "Scūr"
},
"weather-overcast-cloudy": {
"zh": "靉轉曇",
"en": "Ofercast wendþ tō Clūdlic"
},
"weather-cloudy": {
"zh": "曇",
"en": "Clūdlic"
},
"weather-rainy": {
"zh": "霑",
"en": "Renig"
},
"weather-overcast": {
"zh": "靉",
"en": "Ofercast"
},
"weather-snowy": {
"zh": "霙",
"en": "Snāwlic"
},
"weather-light-rain": {
"zh": "霡",
"en": "Lēoht Ren"
},
"weather-thunderstorm": {
"zh": "雷霔",
"en": "Þunorstorm"
},
"weather-light-snow": {
"zh": "霰",
"en": "Lēoht Snāw"
},
"weather-heavy-snow": {
"zh": "霏",
"en": "Hefig Snāw"
},
"weather-foggy": {
"zh": "雺",
"en": "Mistig"
},
"weather-unknown": {
"zh": "未詳",
"en": "Uncuð"
},
"add-record-title": {
"zh": "新立錄",
"en": "Tōgædre Nīwe Writ"
},
"record-title-label": {
"zh": "標",
"en": "Hēafod"
},
"record-content-label": {
"zh": "文",
"en": "Inhold"
},
// 優先級標籤從簡
"priority-low-label": {
"zh": "常",
"en": "Lāg"
},
"priority-medium-label": {
"zh": "迫",
"en": "Middling"
},
"priority-high-label": {
"zh": "急",
"en": "Hēah"
},
"submit-btn": {
"zh": "呈",
"en": "Āsenda"
},
"file-input-label": {
"zh": "進文牘",
"en": "Uplǣdan Writ"
},
"preview-failed": {
"zh": "預覽隳，試下之",
"en": "Forsīen misspǣd, sēc eft niðerlǣdan"
},
"unsupported-preview": {
"zh": "類異不可預覽",
"en": "Ne fremode forsīen þes cyndes"
},
"view-in-browser": {
"zh": "於瀏覽器觀",
"en": "Sīeh in brūscāre"
},
"network-error": {
"zh": "絡訊異常",
"en": "Netwyrċ andswaru wæs nǣt rihte"
},
"error-adding-notification": {
"zh": "添告諭敗",
"en": "Tōgædre notifys wæs forworpen"
},
"unnamed-file": {
"zh": "未名文",
"en": "Nǣmleās writ"
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
    window.dispatchEvent(new Event('languagechange'));
    }
  });
}

export { translations, updateLanguage };