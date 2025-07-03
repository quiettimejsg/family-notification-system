const axios = require('axios');
const cheerio = require('cheerio');

// 获取天气数据
async function getWeatherData(days = 3) {
  const cityName = '苏州';
  const cityCode = '101190401';
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

module.exports = { getWeatherData };