// block save, copy, and developer tools 
document.addEventListener("DOMContentLoaded", function () {

  // Helper: check if event is inside input/textarea/contentEditable
  function isEditableElement(el) {
    return (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    );
  }

  // Disable right-click context menu
  document.addEventListener(
    "contextmenu",
    function (e) {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    },
    true
  );

  // Disable text selection
  document.addEventListener(
    "selectstart",
    function (e) {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    },
    true
  );

  // Disable drag and drop
  document.addEventListener(
    "dragstart",
    function (e) {
      e.preventDefault();
    },
    true
  );

  // Disable common keyboard shortcuts
  document.addEventListener(
    "keydown",
    function (e) {
      if (isEditableElement(e.target)) return; // 允许输入框正常使用

      // 常见快捷键屏蔽
      const key = e.key.toLowerCase();
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && ["i", "c", "j"].includes(key)) || // DevTools
        (e.ctrlKey && ["u", "s", "p", "c", "x", "v", "a"].includes(key)) || // 常见复制、打印、保存
        (e.shiftKey && e.keyCode === 121) // Shift+F10
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
});



///////////////////////////


const select = document.getElementById('content-select');
const offset = 80; // 向下偏移 80px

if (select) {
  select.addEventListener('change', function() {
  const url = this.value;
  const [page, hash] = url.split('#');

  const currentPage = window.location.pathname.split('/').pop();

  if (hash && page === currentPage) {
    // 当前页面跳转锚点
    const el = document.getElementById(hash);
    if (el) {
      const topPos = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  } else {
    // 跨页面跳转或没有 hash
    window.location.href = url;
  }
  });
}





