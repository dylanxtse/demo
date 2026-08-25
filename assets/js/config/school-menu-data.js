(function () {
  const icons = window.AppMenuConfig?.icons || {};
  const menu = [
    { name: '首页', icon: 'home', href: './school-product-management.html' },
    { name: '商品档案', icon: 'box', active: true, selected: true, href: './school-product-management.html' },
    { name: '竞价需求管理', icon: 'tag' },
    { name: '订单管理', icon: 'cart' },
    { name: '财务对账', icon: 'wallet' },
    { name: '公告管理', icon: 'notice', href: './school-notice-management.html' },
    { name: '食堂管理', icon: 'home' },
    { name: '系统设置', icon: 'settings' }
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

  window.SchoolMenuConfig = {
    icons,
    menu: menu.map(normalize)
  };
})();
