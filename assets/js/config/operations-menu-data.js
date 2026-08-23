(function () {
  const icons = window.AppMenuConfig?.icons || {};
  const menu = [
    { name: '首页', icon: 'home', href: './operations.html' },
    { name: '平台管理', icon: 'layers', active: true, expanded: true, children: [
      { name: '教育局管理', selected: true, href: './operations-education-management.html' },
      { name: '企业管理', available: false },
      { name: '学校管理', available: false }
    ] },
    { name: '系统管理', icon: 'settings', expanded: true, children: [
      { name: '菜单配置' },
      { name: '企业角色管理' },
      { name: '平台打通配置' },
      { name: '操作日志' },
      { name: '图标配置' }
    ] }
  ];

  function normalize(entry) {
    const normalized = typeof entry === 'string' ? { name: entry } : entry;
    const hasChildren = Array.isArray(normalized.children) && normalized.children.length > 0;
    return {
      ...normalized,
      available: normalized.available ?? Boolean(normalized.href || hasChildren),
      expanded: Boolean(normalized.expanded),
      children: normalized.children?.map(normalize)
    };
  }

  window.OperationsMenuConfig = {
    icons,
    menu: menu.map(normalize)
  };
})();
