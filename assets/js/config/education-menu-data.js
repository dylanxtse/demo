(function () {
  const icons = window.AppMenuConfig?.icons || {};
  const menu = [
    { name: '首页', icon: 'home', href: './education.html', active: true, selected: true },
    { name: '商品档案', icon: 'box', children: [
      { name: '商品管理' },
      { name: '商品审核' },
      { name: '计量单位' }
    ] },
    { name: '价格管理', icon: 'tag', children: [
      { name: '指导价格' },
      { name: '商品限价' },
      { name: '商品价格' },
      { name: '采购竞价', children: [
        { name: '竞价管理', href: './bid-management.html' },
        { name: '竞价规则管理', href: './bid-rules-management.html' },
        { name: '竞价限价管理', href: './auction-limit-price.html' },
        { name: '废标管理', href: './wasted-bid-management.html' },
        { name: '标段管理', href: './segment-management.html' },
        { name: '供货关系管理', href: './supplier-relationship-management.html' }
      ] }
    ] },
    { name: '订单管理', icon: 'cart', children: [
      { name: '订单管理' },
      { name: '订单标签' }
    ] },
    { name: '供应商档案', icon: 'users', href: './supplier-archive.html' },
    { name: '账单管理', icon: 'wallet' },
    { name: '供货企业管理', icon: 'truck', children: [
      { name: '供货企业档案' }
    ] },
    { name: '学校管理', icon: 'home' },
    { name: '统计报表', icon: 'chart' },
    { name: '公告管理', icon: 'notice', expanded: true, children: [
      { name: '公告管理', href: './notice-management.html' }
    ] },
    { name: '系统管理', icon: 'settings', children: [
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

  window.EducationMenuConfig = {
    icons,
    menu: menu.map(normalize)
  };
})();
