(function () {
  window.AppPageTabs = {
    render(title) {
      return `
        <div class="breadcrumb-bar" aria-label="已打开页面">
          <div class="page-tabs">
            <div class="page-tab active">
              <span>${title}</span>
              <button class="page-tab-close" type="button" disabled aria-label="关闭${title}">×</button>
            </div>
          </div>
        </div>
      `;
    }
  };
})();
