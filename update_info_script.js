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