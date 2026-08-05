(function () {
  const storageKey = 'procurement-outbound-orders';
  const dataVersion = 2;
  const versionKey = 'procurement-outbound-orders-version';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    if (window.DemoStore) return window.DemoStore.get('outboundOrders');
    let useMock = false;
    try {
      const cachedVersion = window.localStorage.getItem(versionKey);
      if (cachedVersion !== String(dataVersion)) {
        useMock = true;
        window.localStorage.setItem(versionKey, String(dataVersion));
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      useMock = true;
    }

    const orders = (useMock || !window.AppStorage)
      ? window.MockOutboundOrders
      : (window.AppStorage.read(storageKey, window.MockOutboundOrders) || window.MockOutboundOrders);
    return clone(orders);
  }

  function save(orders) {
    if (window.DemoStore) {
      window.DemoStore.replace('outboundOrders', orders);
      return;
    }
    if (window.AppStorage) {
      window.AppStorage.write(storageKey, orders);
      try { window.localStorage.setItem(versionKey, String(dataVersion)); } catch {}
    }
  }

  function generateId() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const orders = load();
    const count = orders.filter((order) => order.id.startsWith(`CKD${datePart}`)).length + 1;
    return `CKD${datePart}03${String(count).padStart(5, '0')}`;
  }

  window.OutboundService = {
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
      const current = this.getDetail(id);
      if (!current) return null;
      if (current.orderId && window.OrderFlowService) {
        return window.OrderFlowService.transition('outboundOrders', id, 'complete');
      }
      const updated = this.update(id, { status: '已完成', auditAt: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      if (updated && current.status !== '已完成' && window.InventoryLedgerService) {
        (updated.items || []).forEach((item) => {
          const qty = Number(item.outboundQty || item.quantity || 0);
          if (qty <= 0) return;
          window.InventoryLedgerService.outbound({
            productId: item.productId || item.productCode,
            warehouse: updated.warehouseName || updated.warehouse,
            qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            orderId: updated.orderId || '',
            orderLineId: item.orderLineId || '',
            remark: `出库单 ${updated.id}`
          });
        });
      }
      return updated;
    },
    close(id) {
      return this.update(id, { status: '已关闭' });
    },
    getProducts() {
      return window.ProductService ? window.ProductService.getList() : [];
    }
  };
})();
