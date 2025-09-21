// 等待jQuery加载完成
function waitForJQuery() {
    if (typeof $ !== 'undefined') {
        $('select').on('change', function(){
            var langVal = $(this).val();
            $('.mobile a span').text(langVal);
        });
    } else {
        // 如果jQuery还没加载，等待100ms后重试
        setTimeout(waitForJQuery, 100);
    }
}

// 页面加载完成后尝试执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForJQuery);
} else {
    waitForJQuery();
}



