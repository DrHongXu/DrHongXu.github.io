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



  document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav .slide");

    navLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        // 先清除所有 slide 的 active 状态
        navLinks.forEach(l => l.classList.remove("menu-active"));

        // 给当前点击的 slide 加上 active
        this.classList.add("menu-active");
      });
    });
  });
