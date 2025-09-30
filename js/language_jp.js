 /* 日本 region 英文 -> 日文 映射（ipinfo.io 返回 region 的英文名称） */
 const japanRegions = {
    "Hokkaido": "北海道","Aomori":"青森県","Iwate":"岩手県","Miyagi":"宮城県","Akita":"秋田県","Yamagata":"山形県","Fukushima":"福島県",
    "Ibaraki":"茨城県","Tochigi":"栃木県","Gunma":"群馬県","Saitama":"埼玉県","Chiba":"千葉県","Tokyo":"東京都","Kanagawa":"神奈川県",
    "Niigata":"新潟県","Toyama":"富山県","Ishikawa":"石川県","Fukui":"福井県","Yamanashi":"山梨県","Nagano":"長野県","Gifu":"岐阜県",
    "Shizuoka":"静岡県","Aichi":"愛知県","Mie":"三重県","Shiga":"滋賀県","Kyoto":"京都府","Osaka":"大阪府","Hyogo":"兵庫県",
    "Nara":"奈良県","Wakayama":"和歌山県","Tottori":"鳥取県","Shimane":"島根県","Okayama":"岡山県","Hiroshima":"広島県",
    "Yamaguchi":"山口県","Tokushima":"徳島県","Kagawa":"香川県","Ehime":"愛媛県","Kochi":"高知県","Fukuoka":"福岡県",
    "Saga":"佐賀県","Nagasaki":"長崎県","Kumamoto":"熊本県","Oita":"大分県","Miyazaki":"宮崎県","Kagoshima":"鹿児島県","Okinawa":"沖縄県"
  };
  
  /* 获取 countries.json（若不存在或不可用，代码依然能工作） */
  async function fetchCountries() {
    try {
      const resp = await fetch('/js/countries.json');
      if (!resp.ok) throw new Error('countries.json fetch failed');
      return await resp.json();
    } catch (e) {
      console.warn('无法加载 /js/countries.json，后备使用最小信息', e);
      return []; // 返回空数组，后续会 fallback
    }
  }
  
  /* 根据国家代码查名字（大小写不敏感），并有后备顺序 */
  function getCountryNameByCode(countries, code, language = 'japanese') {
    if (!code) return '地球';
    const target = (code || '').toUpperCase();
    const country = (countries || []).find(c => c.abbr && c.abbr.toUpperCase() === target);
    if (!country) return '地球';
    // 返回优先级：指定语言 -> english -> chinese -> abbr
    return (country[language] || country.english || country.chinese || country.abbr || '地球');
  }
  
  /* 根据时区获取日语问候语 */
  function getJapaneseGreeting(timezone) {
    const now = new Date();
    let localTime;
    
    if (timezone) {
      // 使用指定时区
      try {
        localTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
      } catch (e) {
        // 时区无效，使用本地时间
        localTime = now;
      }
    } else {
      // 没有时区信息，使用本地时间
      localTime = now;
    }
    
    const hour = localTime.getHours();
    
    if (hour >= 5 && hour < 11) {
      return "おはよう！";
    } else if (hour >= 11 && hour < 18) {
      return "こんにちは！";
    } else {
      return "こんばんは！";
    }
  }

  /* 更新问候语显示 */
  function updateGreeting(timezone) {
    const greetingElements = document.querySelectorAll('.morning-night-greeting');
    const greeting = getJapaneseGreeting(timezone);
    
    greetingElements.forEach(element => {
      element.textContent = greeting;
    });
  }

  /* 主逻辑 */
  async function displayCountryAndRegion() {
    const geoSpans = document.querySelectorAll('.geo-location');
    const flagImgs = document.querySelectorAll('.country-flag');
  
    try {
      const countries = await fetchCountries();
  
      // 获取 IP 信息
      const resp = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
      if (!resp.ok) throw new Error('ipinfo fetch failed');
      const data = await resp.json();

      const countryCode = (data.country || '').toUpperCase();
      const regionEnglish = (data.region || '').trim(); // ipinfo 的 prefecture（如 "Tokyo"）
      const timezone = data.timezone; // 获取时区信息
      let displayText = '地球';

      // 更新问候语
      updateGreeting(timezone);
  
      if (countryCode === 'JP') {
        // 日本：若能映射到都道府県，则显示日文名；否则 fallback 显示 “日本”
        if (regionEnglish && japanRegions[regionEnglish]) {
          displayText = japanRegions[regionEnglish];
        } else {
          displayText = '日本'; // fallback
        }
      } else {
        // 其他国家，尝试用 countries.json 的目标语言（japanese）或回退
        displayText = getCountryNameByCode(countries, countryCode, 'japanese');
      }
  
      // 更新所有 geo-location 元素
      geoSpans.forEach(el => { el.textContent = displayText; });
  
      // 更新所有 flag 图片：先尝试大写文件名（例如 JP.png），若失败再尝试小写（jp.png），最后 fallback un.png
      flagImgs.forEach(img => {
        let triedLower = false;
        img.alt = displayText;
  
        img.onerror = function() {
          // 如果还没试过小写，就试试小写文件名
          if (!triedLower) {
            triedLower = true;
            img.src = `./images/wflags/${countryCode.toLowerCase()}.png`;
          } else {
            // 最后回退到联合国旗或你指定的默认图
            img.onerror = null; // 防止死循环
            img.src = './images/wflags/un.png';
            img.alt = '地球';
          }
        };
  
        // 开始尝试：优先大写文件名（与多数资源库一致）
        if (countryCode) {
          img.src = `./images/wflags/${countryCode.toUpperCase()}.png`;
        } else {
          img.src = './images/wflags/un.png';
        }
      });
  
    } catch (err) {
      console.error('displayCountryAndRegion 出错，使用回退值：', err);
      // 回退：显示地球 + UN 旗帜 + 默认问候语
      geoSpans.forEach(el => { el.textContent = '地球'; });
      flagImgs.forEach(img => {
        img.onerror = null;
        img.src = './images/wflags/un.png';
        img.alt = '地球';
      });
      // 使用本地时间作为回退
      updateGreeting(null);
    }
  }
  
  document.addEventListener('DOMContentLoaded', displayCountryAndRegion);




  
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
      ratio = (ratio * 0.7).toFixed(2);
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

