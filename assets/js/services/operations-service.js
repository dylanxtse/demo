(function () {
  const storagePrefix = 'procurement-operations-v1-';
  const legacyOrderNumbers = {
    XS202607300001: { orderNo: 'DD202607300100001', orderId: 'ORD-20260730-001' },
    XS202607290012: { orderNo: 'DD202607290200012', orderId: 'ORD-20260729-012' },
    XS202607280006: { orderNo: 'DD202607280300006', orderId: 'ORD-20260728-006' },
    XS202607270003: { orderNo: 'DD202607270400003', orderId: 'ORD-20260727-003' },
    XS202607260021: { orderNo: 'DD202607260100021' }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function error(code, message) {
    const value = new Error(message);
    value.code = code;
    return value;
  }

  function assertResource(resource) {
    if (!Object.prototype.hasOwnProperty.call(window.MockOperations || {}, resource)) {
      throw error('RESOURCE_NOT_FOUND', '未找到业务数据');
    }
  }

  function normalizeOrderNumbers(resource, records) {
    return records.map((record) => {
      const relation = legacyOrderNumbers[record.orderNo];
      if (!relation) return record;
      return {
        ...record,
        orderNo: relation.orderNo,
        ...(resource === 'sortingItems' && relation.orderId ? { orderId: relation.orderId } : {})
      };
    });
  }

  function load(resource) {
    assertResource(resource);
    const fallback = window.MockOperations[resource] || [];
    const records = clone(window.AppStorage?.read(`${storagePrefix}${resource}`, fallback) || fallback);
    return normalizeOrderNumbers(resource, records);
  }

  function save(resource, items) {
    if (!window.AppStorage?.write(`${storagePrefix}${resource}`, items)) {
      throw error('STORAGE_WRITE_FAILED', '本地数据保存失败');
    }
  }

  function normalize(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
  }

  function matches(item, conditions) {
    return Object.entries(conditions || {}).every(([key, value]) => {
      if (value === '' || value == null) return true;
      if (key === 'keyword') {
        const keyword = normalize(value);
        return Object.values(item).some((field) => normalize(field).includes(keyword));
      }
      if (key === 'dateRange' && Array.isArray(value) && value.length === 2) {
        const source = item.createdAt || item.expectedAt || item.occurredAt || item.inboundAt || item.countAt || '';
        return (!value[0] || source >= value[0]) && (!value[1] || source <= `${value[1]} 23:59:59`);
      }
      if (Array.isArray(value)) return value.includes(item[key]);
      return normalize(item[key]).includes(normalize(value));
    });
  }

  function nextId(resource, items) {
    const max = items.reduce((current, item) => {
      const number = Number(String(item.id || '').replace(/\D/g, '')) || 0;
      return Math.max(current, number);
    }, 0);
    return `${resource.toUpperCase().slice(0, 5)}-${String(max + 1).padStart(3, '0')}`;
  }

  function nextOrderNumber(items, customerName) {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const customers = [...new Set(items.map((item) => item.customerName).filter(Boolean))];
    let customerIndex = customers.indexOf(customerName);
    if (customerIndex < 0) customerIndex = customers.length;
    const customerCode = String(customerIndex + 1).padStart(2, '0').slice(-2);
    const maxSequence = items.reduce((max, item) => {
      const match = String(item.orderNo || '').match(/(\d{5})$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0);
    return `DD${date}${customerCode}${String(maxSequence + 1).padStart(5, '0').slice(-5)}`;
  }

  function statusForAction(action) {
    const mapping = {
      approve: 'APPROVED',
      confirm: 'CONFIRMED',
      close: 'CLOSED',
      enable: 'ENABLE',
      disable: 'DISABLE',
      sort: 'SORTED',
      resetSort: 'PENDING',
      markShortage: 'PENDING',
      cancelShortage: 'PENDING',
      ship: 'SHIPPED',
      upload: 'UPLOADED',
      complete: 'COMPLETED',
      generatePurchase: 'PURCHASED'
    };
    return mapping[action];
  }

  function syncCustomerProgress(sortingItem) {
    if (!sortingItem?.customerName) return;
    const sortingItems = load('sortingItems').filter((item) =>
      item.customerName === sortingItem.customerName && item.canteen === sortingItem.canteen
    );
    const progressItems = load('sortingProgress');
    const progress = progressItems.find((item) =>
      item.customerName === sortingItem.customerName && item.canteen === sortingItem.canteen
    );
    if (!progress || !sortingItems.length) return;
    const sortedCount = sortingItems.filter((item) => item.status === 'SORTED').length;
    const completedCount = sortingItems.filter((item) => item.status === 'SORTED' || item.shortage === '是').length;
    progress.sortedCount = sortedCount;
    progress.orderCount = sortingItems.length;
    progress.progress = `${sortedCount}/${sortingItems.length}`;
    progress.status = completedCount === 0 ? 'PENDING' : completedCount === sortingItems.length ? 'SORTED' : 'PARTIAL';
    save('sortingProgress', progressItems);
  }

  function syncShortageRecord(sortingItem, action) {
    const shortageItems = load('shortageItems');
    const index = shortageItems.findIndex((item) => item.id === sortingItem.id);
    if (action === 'markShortage') {
      const record = {
        ...sortingItem,
        status: 'SHORTAGE',
        shortage: '是',
        shortageQty: Math.max(0, Number(sortingItem.orderQty || 0) - Number(sortingItem.actualQty || 0)),
        purchaseOrder: index >= 0 ? shortageItems[index].purchaseOrder : ''
      };
      if (index >= 0) shortageItems[index] = record;
      else shortageItems.unshift(record);
      save('shortageItems', shortageItems);
    }
    if (action === 'cancelShortage' || action === 'resetSort' || action === 'sort') {
      if (index >= 0) {
        shortageItems.splice(index, 1);
        save('shortageItems', shortageItems);
      }
    }
  }

  function validate(resource, data, currentId) {
    const requiredByResource = {
      tags: ['tagName'],
      sorters: ['sorterName', 'username', 'phone', 'warehouse'],
      warehouses: ['warehouseCode', 'warehouseName', 'address'],
      orders: ['customerName', 'canteen', 'expectedAt', 'orderTag', 'items'],
      returns: ['returnMode', 'customerName', 'canteen', 'reason', 'items'],
      receiptChanges: ['customerName', 'canteen', 'orderNo', 'changeReason', 'items'],
      inventoryCounts: ['warehouse', 'countAt'],
      openingInventory: ['goodsName', 'warehouse', 'openingQty', 'openingPrice'],
      qualityReports: ['inboundNo', 'goodsName', 'warehouse']
    };
    (requiredByResource[resource] || []).forEach((key) => {
      if (data[key] === '' || data[key] == null) throw error('FIELD_REQUIRED', '请完整填写必填项');
    });
    if (resource === 'orders' && (!Array.isArray(data.items) || data.items.length === 0)) {
      throw error('ORDER_GOODS_REQUIRED', '请至少添加一个商品');
    }
    if (resource === 'orders' && data.items.some((item) => !(Number(item.quantity) > 0) || Number(item.unitPrice) < 0)) {
      throw error('INVALID_ORDER_GOODS', '请完整填写商品下单数量和下单单价');
    }
    if (resource === 'tags') {
      const duplicate = load(resource).some((item) =>
        item.id !== currentId && normalize(item.tagName) === normalize(data.tagName)
      );
      if (duplicate) throw error('DUPLICATE_TAG', '标签名称已存在');
    }
    if (resource === 'sorters' && !/^1\d{10}$/.test(String(data.phone || ''))) {
      throw error('INVALID_PHONE', '请输入正确的手机号码');
    }
    if (resource === 'sorters' && !/^[A-Za-z0-9]{6,20}$/.test(String(data.username || ''))) {
      throw error('INVALID_USERNAME', '请输入6～20位字母或数字组成的用户名');
    }
    if (resource === 'warehouses') {
      const duplicate = load(resource).some((item) =>
        item.id !== currentId && (
          normalize(item.warehouseCode) === normalize(data.warehouseCode) ||
          normalize(item.warehouseName) === normalize(data.warehouseName)
        )
      );
      if (duplicate) throw error('DUPLICATE_WAREHOUSE', '仓库编码或仓库名称已存在');
    }
  }

  window.OperationsService = {
    async list(resource, query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Number(query.pageSize) || 20);
      const conditions = query.condition || {};
      const filtered = load(resource)
        .filter((item) => matches(item, conditions))
        .sort((a, b) => String(b.createdAt || b.occurredAt || b.id).localeCompare(String(a.createdAt || a.occurredAt || a.id)));
      const start = (page - 1) * pageSize;
      return {
        items: clone(filtered.slice(start, start + pageSize)),
        total: filtered.length,
        page,
        pageSize
      };
    },

    async get(resource, id) {
      return clone(load(resource).find((item) => item.id === id) || null);
    },

    async create(resource, data) {
      const items = load(resource);
      validate(resource, data);
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const created = {
        id: nextId(resource, items),
        status: data.status || 'PENDING',
        createdAt: now,
        ...clone(data)
      };
      if (resource === 'orders') created.orderNo ||= nextOrderNumber(items, created.customerName);
      if (resource === 'returns') created.returnNo ||= `TH${Date.now()}`;
      if (resource === 'receiptChanges') created.changeNo ||= `BG${Date.now()}`;
      if (resource === 'receiptChanges') {
        created.beforeAmount = Number((created.items || []).reduce((sum, item) => sum + Number(item.shippingAmount || 0), 0).toFixed(2));
        created.afterAmount = Number((created.items || []).reduce((sum, item) => sum + Number(item.afterAmount || 0), 0).toFixed(2));
        created.differenceAmount = Number((created.afterAmount - created.beforeAmount).toFixed(2));
      }
      if (resource === 'returns') {
        created.refundAmount = Number((created.items || []).reduce((sum, item) => sum + Number(item.applyAmount || 0), 0).toFixed(2));
      }
      if (resource === 'inventoryCounts') created.countNo ||= `PD${Date.now()}`;
      if (resource === 'inventoryLosses') created.lossNo ||= `SY${Date.now()}`;
      if (resource === 'openingInventory') {
        created.openingAmount = Number(created.openingQty || 0) * Number(created.openingPrice || 0);
      }
      items.unshift(created);
      save(resource, items);
      return clone(created);
    },

    async update(resource, id, data) {
      const items = load(resource);
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw error('RECORD_NOT_FOUND', '记录不存在或已删除');
      validate(resource, { ...items[index], ...data }, id);
      items[index] = { ...items[index], ...clone(data), updatedAt: new Date().toISOString() };
      if (resource === 'openingInventory') {
        items[index].openingAmount = Number(items[index].openingQty || 0) * Number(items[index].openingPrice || 0);
      }
      if (resource === 'receiptChanges') {
        items[index].beforeAmount = Number((items[index].items || []).reduce((sum, item) => sum + Number(item.shippingAmount || 0), 0).toFixed(2));
        items[index].afterAmount = Number((items[index].items || []).reduce((sum, item) => sum + Number(item.afterAmount || 0), 0).toFixed(2));
        items[index].differenceAmount = Number((items[index].afterAmount - items[index].beforeAmount).toFixed(2));
      }
      if (resource === 'returns' && Array.isArray(items[index].items)) {
        items[index].refundAmount = Number(items[index].items.reduce((sum, item) => sum + Number(item.applyAmount || 0), 0).toFixed(2));
      }
      save(resource, items);
      return clone(items[index]);
    },

    async remove(resource, id) {
      const items = load(resource);
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw error('RECORD_NOT_FOUND', '记录不存在或已删除');
      if (resource === 'warehouses' && items[index].referenced) {
        throw error('WAREHOUSE_REFERENCED', '该仓库已被引用无法删除');
      }
      const removed = items.splice(index, 1)[0];
      save(resource, items);
      return clone(removed);
    },

    async transition(resource, id, action, payload = {}) {
      const items = load(resource);
      const item = items.find((entry) => entry.id === id);
      if (!item) throw error('RECORD_NOT_FOUND', '记录不存在或已删除');
      const nextStatus = statusForAction(action);
      if (!nextStatus) throw error('INVALID_ACTION', '不支持的状态操作');
      item.status = nextStatus;
      if (action === 'sort') {
        item.actualQty = Number(payload.actualQty ?? item.orderQty ?? item.actualQty ?? 0);
        item.progress = `${item.actualQty}/${item.orderQty}`;
        item.sorter ||= '当前用户';
        item.sortingAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        item.shortage = '否';
      }
      if (action === 'resetSort') {
        item.actualQty = 0;
        item.progress = `0/${item.orderQty}`;
        item.sorter = '';
        item.sortingAt = '';
      }
      if (action === 'markShortage') item.shortage = '是';
      if (action === 'cancelShortage') item.shortage = '否';
      if (action === 'ship') item.shippingAmount ||= item.orderAmount || 0;
      if (action === 'upload') {
        item.reportStatus = '已上传';
        item.reportName = payload.reportName || '本地质检报告.pdf';
      }
      if (action === 'generatePurchase') {
        item.purchaseOrder = payload.purchaseOrder || `CG${Date.now()}`;
      }
      if (action === 'approve') {
        item.auditAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        item.auditor = '当前用户';
      }
      if (payload.auditOpinion) item.auditOpinion = payload.auditOpinion;
      if (payload.rejectReason) item.rejectReason = payload.rejectReason;
      save(resource, items);
      if (resource === 'sortingItems') {
        syncShortageRecord(item, action);
        syncCustomerProgress(item);
      }
      if (resource === 'sortingProgress' && (action === 'sort' || action === 'resetSort')) {
        const relatedItems = load('sortingItems');
        relatedItems.forEach((sortingItem) => {
          if (sortingItem.customerName !== item.customerName || sortingItem.canteen !== item.canteen) return;
          if (action === 'sort' && sortingItem.shortage === '是') return;
          sortingItem.status = action === 'sort' ? 'SORTED' : 'PENDING';
          sortingItem.actualQty = action === 'sort' ? Number(sortingItem.orderQty || 0) : 0;
          sortingItem.progress = action === 'sort' ? `${sortingItem.actualQty}/${sortingItem.orderQty}` : `0/${sortingItem.orderQty}`;
          sortingItem.sorter = action === 'sort' ? (sortingItem.sorter || '当前用户') : '';
          sortingItem.sortingAt = action === 'sort' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : '';
          if (action === 'resetSort') sortingItem.shortage = '否';
        });
        save('sortingItems', relatedItems);
      }
      if (resource === 'shortageItems' && action === 'cancelShortage') {
        save('shortageItems', load('shortageItems').filter((shortageItem) => shortageItem.id !== id));
        const sortingItems = load('sortingItems');
        const related = sortingItems.find((sortingItem) => sortingItem.id === id);
        if (related) {
          related.status = 'PENDING';
          related.shortage = '否';
          save('sortingItems', sortingItems);
          syncCustomerProgress(related);
        }
      }
      return clone(item);
    },

    async batch(resource, ids, action, payload = {}) {
      if (!Array.isArray(ids) || ids.length === 0) throw error('NO_SELECTION', '请选择要操作的数据');
      const result = [];
      for (const id of ids) {
        if (action === 'sort') {
          const item = load(resource).find((entry) => entry.id === id);
          if (item && item.shortage === '是') continue;
        }
        result.push(await this.transition(resource, id, action, payload));
      }
      return result;
    },

    async options(resource, field) {
      const values = load(resource).map((item) => item[field]).filter(Boolean);
      return [...new Set(values)].map((value) => ({ label: value, value }));
    },

    async export(resource, query = {}, columns = []) {
      const result = await this.list(resource, { ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
      const selectedColumns = columns.filter((column) => column.key && column.key !== 'actions');
      const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      return [
        selectedColumns.map((column) => escape(column.label)).join(','),
        ...result.items.map((item) => selectedColumns.map((column) => escape(item[column.key])).join(','))
      ].join('\n');
    },

    async reset(resource) {
      assertResource(resource);
      save(resource, clone(window.MockOperations[resource]));
      return true;
    }
  };
})();
