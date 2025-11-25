// ============ 数据映射 ============
const cnProvincesMap = {
  "Beijing": "北京", "Shanghai": "上海", "Tianjin": "天津", "Chongqing": "重庆",
  "Guangdong": "广东", "Zhejiang": "浙江", "Jiangsu": "江苏", "Shandong": "山东",
  "Sichuan": "四川", "Hubei": "湖北", "Hunan": "湖南", "Henan": "河南",
  "Fujian": "福建", "Anhui": "安徽", "Jiangxi": "江西", "Liaoning": "辽宁",
  "Heilongjiang": "黑龙江", "Jilin": "吉林", "Hebei": "河北", "Shanxi": "山西",
  "Shaanxi": "陕西", "Gansu": "甘肃", "Qinghai": "青海", "Hainan": "海南",
  "Guangxi": "广西", "Inner Mongolia": "内蒙古", "Tibet": "西藏", "Ningxia": "宁夏",
  "Xinjiang": "新疆", "Guizhou": "贵州", "Yunnan": "云南", "Taiwan": "台湾"
};

// ============ 缓存系统 ============
let countriesCache = null, cityMapCache = null;

const getCache = (key, duration) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < duration) return data.data;
      localStorage.removeItem(key);
    }
  } catch (e) {}
  return null;
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

async function fetchCountries() {
  if (countriesCache) return countriesCache;
  const cached = getCache('countriesDataCache', 7 * 24 * 60 * 60 * 1000);
  if (cached) return countriesCache = cached;

  try {
    const res = await fetch('/js/countries.json');
    countriesCache = await res.json();
    setCache('countriesDataCache', countriesCache);
    return countriesCache;
  } catch (err) {
    console.error('无法加载 countries.json', err);
    return [];
  }
}

async function fetchCityMap() {
  if (cityMapCache) return cityMapCache;
  const cached = getCache('cityMapCache', 7 * 24 * 60 * 60 * 1000);
  if (cached) return cityMapCache = cached;

  try {
    const res = await fetch('/js/city_name.json');
    cityMapCache = await res.json();
    setCache('cityMapCache', cityMapCache);
    return cityMapCache;
  } catch (err) {
    console.error('无法加载 city_name.json', err);
    return [];
  }
}

const getDeviceInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('deviceInfo'));
  } catch (e) {
    return null;
  }
};

const getCountryNameByCode = (countries, code) => {
  const country = countries.find(c => c.abbr === code);
  return country?.chinese || '地球';
};

// ============ 问候语模块 ============
function getGreetingByTimezone(timezone) {
  try {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone };
    const [hour, minute] = new Intl.DateTimeFormat('en-US', options).format(now).split(':').map(Number);
    const mins = hour * 60 + minute;

    if (mins >= 300 && mins < 540) return '早上好!';
    if (mins >= 540 && mins < 690) return '上午好!';
    if (mins >= 690 && mins < 810) return '中午好!';
    if (mins >= 810 && mins < 1080) return '下午好!';
    return '晚上好!';
  } catch (error) {
    return null;
  }
}

function updateGreeting() {
  const greetingEls = document.querySelectorAll('.morning-night-greeting');
  if (!greetingEls.length) return;

  const deviceInfo = getDeviceInfo();
  const timezone = deviceInfo?.geoLocation?.timezone || 
                   deviceInfo?.languageInfo?.timeZone || 
                   localStorage.getItem('userTimeZone') ||
                   Intl.DateTimeFormat().resolvedOptions().timeZone;

  const greeting = getGreetingByTimezone(timezone) || '你好!';
  greetingEls.forEach(el => el.textContent = greeting);
}

// ============ 打字机动画 ============
async function typeWriter(element, text, speed = 100) {
  element.textContent = '';
  for (let i = 0; i < text.length; i++) {
    element.textContent += text.charAt(i);
    await new Promise(resolve => setTimeout(resolve, speed + Math.random() * 50));
  }
}

function startTypingAnimation() {
  document.querySelectorAll('.typing-animation').forEach(async el => {
    if (el.dataset.animationPlayed === 'true') return;
    
    const originalContent = el.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    el.dataset.animationPlayed = 'true';
    el.innerHTML = '';
    await typeWriter(el, textContent, 80);
    el.innerHTML = originalContent;
  });
}

// ============ 国旗更新 ============
function updateLanguageFlags(code) {
  const flags = {
    simplified: document.getElementById("simplifed-language-flag"),
    traditional: document.getElementById("traditional-language-flag"),
    traditionAdd: document.getElementById("traditional-add-language-flag")
  };

  Object.values(flags).forEach(flag => flag && (flag.style.display = "none"));

  const flagMap = {
    SG: [['simplified', 'sg'], ['traditional', 'mo']],
    MY: [['simplified', 'my'], ['traditional', 'mo']],
    TW: [['traditional', 'tw'], ['traditionAdd', 'mo']],
    default: [['traditional', 'mo']]
  };

  (flagMap[code] || flagMap.default).forEach(([type, svg]) => {
    const flag = flags[type];
    if (flag) {
      flag.style.display = "inline-block";
      flag.src = `./images/wflags_svg/${svg}.svg`;
      flag.alt = `${svg.toUpperCase()} flag`;
    }
  });

  if (['HK', 'TW'].includes(code) && !localStorage.getItem("langMode")) {
    localStorage.setItem("langMode", "traditional");
    switchLanguage("traditional");
  }
}

function updateFlagIcon(mode = null) {
  mode = mode || localStorage.getItem("langMode") || "simplified";
  const src = mode === "traditional" ? "./images/wflags_svg/hk.svg" : "./images/wflags_svg/cn.svg";
  
  ['flag-button-lange', 'flag-button'].forEach(id => {
    const flag = document.getElementById(id);
    if (flag) flag.src = src;
  });
}

function updateCountryFlag() {
  const deviceInfo = getDeviceInfo();
  const code = (deviceInfo?.geoLocation?.countryCode || 
                localStorage.getItem('countryCode') || '').toLowerCase();
  
  if (!code) return;

  const flagPath = `./images/wflags/${code}.png`;
  const flags = [
    document.getElementById('country-flag-local-storage'),
    document.querySelector('.country-flag')
  ];

  flags.forEach((flag, i) => {
    if (!flag) return;
    
    if (i === 1 && code === 'tw') {
      flag.style.display = 'none';
      return;
    }

    flag.style.display = 'inline-block';
    flag.src = flagPath;
    flag.alt = code.toUpperCase();
    flag.onerror = () => {
      flag.src = './images/wflags/un.png';
      flag.alt = 'United Nations';
    };
  });
}

// ============ 语言切换 ============
function switchLanguage(mode) {
  const nameBlock = document.getElementById("nameBlock");
  const mobileBanner = document.getElementById("mobileBanner");
  const pcBanner = document.getElementById("pcBanner");

  if (nameBlock) nameBlock.innerHTML = nameBlock.getAttribute("data-" + mode);
  if (mobileBanner) mobileBanner.src = mobileBanner.getAttribute("data-" + mode);
  if (pcBanner) pcBanner.src = pcBanner.getAttribute("data-" + mode);

  if (mode === "traditional" && typeof runFanTiJavaScript === "function") {
    runFanTiJavaScript();
  } else if (mode === "simplified" && typeof runJianTiJavaScript === "function") {
    runJianTiJavaScript();
  }

  updateFlagIcon(mode);
  localStorage.setItem("langMode", mode);
}

function runFanTiJavaScript() {
  const scriptId = 'tongwenlet_tw';
  let script = document.getElementById(scriptId);
  if (script) document.body.removeChild(script);

  script = document.createElement('script');
  script.src = 'js/bookmarklet_tw.js';
  script.id = scriptId;
  document.body.appendChild(script);
  updateFlagIcon('traditional');
}

function runJianTiJavaScript() {
  const scriptId = 'tongwenlet_cn';
  let script = document.getElementById(scriptId);
  if (script) document.body.removeChild(script);

  script = document.createElement('script');
  script.src = 'js/bookmarklet_cn.js';
  script.id = scriptId;
  document.body.appendChild(script);
  updateFlagIcon('simplified');
}

window.setSimplified = () => {
  switchLanguage("simplified");
  document.getElementById("language-menu")?.classList.add("hidden");
};

window.setTraditional = () => {
  switchLanguage("traditional");
  document.getElementById("language-menu")?.classList.add("hidden");
};

// ============ 地理位置显示 ============
async function updateDisplayImmediatelyFromCache() {
  const deviceInfo = getDeviceInfo();
  if (!deviceInfo) return;

  const code = deviceInfo.geoLocation?.countryCode || "";
  updateCountryFlag();
  updateFlagIcon();
  if (code) updateLanguageFlags(code);

  setTimeout(async () => {
    try {
      const [countries, cityArray] = await Promise.all([fetchCountries(), fetchCityMap()]);
      const region = deviceInfo.geoLocation?.region || "";
      const city = deviceInfo.geoLocation?.city || "";

      let content = null;
      for (const cityObj of cityArray) {
        if (cityObj[city]) {
          content = cityObj[city]['ZH-CN'];
          break;
        }
      }

      if (!content && code === "CN") content = cnProvincesMap[region] || "中国";
      if (!content) content = getCountryNameByCode(countries, code);

      document.querySelectorAll(".geo-location").forEach(span => {
        span.textContent = content || "地球";
      });

      if (code) updateLanguageFlags(code);
      updateGreeting();
    } catch (error) {
      updateGreeting();
    }
  }, 100);
}

let geoLocationLoaded = false;

async function displayGeoLocation() {
  if (window.ipinfoData || window.ipinfoCache) {
    const data = window.ipinfoData || window.ipinfoCache;
    const deviceInfo = getDeviceInfo() || {};
    
    deviceInfo.geoLocation = {
      countryCode: (data.country || '').toUpperCase(),
      region: data.region || '',
      city: data.city || '',
      timezone: data.timezone || ''
    };
    deviceInfo.timestamp = Date.now();
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    
    await updateDisplayImmediatelyFromCache();
    geoLocationLoaded = true;
    return;
  }

  const deviceInfo = getDeviceInfo();
  if (deviceInfo && geoLocationLoaded) {
    if (Date.now() - deviceInfo.timestamp < 1800000) return;
    geoLocationLoaded = false;
  }

  if (geoLocationLoaded) return;
  geoLocationLoaded = true;

  if (deviceInfo && Date.now() - deviceInfo.timestamp < 1800000) {
    await updateDisplayImmediatelyFromCache();
    return;
  }

  await updateDisplayImmediatelyFromCache();

  setTimeout(async () => {
    try {
      const res = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
      const data = await res.json();
      
      localStorage.setItem('countryCodeCache', JSON.stringify({
        countryCode: data.country || "",
        regionEnglish: data.region || "",
        cityEnglish: data.city || "",
        timestamp: Date.now()
      }));

      const updated = getDeviceInfo() || {};
      updated.geoLocation = {
        countryCode: data.country,
        region: data.region,
        city: data.city,
        timezone: data.timezone
      };
      updated.timestamp = Date.now();
      localStorage.setItem('deviceInfo', JSON.stringify(updated));

      await updateDisplayImmediatelyFromCache();
    } catch (err) {}
  }, 1000);
}

// ============ 导航栏宽度 ============
function measureAndDistributeNavWidths() {
  const navItems = document.querySelectorAll('.nav-container > div');
  if (!navItems.length) return [];

  const temp = document.createElement('div');
  Object.assign(temp.style, {
    position: 'absolute', top: '-9999px', visibility: 'hidden',
    whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: 'inherit'
  });
  document.body.appendChild(temp);

  const measurements = Array.from(navItems).map((item, i) => {
    const clone = item.cloneNode(true);
    clone.style.cssText = 'position:static;visibility:visible;white-space:nowrap;display:block';
    temp.appendChild(clone);
    const width = clone.offsetWidth;
    temp.removeChild(clone);
    return { index: i + 1, element: item, width };
  });

  document.body.removeChild(temp);

  const total = measurements.reduce((sum, m) => sum + m.width, 0);
  measurements.forEach(m => {
    let ratio = (m.width / total * 100).toFixed(2);
    if (m.index === measurements.length) ratio = (ratio * 0.95).toFixed(2);
    m.element.style.width = `${ratio}%`;
  });

  return measurements.map(m => m.element.style.width);
}

function initNavWidths() {
  const deviceInfo = getDeviceInfo();
  const cacheKey = 'navWidthsCache';
  const cached = getCache(cacheKey, 24 * 60 * 60 * 1000);

  if (cached && cached.deviceType === deviceInfo?.deviceType && 
      Math.abs(cached.screenWidth - (deviceInfo?.viewport?.width || window.innerWidth)) < 50) {
    document.querySelectorAll('.nav-container > div').forEach((item, i) => {
      if (cached.widths[i]) item.style.width = cached.widths[i];
    });
  } else {
    const widths = measureAndDistributeNavWidths();
    setCache(cacheKey, {
      widths,
      deviceType: deviceInfo?.deviceType || 'unknown',
      screenWidth: deviceInfo?.viewport?.width || window.innerWidth
    });
  }
}

// 立即注入缓存样式
(() => {
  const cached = getCache('navWidthsCache', 24 * 60 * 60 * 1000);
  if (cached?.widths && document.head) {
    const style = document.createElement('style');
    style.textContent = cached.widths.map((w, i) => 
      `.nav-container > div:nth-child(${i + 1}) { width: ${w} !important; }`
    ).join('\n');
    document.head.appendChild(style);
  }
})();

// ============ 事件监听 ============
let listenersAdded = false;

function initEventListeners() {
  if (listenersAdded) return;
  
  const button = document.getElementById("language-button");
  const flagButton = document.getElementById("flag-button-lange");
  const menu = document.getElementById("language-menu");

  [button, flagButton].forEach(btn => {
    btn?.addEventListener("click", e => {
      e.stopPropagation();
      menu?.classList.toggle("hidden");
    });
  });

  document.addEventListener("click", () => menu?.classList.add("hidden"));
  
  window.addEventListener('storage', e => {
    if (e.key === 'langMode') {
      updateFlagIcon();
    } else if (e.key === 'countryCode') {
      updateCountryFlag();
    }
  });

  listenersAdded = true;
}

// ============ 初始化 ============
document.addEventListener("DOMContentLoaded", () => {
  updateDisplayImmediatelyFromCache();
  const savedMode = localStorage.getItem("langMode") || "simplified";
  switchLanguage(savedMode);
  updateFlagIcon(savedMode);
  updateGreeting();
  initEventListeners();
  initNavWidths();
  
  setTimeout(startTypingAnimation, 1000);
});

if (document.readyState !== 'loading') {
  updateDisplayImmediatelyFromCache();
}

document.addEventListener('DOMContentLoaded', displayGeoLocation);

window.addEventListener('resize', () => {
  localStorage.removeItem('navWidthsCache');
  setTimeout(initNavWidths, 50);
});

// ============ 测试函数（保留调试用） ============
window.testGreeting = timezone => {
  const el = document.querySelector('.morning-night-greeting');
  if (!el) return console.error('未找到问候语元素');
  
  const deviceInfo = getDeviceInfo();
  const tz = timezone || deviceInfo?.geoLocation?.timezone || 
             Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  console.log(`测试时区: ${tz}`);
  console.log(`问候语: ${getGreetingByTimezone(tz)}`);
  updateGreeting();
};

window.forceUpdateGreeting = updateGreeting;
window.testZurich = () => testGreeting('Europe/Zurich');
window.checkTimezoneCache = () => console.log('设备信息:', getDeviceInfo());
window.refreshTimezone = () => {
  geoLocationLoaded = false;
  ['deviceInfo', 'countryCodeCache', 'userTimeZone'].forEach(k => localStorage.removeItem(k));
  displayGeoLocation();
  setTimeout(updateGreeting, 1000);
};