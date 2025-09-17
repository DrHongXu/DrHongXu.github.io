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
        languageFlag.style.display = 'none';
        languageFlag.onload = () => { languageFlag.style.display = 'inline-block'; };
        languageFlag.onerror = () => { languageFlag.style.display = 'none'; };

        if (languageCountryFlagMap[countryCode]) {
            languageFlag.src = `./images/wflags_svg/${countryCode}.svg`;
            languageFlag.alt = countryName + ' flag';
        } else {
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

document.addEventListener('DOMContentLoaded', displayCountryName);