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

// 异步数据获取函数
async function fetchCountries() {
  const response = await fetch('/js/countries.json');
  return response.json();
}

async function fetchCityMap() {
  const response = await fetch('/js/city_name.json');
  return response.json();
}

function getCountryNameByCode(countries, code, language = 'chinese') {
  const country = countries.find(c => c.abbr === code);
  return country ? (country[language] || country.chinese) : '地球';
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

// 根据countryCode动态显示国旗
function updateCountryFlag() {
  const countryFlagImg = document.getElementById('country-flag-local-storage');
  
  // 优先从countryCodeCache获取，如果没有则从countryCode获取
  let cachedCode = null;
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
  const button = document.getElementById("language-button");
  const flagButton = document.getElementById("flag-button");
  const flagButtonLange = document.getElementById("flag-button-lange");

  if (button) {
    if (mode === "traditional") {
      // 繁体中文
      button.innerHTML = 'Hk<span style="color:transparent;">▾</span>';
    } else {
      // 简体中文
      button.innerHTML = 'Zh<span style="color:transparent;">▾</span>';
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
  console.log('切换到繁体中文...');
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
  console.log('切换到簡體中文...');
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

// 立即更新显示，不进行网络请求
function updateDisplayImmediate(countryCode, regionEnglish, cityEnglish) {
  // 更新 geo-location
  document.querySelectorAll(".geo-location").forEach(span => {
    span.textContent = countryCode || "地球";
  });

  // 初始化DOM元素引用
  button = document.getElementById("language-button");
  flagButton = document.getElementById("flag-button-lange");
  menu = document.getElementById("language-menu");
  
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

  // 初始化DOM元素引用
  button = document.getElementById("language-button");
  flagButton = document.getElementById("flag-button-lange");
  menu = document.getElementById("language-menu");
  
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
  // 如果已经加载过，直接返回
  if (geoLocationLoaded) return;
  geoLocationLoaded = true;
  
  // 检查缓存，如果有有效的缓存就直接使用
  let cached = localStorage.getItem('countryCodeCache');
  let countryCode = "", regionEnglish = "", cityEnglish = "";
  
  if (cached) {
    const cachedData = JSON.parse(cached);
    const now = Date.now();
    // 如果缓存时间少于30分钟，直接使用缓存
    if (now - cachedData.timestamp < 1800) {
      countryCode = cachedData.countryCode;
      regionEnglish = cachedData.regionEnglish;
      cityEnglish = cachedData.cityEnglish;
      
      // 立即更新显示，不等待网络请求
      updateDisplayImmediate(countryCode, regionEnglish, cityEnglish);
      
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
  updateDisplayImmediate("", "", "");
  
  // 异步加载所有数据，不阻塞页面
  setTimeout(async () => {
    try {
      const countries = await fetchCountries();
      const cityArray = await fetchCityMap();
      
      // 异步刷新 IPInfo
      try {
        const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
        const data = await response.json();

        const newCountryCode = data.country || "";
        const newRegion = data.region || "";
        const newCity = data.city || "";

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
  // 默认简体或者 localStorage 中的保存值
  var savedMode = localStorage.getItem("langMode") || "simplified";
  switchLanguage(savedMode);

  // 确保国旗图标在页面加载时正确显示
  updateFlagIcon(savedMode);

  // 确保语言显示在页面加载时正确显示
  updateLanguageDisplay(savedMode);
});

// 地理定位初始化
document.addEventListener('DOMContentLoaded', displayGeoLocation);