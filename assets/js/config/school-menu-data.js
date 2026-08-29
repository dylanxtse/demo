(function () {
  const icons = window.AppMenuConfig?.icons || {};
  const menu = [
    { name: '首页', icon: 'home', href: './school-product-management.html' },
    { name: '商品档案', icon: 'box', active: true, selected: true, href: './school-product-management.html' },
    { name: '订单管理', icon: 'cart', href: './school-order-management.html' },
    { name: '财务对账', icon: 'wallet', children: [
      { name: '对账单' },
      { name: '付款管理' }
    ] },
    { name: '食堂管理', icon: 'home' },
    { name: '系统设置', icon: 'settings', children: [
      { name: '审核配置' },
      { name: '用户管理' },
      { name: '角色管理' },
      { name: '基础信息' },
      { name: '个人中心' }
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

  window.SchoolMenuConfig = {
    icons,
    menu: menu.map(normalize)
  };
})();
