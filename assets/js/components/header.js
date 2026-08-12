(function () {
  const bellIcon = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const arrowIcon = '<svg class="icon-svg" viewBox="0 0 24 24" style="width:12px;height:12px;"><polyline points="6 9 12 15 18 9"/></svg>';

  window.AppHeader = {
    render() {
      const session = window.DemoStore?.getSession?.() || { displayName: '管理员', companyId: '' };
      const company = window.DemoStore?.get?.('companies')?.find((item) => item.id === session.companyId);
      const companyName = company?.name || '产品部学校食材集采供应链有限公司';
      const userName = session.displayName || session.username || '管理员';
      return `
        <header class="app-header">
          <div class="header-left">
            <span class="header-company" style="font-size:18px">${companyName}</span>
          </div>
          <div class="header-right">
            <div class="header-msg">
              ${bellIcon}
              <span>消息中心</span>
              <span class="msg-badge">84</span>
            </div>
            <div class="header-user">
              <div class="user-avatar">${userName.slice(0, 1)}</div>
              <span>${userName}</span>
              ${arrowIcon}
            </div>
          </div>
        </header>
      `;
    }
  };
})();
