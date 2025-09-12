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

function getCountryNameByCode(countries, code, language = 'italian') {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country[language] || country.italian || country.english) : 'mondo';
}

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

async function updateDisplay(countryCode, countries) {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'italian');
    const formattedCountryName = addItalianArticle(countryName);

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

    // 筛选显示意大利语相关国家的 language-flag
    const languageCountryFlagMap = {
        'it': 'flag-it', // 意大利
        'ch': 'flag-ch', // 瑞士意大利语区
        'sm': 'flag-sm', // 圣马力诺
        'va': 'flag-va'  // 梵蒂冈
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

    // 1. 显示缓存 countryCode（如果有）
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
    }, 10); // 1 分钟延迟
}

document.addEventListener('DOMContentLoaded', displayCountryName);