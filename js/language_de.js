// ============ 问候语和国旗模块 ============
const germanStateGreetings = {
  "Baden-Württemberg": "Grüß Gott!", "Bavaria": "Servus!", "Berlin": "Juten Tach!",
  "Brandenburg": "Guten Tag!", "Bremen": "Moin Moin!", "Hamburg": "Moin Moin!",
  "Hesse": "Ei Gude!", "Lower Saxony": "Moin Moin!", "Mecklenburg-Vorpommern": "Moin Moin!",
  "North Rhine-Westphalia": "Guten Tag!", "Rhineland-Palatinate": "Gunn Tach!",
  "Saarland": "Gemoje!", "Saxony": "Tagchen!", "Saxony-Anhalt": "Tagchen!",
  "Schleswig-Holstein": "Moin Moin!", "Thuringia": "Guten Tag!"
};

const otherGermanCountryGreetings = {
  "CH": "Grüezi!", "AT": "Grüß Gott!", "LI": "Grüß Gott!", "LU": "Moien!",
  "IT": "Grüß Gott!", "NL": "Hoi!", "BE": "Dag!"
};

// 缓存系统
let countriesCache = null;
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
      const res = await fetch('./js/countries.json');
      countriesCache = await res.json();
      setCache('countriesDataCache', countriesCache);
      return countriesCache;
  } catch (err) {
      console.error('无法加载 countries.json', err);
      return [];
  }
}

const isEveningTime = () => {
  const mins = new Date().getHours() * 60 + new Date().getMinutes();
  return mins >= 1050 || mins <= 240; // 17:30 - 04:00
};

async function updateDisplay(code, countries, region = '') {
  const country = countries.find(c => c.abbr.toLowerCase() === code)
  const name = country ? (country.german || country.english) : 'der Welt';
  
  ['location', 'location2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = name;
  });

  const flagImg = document.getElementById('country-flag');
  if (flagImg) {
      flagImg.src = `./images/wflags/${code}.png`;
      flagImg.alt = name;
      flagImg.onerror = () => {
          flagImg.src = './images/wflags/un.png';
          flagImg.alt = 'United Nations';
      };
  }

  const langFlag = document.getElementById('language-flag');
  const langMap = { at: 1, ch: 1, li: 1, lu: 1 };
  if (langFlag) {
      if (langMap[code]) {
          Object.assign(langFlag.style, {
              display: 'inline-block', height: '15px', objectFit: 'cover',
              left: '5px', top: '3px', width: code === 'ch' ? 'auto' : '24px'
          });
          langFlag.src = `./images/wflags_svg/${code}.svg`;
          langFlag.alt = name + ' flag';
          langFlag.onerror = () => langFlag.style.display = 'none';
      } else {
          langFlag.style.display = 'none';
      }
  }

  // 问候语逻辑
  let greeting = "Hallo!";
  if (isEveningTime()) {
      greeting = "Guten Abend!";
  } else if (code === "de" && region) {
      greeting = germanStateGreetings[region] || "Hallo!";
  } else {
      greeting = otherGermanCountryGreetings[code.toUpperCase()] || "Hallo!";
  }

  document.querySelectorAll(".greeting").forEach(span => span.textContent = greeting + " ");
}

async function displayCountryName() {
  const countriesPromise = fetchCountries();
  const cachedCode = localStorage.getItem('countryCode');
  const cachedRegion = localStorage.getItem('regionName') || '';
  
  if (cachedCode) {
      updateDisplay(cachedCode, await countriesPromise, cachedRegion);
  }

  setTimeout(async () => {
      try {
          const [countries, res] = await Promise.all([
              countriesPromise,
              fetch('https://ipinfo.io/json?token=228a7bb192c4fc')
          ]);
          const data = await res.json();
          const newCode = (data.country || '').toLowerCase();
          const newRegion = (data.region || '').normalize();

          if (newCode !== cachedCode || newRegion !== cachedRegion) {
              updateDisplay(newCode, countries, newRegion);
              localStorage.setItem('countryCode', newCode);
              localStorage.setItem('regionName', newRegion);
          }
      } catch (err) {
          console.error('获取 IP 信息失败', err);
      }
  }, 10000);
}

document.addEventListener('DOMContentLoaded', displayCountryName);


// ============ 导航栏宽度模块 ============
function measureAndDistributeNavWidths() {
  const navItems = document.querySelectorAll('.nav-container > div');
  const container = document.querySelector('.nav-container');
  if (!navItems.length || !container) return [];

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
      if (m.index === measurements.length) ratio = (ratio * 0.6).toFixed(2); // 最后一项减少40%
      m.element.style.width = `${ratio}%`;
  });
  
  return measurements.map(m => m.element.style.width);
}

function initNavWidths() {
  const cached = getCache('navWidthsCache', 24 * 60 * 60 * 1000);
  
  if (cached) {
      document.querySelectorAll('.nav-container > div').forEach((item, i) => {
          if (cached[i]) item.style.width = cached[i];
      });
  } else {
      const widths = measureAndDistributeNavWidths();
      setCache('navWidthsCache', widths);
  }
}

// 立即注入缓存样式（减少闪现）
(() => {
  const cached = getCache('navWidthsCache', 24 * 60 * 60 * 1000);
  if (cached && document.head) {
      const style = document.createElement('style');
      style.textContent = cached.map((w, i) => 
          `.nav-container > div:nth-child(${i + 1}) { width: ${w} !important; }`
      ).join('\n');
      document.head.appendChild(style);
  }
})();

document.addEventListener('DOMContentLoaded', initNavWidths);
window.addEventListener('resize', () => {
  localStorage.removeItem('navWidthsCache');
  setTimeout(initNavWidths, 50);
});