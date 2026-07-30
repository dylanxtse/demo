(function () {
  const storageKey = 'procurement-inbound-orders';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    const orders = window.AppStorage?.read(storageKey, window.MockInboundOrders) || window.MockInboundOrders;
    return clone(orders);
  }

  function save(orders) {
    if (window.AppStorage) window.AppStorage.write(storageKey, orders);
  }

  function generateId() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const orders = load();
    const count = orders.filter((order) => order.id.startsWith(`RKD${datePart}`)).length + 1;
    return `RKD${datePart}03${String(count).padStart(5, '0')}`;
  }

  window.InboundService = {
    getList() {
      return load();
    },
    getDetail(id) {
      return load().find((order) => order.id === id) || null;
    },
    create(data) {
      const orders = load();
      const now = new Date();
      const created = {
        ...data,
        id: generateId(),
        status: data.status || '待审核',
        creator: data.creator || '杨',
        entryTime: now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      };
      orders.unshift(created);
      save(orders);
      return clone(created);
    },
    update(id, data) {
      const orders = load();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0) return null;
      orders[index] = { ...orders[index], ...data, id: orders[index].id };
      save(orders);
      return clone(orders[index]);
    },
    remove(id) {
      const orders = load();
      const filtered = orders.filter((order) => order.id !== id);
      save(filtered);
      return filtered.length < orders.length;
    },
    audit(id) {
      return this.update(id, { status: '已完成' });
    },
    close(id) {
      return this.update(id, { status: '已关闭' });
    },
    getProducts() {
      return window.ProductService ? window.ProductService.getList() : [];
    }
  };
})();
