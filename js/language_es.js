// ==================== 模块: 国家/西班牙语问候/导航 ====================
(async function() {
  // -------------------- 国家数据 --------------------
  async function fetchCountries() {
    try {
      const res = await fetch('./js/countries.json');
      return await res.json();
    } catch (err) {
      console.error('无法加载 countries.json', err);
      return [];
    }
  }

  function getCountryNameByCode(countries, code, language='spanish') {
    const country = countries.find(c => c.abbr.toLowerCase()===code.toLowerCase());
    return country ? (country[language] || country.spanish || country.english) : 'mundo';
  }

  function getSpanishGreeting(hour) {
    if(hour>=5 && hour<12) return '¡Buenos días!';
    if(hour>=12 && hour<20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  function updateSpanishGreeting(timezone) {
    const greetingEls = document.querySelectorAll('.morning-night-greeting');
    if(!greetingEls.length) return;
    let hour;
    try {
      hour = new Date(new Date().toLocaleString("en-US",{timeZone: timezone})).getHours();
    } catch { hour = new Date().getHours(); }
    const greeting = getSpanishGreeting(hour);
    greetingEls.forEach(el=>el.textContent=greeting);
  }

  function updateFlag(imgEl, countryCode, countryName) {
    if(!imgEl) return;
    imgEl.src = `./images/wflags/${countryCode}.png`;
    imgEl.alt = countryName;
    imgEl.onerror = ()=>{ imgEl.src='./images/wflags/un.png'; imgEl.alt='United Nations'; };
  }

  function updateLanguageFlag(flagEl, countryCode, countryName) {
    if(!flagEl) return flagEl.style.display='none';
    const map = {
      'mx':'flag-mx','ar':'flag-ar','co':'flag-co','cl':'flag-cl','pe':'flag-pe','uy':'flag-uy',
      've':'flag-ve','ec':'flag-ec','bo':'flag-bo','py':'flag-py','do':'flag-do','cr':'flag-cr',
      'pa':'flag-pa','gt':'flag-gt','hn':'flag-hn','sv':'flag-sv','ni':'flag-ni'
    };
    if(!map[countryCode]) return flagEl.style.display='none';
    flagEl.src = `./images/wflags_svg/${countryCode}.svg`;
    flagEl.alt = countryName + ' flag';
    flagEl.style.cssText='display:inline-block;height:15px;object-fit:cover;left:5px;top:3px;width:24px';
    flagEl.onerror=()=>flagEl.style.display='none';
  }

  async function updateDisplay(countryCode, countries, timezone='') {
    const locEls = [document.getElementById("location"), document.getElementById("location2")];
    const flagImg = document.getElementById("country-flag");
    const flagImg2 = document.getElementById("country-flag-2");
    const languageFlag = document.getElementById("language-flag");

    const countryName = getCountryNameByCode(countries, countryCode, 'spanish');
    locEls.forEach(el=>el&&(el.textContent=countryName));
    if(timezone) updateSpanishGreeting(timezone);
    [flagImg, flagImg2].forEach(img=>updateFlag(img,countryCode,countryName));
    updateLanguageFlag(languageFlag,countryCode,countryName);
  }

  // -------------------- IP 获取与缓存 --------------------
  async function getIPInfo() {
    try {
      const data = await (await fetch('https://ipinfo.io/json?token=228a7bb192c4fc')).json();
      return { code:(data.country||'').toLowerCase(), timezone:data.timezone||'' };
    } catch(err){ console.error('获取 IP 失败', err); return { code:'un', timezone:'' }; }
  }

  // -------------------- 导航宽度缓存 --------------------
  const NAV_CACHE_KEY = 'navWidthsCache';
  function getCachedNavWidths() {
    const cached = localStorage.getItem(NAV_CACHE_KEY);
    if(!cached) return null;
    try {
      const data = JSON.parse(cached);
      if(Date.now()-data.timestamp<24*60*60*1000) return data.widths;
      localStorage.removeItem(NAV_CACHE_KEY);
    } catch{ localStorage.removeItem(NAV_CACHE_KEY); }
    return null;
  }
  function setCachedNavWidths(widths){ localStorage.setItem(NAV_CACHE_KEY,JSON.stringify({widths,timestamp:Date.now()})); }

  function measureNavWidths(){
    const navItems = document.querySelectorAll('.nav-container > div');
    const measureContainer = document.createElement('div');
    measureContainer.style.cssText='position:absolute;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;font-family:inherit;font-size:inherit;';
    document.body.appendChild(measureContainer);
    const measurements = Array.from(navItems).map((item,i)=>{
      const clone = item.cloneNode(true);
      clone.style.cssText='position:static;visibility:visible;white-space:nowrap;display:block;';
      measureContainer.appendChild(clone);
      const width=clone.offsetWidth;
      measureContainer.removeChild(clone);
      return { index:i+1, element:item, width };
    });
    document.body.removeChild(measureContainer);
    const totalWidth = measurements.reduce((sum,m)=>sum+m.width,0);
    measurements.forEach(item=>{
      let ratio=(item.width/totalWidth*100).toFixed(2);
      if(item.index===measurements.length) ratio=(ratio*0.6).toFixed(2);
      item.element.style.width=`${ratio}%`;
    });
    return measurements.map(item=>(item.width/totalWidth*100).toFixed(2)+'%');
  }

  function applyNavCache(widths){
    if(!widths) return false;
    const navItems = document.querySelectorAll('.nav-container > div');
    if(navItems.length===0) return false;
    navItems.forEach((item,i)=>{ if(widths[i]) item.style.width=widths[i]; });
    return true;
  }

  function initNavWidths(){
    const cached = getCachedNavWidths();
    if(cached && applyNavCache(cached)) return;
    const widths = measureNavWidths();
    setCachedNavWidths(widths);
  }

  // -------------------- 初始化 --------------------
  const countries = await fetchCountries();

  // 优先显示缓存的国家
  const cachedCode = localStorage.getItem('countryCode');
  const cachedTimezone = localStorage.getItem('userTimezone');
  if(cachedCode) await updateDisplay(cachedCode, countries, cachedTimezone);

  applyNavCache(getCachedNavWidths());

  // 异步更新 IP/时区
  setTimeout(async ()=>{
    const { code, timezone } = await getIPInfo();
    if(!cachedCode || code!==cachedCode || timezone!==cachedTimezone){
      await updateDisplay(code, countries, timezone);
      localStorage.setItem('countryCode',code);
      localStorage.setItem('userTimezone',timezone);
    }
  },10000);

  document.addEventListener('DOMContentLoaded', initNavWidths);

})();