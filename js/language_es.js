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

function getCountryNameByCode(countries, code, language = 'spanish') {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country[language] || country.spanish || country.english) : 'mundo';
}

async function updateDisplay(countryCode, countries) {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'spanish');

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

    // 仅显示西班牙语主要国家的 language-flag
    const languageCountryFlagMap = {
        'mx': 'flag-mx', // 墨西哥
        'ar': 'flag-ar', // 阿根廷
        'co': 'flag-co', // 哥伦比亚
        'cl': 'flag-cl', // 智利
        'pe': 'flag-pe', // 秘鲁
        'uy': 'flag-uy', // 乌拉圭
        've': 'flag-ve', // 委内瑞拉
        'ec': 'flag-ec', // 厄瓜多尔
        'bo': 'flag-bo', // 玻利维亚
        'py': 'flag-py', // 巴拉圭
        'do': 'flag-do', // 多米尼加
        'cr': 'flag-cr', // 哥斯达黎加
        'pa': 'flag-pa', // 巴拿马
        'gt': 'flag-gt', // 危地马拉
        'hn': 'flag-hn', // 洪都拉斯
        'sv': 'flag-sv', // 萨尔瓦多
        'ni': 'flag-ni', // 尼加拉瓜
    };

    if (languageFlag) {
        if (languageCountryFlagMap[countryCode]) {
            languageFlag.src = `./images/wflags_svg/${countryCode}.svg`;
            languageFlag.alt = countryName + ' flag';
            languageFlag.style.display = 'inline-block';
            languageFlag.style.height = '15px';
            languageFlag.style.width = '24px';
            languageFlag.style.objectFit = 'cover';
            languageFlag.style.left = '5px';
            languageFlag.style.top = '3px';

            languageFlag.onerror = () => { languageFlag.style.display = 'none'; };
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
    }, 600000); // 1 分钟延迟
}

document.addEventListener('DOMContentLoaded', displayCountryName);