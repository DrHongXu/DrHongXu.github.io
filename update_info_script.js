// updateInfo.js

// 固定的个人信息，包含默认的 citation
const data = {
    "age": new Date().getFullYear() - 1993,
    "web_update_year": 2025,
    "web_update_month": "09",
    "web_update_day": 1,
    "born_year": 1993,
    "year_of_experience": 8,
    "no_of_papers": 15,
    "google_scholar_citation": 440,  // 默认值
    "h_index": 10,
    "no_of_journals_for_review": 10,
    "no_of_reviews": 55,
    "no_of_patents": 3,
    "no_of_patents_in_review": 2,
    "no_of_patents_sum": 5,
    "patent_citation": 18,
    "no_of_books": 0,
    "phd_thesis_views": 2200,
    "phd_thesis_downloads": 660,
    "zhihu_followers": 13800,
    "linkedin_followers": 1900,
    "xiaohongshu_followers": 3200,
    "visited_countries": 40
  };
  
  

// 更新指定类名的 <span> 内容的函数
function updateContent() {
    for (const key in data) {
        const elements = document.getElementsByClassName(key);
        for (const element of elements) {
            element.innerText = data[key]; // 更新每个元素
        }
    }
}

// 调用更新函数
updateContent();

// ==================== 时间显示系统 ====================

/**
 * 获取缓存的时区信息
 * @returns {string} 时区字符串
 */
function getCachedTimeZone() {
    const cache = getCachedUserInfo();
    if (cache && cache.languageInfo && cache.languageInfo.timeZone) {
        return cache.languageInfo.timeZone;
    }
    return localStorage.getItem('userTimeZone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 全球时区映射表
 * 包含世界各地的时区，支持别名映射到标准的IANA时区标识符
 */
const timezoneAliases = {
    // 中国时区
    'Asia/Beijing': 'Asia/Shanghai',
    'Asia/Chongqing': 'Asia/Shanghai',
    'Asia/Harbin': 'Asia/Shanghai',
    'Asia/Kashgar': 'Asia/Urumqi',
    'Asia/Urumqi': 'Asia/Urumqi',
    'Asia/Hong_Kong': 'Asia/Hong_Kong',
    'Asia/Macau': 'Asia/Macau',
    'Asia/Taipei': 'Asia/Taipei',
    'CST': 'Asia/Shanghai',
    'China': 'Asia/Shanghai',
    
    // 美国时区
    'EST': 'America/New_York',
    'EDT': 'America/New_York',
    'CST_US': 'America/Chicago',
    'CDT': 'America/Chicago',
    'MST': 'America/Denver',
    'MDT': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'PDT': 'America/Los_Angeles',
    'AKST': 'America/Anchorage',
    'AKDT': 'America/Anchorage',
    'HST': 'Pacific/Honolulu',
    'Hawaii': 'Pacific/Honolulu',
    
    // 欧洲时区
    'GMT': 'Europe/London',
    'BST': 'Europe/London',
    'CET': 'Europe/Paris',
    'CEST': 'Europe/Paris',
    'EET': 'Europe/Athens',
    'EEST': 'Europe/Athens',
    'MSK': 'Europe/Moscow',
    'Russia': 'Europe/Moscow',
    
    // 亚洲时区
    'JST': 'Asia/Tokyo',
    'Japan': 'Asia/Tokyo',
    'KST': 'Asia/Seoul',
    'Korea': 'Asia/Seoul',
    'IST': 'Asia/Kolkata',
    'India': 'Asia/Kolkata',
    'SGT': 'Asia/Singapore',
    'Singapore': 'Asia/Singapore',
    'MYT': 'Asia/Kuala_Lumpur',
    'Malaysia': 'Asia/Kuala_Lumpur',
    'THA': 'Asia/Bangkok',
    'Thailand': 'Asia/Bangkok',
    'ICT': 'Asia/Ho_Chi_Minh',
    'Vietnam': 'Asia/Ho_Chi_Minh',
    'PHT': 'Asia/Manila',
    'Philippines': 'Asia/Manila',
    'WIB': 'Asia/Jakarta',
    'Indonesia': 'Asia/Jakarta',
    
    // 大洋洲时区
    'AEST': 'Australia/Sydney',
    'AEDT': 'Australia/Sydney',
    'Australia': 'Australia/Sydney',
    'NZST': 'Pacific/Auckland',
    'NZDT': 'Pacific/Auckland',
    'New_Zealand': 'Pacific/Auckland',
    
    // 中东和非洲时区
    'GST': 'Asia/Dubai',
    'UAE': 'Asia/Dubai',
    'SAST': 'Africa/Johannesburg',
    'South_Africa': 'Africa/Johannesburg',
    'EAT': 'Africa/Nairobi',
    'Kenya': 'Africa/Nairobi',
    'CAT': 'Africa/Harare',
    'Zimbabwe': 'Africa/Harare',
    
    // 南美洲时区
    'BRT': 'America/Sao_Paulo',
    'Brazil': 'America/Sao_Paulo',
    'ART': 'America/Argentina/Buenos_Aires',
    'Argentina': 'America/Argentina/Buenos_Aires',
    'CLT': 'America/Santiago',
    'Chile': 'America/Santiago',
    'PET': 'America/Lima',
    'Peru': 'America/Lima',
    'COT': 'America/Bogota',
    'Colombia': 'America/Bogota',
    
    // 加拿大时区
    'Canada_Eastern': 'America/Toronto',
    'Canada_Central': 'America/Winnipeg',
    'Canada_Mountain': 'America/Edmonton',
    'Canada_Pacific': 'America/Vancouver',
    
    // 其他常用时区
    'UTC': 'UTC',
    'Zulu': 'UTC',
    'Greenwich': 'Europe/London'
};

/**
 * 获取所有可用的时区列表
 * @returns {Array} 时区列表
 */
function getAllTimeZones() {
    return Intl.supportedValuesOf('timeZone');
}

/**
 * 验证时区是否有效
 * @param {string} timezone - 要验证的时区
 * @returns {boolean} 时区是否有效
 */
function isValidTimeZone(timezone) {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 获取时区的友好名称
 * @param {string} timezone - 时区标识符
 * @returns {string} 友好的时区名称
 */
function getTimeZoneDisplayName(timezone) {
    const actualTimezone = timezoneAliases[timezone] || timezone;
    
    // 常见时区的友好名称
    const friendlyNames = {
        'Asia/Shanghai': '中国标准时间 (CST)',
        'Asia/Tokyo': '日本标准时间 (JST)',
        'Asia/Seoul': '韩国标准时间 (KST)',
        'Asia/Kolkata': '印度标准时间 (IST)',
        'Asia/Singapore': '新加坡时间 (SGT)',
        'Asia/Bangkok': '泰国时间 (THA)',
        'Asia/Ho_Chi_Minh': '越南时间 (ICT)',
        'Asia/Manila': '菲律宾时间 (PHT)',
        'Asia/Jakarta': '印尼时间 (WIB)',
        'America/New_York': '美国东部时间 (EST/EDT)',
        'America/Chicago': '美国中部时间 (CST/CDT)',
        'America/Denver': '美国山地时间 (MST/MDT)',
        'America/Los_Angeles': '美国太平洋时间 (PST/PDT)',
        'Europe/London': '英国时间 (GMT/BST)',
        'Europe/Paris': '中欧时间 (CET/CEST)',
        'Europe/Moscow': '莫斯科时间 (MSK)',
        'Australia/Sydney': '澳大利亚东部时间 (AEST/AEDT)',
        'Pacific/Auckland': '新西兰时间 (NZST/NZDT)',
        'Asia/Dubai': '阿联酋时间 (GST)',
        'Africa/Johannesburg': '南非时间 (SAST)',
        'America/Sao_Paulo': '巴西时间 (BRT)',
        'UTC': '协调世界时 (UTC)'
    };
    
    return friendlyNames[actualTimezone] || actualTimezone;
}

/**
 * 格式化时间显示
 * @param {Date} date - 要格式化的日期对象
 * @param {string} timezone - 时区
 * @param {string} locale - 语言环境
 * @param {boolean} isTime - 是否为时间格式（true）还是日期格式（false）
 * @param {boolean} use24Hour - 是否使用24小时制（true为24小时制，false为12小时制）
 * @returns {string} 格式化后的时间字符串
 */
function formatDateTime(date, timezone, locale, isTime = true, use24Hour = false) {
    let displayDate = date;
    
    // 处理时区别名
    const actualTimezone = timezoneAliases[timezone] || timezone;
    
    // 验证时区有效性
    if (!isValidTimeZone(actualTimezone)) {
        console.warn(`无效的时区: ${timezone}, 使用默认时区`);
        return formatDateTime(date, 'UTC', locale, isTime, use24Hour);
    }
    
    // 处理GMT偏移时区
    if (/^GMT[+-]\d+$/.test(actualTimezone)) {
        const offset = parseInt(actualTimezone.replace('GMT', ''));
        displayDate = new Date(date.getTime() + offset * 3600 * 1000 - date.getTimezoneOffset() * 60000);
    }

    const options = isTime ? {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: !use24Hour, // 根据use24Hour参数决定是否使用12小时制
        timeZone: /^GMT[+-]\d+$/.test(actualTimezone) ? undefined : actualTimezone
    } : {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: /^GMT[+-]\d+$/.test(actualTimezone) ? undefined : actualTimezone
    };

    try {
        return new Intl.DateTimeFormat(locale, options).format(displayDate);
    } catch (e) {
        console.warn(`格式化时间失败: ${e.message}`);
        return new Intl.DateTimeFormat('en-US', options).format(displayDate);
    }
}

/**
 * 更新时间和日期显示
 */
function updateTimeDate() {
    const now = new Date();

    // 更新时间显示
    const timeElements = document.querySelectorAll('.digitalTime');
    
    timeElements.forEach((el, index) => {
        let tz = el.getAttribute('timezone');
        const locale = el.getAttribute('locale') || 'en-US';
        const hourFormat = el.getAttribute('hour-format') || '12'; // 默认12小时制

        if (!tz) {
            tz = getCachedTimeZone(); // 使用缓存的时区
        } else if (tz === 'LocalCache') {
            tz = getCachedTimeZone();
        }

        // 处理时区别名
        const actualTimezone = timezoneAliases[tz] || tz;
        const use24Hour = hourFormat === '24'; // 如果hour-format="24"则使用24小时制
        const formattedTime = formatDateTime(now, actualTimezone, locale, true, use24Hour);
        el.textContent = formattedTime;
    });

    // 更新日期显示
    document.querySelectorAll('.digitalDate').forEach(el => {
        let tz = el.getAttribute('timezone');
        const locale = el.getAttribute('locale') || 'en-US';

        if (!tz) {
            tz = getCachedTimeZone();
        } else if (tz === 'LocalCache') {
            tz = getCachedTimeZone();
        }

        // 处理时区别名
        const actualTimezone = timezoneAliases[tz] || tz;
        el.textContent = formatDateTime(now, actualTimezone, locale, false);
    });

    // 更新星期显示
    document.querySelectorAll('.digitalWeek').forEach(el => {
        let tz = el.getAttribute('timezone');
        const locale = el.getAttribute('locale') || 'en-US';

        if (!tz) {
            tz = getCachedTimeZone();
        } else if (tz === 'LocalCache') {
            tz = getCachedTimeZone();
        }

        // 处理时区别名
        const actualTimezone = timezoneAliases[tz] || tz;
        const options = {
            weekday: 'long',
            timeZone: /^GMT[+-]\d+$/.test(actualTimezone) ? undefined : actualTimezone
        };
        el.textContent = new Intl.DateTimeFormat(locale, options).format(now);
    });
}

// 启动时间更新
function startTimeUpdate() {
    // 立即更新一次
    updateTimeDate();
    
    // 每秒更新一次
    setInterval(updateTimeDate, 1000);
}

// 页面加载完成后启动时间更新
document.addEventListener('DOMContentLoaded', function() {
    startTimeUpdate();
});

// 全局函数：在控制台中查看所有可用时区
window.showAllTimeZones = function() {
    console.log('=== 所有支持的时区 ===');
    const allTimeZones = getAllTimeZones();
    allTimeZones.forEach(tz => {
        console.log(`${tz} - ${getTimeZoneDisplayName(tz)}`);
    });
    console.log(`\n总共支持 ${allTimeZones.length} 个时区`);
    return allTimeZones;
};

// 全局函数：测试特定时区的时间显示
window.testTimeZone = function(timezone, locale = 'zh-CN', use24Hour = false) {
    const now = new Date();
    console.log(`=== 测试时区: ${timezone} ===`);
    console.log(`友好名称: ${getTimeZoneDisplayName(timezone)}`);
    console.log(`12小时制: ${formatDateTime(now, timezone, locale, true, false)}`);
    console.log(`24小时制: ${formatDateTime(now, timezone, locale, true, true)}`);
    console.log(`日期: ${formatDateTime(now, timezone, locale, false)}`);
    console.log(`有效性: ${isValidTimeZone(timezone)}`);
};

//2) JS：使用 localStorage 记忆并排他高亮
document.addEventListener('DOMContentLoaded', function () {
    const slides = Array.from(document.querySelectorAll('nav div.nav-container > div > .slide'));
    const STORAGE_KEY = 'navColorHref';
  
    // 辅助函数：清除所有 nav-visited
    function clearVisited() {
      slides.forEach(slide => slide.classList.remove('nav-visited'));
    }
  
    // 辅助函数：根据 href 找到匹配的 slide 并加上 nav-visited
    function applyVisited(href) {
      if (!href) return;
      // 只匹配完整 href（相对路径 + hash）
      const matched = slides.find(slide => slide.getAttribute('href') === href);
      if (matched) matched.classList.add('nav-visited');
    }
  
    // 读取 localStorage 并应用
    const savedHref = localStorage.getItem(STORAGE_KEY);
    if (savedHref) applyVisited(savedHref);
  
    // 给每个 slide 绑定点击事件
    slides.forEach(slide => {
      slide.addEventListener('click', function (ev) {
        const href = slide.getAttribute('href');
        if (!href || href === '#') return; // logo等无效链接不处理
        // 清除旧状态
        clearVisited();
        // 新状态写入
        slide.classList.add('nav-visited');
        localStorage.setItem(STORAGE_KEY, href);
      });
    });
  });