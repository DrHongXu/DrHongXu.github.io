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
    }, 10); // 1 分钟延迟
}

document.addEventListener('DOMContentLoaded', displayCountryName);