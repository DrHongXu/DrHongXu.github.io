// block save as, copy, and developer tools 
window.onload = function () {
  // Disable right-click context menu
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Disable text selection
  document.addEventListener('selectstart', function (e) {
    e.preventDefault();
  });

  // Disable drag and drop
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  // Disable common keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Block F12
    if (e.keyCode === 123) {
      e.preventDefault();
    }
    // Block Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
    }
    // Block Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
    }
    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
    }
    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
    }
    // Block Ctrl+S (Save)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
    }
    // Block Ctrl+P (Print)
    if (e.ctrlKey && e.keyCode === 80) {
      e.preventDefault();
    }
    // Block Ctrl+C (Copy)
    if (e.ctrlKey && e.keyCode === 67) {
      e.preventDefault();
    }
    // Block Ctrl+X (Cut)
    if (e.ctrlKey && e.keyCode === 88) {
      e.preventDefault();
    }
    // Block Ctrl+V (Paste)
    if (e.ctrlKey && e.keyCode === 86) {
      e.preventDefault();
    }
    // Block Ctrl+A (Select All)
    if (e.ctrlKey && e.keyCode === 65) {
      e.preventDefault();
    }
    // Block Shift+F10 (Context Menu)
    if (e.shiftKey && e.keyCode === 121) {
      e.preventDefault();
    }
  });
}
