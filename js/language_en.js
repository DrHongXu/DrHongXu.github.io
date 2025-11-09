// ============ 问候语和国旗模块 ============

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

function getCountryNameByCode(countries, code) {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country.english || country.german) : 'Unknown';
}

function updateGreeting(timezone) {
    const greetingEl = document.querySelector('.morning-night-greeting');
    if (!greetingEl) return;

    try {
        const now = new Date();
        const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
        const hour = timeInTimezone.getHours();

        const greeting = hour >= 5 && hour < 12 ? 'Good Morning!' 
                       : hour >= 12 && hour < 17 ? 'Good Afternoon!' 
                       : 'Good Evening!';

        greetingEl.textContent = greeting;
        console.log(`时区 ${timezone} 当前时间: ${timeInTimezone.toLocaleString()}, 问候语: ${greeting}`);
    } catch (error) {
        console.error('更新问候语失败:', error);
        const hour = new Date().getHours();
        greetingEl.textContent = hour >= 5 && hour < 12 ? 'Good Morning!' 
                               : hour >= 12 && hour < 17 ? 'Good Afternoon!' 
                               : 'Good Evening!';
    }
}

async function updateDisplay(code, countries, region = '', city = '', timezone = '') {
    const name = getCountryNameByCode(countries, code);
    const fullLocation = name; // 可根据需要改为 region, city 等

    ['location', 'location2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = fullLocation;
    });

    if (timezone) updateGreeting(timezone);

    // 国旗处理
    const flagImg = document.getElementById('country-flag');
    if (flagImg) {
        flagImg.style.display = 'none';
        flagImg.onload = () => flagImg.style.display = 'inline-block';
        flagImg.onerror = () => {
            flagImg.style.display = 'none';
            flagImg.src = './images/wflags/un.png';
            flagImg.alt = 'United Nations';
        };
        flagImg.src = `./images/wflags/${code}.png`;
        flagImg.alt = name;
    }

    // 语言国旗处理
    const langFlag = document.getElementById('language-flag');
    const langMap = { us: 1, ca: 1, au: 1, nz: 1, ie: 1, za: 1, in: 1, sg: 1, hk: 1 };
    
    if (langFlag) {
        langFlag.src = './images/wflags_svg/un.svg';
        langFlag.alt = '';
        langFlag.style.display = 'inline-block';

        if (langMap[code]) {
            const preload = new Image();
            preload.onload = () => {
                langFlag.src = preload.src;
                langFlag.alt = name + ' flag';
            };
            preload.onerror = () => langFlag.style.display = 'none';
            preload.src = `./images/wflags_svg/${code}.svg`;
        } else {
            langFlag.style.display = 'none';
        }
    }
}

async function displayCountryName() {
    const countries = await fetchCountries();

    // 1. 优先使用提前获取的数据
    if (window.ipinfoData || window.ipinfoCache) {
        const data = window.ipinfoData || window.ipinfoCache;
        const code = (data.country || '').toLowerCase();
        
        await updateDisplay(code, countries, data.region, data.city, data.timezone);
        localStorage.setItem('countryCode', code);
        localStorage.setItem('userTimezone', data.timezone);
        window.ipinfoDataUsed = true;
        return;
    }

    // 2. 显示缓存数据
    const cachedCode = localStorage.getItem('countryCode');
    const cachedTimezone = localStorage.getItem('userTimezone');
    if (cachedCode) {
        await updateDisplay(cachedCode, countries, '', '', cachedTimezone);
    }

    // 3. 后台更新 API 数据
    setTimeout(async () => {
        try {
            const res = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
            const data = await res.json();
            const newCode = (data.country || '').toLowerCase();
            const newTimezone = data.timezone || '';

            if (newCode !== cachedCode || newTimezone !== cachedTimezone) {
                await updateDisplay(newCode, countries, data.region, data.city, newTimezone);
                localStorage.setItem('countryCode', newCode);
                localStorage.setItem('userTimezone', newTimezone);
            }
        } catch (err) {
            console.error('获取 IPInfo 失败，使用缓存', err);
        }
    }, 500);
}


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

document.addEventListener('DOMContentLoaded', () => {
    displayCountryName();
    initNavWidths();
});

window.addEventListener('resize', () => {
    localStorage.removeItem('navWidthsCache');
    setTimeout(initNavWidths, 50);
});