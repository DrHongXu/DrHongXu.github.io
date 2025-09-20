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
        if (now - cachedData.timestamp < 10000) {
          delay = 10000 - (now - cachedData.timestamp); // 1 分钟后刷新
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