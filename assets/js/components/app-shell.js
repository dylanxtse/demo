(function () {
  window.AppShell = {
    mount({ title, content, emptyText = '当前没有打开的页面' }) {
      const root = document.getElementById('app');
      if (!root) throw new Error('缺少 #app 页面挂载节点');

      root.innerHTML = `
        <div class="app-layout">
          ${window.AppSidebar.render()}
          <section class="main-section">
            ${window.AppHeader.render()}
            ${window.AppPageTabs.render(title)}
            <div class="page-empty-state">${emptyText}</div>
            <main class="content-area" id="pageContent">${content}</main>
          </section>
        </div>
      `;
      window.AppSidebar.bind(root);
      window.AppPageTabs.bind(root);
      return root;
    }
  };
})();
