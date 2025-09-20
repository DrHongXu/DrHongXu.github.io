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

function getCountryNameByCode(countries, code, language = 'french') {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country[language] || country.french || country.english) : 'monde';
}

function addFrenchArticle(countryName) {
    const articles = { 'la': 'de la', 'le': 'du', 'les': 'des' };
    const words = countryName.split(' ');
    const article = words[0].toLowerCase();

    if (articles[article]) {
        return `${articles[article]} ${words.slice(1).join(' ')}`;
    }

    const firstLetter = countryName.charAt(0).toLowerCase();
    const isVowel = 'aeioué'.indexOf(firstLetter) !== -1;

    if (isVowel) {
        return `d'${countryName}`;
    } else {
        return `de ${countryName}`;
    }
}

async function updateDisplay(countryCode, countries) {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'french');
    const formattedCountryName = addFrenchArticle(countryName);

    if (locationEl) locationEl.textContent = formattedCountryName;
    if (location2El) location2El.textContent = formattedCountryName;

    if (flagImg) {
        flagImg.src = `./images/wflags/${countryCode}.png`;
        flagImg.alt = countryName;
        flagImg.onerror = () => {
            flagImg.src = './images/wflags/un.png';
            flagImg.alt = 'United Nations';
        };
    }

    const languageCountryFlagMap = {
        'be': 'flag-be', // 比利时
        'ch': 'flag-ch', // 瑞士
        'lu': 'flag-lu', // 卢森堡
        'ca': 'flag-ca', // 加拿大法语区
    };

    if (languageFlag) {
        if (languageCountryFlagMap[countryCode]) {
            languageFlag.src = `./images/wflags_svg/${countryCode}.svg`;
            languageFlag.alt = countryName + ' flag';
            languageFlag.style.display = 'inline-block';
            languageFlag.style.height = '15px';
            languageFlag.style.objectFit = 'cover';
            languageFlag.style.left = '5px';
            languageFlag.style.top = '3px';
            languageFlag.style.width = '24px';

            if (countryCode === 'ch') languageFlag.style.width = 'auto';

            languageFlag.onerror = () => { languageFlag.style.display = 'none'; };
        } else {
            languageFlag.style.display = 'none';
        }
    }
}

async function displayCountryName() {
    const countries = await fetchCountries();

    // 1. 先显示缓存 countryCode
    let cachedCode = localStorage.getItem('countryCode');
    if (cachedCode) {
        await updateDisplay(cachedCode, countries);
    }

    // 2. 延迟 1 分钟后重新获取最新 IP
    setTimeout(async () => {
        try {
            const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
            const data = await response.json();
            const newCode = (data.country || '').toLowerCase();

            if (!cachedCode || newCode !== cachedCode) {
                await updateDisplay(newCode, countries);
                localStorage.setItem('countryCode', newCode);
            }
        } catch (err) {
            console.error('延迟获取 IPInfo 失败', err);
        }
    }, 10000); // 1 分钟延迟
}

document.addEventListener('DOMContentLoaded', displayCountryName);









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
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
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