// updateInfo.js

const data = {
    "web_update_year": 2024,
    "web_update_month": 10,  // 两位数，01-09
    "web_update_day": 1,
    "born_year": 1993,
    "age": 31,
    "year_of_experience": 8,
    "no_of_papers": 15,
    "google_scholar_citation": 330,
    "h_index": 9,
    "no_of_reviews": 55,
    "no_of_patents": 3,
    "patent_citation": 18,
    "no_of_books": 0,
    "phd_thesis_views": 2200,
    "zhihu_followers": 13800,
    "linkedin_followers": 1900,
    "xiaohongshu_followers": 3200,
    "visited_countries": 41
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