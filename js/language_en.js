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

async function updateDisplay(countryCode, countries) {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode);

    if (locationEl) locationEl.textContent = countryName;
    if (location2El) location2El.textContent = countryName;

    if (flagImg) {
        flagImg.src = `./images/wflags/${countryCode}.png`;
        flagImg.alt = countryName;
        flagImg.onerror = () => {
            flagImg.src = './images/wflags/un.png';
            flagImg.alt = 'United Nations';
        };
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
        if (languageCountryFlagMap[countryCode]) {
            languageFlag.src = `./images/wflags_svg/${countryCode}.svg`;
            languageFlag.alt = countryName + ' flag';
            languageFlag.style.display = 'inline-block';
            languageFlag.onerror = () => {
                languageFlag.style.display = 'none';
            };
        } else {
            languageFlag.style.display = 'none';
        }
    }
}

async function displayCountryName() {
    const countries = await fetchCountries();

    // 1. 先显示缓存的 countryCode（如果有）
    let cachedCode = localStorage.getItem('countryCode');
    if (cachedCode) {
        await updateDisplay(cachedCode, countries);
    }

    // 2. 延迟 10 秒后重新获取最新 IP
    setTimeout(async () => {
        try {
            const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
            const data = await response.json();
            const newCode = (data.country || '').toLowerCase();

            if (!cachedCode || newCode !== cachedCode) {
                // 更新显示和缓存
                await updateDisplay(newCode, countries);
                localStorage.setItem('countryCode', newCode);
            }
        } catch (err) {
            console.error('延迟获取 IPInfo 失败', err);
        }
    }, 10); // 1 分钟延迟 (60000) (10秒延迟是10000)
}

document.addEventListener('DOMContentLoaded', displayCountryName);