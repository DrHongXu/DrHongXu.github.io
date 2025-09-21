async function fetchCountries() {
    try {
        const response = await fetch('./js/countries.json');
        const countries = await response.json();
        return countries;
    } catch (err) {
        console.error('无法加载 countries.json', err);
        return [];
    }
}

function getCountryNameByCode(countries, code, language = 'english') {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country[language] || country.english) : 'Unknown';
}

async function updateDisplay(countryCode, countries, regionName = '', cityName = '') {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode);

    // 只显示 Region + Country
    //const fullLocation = regionName ? `${regionName}, ${countryName}` : countryName;
    //const fullLocation = `${regionName}`;
    //const fullLocation = `${cityName}`;
    const fullLocation = `${countryName}`;

    if (locationEl) locationEl.textContent = fullLocation;
    if (location2El) location2El.textContent = fullLocation;

    // --- 国旗处理 ---
    if (flagImg) {
        flagImg.style.display = 'none';
        flagImg.onload = () => { flagImg.style.display = 'inline-block'; };
        flagImg.onerror = () => {
            flagImg.style.display = 'none';
            flagImg.src = './images/wflags/un.png';
            flagImg.alt = 'United Nations';
        };
        flagImg.src = `./images/wflags/${countryCode}.png`;
        flagImg.alt = countryName;
    }

    const languageCountryFlagMap = {
        'us': 'flag-us',
        'ca': 'flag-ca',
        'au': 'flag-au',
        'nz': 'flag-nz',
        'ie': 'flag-ie',
        'za': 'flag-za',
        'in': 'flag-in',
        'sg': 'flag-sg',
        'hk': 'flag-hk'
    };

    if (languageFlag) {
        // 默认显示占位旗帜，避免 broken image
        languageFlag.src = './images/wflags_svg/un.svg';
        languageFlag.alt = '';
        languageFlag.style.display = 'inline-block';
    
        if (languageCountryFlagMap[countryCode]) {
            // 创建临时 Image 预加载真实国旗
            const realFlag = new Image();
            realFlag.onload = () => {
                languageFlag.src = realFlag.src; // 加载完成后替换
                languageFlag.alt = countryName + ' flag';
            };
            realFlag.onerror = () => {
                languageFlag.style.display = 'none'; // 加载失败隐藏
            };
            realFlag.src = `./images/wflags_svg/${countryCode}.svg`;
        } else {
            // 没有对应国旗，隐藏
            languageFlag.style.display = 'none';
        }
    }
}

async function displayCountryName() {
    const countries = await fetchCountries();

    try {
        const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
        const data = await response.json();

        const newCode = (data.country || '').toLowerCase();
        const regionName = data.region || '';
        const cityName = data.city || '';

        await updateDisplay(newCode, countries, regionName,cityName);
        localStorage.setItem('countryCode', newCode);

    } catch (err) {
        console.error('获取 IPInfo 失败，使用缓存或默认值', err);

        // 如果失败，用缓存国家码（只显示国家名）
        const cachedCode = localStorage.getItem('countryCode');
        if (cachedCode) {
            await updateDisplay(cachedCode, countries);
        }
    }

    // 延迟每分钟刷新一次
    setTimeout(displayCountryName, 10000);
}



////////////////////////////
// 设置导航栏目宽度分配
function measureAndDistributeNavWidths() {
    const navItems = document.querySelectorAll('.nav-container > div');
    const measurements = [];
    
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
      
      console.log(`导航项 ${index + 1}: "${item.textContent.trim()}" - 宽度: ${width}px`);
    });
    
    document.body.removeChild(measureContainer);
    
    // 计算总宽度和比例
    const totalWidth = measurements.reduce((sum, item) => sum + item.width, 0);
    const containerWidth = document.querySelector('.nav-container').offsetWidth;
    
    console.log(`总内容宽度: ${totalWidth}px, 容器宽度: ${containerWidth}px`);
    
    // 应用动态比例 - 使用 table-layout: fixed 和 width 百分比
    measurements.forEach(item => {
      let ratio = (item.width / totalWidth * 100).toFixed(2);
      
      // 最后一个导航项（语言选择）减少40%宽度
      if (item.index === measurements.length) {
        ratio = (ratio * 0.6).toFixed(2);
        console.log(`导航项 ${item.index} (语言选择) 宽度减少40%`);
      }
      
      item.element.style.width = `${ratio}%`;
      console.log(`导航项 ${item.index} 设置宽度: ${ratio}% (${item.width}px)`);
    });
    
    return measurements;
  }
  
  // 缓存系统
  function getCachedNavWidths() {
    const cacheKey = 'navWidthsCache';
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        // 检查缓存是否过期（24小时）
        if (now - cacheData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('使用缓存的导航宽度设置');
          return cacheData.widths;
        } else {
          console.log('导航宽度缓存已过期，重新测量');
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.log('导航宽度缓存数据损坏，重新测量');
        localStorage.removeItem(cacheKey);
      }
    }
    
    return null;
  }
  
  function setCachedNavWidths(widths) {
    const cacheKey = 'navWidthsCache';
    const cacheData = {
      widths: widths,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('导航宽度设置已缓存');
    } catch (e) {
      console.log('无法缓存导航宽度设置:', e);
    }
  }
  
  function applyCachedWidths(cachedWidths) {
    const navItems = document.querySelectorAll('.nav-container > div');
    
    navItems.forEach((item, index) => {
      if (cachedWidths[index]) {
        item.style.width = cachedWidths[index];
        console.log(`导航项 ${index + 1} 应用缓存宽度: ${cachedWidths[index]}`);
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
        
        // 最后一个导航项减少40%宽度
        if (item.index === measurements.length) {
          ratio = (ratio * 0.6).toFixed(2);
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
      console.log('立即应用缓存的导航宽度设置');
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
        console.log('早期应用缓存的导航宽度设置');
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
      
      console.log('添加导航宽度CSS预加载');
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
              console.log('同步应用缓存的导航宽度设置');
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
        const waitForBody = setInterval(() => {
          if (document.body) {
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            clearInterval(waitForBody);
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
        console.log('立即应用缓存的导航宽度设置');
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
        console.log('立即注入导航宽度CSS');
      } else {
        // 如果head还不存在，等待它出现
        const checkHead = setInterval(() => {
          if (document.head) {
            const style = document.createElement('style');
            style.id = 'nav-width-inline';
            style.textContent = css;
            document.head.appendChild(style);
            clearInterval(checkHead);
            console.log('延迟注入导航宽度CSS');
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