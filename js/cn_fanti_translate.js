// 更新国旗图标
function updateFlagIcon(mode) {
    // 更新主语言国旗
    const flagButton = document.getElementById("flag-button-lange");
    if (flagButton) {
        if (mode === "traditional") {
            flagButton.src = "./images/wflags_svg/hk.svg";
        } else {
            flagButton.src = "./images/wflags_svg/cn.svg";
        }
    }
    
    // 更新国家国旗（如果存在）
    const countryFlag = document.getElementById("country-flag-local-storage");
    if (countryFlag) {
        // 这里可以添加国家国旗的更新逻辑
        // 目前保持原样，因为国家国旗应该根据地理位置显示
    }
}

// 处理语言切换
function handleChange(select) {
    const selectedValue = select.value;

    if (selectedValue === 'javascript:runFanTiJavaScript();') {
        // 切换到繁体中文
        runFanTiJavaScript();
        currentLanguage = '繁体';
        updateSelectBox(); // 确保选框同步状态
        updateLogo(); // 切换语言时更新 logo
    } else {
        // 切换到其他语言或简体中文
        if (selectedValue !== '') {
            currentLanguage = select.options[select.selectedIndex].textContent.trim();
            updateLogo(); // 切换语言时更新 logo
            window.location.href = selectedValue; // 跳转页面
        }
    }
}

// 繁体中文切换函数
function runFanTiJavaScript() {
    console.log('切换到繁体中文...');
    const scriptId = 'tongwenlet_tw';
    let script = document.getElementById(scriptId);

    if (script) {
        document.body.removeChild(script);
    }

    script = document.createElement('script');
    script.language = 'javascript';
    script.type = 'text/javascript';
    script.src = 'js/bookmarklet_tw.js';
    script.id = scriptId;
    document.body.appendChild(script);
    
    // 切换国旗图标
    updateFlagIcon('traditional');
}

// 简体中文切换函数
function runJianTiJavaScript() {
    console.log('切换到簡體中文...');
    const scriptId = 'tongwenlet_cn';
    let script = document.getElementById(scriptId);

    if (script) {
        document.body.removeChild(script);
    }

    script = document.createElement('script');
    script.language = 'javascript';
    script.type = 'text/javascript';
    script.src = 'js/bookmarklet_cn.js';
    script.id = scriptId;
    document.body.appendChild(script);
    
    // 切换国旗图标
    updateFlagIcon('simplified');
}



function handleLanguageChange(select) {
    var value = select.value;
    if(value === "simplified" || value === "traditional") {
        // 切换简繁体
        switchLanguage(value);
    } else {
        // 跳转到其他语言页面
        window.location.href = value;
    }
}

function switchLanguage(mode) {
  // mode: "simplified" 或 "traditional"

  // 第1处：姓名标题
  var nameBlock = document.getElementById("nameBlock");
  if (nameBlock) {
    nameBlock.innerHTML = nameBlock.getAttribute("data-" + mode);
  }

  // 第2处：手机端 banner
  var mobileBanner = document.getElementById("mobileBanner");
  if (mobileBanner) {
    mobileBanner.src = mobileBanner.getAttribute("data-" + mode);
  }

  // 第3处：PC端 banner
  var pcBanner = document.getElementById("pcBanner");
  if (pcBanner) {
    pcBanner.src = pcBanner.getAttribute("data-" + mode);
  }

  // 调用原有的简繁切换逻辑
  if (mode === "traditional" && typeof runFanTiJavaScript === "function") {
    runFanTiJavaScript();
  } else if (mode === "simplified" && typeof runJianTiJavaScript === "function") {
    runJianTiJavaScript();
  }
  
  // 更新国旗图标
  updateFlagIcon(mode);

  // 存储当前选择
  localStorage.setItem("langMode", mode);
}

document.addEventListener("DOMContentLoaded", function() {
  // 默认简体或者 localStorage 中的保存值
  var savedMode = localStorage.getItem("langMode") || "simplified";
  switchLanguage(savedMode);
  
  // 确保国旗图标在页面加载时正确显示
  updateFlagIcon(savedMode);
  
  // 确保语言显示在页面加载时正确显示
  updateLanguageDisplay(savedMode);
});

// 更新语言显示和国旗（用于cn-research.html等页面）
function updateLanguageDisplay(mode) {
  const button = document.getElementById("language-button");
  const flagButton = document.getElementById("flag-button");
  const flagButtonLange = document.getElementById("flag-button-lange");
  
  if (button) {
    if (mode === "traditional") {
      // 繁体中文
      button.innerHTML = 'Hk<span style="color:transparent;">▾</span>';
    } else {
      // 简体中文
      button.innerHTML = 'Zh<span style="color:transparent;">▾</span>';
    }
  }
  
  // 更新国旗（支持两种ID）
  if (flagButton) {
    if (mode === "traditional") {
      flagButton.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButton.src = "./images/wflags_svg/cn.svg";
    }
  }
  
  if (flagButtonLange) {
    if (mode === "traditional") {
      flagButtonLange.src = "./images/wflags_svg/hk.svg";
    } else {
      flagButtonLange.src = "./images/wflags_svg/cn.svg";
    }
  }
}

// 简体按钮
function setSimplified() {
  switchLanguage("simplified");
  updateLanguageDisplay("simplified");
}

// 繁体按钮
function setTraditional() {
  switchLanguage("traditional");
  updateLanguageDisplay("traditional");
}
