(function () {
  // file:// 页面不会读取服务端的 no-store 响应，使用时间戳避免浏览器复用旧的标注配置脚本。
  document.write('<script src="./assets/js/config/annotation-data.js?v=' + Date.now() + '"><\/script>');
})();
