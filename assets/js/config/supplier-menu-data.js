(function () {
  const icons = window.AppMenuConfig?.icons || {};
  const menu = [
    { name: '商品档案', icon: 'box', children: [
      { name: '商品管理', href: './supplier-product-management.html' }
    ] },
    { name: '采购单', icon: 'cart', href: './supplier-purchase-order.html' },
    { name: '价格管理', icon: 'tag', children: [
      { name: '协议价' },
      { name: '询价报价' },
      { name: '竞价报价', href: './supplier-bidding-quotation.html' }
    ] },
    { name: '财务对账', icon: 'wallet' },
    { name: '公告管理', icon: 'notice', href: './supplier-notice-management.html' },
    { name: '系统管理', icon: 'settings' }
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

  window.SupplierMenuConfig = {
    icons,
    menu: menu.map(normalize)
  };
})();
