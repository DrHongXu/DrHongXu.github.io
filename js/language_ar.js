async function fetchCountries() {
    try {
      const response = await fetch('/js/world.json');
      const countries = await response.json();
      return countries;
    } catch (err) {
      console.error('无法加载 world.json', err);
      return [];
    }
  }

  function getCountryNameByCode(countries, code, language = 'ar') {
    const country = countries.find(country => country.alpha2.toUpperCase() === code.toUpperCase());
    return country ? (country[language] || country.en) : 'العالم';
  }

  async function updateDisplay(countryCode, countries) {
    const locationEl = document.getElementById("location");
    const location2El = document.getElementById("location2");
    const flagImg = document.getElementById("country-flag");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'ar');

    if (locationEl) locationEl.textContent = countryName;
    if (location2El) location2El.textContent = countryName;

    if (flagImg) {
      flagImg.src = `./images/wflags/${countryCode.toLowerCase()}.png`;
      flagImg.alt = countryName;
      flagImg.onerror = () => {
        flagImg.src = './images/wflags/un.png';
        flagImg.alt = 'United Nations';
      };
    }

    // 阿拉伯语主要国家筛选表
    const languageCountryFlagMap = {
        'ae': 'flag-ae', // 阿联酋
        'eg': 'flag-eg', // 埃及
        'ma': 'flag-ma', // 摩洛哥
        'dz': 'flag-dz', // 阿尔及利亚
        'tn': 'flag-tn', // 突尼斯
        'iq': 'flag-iq', // 伊拉克
        'jo': 'flag-jo', // 约旦
        'kw': 'flag-kw', // 科威特
        'om': 'flag-om', // 阿曼
        'qa': 'flag-qa', // 卡塔尔
        'lb': 'flag-lb', // 黎巴嫩
        'sy': 'flag-sy', // 叙利亚
        'ye': 'flag-ye', // 也门
        'bh': 'flag-bh', // 巴林
        'sd': 'flag-sd'  // 苏丹
    };

    if (languageFlag) {
      let flagToShow = countryCode.toLowerCase();
      if (!languageCountryFlagMap[flagToShow]) {
        // 不在筛选表里，显示沙特阿拉伯
        flagToShow = 'sa';
      }

      languageFlag.src = `./images/wflags_svg/${flagToShow}.svg`;
      languageFlag.alt = getCountryNameByCode(countries, flagToShow, 'ar') + ' flag';
      languageFlag.style.display = 'inline-block';
      languageFlag.style.height = '15px';
      languageFlag.style.width = '24px';
      languageFlag.style.objectFit = 'cover';
      languageFlag.style.left = '5px';
      languageFlag.style.top = '3px';
      languageFlag.onerror = () => { languageFlag.style.display = 'none'; };
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
    }, 10000); // 1 分钟延迟
  }

  document.addEventListener('DOMContentLoaded', displayCountryName);