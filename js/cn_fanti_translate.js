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

  // 存储当前选择
  localStorage.setItem("langMode", mode);
}

document.addEventListener("DOMContentLoaded", function() {
  // 默认简体或者 localStorage 中的保存值
  var savedMode = localStorage.getItem("langMode") || "simplified";
  switchLanguage(savedMode);
});

// 简体按钮
function setSimplified() {
  switchLanguage("simplified");
}

// 繁体按钮
function setTraditional() {
  switchLanguage("traditional");
}
