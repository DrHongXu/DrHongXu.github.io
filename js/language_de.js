// ============ 问候语和国旗模块（扩展版） ============

// 德国各州问候语（按时段）
const germanStateGreetings = {
  "Baden-Württemberg": {
    morning: "Grüß Gott!",
    day: "Grüß Gott!",
    evening: "Grüß Gott!"
  },
  "Bavaria": {
    morning: "Grüß Gott!",
    day: "Servus!",
    evening: "Grüß Gott!"
  },
  "Berlin": {
    morning: "Guten Morgen!",
    day: "Juten Tach!",
    evening: "N'Abend!"
  },
  "Brandenburg": {
    morning: "Guten Morgen!",
    day: "Guten Tag!",
    evening: "Guten Abend!"
  },
  "Bremen": {
    morning: "Moin!",
    day: "Moin Moin!",
    evening: "Moin!"
  },
  "Hamburg": {
    morning: "Moin!",
    day: "Moin Moin!",
    evening: "Moin!"
  },
  "Hesse": {
    morning: "Ei Gude Morge!",
    day: "Ei Gude!",
    evening: "Schönen Abend!"
  },
  "Lower Saxony": {
    morning: "Moin!",
    day: "Moin Moin!",
    evening: "Moin!"
  },
  "Mecklenburg-Vorpommern": {
    morning: "Moin!",
    day: "Moin Moin!",
    evening: "Moin!"
  },
  "North Rhine-Westphalia": {
    morning: "Guten Morgen!",
    day: "Guten Tag!",
    evening: "Guten Abend!"
  },
  "Rhineland-Palatinate": {
    morning: "Gunn Morge!",
    day: "Gunn Tach!",
    evening: "Gunn Owe!"
  },
  "Saarland": {
    morning: "Gemoje!",
    day: "Guten Tag!",
    evening: "Gemoje!"
  },
  "Saxony": {
    morning: "Guten Morgen!",
    day: "Tagchen!",
    evening: "N'Abend!"
  },
  "Saxony-Anhalt": {
    morning: "Guten Morgen!",
    day: "Tagchen!",
    evening: "Guten Abend!"
  },
  "Schleswig-Holstein": {
    morning: "Moin!",
    day: "Moin Moin!",
    evening: "Moin!"
  },
  "Thuringia": {
    morning: "Guten Morgen!",
    day: "Guten Tag!",
    evening: "Guten Abend!"
  }
};

// 其他德语国家与周边地区问候语
const otherGermanCountryGreetings = {
  "CH": {
    morning: "Guete Morge!",
    day: "Grüezi!",
    evening: "Gueten Abig!"
  },
  "AT": {
    morning: "Grüß Gott!",
    day: "Servus!",
    evening: "Grüß Gott!"
  },
  "LI": {
    morning: "Grüß Gott!",
    day: "Grüß Gott!",
    evening: "Grüß Gott!"
  },
  "LU": {
    morning: "Moien!",
    day: "Moien!",
    evening: "Gudden Owend!"
  },
  "IT": {
    morning: "Grüß Gott!",
    day: "Grüß Gott!",
    evening: "Grüß Gott!"
  },
  "NL": {
    morning: "Goedemorgen!",
    day: "Hoi!",
    evening: "Goedenavond!"
  },
  "BE": {
    morning: "Goedemorgen!",
    day: "Dag!",
    evening: "Goedenavond!"
  }
};

// 默认问候语 fallback
const defaultGreetings = {
  morning: "Guten Morgen!",
  day: "Guten Tag!",
  evening: "Guten Abend!"
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

// 获取时段：morning (05:00-11:59), day (12:00-17:29), evening (17:30-04:59)
const getTimePeriod = () => {
  const mins = new Date().getHours() * 60 + new Date().getMinutes();
  if (mins >= 300 && mins < 720) return 'morning';      // 05:00-11:59
  if (mins >= 720 && mins < 1050) return 'day';         // 12:00-17:29
  return 'evening';                                     // 17:30-04:59
};

// 获取问候语
const getGreeting = (code, region) => {
  const period = getTimePeriod();
  
  // 德国境内，按州获取
  if (code === "de" && region && germanStateGreetings[region]) {
    return germanStateGreetings[region][period] || defaultGreetings[period];
  }
  
  // 其他德语国家/地区
  if (otherGermanCountryGreetings[code.toUpperCase()]) {
    return otherGermanCountryGreetings[code.toUpperCase()][period] || defaultGreetings[period];
  }
  
  // 默认问候语
  return defaultGreetings[period];
};

async function updateDisplay(code, countries, region = '') {
  const country = countries.find(c => c.abbr.toLowerCase() === code);
  const name = country ? (country.germen || country.english) : 'der Welt';
  
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

  // 根据国家、地区和时段获取问候语
  const greeting = getGreeting(code, region);
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
      if (m.index === measurements.length) ratio = (ratio * 0.6).toFixed(2);
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