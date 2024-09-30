$('.float-nav').click(function () {
  event.preventDefault(); // 阻止默认的跳转行为
  $('.main-nav, .menu-btn').toggleClass('active');
});


