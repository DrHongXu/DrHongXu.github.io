// updateInfo.js

const data = {
    "age": new Date().getFullYear() - 1993 ,
    "web_update_year": 2025,
    "web_update_month": "08",  // 两位数，01-09
    "web_update_day": 1,
    "born_year": 1993,
    "year_of_experience": 8,
    "no_of_papers": 15,
    "google_scholar_citation": 430,
    "h_index": 10,
    "no_of_reviews": 55,
    "no_of_patents": 3,
    "no_of_patents_in_review": 2,
    "no_of_patents_sum": 5,
    "patent_citation": 18,
    "no_of_books": 0,
    "phd_thesis_views": 2200,
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