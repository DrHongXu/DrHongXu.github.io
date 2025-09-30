// 检查是否已经声明过，避免重复声明
if (typeof cnProvincesMap === 'undefined') {
  var cnProvincesMap = {
    "Beijing": "北京", "Shanghai": "上海", "Tianjin": "天津", "Chongqing": "重庆",
    "Guangdong": "广东", "Zhejiang": "浙江", "Jiangsu": "江苏", "Shandong": "山东",
    "Sichuan": "四川", "Hubei": "湖北", "Hunan": "湖南", "Henan": "河南",
    "Fujian": "福建", "Anhui": "安徽", "Jiangxi": "江西", "Liaoning": "辽宁",
    "Heilongjiang": "黑龙江", "Jilin": "吉林", "Hebei": "河北", "Shanxi": "山西",
    "Shaanxi": "陕西", "Gansu": "甘肃", "Qinghai": "青海", "Hainan": "海南",
    "Guangxi": "广西", "Inner Mongolia": "内蒙古", "Tibet": "西藏", "Ningxia": "宁夏",
    "Xinjiang": "新疆", "Guizhou": "贵州", "Yunnan": "云南", "Taiwan": "台湾"
  };
}

// 异步数据获取函数（带缓存）
let countriesCache = null;
let cityMapCache = null;

async function fetchCountries() {
  if (countriesCache) return countriesCache;
  const response = await fetch('/js/countries.json');
  countriesCache = await response.json();
  return countriesCache;
}

async function fetchCityMap() {
  if (cityMapCache) return cityMapCache;
  const response = await fetch('/js/city_name.json');
  cityMapCache = await response.json();
  return cityMapCache;
}

function getCountryNameByCode(countries, code, language = 'chinese') {
  const country = countries.find(c => c.abbr === code);
  return country ? (country[language] || country.chinese) : '地球';
}

// 从index.html缓存获取设备信息的辅助函数
function getDeviceInfoFromCache() {
  const deviceInfo = localStorage.getItem('deviceInfo');
  if (deviceInfo) {
    try {
      return JSON.parse(deviceInfo);
    } catch (e) {
      console.warn('Failed to parse deviceInfo from cache');
      return null;
    }
  }
  return null;
}

// 获取设备类型（从index.html缓存）
function getDeviceTypeFromCache() {
  const deviceInfo = getDeviceInfoFromCache();
  return deviceInfo?.deviceType || 'unknown';
}

// 获取屏幕宽度（从index.html缓存）
function getScreenWidthFromCache() {
  const deviceInfo = getDeviceInfoFromCache();
  return deviceInfo?.viewport?.width || window.innerWidth;
}

// 获取用户语言（从index.html缓存）
function getUserLanguageFromCache() {
  const deviceInfo = getDeviceInfoFromCache();
  return deviceInfo?.language?.primary || navigator.language;
}

// 根据时区获取问候语
function getGreetingByTimezone(timezone) {
  try {
    const now = new Date();
    
    // 使用24小时制格式
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    };
    
    const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
    const [hour, minute] = timeString.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    // 05:00-08:59: 早安
    if (timeInMinutes >= 300 && timeInMinutes < 540) {
      return '早上好!';
    }
    // 09:00-11:29: 上午好
    else if (timeInMinutes >= 540 && timeInMinutes < 690) {
      return '上午好!';
    }
    // 11:30-13:29: 午安
    else if (timeInMinutes >= 690 && timeInMinutes < 810) {
      return '中午好!';
    }
    // 13:30-17:59: 下午好
    else if (timeInMinutes >= 810 && timeInMinutes < 1080) {
      return '下午好!';
    }
    // 18:00-04:59: 晚上好
    else {
      return '晚上好!';
    }
  } catch (error) {
    console.warn('获取时区问候语失败:', error);
    return null;
  }
}

// 更新问候语显示
function updateGreeting() {
  const greetingElement = document.querySelector('.morning-night-greeting');
  if (!greetingElement) {
    return;
  }
  
  // 默认问候语
  const defaultGreeting = '你好!';
  
  try {
    // 获取设备信息
    const deviceInfo = getDeviceInfoFromCache();
    let timezone = null;
    
    if (deviceInfo) {
      // 优先获取IP info缓存的时区信息
      timezone = deviceInfo.geoLocation?.timezone ||
                 deviceInfo.languageInfo?.timeZone || 
                 localStorage.getItem('userTimeZone');
    }
    
    // 如果没有时区信息，使用浏览器默认时区
    if (!timezone) {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    // 获取问候语
    const greeting = getGreetingByTimezone(timezone);
    if (greeting) {
      greetingElement.textContent = greeting;
    } else {
      // 如果获取失败，设置为默认问候语
      greetingElement.textContent = defaultGreeting;
    }
  } catch (error) {
    // 任何错误都设置为默认问候语
    greetingElement.textContent = defaultGreeting;
  }
}

// 立即更新显示（使用缓存，无延迟）
function updateDisplayImmediatelyFromCache() {
  const deviceInfo = getDeviceInfoFromCache();
  if (!deviceInfo) return;
  
  const countryCode = deviceInfo.geoLocation?.countryCode || "";
  const regionEnglish = deviceInfo.geoLocation?.region || "";
  const cityEnglish = deviceInfo.geoLocation?.city || "";
  
  // 保持默认的"地球"显示，不显示国家代码
  // document.querySelectorAll(".geo-location").forEach(span => {
  //   span.textContent = "地球";
  // });
  
  // 立即更新国旗
  const countryFlagImg = document.getElementById('country-flag-local-storage');
  if (countryFlagImg && countryCode) {
    const lowerCode = countryCode.toLowerCase();
    const flagPath = `./images/wflags/${lowerCode}.png`;
    countryFlagImg.src = flagPath;
    countryFlagImg.alt = `Flag of ${countryCode.toUpperCase()}`;
    
    countryFlagImg.onerror = function() {
      this.src = './images/wflags/un.png';
      this.alt = 'United Nations';
    };
  }
  
  // 立即更新语言国旗
  updateFlagIcon();
  
  // 异步获取完整的地理位置名称和更新问候语
  setTimeout(async () => {
    try {
      const countries = await fetchCountries();
      const cityArray = await fetchCityMap();
      
      // 计算城市/省/国家显示
      let content = null;
      for (const cityObj of cityArray) {
        if (cityObj[cityEnglish]) {
          content = cityObj[cityEnglish]['ZH-CN'];
          break;
        }
      }

      if (!content && countryCode === "CN") {
        content = cnProvincesMap[regionEnglish] || "中国";
      }

      if (!content) {
        content = getCountryNameByCode(countries, countryCode, 'chinese');
      }
      
      // 更新为完整的地理位置名称
      document.querySelectorAll(".geo-location").forEach(span => {
        span.textContent = content || "地球";
      });
      
      // 在获取完整地理位置信息后更新问候语
      updateGreeting();
    } catch (error) {
      // 即使失败也要更新问候语
      updateGreeting();
    }
  }, 100);
}

// 全局变量和状态管理
let button, flagButton, menu;
let listenersAdded = false;
let geoLocationLoaded = false;

// 统一的国旗更新函数
function updateFlagIcon(mode = null) {
  // 如果没有传入mode，从localStorage获取
  if (!mode) {
    mode = localStorage.getItem("langMode") || "simplified";
  }
  
  // 更新主语言国旗
  const flagButtonLange = document.getElementById("flag-button-lange");
  if (flagButtonLange) {
    if (mode === "traditional") {
      flagButtonLange.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButtonLange.src = "./images/wflags_svg/cn.svg";
    }
  }
  
  // 更新备用国旗（如果存在）
  const flagButton = document.getElementById("flag-button");
  if (flagButton) {
    if (mode === "traditional") {
      flagButton.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButton.src = "./images/wflags_svg/cn.svg";
    }
  }
}

// 根据countryCode动态显示国旗（使用index.html的缓存）
function updateCountryFlag() {
  const countryFlagImg = document.getElementById('country-flag-local-storage');
  
  // 优先从index.html的deviceInfo缓存获取
  let cachedCode = null;
  const deviceInfo = localStorage.getItem('deviceInfo');
  
  if (deviceInfo) {
    try {
      const deviceData = JSON.parse(deviceInfo);
      cachedCode = deviceData.geoLocation?.countryCode;
    } catch (e) {
      // 如果解析失败，回退到旧方法
      const countryCodeCache = localStorage.getItem('countryCodeCache');
      if (countryCodeCache) {
        try {
          const cacheData = JSON.parse(countryCodeCache);
          cachedCode = cacheData.countryCode;
        } catch (e2) {
          cachedCode = localStorage.getItem('countryCode');
        }
      } else {
        cachedCode = localStorage.getItem('countryCode');
      }
    }
  } else {
    // 回退到旧方法
    const countryCodeCache = localStorage.getItem('countryCodeCache');
    if (countryCodeCache) {
      try {
        const cacheData = JSON.parse(countryCodeCache);
        cachedCode = cacheData.countryCode;
      } catch (e) {
        cachedCode = localStorage.getItem('countryCode');
      }
    } else {
      cachedCode = localStorage.getItem('countryCode');
    }
  }
  
  if (cachedCode && countryFlagImg && cachedCode.trim() !== '' && cachedCode.length > 1) {
    const lowerCode = cachedCode.toLowerCase();
    const flagPath = `./images/wflags/${lowerCode}.png`;
    
    countryFlagImg.src = flagPath;
    countryFlagImg.alt = `Flag of ${cachedCode.toUpperCase()}`;
    
    // 如果图片加载失败，显示默认的UN旗帜
    countryFlagImg.onerror = function() {
      this.src = './images/wflags/un.png';
      this.alt = 'United Nations';
    };
  } else if (countryFlagImg) {
    // 如果没有国家代码，显示默认旗帜
    countryFlagImg.src = './images/wflags/un.png';
    countryFlagImg.alt = 'United Nations';
  }
}

// 更新语言显示和国旗（用于cn-research.html等页面）
function updateLanguageDisplay(mode) {
  const languageButton = document.getElementById("language-button");
  const flagButton = document.getElementById("flag-button");
  const flagButtonLange = document.getElementById("flag-button-lange");

  if (languageButton) {
    if (mode === "traditional") {
      // 繁体中文
      languageButton.innerHTML = 'Hk<span style="color:transparent;">▾</span>';
    } else {
      // 简体中文
      languageButton.innerHTML = 'Zh<span style="color:transparent;">▾</span>';
    }
  }

  // 更新国旗（支持两种ID）
  if (flagButton) {
    if (mode === "traditional") {
      flagButton.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButton.src = "./images/wflags_svg/cn.svg";
    }
  }

  if (flagButtonLange) {
    if (mode === "traditional") {
      flagButtonLange.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButtonLange.src = "./images/wflags_svg/cn.svg";
    }
  }
}

// 统一的简繁切换函数
function switchLanguage(mode) {
  // 第1处：姓名标题
  var nameBlock = document.getElementById("nameBlock");
  if (nameBlock) {
    nameBlock.innerHTML = nameBlock.getAttribute("data-" + mode);
  }

  // 第2处：手机端 banner
  var mobileBanner = document.getElementById("mobileBanner");
  if (mobileBanner) {
    mobileBanner.src = mobileBanner.getAttribute("data-" + mode);
  }

  // 第3处：PC端 banner
  var pcBanner = document.getElementById("pcBanner");
  if (pcBanner) {
    pcBanner.src = pcBanner.getAttribute("data-" + mode);
  }

  // 调用原有的简繁切换逻辑
  if (mode === "traditional" && typeof runFanTiJavaScript === "function") {
    runFanTiJavaScript();
  } else if (mode === "simplified" && typeof runJianTiJavaScript === "function") {
    runJianTiJavaScript();
  }

  // 更新国旗图标
  updateFlagIcon(mode);
  
  // 更新语言显示
  updateLanguageDisplay(mode);

  // 存储当前选择
  localStorage.setItem("langMode", mode);
}

// 繁体中文切换函数
function runFanTiJavaScript() {
  const scriptId = 'tongwenlet_tw';
  let script = document.getElementById(scriptId);

  if (script) {
    document.body.removeChild(script);
  }

  script = document.createElement('script');
  script.language = 'javascript';
  script.type = 'text/javascript';
  script.src = 'js/bookmarklet_tw.js';
  script.id = scriptId;
  document.body.appendChild(script);
  
  // 切换国旗图标
  updateFlagIcon('traditional');
}

// 简体中文切换函数
function runJianTiJavaScript() {
  const scriptId = 'tongwenlet_cn';
  let script = document.getElementById(scriptId);

  if (script) {
    document.body.removeChild(script);
  }

  script = document.createElement('script');
  script.language = 'javascript';
  script.type = 'text/javascript';
  script.src = 'js/bookmarklet_cn.js';
  script.id = scriptId;
  document.body.appendChild(script);
  
  // 切换国旗图标
  updateFlagIcon('simplified');
}

// 全局简繁切换按钮函数
window.setSimplified = function() {
  switchLanguage("simplified");
  // 关闭菜单
  if (menu) menu.classList.add("hidden");
};

window.setTraditional = function() {
  switchLanguage("traditional");
  // 关闭菜单
  if (menu) menu.classList.add("hidden");
};

// 备用简繁切换函数（用于兼容性）
function setSimplified() {
  switchLanguage("simplified");
}

function setTraditional() {
  switchLanguage("traditional");
}

// 语言选择处理函数
function handleLanguageChange(select) {
  var value = select.value;
  if(value === "simplified" || value === "traditional") {
    // 切换简繁体
    switchLanguage(value);
  } else {
    // 跳转到其他语言页面
    window.location.href = value;
  }
}

// 处理语言切换（兼容旧版本）
function handleChange(select) {
  const selectedValue = select.value;

  if (selectedValue === 'javascript:runFanTiJavaScript();') {
    // 切换到繁体中文
    runFanTiJavaScript();
    currentLanguage = '繁体';
    updateSelectBox(); // 确保选框同步状态
    updateLogo(); // 切换语言时更新 logo
  } else {
    // 切换到其他语言或简体中文
    if (selectedValue !== '') {
      currentLanguage = select.options[select.selectedIndex].textContent.trim();
      updateLogo(); // 切换语言时更新 logo
      window.location.href = selectedValue; // 跳转页面
    }
  }
}

// 立即更新显示，使用index.html的缓存信息
function updateDisplayImmediate() {
  // 从index.html的deviceInfo缓存获取信息
  const deviceInfo = localStorage.getItem('deviceInfo');
  let countryCode = "", regionEnglish = "", cityEnglish = "";
  
  if (deviceInfo) {
    try {
      const deviceData = JSON.parse(deviceInfo);
      countryCode = deviceData.geoLocation?.countryCode || "";
      regionEnglish = deviceData.geoLocation?.region || "";
      cityEnglish = deviceData.geoLocation?.city || "";
    } catch (e) {
      // 静默处理解析错误
    }
  }
  
  // 保持默认的"地球"显示，不显示国家代码
  // document.querySelectorAll(".geo-location").forEach(span => {
  //   span.textContent = countryCode || "地球";
  // });

  // 初始化DOM元素引用
  if (!button) button = document.getElementById("language-button");
  if (!flagButton) flagButton = document.getElementById("flag-button-lange");
  if (!menu) menu = document.getElementById("language-menu");
  
  // 页面加载时更新国旗
  updateFlagIcon();
  
  // 确保DOM完全加载后再更新国旗
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCountryFlag);
  } else {
    updateCountryFlag();
  }
  
  // 为En文字添加点击事件（避免重复添加）
  if (button && !listenersAdded) {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      menu.classList.toggle("hidden");
    });
  }
  
  // 为国旗图标添加点击事件（避免重复添加）
  if (flagButton && !listenersAdded) {
    flagButton.addEventListener("click", (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      menu.classList.toggle("hidden");
    });
  }
  
  // 点击页面其他地方收起菜单（避免重复添加）
  if (!listenersAdded) {
    document.addEventListener("click", () => {
      if (menu) menu.classList.add("hidden");
    });
    listenersAdded = true;
  }

  // 更新国旗
  const flagImg = document.querySelector(".country-flag");
  if (flagImg) {
    if (countryCode === "TW") {
      flagImg.style.display = "none"; // TW 不显示
    } else {
      flagImg.style.display = "inline-block";
      flagImg.src = `./images/wflags/${countryCode.toLowerCase()}.png`;
      flagImg.alt = countryCode;
    }
  }
}

function updateDisplay(countryCode, regionEnglish, cityEnglish, countries, cityArray) {
  // 计算城市/省/国家显示
  let content = null;
  for (const cityObj of cityArray) {
    if (cityObj[cityEnglish]) {
      content = cityObj[cityEnglish]['ZH-CN'];
      break;
    }
  }

  if (!content && countryCode === "CN") {
    content = cnProvincesMap[regionEnglish] || "中国";
  }

  if (!content) {
    content = getCountryNameByCode(countries, countryCode, 'chinese');
  }

  // 更新 geo-location
  document.querySelectorAll(".geo-location").forEach(span => {
    span.textContent = content;
  });
  
  // 更新问候语
  updateGreeting();

  // 初始化DOM元素引用
  if (!button) button = document.getElementById("language-button");
  if (!flagButton) flagButton = document.getElementById("flag-button-lange");
  if (!menu) menu = document.getElementById("language-menu");
  
  // 页面加载时更新国旗
  updateFlagIcon();
  
  // 确保DOM完全加载后再更新国旗
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCountryFlag);
  } else {
    updateCountryFlag();
  }
  
  // 为En文字添加点击事件（避免重复添加）
  if (button && !listenersAdded) {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      menu.classList.toggle("hidden");
    });
  }
  
  // 为国旗图标添加点击事件（避免重复添加）
  if (flagButton && !listenersAdded) {
    flagButton.addEventListener("click", (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      menu.classList.toggle("hidden");
    });
  }
  
  // 点击页面其他地方收起菜单（避免重复添加）
  if (!listenersAdded) {
    document.addEventListener("click", () => {
      if (menu) menu.classList.add("hidden");
    });
    listenersAdded = true;
  }

  // 更新国旗
  const flagImg = document.querySelector(".country-flag");
  if (flagImg) {
    if (countryCode === "TW") {
      flagImg.style.display = "none"; // TW 不显示
    } else {
      flagImg.style.display = "inline-block";
      flagImg.src = `./images/wflags/${countryCode.toLowerCase()}.png`;
      flagImg.alt = content;
    }
  }

  // 简繁旗
  const simplifiedFlag = document.getElementById("simplifed-language-flag");
  const traditionalFlag = document.getElementById("traditional-language-flag");
  const traditionalFlagAdd = document.getElementById("traditional-add-language-flag");

  if (simplifiedFlag) simplifiedFlag.style.display = "none";
  if (traditionalFlag) traditionalFlag.style.display = "none";
  if (traditionalFlagAdd) traditionalFlagAdd.style.display = "none";

  if (countryCode === "SG") {
    if (simplifiedFlag) { simplifiedFlag.style.display = "inline-block"; simplifiedFlag.src = "./images/wflags_svg/sg.svg"; }
    if (traditionalFlag) { traditionalFlag.style.display = "inline-block"; traditionalFlag.src = "./images/wflags_svg/mo.svg"; }
  } else if (countryCode === "MY") {
    if (simplifiedFlag) { simplifiedFlag.style.display = "inline-block"; simplifiedFlag.src = "./images/wflags_svg/my.svg"; }
    if (traditionalFlag) { traditionalFlag.style.display = "inline-block"; traditionalFlag.src = "./images/wflags_svg/mo.svg"; }
  } else if (countryCode === "TW") {
    if (traditionalFlag) { traditionalFlag.style.display = "inline-block"; traditionalFlag.src = "./images/wflags_svg/tw.svg"; }
    if (traditionalFlagAdd) { traditionalFlagAdd.style.display = "inline-block"; traditionalFlagAdd.src = "./images/wflags_svg/mo.svg"; }
  } else {
    if (traditionalFlag) { traditionalFlag.style.display = "inline-block"; traditionalFlag.src = "./images/wflags_svg/mo.svg"; }
  }

  // HK/TW 初始化繁体
  if (countryCode === "HK" || countryCode === "TW") {
    if (!localStorage.getItem("langMode")) localStorage.setItem("langMode", "traditional");
    switchLanguage("traditional");
  }
}

async function displayGeoLocation() {
  // 检查是否需要重新加载（IP变化时）
  const deviceInfo = localStorage.getItem('deviceInfo');
  if (deviceInfo && geoLocationLoaded) {
    try {
      const deviceData = JSON.parse(deviceInfo);
      const now = Date.now();
      // 如果缓存时间超过30分钟，重新加载
      if (now - deviceData.timestamp > 1800) {
        console.log('地理位置缓存已过期，重新获取...');
        geoLocationLoaded = false;
      } else {
        // 缓存仍然有效，直接返回
        return;
      }
    } catch (e) {
      console.warn('解析设备信息失败，重新获取地理位置');
      geoLocationLoaded = false;
    }
  }
  
  // 如果已经加载过且缓存有效，直接返回
  if (geoLocationLoaded) return;
  geoLocationLoaded = true;
  
  // 优先使用index.html的deviceInfo缓存
  let countryCode = "", regionEnglish = "", cityEnglish = "";
  
  if (deviceInfo) {
    try {
      const deviceData = JSON.parse(deviceInfo);
      const now = Date.now();
      // 如果deviceInfo缓存时间少于30分钟，直接使用
      if (now - deviceData.timestamp < 1800) {
        countryCode = deviceData.geoLocation?.countryCode || "";
        regionEnglish = deviceData.geoLocation?.region || "";
        cityEnglish = deviceData.geoLocation?.city || "";
        
        // 立即更新显示，不等待网络请求
        updateDisplayImmediatelyFromCache();
        
        // 异步加载数据，不阻塞页面
        setTimeout(() => {
          Promise.all([fetchCountries(), fetchCityMap()]).then(([countries, cityArray]) => {
            updateDisplay(countryCode, regionEnglish, cityEnglish, countries, cityArray);
          }).catch(() => {
            // 静默处理错误
          });
        }, 100);
        return;
      }
    } catch (e) {
      console.warn('Failed to parse deviceInfo from index.html cache');
    }
  }
  
  // 回退到旧的countryCodeCache方法
  let cached = localStorage.getItem('countryCodeCache');
  if (cached) {
    const cachedData = JSON.parse(cached);
    const now = Date.now();
    // 如果缓存时间少于30分钟，直接使用缓存
    if (now - cachedData.timestamp < 1800) {
      countryCode = cachedData.countryCode;
      regionEnglish = cachedData.regionEnglish;
      cityEnglish = cachedData.cityEnglish;
      
      // 立即更新显示，不等待网络请求
      updateDisplayImmediatelyFromCache();
      
      // 异步加载数据，不阻塞页面
      setTimeout(() => {
        Promise.all([fetchCountries(), fetchCityMap()]).then(([countries, cityArray]) => {
          updateDisplay(countryCode, regionEnglish, cityEnglish, countries, cityArray);
        }).catch(() => {
          // 静默处理错误
        });
      }, 100);
      return;
    }
  }
  
  // 显示默认内容，不进行任何网络请求
  updateDisplayImmediatelyFromCache();
  
  // 异步加载所有数据，不阻塞页面
  setTimeout(async () => {
    try {
      const countries = await fetchCountries();
      const cityArray = await fetchCityMap();
      
      // 异步刷新 IPInfo（仅在必要时）
      try {
        const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
        const data = await response.json();

        const newCountryCode = data.country || "";
        const newRegion = data.region || "";
        const newCity = data.city || "";

        // 更新旧的缓存格式（向后兼容）
        localStorage.setItem('countryCodeCache', JSON.stringify({
          countryCode: newCountryCode, 
          regionEnglish: newRegion, 
          cityEnglish: newCity, 
          timestamp: Date.now()
        }));
        
        updateDisplay(newCountryCode, newRegion, newCity, countries, cityArray);
      } catch (err) {
        // 静默处理错误
      }
    } catch (err) {
      // 静默处理错误
    }
  }, 1000);
}

// 监听languageMode变化（避免重复添加）
if (!window.storageListenerAdded) {
  window.addEventListener('storage', function(e) {
    if (e.key === 'langMode') {
      updateFlagIcon();
      updateLanguageDisplay(localStorage.getItem("langMode") || "simplified");
    } else if (e.key === 'countryCode') {
      updateCountryFlag();
    }
  });
  window.storageListenerAdded = true;
}

// 监听localStorage变化（同页面内）
if (!localStorage.interceptorAdded) {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'langMode') {
      updateFlagIcon();
      updateLanguageDisplay(value);
    } else if (key === 'countryCode') {
      updateCountryFlag();
    }
  };
  localStorage.interceptorAdded = true;
}

// 页面加载时的初始化
document.addEventListener("DOMContentLoaded", function() {
  // 立即使用缓存更新显示
  updateDisplayImmediatelyFromCache();
  
  // 默认简体或者 localStorage 中的保存值
  var savedMode = localStorage.getItem("langMode") || "simplified";
  switchLanguage(savedMode);

  // 确保国旗图标在页面加载时正确显示
  updateFlagIcon(savedMode);

  // 确保语言显示在页面加载时正确显示
  updateLanguageDisplay(savedMode);
  
  // 确保问候语在页面加载时正确显示
  updateGreeting();
});

// 立即执行，不等待DOMContentLoaded
if (document.readyState === 'loading') {
  // 如果DOM还在加载，等待DOMContentLoaded
  document.addEventListener('DOMContentLoaded', updateDisplayImmediatelyFromCache);
} else {
  // 如果DOM已经加载完成，立即执行
  updateDisplayImmediatelyFromCache();
}

// 地理定位初始化
document.addEventListener('DOMContentLoaded', displayGeoLocation);



// 设置导航栏目宽度分配（使用index.html的缓存信息）
function measureAndDistributeNavWidths() {
  const navItems = document.querySelectorAll('.nav-container > div');
  const measurements = [];
  
  // 获取缓存的设备信息
  const deviceInfo = getDeviceInfoFromCache();
  const deviceType = deviceInfo?.deviceType || 'unknown';
  const screenWidth = deviceInfo?.viewport?.width || window.innerWidth;
  
  // 创建临时测量容器
  const measureContainer = document.createElement('div');
  measureContainer.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
    white-space: nowrap;
    font-family: inherit;
    font-size: inherit;
  `;
  document.body.appendChild(measureContainer);
  
  navItems.forEach((item, index) => {
    // 克隆导航项内容进行测量
    const clone = item.cloneNode(true);
    clone.style.cssText = `
      position: static;
      visibility: visible;
      white-space: nowrap;
      display: block;
    `;
    
    measureContainer.appendChild(clone);
    const width = clone.offsetWidth;
    measureContainer.removeChild(clone);
    
    measurements.push({
      index: index + 1,
      element: item,
      width: width,
      content: item.textContent.trim()
    });
  });
  
  document.body.removeChild(measureContainer);
  
  // 计算总宽度和比例
  const totalWidth = measurements.reduce((sum, item) => sum + item.width, 0);
  const containerWidth = document.querySelector('.nav-container').offsetWidth;
  
  // 应用动态比例 - 使用 table-layout: fixed 和 width 百分比
  measurements.forEach(item => {
    let ratio = (item.width / totalWidth * 100).toFixed(2);
    
    // 最后一个导航项（语言选择）减少5%宽度
    if (item.index === measurements.length) {
      ratio = (ratio * 0.95).toFixed(2);
    }
    
    item.element.style.width = `${ratio}%`;
  });
  
  return measurements;
}

// 缓存系统（使用index.html的设备信息）
function getCachedNavWidths() {
  const cacheKey = 'navWidthsCache';
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // 检查缓存是否过期（24小时）
      if (now - cacheData.timestamp < 24 * 60 * 60 * 1000) {
        // 验证设备信息是否匹配
        const deviceInfo = getDeviceInfoFromCache();
        const currentDeviceType = deviceInfo?.deviceType || 'unknown';
        const currentScreenWidth = deviceInfo?.viewport?.width || window.innerWidth;
        
        if (cacheData.deviceType === currentDeviceType && 
            Math.abs(cacheData.screenWidth - currentScreenWidth) < 50) {
          return cacheData.widths;
        } else {
          localStorage.removeItem(cacheKey);
        }
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }
  
  return null;
}

function setCachedNavWidths(widths) {
  const cacheKey = 'navWidthsCache';
  const deviceInfo = getDeviceInfoFromCache();
  const cacheData = {
    widths: widths,
    timestamp: Date.now(),
    deviceType: deviceInfo?.deviceType || 'unknown',
    screenWidth: deviceInfo?.viewport?.width || window.innerWidth
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    // 静默处理缓存错误
  }
}

function applyCachedWidths(cachedWidths) {
  const navItems = document.querySelectorAll('.nav-container > div');
  
  navItems.forEach((item, index) => {
    if (cachedWidths[index]) {
      item.style.width = cachedWidths[index];
    }
  });
}

function initializeNavWidths() {
  // 优先使用缓存
  const cachedWidths = getCachedNavWidths();
  
  if (cachedWidths) {
    applyCachedWidths(cachedWidths);
  } else {
    // 缓存不存在或过期，进行测量
    const measurements = measureAndDistributeNavWidths();
    
    // 将结果缓存
    const widths = measurements.map(item => {
      let ratio = (item.width / measurements.reduce((sum, m) => sum + m.width, 0) * 100).toFixed(2);
      
      // 最后一个导航项减少5%宽度
      if (item.index === measurements.length) {
        ratio = (ratio * 0.95).toFixed(2);
      }
      
      return `${ratio}%`;
    });
    
    setCachedNavWidths(widths);
  }
}

// 立即应用缓存的导航宽度（减少闪现）
function applyNavWidthsImmediately() {
  const cachedWidths = getCachedNavWidths();
  if (cachedWidths) {
    // 立即应用缓存，不等待DOM完全加载
    const navItems = document.querySelectorAll('.nav-container > div');
    navItems.forEach((item, index) => {
      if (cachedWidths[index]) {
        item.style.width = cachedWidths[index];
      }
    });
    return true;
  }
  return false;
}

// 在DOM构建过程中就尝试应用缓存（减少闪现）
function tryApplyCacheEarly() {
  // 检查是否有缓存的导航宽度设置
  const cachedWidths = getCachedNavWidths();
  if (cachedWidths) {
    // 尝试立即应用缓存
    const navItems = document.querySelectorAll('.nav-container > div');
    if (navItems.length > 0) {
      navItems.forEach((item, index) => {
        if (cachedWidths[index]) {
          item.style.width = cachedWidths[index];
        }
      });
      return true;
    }
  }
  return false;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 移除临时CSS样式
  const tempStyle = document.getElementById('nav-width-cache');
  if (tempStyle) {
    tempStyle.remove();
  }
  
  const inlineStyle = document.getElementById('nav-width-inline');
  if (inlineStyle) {
    inlineStyle.remove();
  }
  
  // 立即验证和更新，无延迟
  initializeNavWidths();
});

// 在页面加载过程中多次尝试应用缓存
let earlyCacheAttempts = 0;
const maxEarlyAttempts = 10;

function attemptEarlyCache() {
  if (earlyCacheAttempts < maxEarlyAttempts) {
    earlyCacheAttempts++;
    if (!tryApplyCacheEarly()) {
      // 如果DOM还没准备好，继续尝试
      setTimeout(attemptEarlyCache, 10);
    }
  }
}

// 立即开始尝试应用缓存
attemptEarlyCache();

// 添加CSS预加载机制，减少视觉闪现
function addNavWidthCSS() {
  const cachedWidths = getCachedNavWidths();
  if (cachedWidths) {
    let css = '';
    cachedWidths.forEach((width, index) => {
      css += `.nav-container > div:nth-child(${index + 1}) { width: ${width} !important; }\n`;
    });
    
    // 创建临时样式表
    const style = document.createElement('style');
    style.id = 'nav-width-cache';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

// 立即应用缓存的导航宽度（同步执行，无延迟）
function applyCacheSynchronously() {
  const cachedWidths = getCachedNavWidths();
  if (cachedWidths) {
    // 使用MutationObserver监听DOM变化，立即应用
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          const navItems = document.querySelectorAll('.nav-container > div');
          if (navItems.length > 0) {
            navItems.forEach((item, index) => {
              if (cachedWidths[index]) {
                item.style.width = cachedWidths[index];
              }
            });
            observer.disconnect(); // 应用完成后停止监听
          }
        }
      });
    });
    
    // 开始监听DOM变化
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // 如果document.body还不存在，等待它出现
      const checkBody = setInterval(() => {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          clearInterval(checkBody);
        }
      }, 10);
    }
    
    // 如果DOM已经存在，立即应用
    const navItems = document.querySelectorAll('.nav-container > div');
    if (navItems.length > 0) {
      navItems.forEach((item, index) => {
        if (cachedWidths[index]) {
          item.style.width = cachedWidths[index];
        }
      });
      observer.disconnect();
    }
  }
}

// 在页面加载时立即添加CSS和同步应用
addNavWidthCSS();
applyCacheSynchronously();

// 最激进的优化：在script标签执行时立即注入CSS
(function() {
  const cachedWidths = getCachedNavWidths();
  if (cachedWidths) {
    // 立即注入CSS到head，不等待任何事件
    const css = cachedWidths.map((width, index) => 
      `.nav-container > div:nth-child(${index + 1}) { width: ${width} !important; }`
    ).join('\n');
    
    if (document.head) {
      const style = document.createElement('style');
      style.id = 'nav-width-inline';
      style.textContent = css;
      document.head.appendChild(style);
    } else {
      // 如果head还不存在，等待它出现
      const checkHead = setInterval(() => {
        if (document.head) {
          const style = document.createElement('style');
          style.id = 'nav-width-inline';
          style.textContent = css;
          document.head.appendChild(style);
          clearInterval(checkHead);
        }
      }, 1);
    }
  }
})();

// 窗口大小变化时重新测量（清除缓存）
window.addEventListener('resize', function() {
  localStorage.removeItem('navWidthsCache');
  setTimeout(initializeNavWidths, 50);
});

// 全局测试函数：测试问候语功能
window.testGreeting = function(timezone = null) {
  console.log('=== 测试问候语功能 ===');
  
  // 检查问候语元素是否存在
  const greetingElement = document.querySelector('.morning-night-greeting');
  if (!greetingElement) {
    console.error('未找到 .morning-night-greeting 元素');
    return;
  }
  console.log(`找到问候语元素，当前内容: "${greetingElement.textContent}"`);
  
  // 获取设备信息
  const deviceInfo = getDeviceInfoFromCache();
  console.log('设备信息:', deviceInfo);
  
  const testTimezone = timezone || 
    (() => {
      const tz = deviceInfo?.geoLocation?.timezone ||
                 deviceInfo?.languageInfo?.timeZone || 
                 localStorage.getItem('userTimeZone') ||
                 Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`获取到时区: ${tz}`);
      return tz;
    })();
  
  try {
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: testTimezone
    };
    
    const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
    const [hour, minute] = timeString.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    console.log(`测试时区: ${testTimezone}`);
    console.log(`当前时间: ${timeString} (${timeInMinutes}分钟)`);
    
    const greeting = getGreetingByTimezone(testTimezone);
    console.log(`计算出的问候语: ${greeting}`);
    
    // 显示时间规则
    console.log('时间规则:');
    console.log('05:00-08:59: 早安!');
    console.log('09:00-11:29: 上午好!');
    console.log('11:30-13:29: 午安!');
    console.log('13:30-17:59: 下午好!');
    console.log('18:00-04:59: 晚上好!');
    
  } catch (error) {
    console.error('测试问候语失败:', error);
  }
  
  // 手动更新问候语显示
  console.log('开始更新问候语...');
  updateGreeting();
  console.log(`更新后问候语内容: "${greetingElement.textContent}"`);
};

// 全局函数：强制更新问候语
window.forceUpdateGreeting = function() {
  updateGreeting();
  console.log('强制更新问候语完成');
};

// 全局函数：测试苏黎世时区
window.testZurich = function() {
  console.log('=== 测试苏黎世时区 ===');
  testGreeting('Europe/Zurich');
};

// 全局函数：测试所有时区
window.testAllTimezones = function() {
  const timezones = [
    'Europe/Zurich',
    'Europe/Paris', 
    'Asia/Shanghai',
    'America/New_York',
    'Europe/London'
  ];
  
  console.log('=== 测试所有时区 ===');
  timezones.forEach(tz => {
    console.log(`\n--- ${tz} ---`);
    testGreeting(tz);
  });
};

// 全局函数：检查缓存中的时区信息
window.checkTimezoneCache = function() {
  console.log('=== 检查时区缓存信息 ===');
  
  const deviceInfo = getDeviceInfoFromCache();
  if (deviceInfo) {
    console.log('设备信息缓存:', deviceInfo);
    console.log('地理位置时区:', deviceInfo.geoLocation?.timezone);
    console.log('语言信息时区:', deviceInfo.languageInfo?.timeZone);
    console.log('用户设置时区:', localStorage.getItem('userTimeZone'));
    console.log('浏览器默认时区:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // 计算实际使用的时区
    const actualTimezone = deviceInfo.geoLocation?.timezone ||
                          deviceInfo.languageInfo?.timeZone || 
                          localStorage.getItem('userTimeZone') ||
                          Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('实际使用的时区:', actualTimezone);
  } else {
    console.log('没有找到设备信息缓存');
  }
};

// 全局函数：清除时区缓存并重新获取
window.refreshTimezone = function() {
  console.log('=== 刷新时区信息 ===');
  
  // 重置地理位置加载状态
  geoLocationLoaded = false;
  
  // 清除相关缓存
  localStorage.removeItem('deviceInfo');
  localStorage.removeItem('countryCodeCache');
  localStorage.removeItem('userTimeZone');
  
  console.log('已清除时区相关缓存');
  
  // 重新获取地理位置信息
  if (typeof displayGeoLocation === 'function') {
    displayGeoLocation();
  }
  
  // 延迟更新问候语
  setTimeout(() => {
    updateGreeting();
    console.log('问候语已更新');
  }, 2000);
};

// 全局函数：强制重新获取地理位置（IP变化时使用）
window.forceRefreshGeoLocation = function() {
  console.log('=== 强制刷新地理位置信息 ===');
  
  // 重置地理位置加载状态
  geoLocationLoaded = false;
  
  // 重新获取地理位置信息
  if (typeof displayGeoLocation === 'function') {
    displayGeoLocation();
  }
  
  // 延迟更新问候语
  setTimeout(() => {
    updateGreeting();
    console.log('地理位置和问候语已更新');
  }, 1000);
};

// 全局函数：检查IP变化并更新时区
window.checkIPChangeAndUpdateTimezone = function() {
  console.log('=== 检查IP变化并更新时区 ===');
  
  // 获取当前缓存的IP信息
  const deviceInfo = getDeviceInfoFromCache();
  const cachedIP = deviceInfo?.geoLocation?.ip;
  const cachedTimezone = deviceInfo?.geoLocation?.timezone;
  
  console.log('当前缓存的IP:', cachedIP);
  console.log('当前缓存的时区:', cachedTimezone);
  
  // 重新获取IP信息
  fetch('https://ipinfo.io/json?token=228a7bb192c4fc')
    .then(response => response.json())
    .then(data => {
      const newIP = data.ip;
      const newTimezone = data.timezone;
      
      console.log('新获取的IP:', newIP);
      console.log('新获取的时区:', newTimezone);
      
      // 检查IP是否变化
      if (cachedIP !== newIP) {
        console.log('检测到IP变化，更新时区信息');
        
        // 更新设备信息缓存
        if (deviceInfo) {
          deviceInfo.geoLocation = {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            countryCode: data.country,
            timezone: data.timezone,
            org: data.org,
            postal: data.postal,
            loc: data.loc
          };
          deviceInfo.timestamp = Date.now();
          
          // 保存更新后的设备信息
          localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
          
          // 更新问候语
          updateGreeting();
          
          console.log('IP变化检测完成，时区已更新');
        }
      } else {
        console.log('IP未变化，无需更新');
      }
    })
    .catch(error => {
      console.error('检查IP变化失败:', error);
    });
};