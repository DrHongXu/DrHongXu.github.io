const germanStateGreetings = {
    "Baden-Württemberg": "Grüß Gott!",
    "Bavaria": "Servus!",
    "Berlin": "Juten Tach!",
    "Brandenburg": "Hallo!",
    "Bremen": "Moin Moin!",
    "Hamburg": "Moin Moin!",
    "Hesse": "Ei Gude!",
    "Lower Saxony": "Moin Moin!",
    "Mecklenburg-Vorpommern": "Moin Moin!",
    "North Rhine-Westphalia": "Hallo!",
    "Rhineland-Palatinate": "Gunn Tach!",
    "Saarland": "Gemoje!",
    "Saxony": "Tagchen!",
    "Saxony-Anhalt": "Tagchen!",
    "Schleswig-Holstein": "Moin Moin!",
    "Thuringia": "Hallo!"
};

const otherGermanCountryGreetings = {
    "CH": "Grüezi!",       
    "AT": "Grüß Gott!",    
    "LI": "Grüß Gott!",    
    "LU": "Moien!",         
    "IT": "Grüß Gott!",   
    "NL": "Hoi!",        
    "BE": "Dag!"         
};

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

function getCountryNameByCode(countries, code, language = 'german') {
    const country = countries.find(c => c.abbr.toLowerCase() === code.toLowerCase());
    return country ? (country[language] || country.german || country.english) : 'der Welt';
}

async function updateDisplay(countryCode, countries, regionName = '') {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'germen');

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
        'at': 'flag-at', 
        'ch': 'flag-ch', 
        'li': 'flag-li', 
        'lu': 'flag-lu'
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

            if (countryCode === 'ch') {
                languageFlag.style.width = 'auto';
            } else {
                languageFlag.style.width = '24px';
            }

            languageFlag.onerror = () => {
                languageFlag.style.display = 'none';
            };
        } else {
            languageFlag.style.display = 'none';
        }
    }

    // --- 设置问候语 ---
    const defaultGreeting = "Hallo!";
    let greeting = defaultGreeting;

    if (countryCode === "de" && regionName) {
        greeting = germanStateGreetings[regionName] || defaultGreeting;
    } else if (otherGermanCountryGreetings[countryCode.toUpperCase()]) {
        greeting = otherGermanCountryGreetings[countryCode.toUpperCase()];
    }

    const spans = document.querySelectorAll(".greeting");
    spans.forEach(span => span.textContent = greeting + " ");
}

async function displayCountryName() {
    const countries = await fetchCountries();

    // 1. 先显示缓存的 countryCode（如果有）
    let cachedCode = localStorage.getItem('countryCode');
    let cachedRegion = localStorage.getItem('regionName') || '';
    if (cachedCode) {
        await updateDisplay(cachedCode, countries, cachedRegion);
    }

    // 2. 延迟 1 分钟后重新获取最新 IP
    setTimeout(async () => {
        try {
            const response = await fetch('https://ipinfo.io/json?token=228a7bb192c4fc');
            const data = await response.json();
            const newCode = (data.country || '').toLowerCase();
            const regionName = (data.region || "").normalize();

            if (!cachedCode || newCode !== cachedCode || regionName !== cachedRegion) {
                await updateDisplay(newCode, countries, regionName);
                localStorage.setItem('countryCode', newCode);
                localStorage.setItem('regionName', regionName);
            }
        } catch (err) {
            console.error('延迟获取 IPInfo 失败', err);
        }
    }, 10); // 1 分钟延迟
}

document.addEventListener('DOMContentLoaded', displayCountryName);