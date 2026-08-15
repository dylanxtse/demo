(function () {
  const bellIcon = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const arrowIcon = '<svg class="icon-svg" viewBox="0 0 24 24" style="width:12px;height:12px;"><polyline points="6 9 12 15 18 9"/></svg>';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.AppHeader = {
    render({ variant = 'enterprise' } = {}) {
      const isEducation = variant === 'education';
      const session = window.DemoStore?.getSession?.() || { displayName: '管理员', companyId: '' };
      const company = window.DemoStore?.get?.('companies')?.find((item) => item.id === session.companyId);
      const companyName = isEducation ? '南皮县教育局' : (company?.name || '产品部学校食材集采供应链有限公司');
      const userName = session.displayName || session.username || '管理员';
      const platformSwitcher = `
        <div class="education-platform-switcher" aria-label="平台切换">
          <button type="button" class="education-platform-button">食品安全平台</button>
          <button type="button" class="education-platform-button active">膳食集采竞价版</button>
          <button type="button" class="education-platform-button">膳食经费平台</button>
        </div>
      `;
      const headerRight = isEducation ? platformSwitcher : `
        <div class="header-msg">
          ${bellIcon}
          <span>消息中心</span>
          <span class="msg-badge">84</span>
        </div>
      `;
      const switchTarget = isEducation ? 'enterprise' : 'education';
      const switchLabel = isEducation ? '切换至企业端' : '切换至教育局端';
      return `
        <header class="app-header ${isEducation ? 'education-header' : ''}">
          <div class="header-left">
            <span class="header-company" style="font-size:18px">${escapeHtml(companyName)}</span>
          </div>
          <div class="header-right">
            ${headerRight}
            <div class="header-user" tabindex="0" aria-haspopup="menu" aria-label="用户菜单">
              <div class="user-avatar">${escapeHtml(userName.slice(0, 1))}</div>
              <span class="header-user-name">${escapeHtml(userName)}</span>
              ${arrowIcon}
              <div class="header-user-menu" role="menu">
                <button type="button" role="menuitem" data-shell-switch="${switchTarget}">${switchLabel}</button>
                <button type="button" role="menuitem">个人中心</button>
                <button type="button" role="menuitem">退出登录</button>
              </div>
            </div>
          </div>
        </header>
      `;
    },

    bind(root) {
      if (!root || root.dataset.headerBound === 'true') return;
      root.dataset.headerBound = 'true';
      root.addEventListener('click', (event) => {
        const switchButton = event.target.closest('[data-shell-switch]');
        if (!switchButton) return;
        window.location.href = switchButton.dataset.shellSwitch === 'education'
          ? './education.html'
          : './index.html';
      });
    }
  };
})();
