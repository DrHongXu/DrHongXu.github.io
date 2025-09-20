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
  
    const button = document.getElementById("language-button");
    const flagButton = document.getElementById("flag-button-lange");
    const menu = document.getElementById("language-menu");
    
    // 根据languageMode动态切换国旗
    function updateFlagIcon() {
      const langMode = localStorage.getItem("langMode");
      console.log("Current langMode:", langMode);
      console.log("flagButton element:", flagButton);
      
      if (langMode === "traditional") {
        console.log("Setting flag to hk.svg");
        flagButton.src = "./images/wflags_svg/hk.svg";
      } else {
        console.log("Setting flag to cn.svg");
        flagButton.src = "./images/wflags_svg/cn.svg";
      }
    }

   
      // 根据countryCode动态显示国旗
      function updateCountryFlag() {
        const cachedCode = localStorage.getItem('countryCode');
        const countryFlagImg = document.getElementById('country-flag-local-storage');
        
        console.log("=== Country Flag Debug ===");
        console.log("countryCode from localStorage:", cachedCode);
        console.log("countryFlagImg element:", countryFlagImg);
        console.log("All localStorage keys:", Object.keys(localStorage));
        
        // 检查是否有其他相关的localStorage项
        const countryCodeCache = localStorage.getItem('countryCodeCache');
        console.log("countryCodeCache:", countryCodeCache);
        
        if (cachedCode && countryFlagImg) {
          // 确保countryCode是小写的，因为图片文件名是小写
          const lowerCode = cachedCode.toLowerCase();
          const flagPath = `./images/wflags/${lowerCode}.png`;
          
          console.log("Setting flag to:", flagPath);
          
          countryFlagImg.src = flagPath;
          countryFlagImg.alt = `Flag of ${cachedCode.toUpperCase()}`;
          
          // 如果图片加载失败，显示默认的UN旗帜
          countryFlagImg.onerror = function() {
            console.log("Flag image failed to load:", flagPath);
            this.src = './images/wflags/un.png';
            this.alt = 'United Nations';
          };
          
          countryFlagImg.onload = function() {
            console.log("Flag image loaded successfully:", flagPath);
          };
        } else {
          console.log("Missing countryCode or countryFlagImg element");
          if (!cachedCode) console.log("No countryCode in localStorage");
          if (!countryFlagImg) console.log("No country-flag-local-storage element found");
        }
        console.log("=== End Debug ===");
      }
      
      // 重写setSimplified和setTraditional函数，确保国旗立即更新
      // 使用window对象确保全局覆盖
      window.setSimplified = function() {
        console.log("Custom setSimplified called");
        localStorage.setItem("langMode", "simplified");
        updateFlagIcon(); // 立即更新国旗
        updateCountryFlag(); // 立即更新国家国旗
        // 关闭菜单
        menu.classList.add("hidden");
      };
      
      window.setTraditional = function() {
        console.log("Custom setTraditional called");
        localStorage.setItem("langMode", "traditional");
        updateFlagIcon(); // 立即更新国旗
        updateCountryFlag(); // 立即更新国家国旗
        // 关闭菜单
        menu.classList.add("hidden");
      };
      
      // 页面加载时更新国旗
      updateFlagIcon();
      
      // 确保DOM完全加载后再更新国旗
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCountryFlag);
      } else {
        updateCountryFlag();
      }
      
      // 监听languageMode变化
      window.addEventListener('storage', function(e) {
        if (e.key === 'langMode') {
          updateFlagIcon();
        } else if (e.key === 'countryCode') {
          updateCountryFlag();
        }
      });
      
      // 监听localStorage变化（同页面内）
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'langMode') {
          updateFlagIcon();
        } else if (key === 'countryCode') {
          updateCountryFlag();
        }
      };
      
      // 为En文字添加点击事件
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        menu.classList.toggle("hidden");
      });
      
      // 为国旗图标添加点击事件
      flagButton.addEventListener("click", (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        menu.classList.toggle("hidden");
      });
      
      // 点击页面其他地方收起菜单
      document.addEventListener("click", () => {
        menu.classList.add("hidden");
      });

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
    try {
      const countries = await fetchCountries();
      const cityArray = await fetchCityMap();
  
      let cached = localStorage.getItem('countryCodeCache');
      let countryCode = "", regionEnglish = "", cityEnglish = "";
      let delay = 0;
  
      if (cached) {
        const cachedData = JSON.parse(cached);
        countryCode = cachedData.countryCode;
        regionEnglish = cachedData.regionEnglish;
        cityEnglish = cachedData.cityEnglish;
        // localStorage 有缓存，则延迟刷新
        const now = Date.now();
        if (now - cachedData.timestamp < 100) {
          delay = 100 - (now - cachedData.timestamp); // 1 分钟后刷新
        }
      }
  
      // 立即显示缓存内容
      updateDisplay(countryCode, regionEnglish, cityEnglish, countries, cityArray);
  
      // 延迟刷新 IPInfo
      setTimeout(async () => {
        try {
          const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
          const data = await response.json();
  
          const newCountryCode = data.country || "";
          const newRegion = data.region || "";
          const newCity = data.city || "";
  
          if (newCountryCode !== countryCode || newRegion !== regionEnglish || newCity !== cityEnglish) {
            countryCode = newCountryCode;
            regionEnglish = newRegion;
            cityEnglish = newCity;
            localStorage.setItem('countryCodeCache', JSON.stringify({
              countryCode, regionEnglish, cityEnglish, timestamp: Date.now()
            }));
            updateDisplay(countryCode, regionEnglish, cityEnglish, countries, cityArray);
          }
        } catch (err) {
          console.error('刷新 IPInfo 失败', err);
        }
      }, delay);
  
    } catch (err) {
      console.error("无法获取 IP 信息:", err);
      document.querySelectorAll(".geo-location").forEach(span => span.textContent = "地球");
      const flagImg = document.querySelector(".country-flag");
      if(flagImg) { flagImg.src = "./images/wflags/un.png"; flagImg.alt = "地球"; }
    }
  }
  
  document.addEventListener('DOMContentLoaded', displayGeoLocation);