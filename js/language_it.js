// -------------------- 国家数据 --------------------
async function fetchCountries() {
  try {
      const response = await fetch('./js/countries.json');
      return await response.json();
  } catch (err) {
      console.error('无法加载 countries.json', err);
      return [];
  }
}

function getCountryNameByCode(countries, code, language = 'italian') {
  const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
  return country ? (country[language] || country.italian || country.english) : 'mondo';
}

// -------------------- 意大利语冠词处理 --------------------
function addItalianArticle(countryName) {
  const articles = {
      'il': 'del',
      'lo': 'dello',
      "l'": "dell'",
      'i': 'dei',
      'gli': 'degli',
      'la': 'della',
      'le': 'delle'
  };

  const words = countryName.split(/\s+/);
  const article = words[0].toLowerCase().replace(/[^\w']/g, '');
  if (articles[article]) {
      return `${articles[article]} ${words.slice(1).join(' ')}`;
  }
  return `di ${countryName}`;
}

// -------------------- 问候语 --------------------
function getItalianGreeting(hour) {
  if (hour >= 5 && hour < 17) return 'Buongiorno!';
  return 'Buonasera!';
}

function updateItalianGreeting(timezone) {
  const greetingEls = document.querySelectorAll('.morning-night-greeting');
  if (!greetingEls.length) return;

  try {
      const now = new Date();
      const timeInTZ = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      const greeting = getItalianGreeting(timeInTZ.getHours());
      greetingEls.forEach(el => el.textContent = greeting);
      console.log(`时区 ${timezone} 当前时间: ${timeInTZ.toLocaleString()}, 意大利语问候语: ${greeting}`);
  } catch (err) {
      console.error('更新意大利语问候语失败:', err);
      const fallbackGreeting = getItalianGreeting(new Date().getHours());
      greetingEls.forEach(el => el.textContent = fallbackGreeting);
  }
}

// -------------------- 页面显示更新 --------------------
async function updateDisplay(countryCode, countries, timezone = '') {
  const locationEl = document.getElementById("location");
  const location2El = document.getElementById("location2");
  const flagImg = document.getElementById("country-flag");
  const flagImg2 = document.getElementById("country-flag-2");
  const languageFlag = document.getElementById("language-flag");

  const countryName = getCountryNameByCode(countries, countryCode, 'italian');
  const formattedName = addItalianArticle(countryName);

  if (locationEl) locationEl.textContent = formattedName;
  if (location2El) location2El.textContent = formattedName;

  if (timezone) updateItalianGreeting(timezone);

  [flagImg, flagImg2].forEach(img => {
      if (img) {
          img.src = `./images/wflags/${countryCode}.png`;
          img.alt = countryName;
          img.onerror = () => {
              img.src = './images/wflags/un.png';
              img.alt = 'United Nations';
          };
      }
  });

  const languageCountryFlagMap = {
      'ch': 'flag-ch',
      'sm': 'flag-sm',
      'va': 'flag-va'
  };

  if (languageFlag) {
      if (languageCountryFlagMap[countryCode]) {
          languageFlag.src = `./images/wflags_svg/${countryCode}.svg`;
          languageFlag.alt = countryName + ' flag';
          languageFlag.style.cssText = `
              display:inline-block;
              height:15px;
              width:${countryCode === 'ch' ? 'auto' : '24px'};
              object-fit:cover;
              left:5px;
              top:3px;
          `;
          languageFlag.onerror = () => { languageFlag.style.display = 'none'; };
      } else {
          languageFlag.style.display = 'none';
      }
  }
}

// -------------------- IP & 缓存 --------------------
async function displayCountryName() {
  const countries = await fetchCountries();
  const cachedCode = localStorage.getItem('countryCode');
  const cachedTimezone = localStorage.getItem('userTimezone');

  if (cachedCode) await updateDisplay(cachedCode, countries, cachedTimezone);

  setTimeout(async () => {
      try {
          const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
          const data = await response.json();
          const newCode = (data.country || '').toLowerCase();
          const timezone = data.timezone || '';

          if (!cachedCode || newCode !== cachedCode || timezone !== cachedTimezone) {
              await updateDisplay(newCode, countries, timezone);
              localStorage.setItem('countryCode', newCode);
              localStorage.setItem('userTimezone', timezone);
          }
      } catch (err) {
          console.error('延迟获取 IPInfo 失败', err);
      }
  }, 10000);
}

document.addEventListener('DOMContentLoaded', displayCountryName);

// -------------------- 导航宽度优化 --------------------
function measureAndDistributeNavWidths() {
  const navItems = document.querySelectorAll('.nav-container > div');
  if (!navItems.length) return [];

  const measureContainer = document.createElement('div');
  measureContainer.style.cssText = `
      position:absolute; top:-9999px; left:-9999px; visibility:hidden; white-space:nowrap; font-family:inherit; font-size:inherit;
  `;
  document.body.appendChild(measureContainer);

  const measurements = [...navItems].map((item, idx) => {
      const clone = item.cloneNode(true);
      clone.style.cssText = 'position:static; visibility:visible; white-space:nowrap; display:block;';
      measureContainer.appendChild(clone);
      const width = clone.offsetWidth;
      measureContainer.removeChild(clone);
      console.log(`导航项 ${idx + 1}: "${item.textContent.trim()}" - 宽度: ${width}px`);
      return { index: idx + 1, element: item, width };
  });

  document.body.removeChild(measureContainer);

  const totalWidth = measurements.reduce((sum, m) => sum + m.width, 0);
  measurements.forEach(item => {
      let ratio = (item.width / totalWidth * 100).toFixed(2);
      if (item.index === measurements.length) ratio = (ratio * 0.6).toFixed(2);
      item.element.style.width = `${ratio}%`;
      console.log(`导航项 ${item.index} 设置宽度: ${ratio}%`);
  });

  return measurements;
}

function cacheNavWidths(widths) {
  localStorage.setItem('navWidthsCache', JSON.stringify({ widths, timestamp: Date.now() }));
}

function getCachedNavWidths() {
  const cached = localStorage.getItem('navWidthsCache');
  if (!cached) return null;
  try {
      const data = JSON.parse(cached);
      return (Date.now() - data.timestamp < 24 * 3600 * 1000) ? data.widths : null;
  } catch { return null; }
}

function initializeNavWidths() {
  const cached = getCachedNavWidths();
  if (cached) {
      document.querySelectorAll('.nav-container > div').forEach((item, idx) => {
          if (cached[idx]) item.style.width = cached[idx];
      });
  } else {
      const measurements = measureAndDistributeNavWidths();
      const widths = measurements.map(item => {
          let ratio = (item.width / measurements.reduce((sum, m) => sum + m.width, 0) * 100).toFixed(2);
          if (item.index === measurements.length) ratio = (ratio * 0.6).toFixed(2);
          return `${ratio}%`;
      });
      cacheNavWidths(widths);
  }
}

document.addEventListener('DOMContentLoaded', initializeNavWidths);
window.addEventListener('resize', () => {
  localStorage.removeItem('navWidthsCache');
  setTimeout(initializeNavWidths, 50);
});