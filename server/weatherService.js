const axios = require('axios');
const cheerio = require('cheerio');

// 城市编码映射表
const cityCodes = {
  '北京': '101010100',
  '上海': '101020100',
  '广州': '101280101',
  '深圳': '101280601',
  '杭州': '101210101',
  '苏州': '101190401',
  '南京': '101190101',
  '武汉': '101200101',
  '成都': '101270101',
  '重庆': '101040100',
  '天津': '101030100',
  '西安': '101110101',
  '郑州': '101180101',
  '长沙': '101250101',
  '青岛': '101120201',
  '沈阳': '101070101',
  '大连': '101070201',
  '宁波': '101210401',
  '无锡': '101190201'
};

// 获取天气数据
async function getWeatherData(cityName, days = 3) {
  // 验证城市是否支持
  if (!cityCodes[cityName]) {
    throw new Error(`暂不支持该城市: ${cityName}`);
  }

  const cityCode = cityCodes[cityName];
  const url = `https://weather.com.cn/weather/${cityCode}.shtml`;

  try {
    console.log(`[天气服务] 请求天气数据: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    console.log(`[天气服务] 响应状态码: ${response.status}`);
    console.log(`[天气服务] 响应数据长度: ${response.data.length}`);

    const $ = cheerio.load(response.data);
    const weatherData = [];

    // 提取未来几天天气数据
    const weatherElements = $('.t .sky');
    console.log(`[天气服务] 找到天气元素数量: ${weatherElements.length}`);

    weatherElements.each((index, element) => {
      if (index < days) {
        const dateText = $(element).find('h1').text().trim();
        const weather = $(element).find('p.wea').text().trim();
        const temperature = $(element).find('p.tem').text().trim();
        const wind = $(element).find('p.win i').text().trim();

        weatherData.push({
          date: dateText,
          weather: weather,
          temperature: temperature,
          wind: wind
        });
      }
    });

    if (weatherData.length === 0) {
      console.error('[天气服务] 提取天气数据为空，页面结构可能已变化');
      console.error('[天气服务] 页面HTML片段:', response.data.substring(0, 500));
      throw new Error('未能提取天气数据，请检查页面结构是否变化');
    }

    return {
      city: cityName,
      data: weatherData
    };
  } catch (error) {
    console.error(`[天气服务] 获取${cityName}天气失败:`, error);
    if (error.response) {
      console.error(`[天气服务] 响应状态: ${error.response.status}`);
      console.error(`[天气服务] 响应数据: ${error.response.data.substring(0, 200)}`);
    }
    throw error;
  }
}

// 城市坐标数据库（中国主要城市）
const cityCoordinates = {
  '北京': { latitude: 39.9042, longitude: 116.4074 },
  '上海': { latitude: 31.2304, longitude: 121.4737 },
  '广州': { latitude: 23.1291, longitude: 113.2644 },
  '深圳': { latitude: 22.5431, longitude: 114.0579 },
  '杭州': { latitude: 30.2796, longitude: 120.1590 },
  '南京': { latitude: 32.0603, longitude: 118.7969 },
  '武汉': { latitude: 30.5928, longitude: 114.3055 },
  '成都': { latitude: 30.5723, longitude: 104.0665 },
  '重庆': { latitude: 29.4316, longitude: 106.9123 },
  '天津': { latitude: 39.0842, longitude: 117.2009 },
  '西安': { latitude: 33.4290, longitude: 108.9401 },
  '苏州': { latitude: 31.2993, longitude: 120.6195 },
  '郑州': { latitude: 34.7472, longitude: 113.6250 },
  '长沙': { latitude: 28.1125, longitude: 112.9822 },
  '青岛': { latitude: 36.0670, longitude: 120.3826 },
  '沈阳': { latitude: 41.7968, longitude: 123.4294 },
  '大连': { latitude: 38.9140, longitude: 121.6147 },
  '宁波': { latitude: 29.8683, longitude: 121.5440 },
  '无锡': { latitude: 31.5977, longitude: 120.2997 }
};

// Haversine公式：计算两点间距离（公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // 距离（公里）
}

// 根据经纬度查找最近的城市
function findNearestCity(latitude, longitude) {
  let nearestCity = '北京'; // 默认城市
  let minDistance = Infinity;
  
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const distance = calculateDistance(latitude, longitude, coords.latitude, coords.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  return nearestCity;
}

module.exports = { getWeatherData, cityCodes, cityCoordinates, findNearestCity };