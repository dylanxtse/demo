(function () {
  window.AppStorage = {
    read(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
  };
})();

/*
 * Procurement demo source of truth.
 *
 * The application is intentionally static, so the v2 store keeps the same
 * persistence boundary as the existing localStorage adapters while making all
 * cross-page relations explicit.  The store is lazy: seed data is built only
 * after the page has loaded its mock data scripts.
 */
(function () {
  const storageKey = 'procurement-demo-v2';
  const schemaVersion = '20260805-flow-v2.6';
  const legacyBusinessStoragePrefixes = [
    'procurement-products',
    'procurement-inbound-orders',
    'procurement-outbound-orders',
    'procurement-processing-orders',
    'procurement-processing-config',
    'procurement-processing-data-version',
    'procurement-processing-templates',
    'procurement-goods-reviews',
    'procurement-unit-measurements',
    'procurement-operations-v1-'
  ];
  let legacyBusinessStorageCleaned = false;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const timestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
  const normalizeDateTime = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    const parts = text.split(/\s+/);
    const time = parts[1] || '08:00:00';
    return `${parts[0]} ${`${time}:00`.slice(0, 8)}`;
  };

  function nextOutboundNumber(records, record = {}) {
    const dateSource = record.outboundTime || record.shippingAt || record.createdAt || timestamp();
    const datePart = String(dateSource).slice(0, 10).replace(/-/g, '') || timestamp().slice(0, 10).replace(/-/g, '');
    const prefix = `CKD${datePart}03`;
    let sequence = records.filter((item) => String(item.id || '').startsWith(prefix)).length + 1;
    let candidate = `${prefix}${String(sequence).padStart(5, '0')}`;
    while (records.some((item) => item.id === candidate || item.outboundOrderId === candidate)) {
      sequence += 1;
      candidate = `${prefix}${String(sequence).padStart(5, '0')}`;
    }
    return candidate;
  }

  function migrateOutboundNumbers(current) {
    const outboundOrders = current.outboundOrders || [];
    const used = outboundOrders.filter((item) => !String(item.id || '').startsWith('OUT-'));
    const replacements = new Map();
    let changed = false;
    outboundOrders.forEach((outbound) => {
      if (!String(outbound.id || '').startsWith('OUT-')) return;
      const order = (current.orders || []).find((item) => item.id === outbound.orderId);
      const nextId = nextOutboundNumber(used, {
        outboundTime: outbound.outboundTime || order?.shippingAt || order?.createdAt
      });
      replacements.set(outbound.id, nextId);
      outbound.id = nextId;
      outbound.outboundOrderId = nextId;
      used.push(outbound);
      changed = true;
    });
    if (changed) {
      (current.processingOrders || []).forEach((order) => {
        if (replacements.has(order.outboundOrderId)) order.outboundOrderId = replacements.get(order.outboundOrderId);
      });
    }
    return changed;
  }

  const defaultSettings = {
    enterpriseOrderAuditEnabled: true,
    sortingInventoryThresholdEnabled: true,
    outboundAuditEnabled: true,
    defaultWarehouseId: 'WH-001'
  };

  let state = null;

  function clearLegacyBusinessStorage() {
    if (legacyBusinessStorageCleaned) return;
    legacyBusinessStorageCleaned = true;
    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (key === storageKey) return;
        if (legacyBusinessStoragePrefixes.some((prefix) => key.startsWith(prefix))) {
          window.localStorage.removeItem(key);
        }
      });
    } catch {}
  }

  function sourceProducts() {
    const fallbackProducts = [
      ['SP0300039', '土豆丝', '斤', 1], ['SP0300040', '土豆', '斤', 6.8], ['SP0300038', '牛奶', '瓶', 5], ['SP0300037', '牛奶', '瓶', 5],
      ['SP0300036', '大玉米棒子', 'KG', 5], ['SP0300034', '黑大米', '斤', 10], ['SP0300031', '鲫鱼', 'L', 20], ['SP0300030', '金龙鱼5L桶装油', '瓶', 55],
      ['SP0300029', '鲫鱼', '斤', 15], ['SP0300026', '面', '瓶', 1], ['SP0300025', '大米', 'KG', 19], ['SP0300024', '三元牛奶', '瓶', 10],
      ['SP0300023', '大饼', '斤', 1], ['SP0300020', '西红柿', 'KG', 20], ['SP0300019', '大白菜', '斤', 8], ['SP0300018', '鸡蛋', '斤', 22],
      ['SP0300017', '金龙鱼豆油', '斤', 50], ['SP0300016', '面粉', '斤', 30], ['SP0300015', '香蕉', '斤', 30], ['SP0300014', '苹果', '斤', 23]
    ].map(([code, name, unit, marketPrice], index) => ({ code, name, unit, marketPrice, status: '已上架', brand: '--', spec: '--', category: '其他材料-其他二级', seq: index + 1 }));
    const source = Array.isArray(window.MockProducts) && window.MockProducts.length ? window.MockProducts : fallbackProducts;
    const seededNetVegetables = new Set(['SP0300039', 'SP0300020', 'SP0300019', 'SP0300034']);
    return source.filter((product) => product && (product.code || product.id)).map((product, index) => ({
      ...clone(product),
      id: product.id || product.code,
      productId: product.code,
      seq: product.seq || index + 1,
      isNetVegetable: product.isNetVegetable === true || seededNetVegetables.has(product.code),
      purchaseType: product.purchaseType || '供应商送货',
      source: product.source || '平台添加',
      addTime: product.addTime || `2026-08-${String((index % 9) + 1).padStart(2, '0')} 09:00:00`,
      marketPrice: number(product.marketPrice),
      status: product.status || '已上架'
    }));
  }

  function sourceWarehouses() {
    const warehouses = window.MockOperations?.warehouses || [];
    if (warehouses.length) {
      const normalized = clone(warehouses).map((warehouse, index) => ({
      ...warehouse,
      id: warehouse.id || `WH-${String(index + 1).padStart(3, '0')}`,
      warehouseId: warehouse.id || `WH-${String(index + 1).padStart(3, '0')}`,
      warehouseName: warehouse.warehouseName || warehouse.name || `仓库${index + 1}`
      }));
      return padRecords(normalized, 20, (index) => ({
        id: `WH-${String(index + 1).padStart(3, '0')}`,
        warehouseId: `WH-${String(index + 1).padStart(3, '0')}`,
        warehouseCode: `CK${String(index + 1).padStart(4, '0')}`,
        warehouseName: ['冷链分拨仓', '南区配送仓', '西区周转仓', '东区备货仓', '北门收货仓', '江湾备货仓', '浦东配送仓', '浦西周转仓', '学校专供仓', '果蔬冷藏仓', '粮油仓', '水产暂存仓', '成品待发仓', '退货暂存仓', '应急保供仓', '夜间配送仓', '干货仓', '冷藏二仓', '华东干线仓', '南站中转仓'][index],
        address: `仓储路${index + 1}号`,
        status: 'ENABLE'
      }));
    }
    return padRecords([
      { id: 'WH-001', warehouseId: 'WH-001', warehouseCode: 'CK0001', warehouseName: '中心仓', address: '集采路18号', status: 'ENABLE' },
      { id: 'WH-002', warehouseId: 'WH-002', warehouseCode: 'CK0002', warehouseName: '北区仓', address: '配送路6号', status: 'ENABLE' }
    ], 20, (index) => ({
      id: `WH-${String(index + 1).padStart(3, '0')}`,
      warehouseId: `WH-${String(index + 1).padStart(3, '0')}`,
      warehouseCode: `CK${String(index + 1).padStart(4, '0')}`,
      warehouseName: ['冷链分拨仓', '南区配送仓', '西区周转仓', '东区备货仓', '北门收货仓', '江湾备货仓', '浦东配送仓', '浦西周转仓', '学校专供仓', '果蔬冷藏仓', '粮油仓', '水产暂存仓', '成品待发仓', '退货暂存仓', '应急保供仓', '夜间配送仓', '干货仓', '冷藏二仓', '华东干线仓', '南站中转仓'][index],
      address: `仓储路${index + 1}号`,
      status: 'ENABLE'
    }));
  }

  function padRecords(records, minimum, factory) {
    const result = clone(records || []);
    while (result.length < minimum) result.push(factory(result.length, result));
    return result;
  }

  function sourceCustomers(extraOrders = []) {
    const base = [
      { id: 'CUS-001', customerId: 'CUS-001', customerCode: 'CUS001', name: '第一实验学校', customerName: '第一实验学校', type: '学校', status: 'ENABLE' },
      { id: 'CUS-002', customerId: 'CUS-002', customerCode: 'CUS002', name: '阳光幼儿园', customerName: '阳光幼儿园', type: '幼儿园', status: 'ENABLE' },
      { id: 'CUS-003', customerId: 'CUS-003', customerCode: 'CUS003', name: '育才中学', customerName: '育才中学', type: '学校', status: 'ENABLE' },
      { id: 'CUS-004', customerId: 'CUS-004', customerCode: 'CUS004', name: '机关第二食堂', customerName: '机关第二食堂', type: '机关单位', status: 'ENABLE' }
    ];
    const known = new Set(base.map((customer) => customer.customerName));
    extraOrders.forEach((order) => {
      const customerName = order.customerName || '';
      if (!customerName || known.has(customerName)) return;
      const id = `CUS-${String(base.length + 1).padStart(3, '0')}`;
      base.push({
        id,
        customerId: id,
        customerCode: `CUS${String(base.length + 1).padStart(3, '0')}`,
        name: customerName,
        customerName,
        type: order.customerType || '其他单位',
        status: 'ENABLE'
      });
      known.add(customerName);
    });
    const customerNames = ['第三小学', '实验幼儿园', '第七中学', '机关第一食堂', '东城职业学校', '南城中心幼儿园', '明德小学', '滨江实验中学', '晨光托育中心', '浦东社区食堂', '青禾小学', '华东商贸学校', '星河幼儿园', '新城职工食堂', '希望中学', '文汇小学'];
    return padRecords(base, 20, (index) => {
      const id = `CUS-${String(index + 1).padStart(3, '0')}`;
      const customerName = customerNames[index] || `合作单位${String(index + 1).padStart(2, '0')}`;
      return { id, customerId: id, customerCode: `CUS${String(index + 1).padStart(3, '0')}`, name: customerName, customerName, type: index % 2 ? '学校' : '机关单位', status: 'ENABLE' };
    });
  }

  function sourceLocations(extraOrders = [], customers = sourceCustomers(extraOrders)) {
    const locations = [
      { id: 'LOC-001', customerId: 'CUS-001', customerName: '第一实验学校', canteen: '第一食堂', receiver: '王老师', phone: '13800001011', address: '实验路1号', route: '东城一线' },
      { id: 'LOC-002', customerId: 'CUS-001', customerName: '第一实验学校', canteen: '第二食堂', receiver: '李老师', phone: '13800001012', address: '实验路1号', route: '东城一线' },
      { id: 'LOC-003', customerId: 'CUS-002', customerName: '阳光幼儿园', canteen: '园区食堂', receiver: '周老师', phone: '13800001013', address: '阳光路8号', route: '南城二线' },
      { id: 'LOC-004', customerId: 'CUS-003', customerName: '育才中学', canteen: '高中部食堂', receiver: '赵老师', phone: '13800001014', address: '育才路12号', route: '北城一线' },
      { id: 'LOC-005', customerId: 'CUS-003', customerName: '育才中学', canteen: '初中部食堂', receiver: '孙老师', phone: '13800001015', address: '育才路12号', route: '北城一线' },
      { id: 'LOC-006', customerId: 'CUS-004', customerName: '机关第二食堂', canteen: '二号食堂', receiver: '刘主任', phone: '13800001016', address: '政务路2号', route: '西城一线' }
    ];
    const known = new Set(locations.map((location) => `${location.customerName}|${location.canteen}`));
    extraOrders.forEach((order) => {
      const key = `${order.customerName || ''}|${order.canteen || ''}`;
      if (!order.customerName || !order.canteen || known.has(key)) return;
      const customer = customers.find((item) => item.customerName === order.customerName);
      locations.push({
        id: `LOC-${String(locations.length + 1).padStart(3, '0')}`,
        customerId: customer?.id || '',
        customerName: order.customerName,
        canteen: order.canteen,
        receiver: order.receiver || '',
        phone: order.phone || '',
        address: order.address || '',
        route: order.route || ''
      });
      known.add(key);
    });
    return padRecords(locations, 20, (index) => ({
      id: `LOC-${String(index + 1).padStart(3, '0')}`,
      customerId: `CUS-${String((index % 20) + 1).padStart(3, '0')}`,
      customerName: customers[index % customers.length]?.customerName || '合作单位',
      canteen: ['校园一食堂', '园区食堂', '职工食堂', '学生餐厅', '社区食堂'][index % 5],
      receiver: '配送联系人', phone: `1380000${String(index + 200).padStart(4, '0')}`,
      address: `配送路${index + 1}号`, route: `配送线路${(index % 5) + 1}`
    }));
  }

  function normalizeOrder(source, index) {
    const id = source.id || `ORD-DEMO-${String(index + 1).padStart(3, '0')}`;
    const sourceType = source.source === '客户下单' ? 'CUSTOMER' : 'ENTERPRISE';
    const createdAt = source.createdAt || source.createTime || `2026-08-${String((index % 9) + 1).padStart(2, '0')} ${String(8 + (index % 8)).padStart(2, '0')}:00:00`;
    const creator = source.creator || '管理员';
    const items = (source.items || []).map((item, itemIndex) => {
      const orderLineId = item.orderLineId || `${id}-LINE-${String(itemIndex + 1).padStart(3, '0')}`;
      const productId = item.productId || item.goodsCode || item.productCode || '';
      const quantity = number(item.quantity || item.orderQty);
      return {
        ...clone(item),
        id: orderLineId,
        orderLineId,
        orderId: id,
        productId,
        goodsCode: productId,
        quantity,
        orderQty: quantity,
        actualQty: number(item.actualQty),
        shippedQty: number(item.shippedQty),
        shippedAmount: number(item.shippedAmount),
        subtotal: number(item.subtotal || quantity * number(item.unitPrice))
      };
    });
    let status = source.status || 'PENDING';
    if (status === 'PENDING') status = sourceType === 'CUSTOMER' ? 'PENDING_CONFIRM' : 'PENDING_AUDIT';
    if (status === 'APPROVED') status = 'READY_FOR_SORTING';
    if (status === 'CONFIRMED') status = 'READY_FOR_SORTING';
    if (status === 'COMPLETED') status = 'SHIPPED';
    const shippingAt = source.shippingAt || (status === 'SHIPPED' ? `${createdAt.slice(0, 10)} 06:30:00` : '');
    return {
      ...clone(source),
      id,
      orderId: id,
      createdAt,
      createTime: createdAt,
      creator,
      operationLogs: normalizeOrderLogs(source, createdAt, creator),
      sourceType,
      status,
      customerId: source.customerId || '',
      customerName: source.customerName || '',
      canteen: source.canteen || '',
      receiptStatus: '未收货',
      receivedAt: '',
      supplement: '否',
      orderLineCount: items.length,
      productCount: items.length,
      items,
      sortingCompleted: false,
      expectedAt: normalizeDateTime(source.expectedAt || source.deliveryTime || ''),
      shippingAt: normalizeDateTime(shippingAt),
      updatedAt: source.updatedAt || createdAt
    };
  }

  function normalizeOrderLogs(order, createdAt, creator) {
    const logs = Array.isArray(order.operationLogs) ? clone(order.operationLogs).filter((log) => log && (log.action || log.desc)) : [];
    if (logs.length) return logs;
    const result = [{ action: '创建订单', desc: `${creator} 创建订单 ${createdAt}` }];
    if (['CONFIRMED', 'COMPLETED', 'APPROVED'].includes(order.status)) result.push({ action: '确认供货', desc: `${creator} 确认供货 ${createdAt}` });
    if (order.status === 'COMPLETED') result.push({ action: '完成发货', desc: `系统 完成发货 ${createdAt}` });
    if (order.status === 'CLOSED') result.push({ action: '关闭订单', desc: `${creator} 关闭订单 ${createdAt}` });
    return result;
  }

  function ensureDocumentOperationLogs(state) {
    const collections = [
      ['orders', '订单', 'creator', 'createdAt'],
      ['orderLines', '订单明细', 'creator', 'createdAt'],
      ['sortingTasks', '分拣任务', 'sorter', 'sortingAt'],
      ['shippingOrders', '发货单', 'creator', 'createdAt'],
      ['outboundOrders', '出库单', 'creator', 'outboundTime'],
      ['inboundOrders', '入库单', 'creator', 'entryTime'],
      ['processingOrders', '加工单', 'operator', 'createTime'],
      ['returns', '退货单', 'creator', 'createdAt'],
      ['receiptChanges', '收货变更单', 'creator', 'createdAt']
    ];
    let changed = false;
    collections.forEach(([resource, label, actorKey, timeKey]) => {
      (state[resource] || []).forEach((record) => {
        const logs = Array.isArray(record.operationLogs)
          ? record.operationLogs.filter((log) => log && (log.action || log.desc))
          : [];
        if (logs.length) {
          record.operationLogs = logs;
          return;
        }
        const actor = record[actorKey] || '系统';
        const occurredAt = record[timeKey] || record.createdAt || record.createTime || timestamp();
        record.operationLogs = [{
          action: '创建',
          operator: actor,
          createdAt: occurredAt,
          desc: `${actor} 创建${label} ${occurredAt}`
        }];
        changed = true;
      });
    });
    return changed;
  }

  function normalizeReceiptAndSupplement(state) {
    let changed = false;
    (state.orders || []).forEach((order) => {
      if (order.receiptStatus !== '未收货' || order.receivedAt) {
        order.receiptStatus = '未收货';
        order.receivedAt = '';
        changed = true;
      }
      if (order.supplement !== '否') {
        order.supplement = '否';
        changed = true;
      }
    });
    return changed;
  }

  function normalizeStateDateTimes(state) {
    let changed = false;
    ['orders', 'shippingOrders', 'sortingTasks'].forEach((resource) => {
      (state[resource] || []).forEach((record) => {
        if (!record.expectedAt) return;
        const normalized = normalizeDateTime(record.expectedAt);
        if (normalized !== record.expectedAt) {
          record.expectedAt = normalized;
          changed = true;
        }
      });
    });
    return changed;
  }

  function normalizeProductMetadata(state) {
    const seededNetVegetables = new Set(['SP0300039', 'SP0300020', 'SP0300019', 'SP0300034']);
    let changed = false;
    (state.products || []).forEach((product, index) => {
      const productCode = product.code || product.productId;
      const isSeededNetVegetable = seededNetVegetables.has(productCode);
      const sourceProduct = window.MockProducts?.find((item) => (item.code || item.id) === productCode);
      if (!product.source) {
        product.source = '平台添加';
        changed = true;
      }
      if (!product.addTime) {
        product.addTime = `2026-08-${String((index % 9) + 1).padStart(2, '0')} 09:00:00`;
        changed = true;
      }
      if (!product.purchaseType) {
        product.purchaseType = sourceProduct?.purchaseType
          || (product.isNetVegetable ? '企业自加工' : '供应商送货');
        changed = true;
      }
      if (isSeededNetVegetable && !product.isNetVegetable) {
        product.isNetVegetable = true;
        product.purchaseType = '企业自加工';
        changed = true;
      }
      if (productCode === 'SP0300039' && product.purchaseType !== '企业自加工') {
        product.isNetVegetable = true;
        product.purchaseType = '企业自加工';
        changed = true;
      }
      if (productCode === 'SP0300040' && product.isNetVegetable) {
        product.isNetVegetable = false;
        if (product.purchaseType === '企业自加工') product.purchaseType = '供应商送货';
        changed = true;
      }
    });
    if (state.productSeedRevision !== 'products-v3') {
      state.productSeedRevision = 'products-v3';
      changed = true;
    }
    return changed;
  }

  function normalizeProcessingOutputs(state) {
    const outputPlan = {
      JGD20260727002: ['SP0300034', 'SP0300025'],
      JGD20260726003: ['SP0300014', 'SP0300020'],
      JGD20260725004: ['SP0300029', 'SP0300018']
    };
    let changed = false;
    (state.processingOrders || []).forEach((record) => {
      if (!/^JG(?!D)/.test(String(record.id || ''))) return;
      record.id = `JGD${String(record.id).slice(2)}`;
      changed = true;
    });
    Object.entries(outputPlan).forEach(([processingId, productCodes]) => {
      const processingOrder = (state.processingOrders || []).find((record) => record.id === processingId);
      if (!processingOrder) return;
      const materialQty = number(processingOrder.materials?.[0]?.consumeQty, 10);
      const outputs = Array.isArray(processingOrder.outputs) ? processingOrder.outputs : [];
      productCodes.forEach((productCode, index) => {
        if (outputs.some((output) => output.productCode === productCode)) return;
        const product = (state.products || []).find((item) => (item.code || item.id) === productCode);
        if (!product) return;
        const coefficient = [0.8, 0.5][index] || 0.5;
        const refQty = Number((materialQty * coefficient).toFixed(2));
        outputs.push({
          productCode,
          productName: product.name,
          unit: product.unit,
          refCoefficient: coefficient,
          refQty,
          actualQty: refQty,
          costPrice: number(product.marketPrice).toFixed(2)
        });
        changed = true;
      });
      if (processingOrder.outputs !== outputs) {
        processingOrder.outputs = outputs;
        changed = true;
      }
    });
    (state.processingOrders || []).forEach((processingOrder, index) => {
      if (!String(processingOrder.id || '').startsWith('JGD20260805')) return;
      if (![1, 4, 7, 10, 13].includes(index % 15)) return;
      const outputs = Array.isArray(processingOrder.outputs) ? processingOrder.outputs : [];
      const usedCodes = new Set(outputs.map((output) => output.productCode));
      const candidates = (state.products || []).filter((product) => !usedCodes.has(product.code));
      const materialQty = number(processingOrder.materials?.[0]?.consumeQty, 10);
      candidates.slice(0, 2).forEach((product, candidateIndex) => {
        const coefficient = candidateIndex ? 0.6 : 0.8;
        const refQty = Number((materialQty * coefficient).toFixed(2));
        outputs.push({
          productCode: product.code,
          productName: product.name,
          unit: product.unit,
          refCoefficient: coefficient,
          refQty,
          actualQty: refQty,
          costPrice: number(product.marketPrice).toFixed(2)
        });
        changed = true;
      });
      processingOrder.outputs = outputs;
    });
    if (state.processingOutputSeedRevision !== 'processing-outputs-v4') {
      state.processingOutputSeedRevision = 'processing-outputs-v4';
      changed = true;
    }
    return changed;
  }

  function makeSortingTasks(orders) {
    const sourceItems = window.MockOperations?.sortingItems || [];
    return orders.flatMap((order) => order.items.map((line, index) => {
      const source = sourceItems.find((item) => (
        (item.orderId === order.id || item.orderNo === order.orderNo)
        && (item.goodsCode || item.productCode) === line.productId
      ));
      const sorted = source?.status === 'SORTED' || Boolean(source?.sortingAt);
      const actualQty = source ? number(source.actualQty) : number(line.shippedQty);
      return {
        ...(source ? clone(source) : {}),
        id: source?.id || `SORT-${order.id}-${String(index + 1).padStart(3, '0')}`,
        sortingTaskId: source?.id || `SORT-${order.id}-${String(index + 1).padStart(3, '0')}`,
        orderId: order.id,
        orderLineId: line.orderLineId,
        productId: line.productId,
        goodsCode: line.productId,
        goodsName: line.goodsName || '',
        isNetVegetable: line.isNetVegetable === true,
        customerId: order.customerId || '',
        customerName: order.customerName || '',
        canteen: order.canteen || '',
        orderNo: order.orderNo || '',
        orderQty: number(line.quantity),
        actualQty,
        unit: line.unit || '',
        warehouse: order.warehouse || '',
        route: order.route || '',
        expectedAt: order.expectedAt || '',
        status: sorted ? 'SORTED' : 'PENDING',
        sortingCompleted: sorted,
        shortage: source?.shortage || (actualQty < number(line.quantity) && sorted ? '是' : '否'),
        shortageQty: Math.max(number(line.quantity) - actualQty, 0),
        progress: `${actualQty}/${number(line.quantity)}`,
        sorter: source?.sorter || '',
        sortingAt: source?.sortingAt || ''
      };
    }));
  }

  function makeShippingOrders(orders, sortingTasks) {
    return orders.map((order) => {
      const tasks = sortingTasks.filter((task) => task.orderId === order.id);
      const shipped = order.status === 'SHIPPED' || tasks.some((task) => task.shipped === '是');
      const sortingCompleted = tasks.length > 0 && tasks.every((task) => task.sortingCompleted);
      return {
        id: `SHIP-${order.id}`,
        shippingOrderId: `SHIP-${order.id}`,
        orderId: order.id,
        orderNo: order.orderNo,
        customerId: order.customerId || '',
        customerName: order.customerName,
        canteen: order.canteen,
        receiver: order.receiver || '',
        phone: order.phone || '',
        address: order.address || '',
        route: order.route || '',
        warehouse: order.warehouse || '',
        shippingAmount: number(order.shippingAmount),
        sortingStatus: sortingCompleted ? 'SORTED' : 'PENDING',
        status: shipped ? 'SHIPPED' : 'PENDING',
        printed: order.printed || '否',
        expectedAt: order.expectedAt || '',
        orderTag: order.orderTag || '',
        items: tasks.map((task) => ({ ...clone(task), shippingQty: task.actualQty }))
      };
    });
  }

  function makeOutboundOrders(orders, shippingOrders) {
    const outboundOrders = [];
    shippingOrders.filter((shipping) => shipping.status === 'SHIPPED').forEach((shipping) => {
      const order = orders.find((item) => item.id === shipping.orderId);
      const outboundTime = order?.shippingAt || order?.createdAt || timestamp();
      const outboundId = nextOutboundNumber(outboundOrders, { outboundTime });
      outboundOrders.push({
        id: outboundId,
        outboundOrderId: outboundId,
        orderId: shipping.orderId,
        orderNo: shipping.orderNo,
        relNo: shipping.orderNo,
        warehouse: shipping.warehouse,
        warehouseName: shipping.warehouse,
        outboundType: '销售出库',
        status: '待审核',
        outboundTime,
        creator: order?.creator || '管理员',
        items: (shipping.items || []).map((item) => ({
          orderId: shipping.orderId,
          orderLineId: item.orderLineId,
          productId: item.productId,
          productCode: item.productId,
          productName: item.goodsName,
          unit: item.unit,
          outboundQty: number(item.actualQty),
          currentStock: 0,
          unitPrice: number(item.unitPrice),
          amount: number(item.actualQty) * number(item.unitPrice)
        }))
      });
    });
    return outboundOrders;
  }

  function makeLedger(products, orders) {
    const balanceRows = window.MockOperations?.inventoryBalance || [];
    const ledger = [];
    balanceRows.forEach((row, index) => {
      const productId = row.productId || row.goodsCode || row.productCode;
      const qty = number(row.currentStock || row.balance || row.openingQty);
      if (!productId || qty === 0) return;
      ledger.push({
        id: `LEDGER-OPEN-${String(index + 1).padStart(4, '0')}`,
        type: 'OPENING',
        productId,
        warehouse: row.warehouse || '中心仓',
        qty,
        unit: row.unit || products.find((p) => p.id === productId)?.unit || '',
        unitPrice: number(row.averageCost || row.openingPrice),
        amount: number(row.totalAmount || qty * number(row.averageCost || row.openingPrice)),
        orderId: '',
        orderLineId: '',
        occurredAt: row.occurredAt || '2026-08-01 00:00:00',
        remark: '系统初始库存'
      });
    });
    if (!ledger.length) {
      products.slice(0, 8).forEach((product, index) => ledger.push({
        id: `LEDGER-OPEN-${String(index + 1).padStart(4, '0')}`,
        type: 'OPENING',
        productId: product.id,
        warehouse: '中心仓',
        qty: product.isNetVegetable ? 60 : 120,
        unit: product.unit,
        unitPrice: number(product.marketPrice),
        amount: (product.isNetVegetable ? 60 : 120) * number(product.marketPrice),
        orderId: '',
        orderLineId: '',
        occurredAt: '2026-08-01 00:00:00',
        remark: '系统初始库存'
      }));
    }
    const seededProducts = new Set(ledger.map((entry) => entry.productId));
    const usedLines = orders.flatMap((order) => order.items || []);
    usedLines.forEach((line, index) => {
      const productId = line.productId || line.goodsCode || '';
      if (!productId || seededProducts.has(productId)) return;
      const product = products.find((item) => item.id === productId);
      const qty = productId === 'SIM-NET-EGG-LIQUID' ? 0 : Math.max(number(line.quantity) * 2, 100);
      ledger.push({
        id: `LEDGER-OPEN-FALLBACK-${String(index + 1).padStart(4, '0')}`,
        type: 'OPENING',
        productId,
        warehouse: '中心仓',
        qty,
        unit: line.unit || product?.unit || '',
        unitPrice: number(line.unitPrice || product?.marketPrice),
        amount: qty * number(line.unitPrice || product?.marketPrice),
        orderId: '',
        orderLineId: '',
        occurredAt: '2026-08-01 00:00:00',
        remark: '订单基础库存'
      });
      seededProducts.add(productId);
    });
    products.forEach((product, index) => {
      if (seededProducts.has(product.id)) return;
      const qty = product.isNetVegetable ? 60 : 120;
      ledger.push({
        id: `LEDGER-OPEN-PRODUCT-${String(index + 1).padStart(4, '0')}`,
        type: 'OPENING', productId: product.id, warehouse: '中心仓', qty,
        unit: product.unit, unitPrice: number(product.marketPrice), amount: qty * number(product.marketPrice),
        orderId: '', orderLineId: '', occurredAt: '2026-08-01 00:00:00', remark: '商品基础库存'
      });
    });
    return ledger;
  }

  function expandOrders(sourceOrders, products) {
    const orders = clone(sourceOrders || []);
    const customerNames = ['第一实验学校', '阳光幼儿园', '育才中学', '机关第二食堂', '第三小学', '实验幼儿园', '第七中学', '机关第一食堂', '东城职业学校', '南城中心幼儿园'];
    const canteenByCustomer = { 第一实验学校: '第一食堂', 阳光幼儿园: '园区食堂', 育才中学: '高中部食堂', 机关第二食堂: '二号食堂', 第三小学: '校园食堂', 实验幼儿园: '幼儿部食堂', 第七中学: '初中部食堂', 机关第一食堂: '一号食堂', 东城职业学校: '职工食堂', 南城中心幼儿园: '中心食堂' };
    const generatedStatus = ['COMPLETED', 'PENDING', 'CONFIRMED', 'COMPLETED', 'PENDING', 'COMPLETED', 'PENDING_AUDIT', 'COMPLETED', 'CONFIRMED', 'CLOSED'];
    while (orders.length < 40) {
      const index = orders.length;
      const generatedIndex = index - 11;
      const product = products[index % products.length];
      const customerName = customerNames[generatedIndex % customerNames.length];
      const status = generatedIndex < 18 ? 'COMPLETED' : generatedStatus[generatedIndex % generatedStatus.length];
      orders.push({
        id: `ORD-DEMO-${String(index + 1).padStart(3, '0')}`, orderNo: `DD202608${String(5 + (generatedIndex % 20)).padStart(2, '0')}03${String(index + 1).padStart(5, '0')}`,
        customerName, customerType: customerName.includes('幼儿') ? '幼儿园' : customerName.includes('食堂') ? '机关单位' : '学校', canteen: canteenByCustomer[customerName],
        source: generatedIndex % 3 ? '企业下单' : '客户下单', orderTag: index % 2 ? '普通餐' : '营养餐', expectedAt: `2026-08-${String(5 + (generatedIndex % 10)).padStart(2, '0')} ${generatedIndex % 2 ? '08:00' : '07:30'}`,
        warehouse: generatedIndex % 4 === 0 ? '北区仓' : '中心仓', route: `配送线路${(generatedIndex % 5) + 1}`, status,
        orderAmount: Number((10 + (index % 6)) * number(product.marketPrice)), shippingAmount: status === 'COMPLETED' ? Number((10 + (index % 6)) * number(product.marketPrice)) : 0,
        items: [{ goodsCode: product.code || product.id, goodsName: product.name, unit: product.unit, quantity: 10 + (index % 6), unitPrice: number(product.marketPrice), isNetVegetable: product.isNetVegetable === true }]
      });
    }
    return orders;
  }

  function buildSeed() {
    const products = sourceProducts();
    const fallbackOrders = [
      {
        id: 'ORD-DEMO-001',
        orderNo: 'DD202608040100001',
        customerName: '第一实验学校',
        customerType: '学校',
        canteen: '第一食堂',
        source: '客户下单',
        orderTag: '营养餐',
        expectedAt: '2026-08-05 07:30',
        warehouse: '中心仓',
        route: '东城一线',
        status: 'PENDING',
        items: [
          { goodsCode: 'SP0300019', goodsName: '大白菜', unit: '斤', quantity: 30, unitPrice: 1.5, isNetVegetable: false },
          { goodsCode: 'SP0300039', goodsName: '土豆丝', unit: '斤', quantity: 20, unitPrice: 1, isNetVegetable: true }
        ]
      },
      {
        id: 'ORD-DEMO-002',
        orderNo: 'DD202608040200002',
        customerName: '阳光幼儿园',
        customerType: '幼儿园',
        canteen: '园区食堂',
        source: '平台添加',
        orderTag: '普通餐',
        expectedAt: '2026-08-05 08:00',
        warehouse: '中心仓',
        route: '南城二线',
        status: 'CONFIRMED',
        items: [
          { goodsCode: 'SP0300031', goodsName: '鲫鱼', unit: 'L', quantity: 12, unitPrice: 20, isNetVegetable: true },
          { goodsCode: 'SP0300040', goodsName: '土豆', unit: '斤', quantity: 20, unitPrice: 6.8, isNetVegetable: false }
        ]
      }
    ];
    const rawOrders = expandOrders(window.MockOperations?.orders?.length ? window.MockOperations.orders : fallbackOrders, products);
    const customers = sourceCustomers(rawOrders);
    const orders = rawOrders.map(normalizeOrder);
    const sortingTasks = makeSortingTasks(orders);
    const shippingOrders = makeShippingOrders(orders, sortingTasks);
    const outboundOrders = makeOutboundOrders(orders, shippingOrders);
    const seededReturns = (window.MockOperations?.returns || []).map((record, index) => {
      const datePart = String(record.createdAt || '2026-08-05').slice(0, 10).replace(/-/g, '');
      return { ...clone(record), returnNo: `THD${datePart}03${String(index + 1).padStart(5, '0')}`, orderNo: String(record.orderNo || '').replace(/^XS/, 'DD') };
    });
    const inboundOrders = clone(window.MockInboundOrders || []).map((order) => ({
      ...order,
      orderId: order.orderId || '',
      orderLineIds: order.orderLineIds || [],
      items: (order.items || []).map((item) => ({ ...item, productId: item.productId || item.productCode || '' }))
    }));
    return {
      version: schemaVersion,
      settings: { ...defaultSettings },
      products,
      customers,
      customerLocations: sourceLocations(rawOrders, customers),
      warehouses: sourceWarehouses(),
      orders,
      orderLines: orders.flatMap((order) => order.items.map((line) => clone(line))),
      sortingTasks,
      processingOrders: padRecords(window.MockProcessingOrders || [], 20, (index) => {
        const material = products[index % products.length];
        const output = products[(index + 1) % products.length];
        return {
          id: `JGD20260805${String(index + 1).padStart(5, '0')}`, processingDate: `2026-08-${String((index % 9) + 1).padStart(2, '0')}`,
          warehouse: index % 3 ? '中心仓' : '北区仓', status: index % 3 ? '已加工' : '草稿', operator: ['管理员', '杨师傅', '周师傅'][index % 3], remark: '日常净菜加工', costMode: 'auto',
          materials: [{ productCode: material.code, productName: material.name, unit: material.unit, stock: 100, avgPrice: number(material.marketPrice), consumeQty: 10 }],
          outputs: [{ productCode: output.code, productName: output.name, unit: output.unit, refCoefficient: 1, refQty: 10, actualQty: 9, costPrice: number(output.marketPrice).toFixed(2) }],
          createTime: `2026-08-${String((index % 9) + 1).padStart(2, '0')} 09:00:00`, attachments: [], operationLogs: [{ action: '创建', desc: `管理员 创建加工单 ${index + 1}` }]
        };
      }),
      shippingOrders,
      outboundOrders,
      inboundOrders: padRecords(inboundOrders, 20, (index) => {
        const product = products[index % products.length];
        return {
          id: `RKD202608050300${String(index + 1).padStart(5, '0')}`, entryTime: '2026-08-05 09:00:00', supplierPurchaserCustomerName: ['上海绿源农产品有限公司', '北方粮油批发部', '联营水产合作社'][index % 3],
          entryType: '采购入库', entryAmt: String((10 + index) * number(product.marketPrice)), warehouseName: index % 3 ? '中心仓' : '北区仓', relNo: `CGD20260805${String(index + 1).padStart(5, '0')}`, expectedDeliveryDate: '2026-08-05', status: index % 3 ? '已完成' : '待审核', purchaserLeaderName: ['杨', '周', '刘'][index % 3], creator: '管理员', remark: '采购到货验收入库', attachments: [], operationLogs: [{ action: '添加', operator: '管理员', desc: '管理员 添加入库单' }],
          items: [{ productCode: product.code, productName: product.name, unit: product.unit, expectedQty: 10 + index, actualQty: 10 + index, unitPrice: String(product.marketPrice), amount: String((10 + index) * number(product.marketPrice)) }]
        };
      }),
      inventoryLedger: makeLedger(products, orders),
      returns: padRecords(seededReturns, 20, (index) => {
        const order = orders[index % orders.length]; const line = order.items[0];
        return { id: `RET-${String(index + 1).padStart(3, '0')}`, returnNo: `THD2026080503${String(index + 1).padStart(5, '0')}`, customerName: order.customerName, canteen: order.canteen, orderNo: order.orderNo, inboundNo: `RKD2026080503${String(index + 1).padStart(5, '0')}`, goodsName: line.goodsName, warehouse: order.warehouse, status: ['PENDING', 'APPROVED', 'CLOSED'][index % 3], creator: '管理员', createdAt: '2026-08-05 10:00:00', reason: ['商品破损', '数量多发', '质量不符合要求'][index % 3], refundAmount: number(line.unitPrice) * 2, items: [{ id: `RL-${index + 1}`, goodsName: line.goodsName, unit: line.unit, orderPrice: number(line.unitPrice), shippedQty: number(line.quantity), returnedQty: 0, applyQty: 2, applyPrice: number(line.unitPrice), applyAmount: number(line.unitPrice) * 2, damageQty: 1, remark: '按订单明细退货' }] };
      }),
      tags: padRecords(window.MockOperations?.tags || [], 20, (index) => ({ id: `TAG-${String(index + 1).padStart(3, '0')}`, tagName: ['营养餐', '普通餐', '应急保供', '节日餐'][index % 4], status: 'ENABLE', createdAt: '2026-08-05 09:00:00' })),
      receiptChanges: padRecords(window.MockOperations?.receiptChanges || [], 20, (index) => { const order = orders[index % orders.length]; return { id: `CHANGE-${String(index + 1).padStart(3, '0')}`, changeNo: `BG20260805${String(index + 1).padStart(5, '0')}`, status: '待审核', customerName: order.customerName, canteen: order.canteen, orderNo: order.orderNo, items: order.items, createdAt: '2026-08-05 11:00:00' }; }),
      sortingProgress: padRecords(window.MockOperations?.sortingProgress || [], 20, (index) => { const order = orders[index % orders.length]; return { id: `PROGRESS-${String(index + 1).padStart(3, '0')}`, customerName: order.customerName, canteen: order.canteen, sortedCount: index % 3, orderCount: order.items.length, progress: `${index % 3}/${order.items.length}`, status: index % 3 ? 'PARTIAL' : 'PENDING', warehouse: order.warehouse, expectedAt: order.expectedAt, route: order.route }; }),
      shortageItems: padRecords(window.MockOperations?.shortageItems || [], 20, (index) => { const task = sortingTasks[index % sortingTasks.length]; return { ...clone(task), id: `SHORTAGE-${String(index + 1).padStart(3, '0')}`, shortage: '是', status: 'SHORTAGE', shortageQty: 1 }; }),
      sorters: padRecords(window.MockOperations?.sorters || [], 20, (index) => ({ id: `SORTER-${String(index + 1).padStart(3, '0')}`, sorterName: ['陈分拣', '李分拣', '王分拣', '赵分拣'][index % 4], username: ['chenfenjian', 'lifenjian', 'wangfenjian', 'zhaofen'] [index % 4], phone: `1380000${String(index + 300).padStart(4, '0')}`, warehouse: index % 2 ? '中心仓' : '北区仓', status: 'ENABLE' })),
      qualityReports: padRecords(window.MockOperations?.qualityReports || [], 20, (index) => { const product = products[index % products.length]; return { id: `QUALITY-${String(index + 1).padStart(3, '0')}`, inboundNo: `RKD20260805${String(index + 1).padStart(5, '0')}`, goodsName: product.name, warehouse: index % 2 ? '中心仓' : '北区仓', status: index % 4 ? '合格' : '未上传' }; }),
      inventoryCounts: padRecords(window.MockOperations?.inventoryCounts || [], 20, (index) => ({ id: `COUNT-DEMO-${String(index + 1).padStart(3, '0')}`, warehouse: '中心仓', countAt: '2026-08-04', status: '已完成' })),
      inventoryLosses: padRecords(window.MockOperations?.inventoryLosses || [], 20, (index) => { const product = products[index % products.length]; return { id: `LOSS-${String(index + 1).padStart(3, '0')}`, warehouse: index % 2 ? '中心仓' : '北区仓', status: '待审核', goodsName: product.name, productCode: product.code, quantity: 1, amount: number(product.marketPrice) }; }),
      openingInventory: padRecords(window.MockOperations?.openingInventory || [], 20, (index) => { const product = products[index % products.length]; return { id: `OPENING-${String(index + 1).padStart(3, '0')}`, warehouse: index % 2 ? '中心仓' : '北区仓', goodsName: product.name, goodsCode: product.code, openingQty: 100, openingPrice: number(product.marketPrice) }; })
    };
  }

  function ensure() {
    if (state) return state;
    clearLegacyBusinessStorage();
    const stored = window.AppStorage.read(storageKey, null);
    const hasValidProducts = Array.isArray(stored?.products)
      && stored.products.length > 0
      && stored.products.every((product) => product && (product.code || product.id));
    const hasValidOrders = Array.isArray(stored?.orders) && Array.isArray(stored?.sortingTasks);
    if (stored && stored.version === schemaVersion && hasValidProducts && hasValidOrders) {
      state = stored;
      const migrated = migrateOutboundNumbers(state);
      const logsAdded = ensureDocumentOperationLogs(state);
      const receiptFieldsNormalized = normalizeReceiptAndSupplement(state);
      const dateTimesNormalized = normalizeStateDateTimes(state);
      const productMetadataNormalized = normalizeProductMetadata(state);
      const processingOutputsNormalized = normalizeProcessingOutputs(state);
      if (migrated || logsAdded || receiptFieldsNormalized || dateTimesNormalized || productMetadataNormalized || processingOutputsNormalized) persist();
    }
    else {
      state = buildSeed();
      ensureDocumentOperationLogs(state);
      normalizeReceiptAndSupplement(state);
      normalizeStateDateTimes(state);
      normalizeProductMetadata(state);
      normalizeProcessingOutputs(state);
      window.AppStorage.write(storageKey, state);
    }
    return state;
  }

  function persist() {
    state.version = schemaVersion;
    window.AppStorage.write(storageKey, state);
  }

  function aggregateInventory(resource) {
    const current = ensure();
    const grouped = new Map();
    current.inventoryLedger.forEach((entry) => {
      const key = `${entry.productId}|${entry.warehouse || ''}`;
      const item = grouped.get(key) || {
        id: key,
        goodsCode: entry.productId,
        productId: entry.productId,
        goodsName: current.products.find((product) => product.id === entry.productId)?.name || entry.productId,
        category: current.products.find((product) => product.id === entry.productId)?.category || '',
        warehouse: entry.warehouse || '',
        unit: entry.unit || '',
        currentStock: 0,
        reservedStock: 0,
        pendingOutbound: 0,
        averageCost: 0,
        totalAmount: 0
      };
      if (entry.type === 'RESERVE') item.reservedStock += number(entry.qty);
      else if (entry.type === 'RELEASE') item.reservedStock -= number(entry.qty);
      else if (entry.type === 'PENDING_OUTBOUND') item.pendingOutbound += number(entry.qty);
      else if (entry.type === 'PENDING_OUTBOUND_RELEASE') item.pendingOutbound -= number(entry.qty);
      else if (entry.type === 'OUTBOUND') item.currentStock -= number(entry.qty);
      else item.currentStock += number(entry.qty);
      item.totalAmount += number(entry.amount || entry.qty * entry.unitPrice);
      grouped.set(key, item);
    });
    const values = [...grouped.values()].map((item) => ({
      ...item,
      reservedStock: Math.max(item.reservedStock, 0),
      availableStock: item.currentStock - Math.max(item.reservedStock, 0) - item.pendingOutbound,
      averageCost: item.currentStock ? item.totalAmount / item.currentStock : 0
    }));
    if (resource === 'inventoryDetails') {
      return current.inventoryLedger.map((entry) => ({
        ...clone(entry),
        goodsCode: entry.productId,
        goodsName: current.products.find((product) => product.id === entry.productId)?.name || entry.productId,
        documentType: entry.type,
        relationNo: entry.orderId || '--',
        occurredAt: entry.occurredAt,
        occurredQty: entry.type === 'OUTBOUND' ? -number(entry.qty) : number(entry.qty),
        balance: values.find((item) => item.productId === entry.productId && item.warehouse === entry.warehouse)?.currentStock || 0
      }));
    }
    return values;
  }

  window.DemoStore = {
    version: schemaVersion,
    get(resource) {
      const current = ensure();
      if (resource === 'inventoryBalance' || resource === 'inventoryDetails') return clone(aggregateInventory(resource));
      const key = resource === 'sortingItems' ? 'sortingTasks' : resource;
      return clone(current[key] || []);
    },
    replace(resource, value) {
      ensure();
      const key = resource === 'sortingItems' ? 'sortingTasks' : resource;
      state[key] = clone(value);
      persist();
      return clone(state[key]);
    },
    transact(mutator) {
      ensure();
      const result = mutator(state);
      persist();
      return result === undefined ? undefined : clone(result);
    },
    getSettings() { return clone(ensure().settings); },
    updateSettings(values) {
      ensure();
      state.settings = { ...state.settings, ...clone(values) };
      persist();
      return clone(state.settings);
    },
    reset() {
      state = buildSeed();
      persist();
      return clone(state);
    },
    snapshot() { return clone(ensure()); }
  };
})();

(function () {
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function nextId(prefix, items) {
    const max = items.reduce((value, item) => Math.max(value, Number(String(item.id || '').replace(/\D/g, '')) || 0), 0);
    return `${prefix}-${String(max + 1).padStart(3, '0')}`;
  }

  window.MasterDataService = {
    listCustomers(condition = {}) {
      const customers = window.DemoStore.get('customers');
      return customers.filter((customer) => Object.entries(condition).every(([key, value]) => !value || String(customer[key] || '').includes(String(value))));
    },
    getCustomer(id) {
      return window.DemoStore.get('customers').find((customer) => customer.id === id || customer.customerId === id) || null;
    },
    getLocations(customerId) {
      return window.DemoStore.get('customerLocations').filter((location) => !customerId || location.customerId === customerId);
    },
    createCustomer(data) {
      return window.DemoStore.transact((state) => {
        const customerId = nextId('CUS', state.customers);
        const customer = {
          ...clone(data),
          id: customerId,
          customerId,
          customerCode: data.customerCode || `CUS${String(state.customers.length + 1).padStart(3, '0')}`,
          status: data.status || 'ENABLE',
          createdAt: data.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        state.customers.unshift(customer);
        return customer;
      });
    },
    updateCustomer(id, data) {
      return window.DemoStore.transact((state) => {
        const customer = state.customers.find((item) => item.id === id || item.customerId === id);
        if (!customer) return null;
        Object.assign(customer, clone(data), { id: customer.id, customerId: customer.customerId });
        return customer;
      });
    }
  };
})();

(function () {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  function nextOutboundNumber(records, record = {}) {
    const dateSource = record.outboundTime || record.shippingAt || record.createdAt || now();
    const datePart = String(dateSource).slice(0, 10).replace(/-/g, '') || now().slice(0, 10).replace(/-/g, '');
    const prefix = `CKD${datePart}03`;
    let sequence = records.filter((item) => String(item.id || '').startsWith(prefix)).length + 1;
    let candidate = `${prefix}${String(sequence).padStart(5, '0')}`;
    while (records.some((item) => item.id === candidate || item.outboundOrderId === candidate)) {
      sequence += 1;
      candidate = `${prefix}${String(sequence).padStart(5, '0')}`;
    }
    return candidate;
  }

  function appendLedger(state, entry) {
    state.inventoryLedger.push({
      id: entry.id || `LEDGER-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: entry.type,
      productId: entry.productId,
      warehouse: entry.warehouse || '中心仓',
      qty: number(entry.qty),
      unit: entry.unit || '',
      unitPrice: number(entry.unitPrice),
      amount: number(entry.amount || number(entry.qty) * number(entry.unitPrice)),
      orderId: entry.orderId || '',
      orderLineId: entry.orderLineId || '',
      occurredAt: entry.occurredAt || now(),
      remark: entry.remark || ''
    });
  }

  function balanceFor(productId, warehouse) {
    const rows = window.DemoStore.get('inventoryBalance');
    return rows.find((row) => row.productId === productId && (!warehouse || row.warehouse === warehouse)) || {
      productId,
      warehouse: warehouse || '中心仓',
      currentStock: 0,
      reservedStock: 0,
      pendingOutbound: 0,
      availableStock: 0
    };
  }

  window.InventoryLedgerService = {
    getBalance(productId, warehouse) {
      return clone(balanceFor(productId, warehouse));
    },
    getAvailableQty(productId, warehouse) {
      return number(balanceFor(productId, warehouse).availableStock);
    },
    append(entry) {
      return window.DemoStore.transact((state) => {
        appendLedger(state, entry);
        return state.inventoryLedger[state.inventoryLedger.length - 1];
      });
    },
    reserve({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'RESERVE', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    release({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'RELEASE', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    inbound({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'INBOUND', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    outbound({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'OUTBOUND', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    pendingOutbound({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'PENDING_OUTBOUND', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    releasePendingOutbound({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'PENDING_OUTBOUND_RELEASE', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    opening({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity <= 0) return null;
      return this.append({ type: 'OPENING', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    },
    adjust({ productId, warehouse, qty, unit, unitPrice, orderId, orderLineId, remark }) {
      const quantity = number(qty);
      if (quantity === 0) return null;
      return this.append({ type: 'ADJUST', productId, warehouse, qty: quantity, unit, unitPrice, orderId, orderLineId, remark });
    }
  };

  function getOrder(state, orderId) {
    return state.orders.find((order) => order.id === orderId || order.orderId === orderId) || null;
  }

  function getTask(state, taskId) {
    return state.sortingTasks.find((task) => task.id === taskId || task.sortingTaskId === taskId) || null;
  }

  function taskList(state, orderId) {
    return state.sortingTasks.filter((task) => task.orderId === orderId);
  }

  function syncProgress(state, order) {
    if (!order?.customerName || !order.canteen) return;
    const tasks = taskList(state, order.id);
    let progress = state.sortingProgress.find((item) => item.customerName === order.customerName && item.canteen === order.canteen && item.expectedAt === order.expectedAt);
    if (!progress) {
      progress = {
        id: `PROGRESS-${order.id}`,
        customerId: order.customerId || '',
        customerName: order.customerName,
        canteen: order.canteen,
        route: order.route || '',
        expectedAt: order.expectedAt || '',
        sortedCount: 0,
        orderCount: tasks.length,
        progress: `0/${tasks.length}`,
        status: 'PENDING'
      };
      state.sortingProgress.unshift(progress);
    }
    const sortedCount = tasks.filter((task) => task.sortingCompleted).length;
    progress.sortedCount = sortedCount;
    progress.orderCount = tasks.length;
    progress.progress = `${sortedCount}/${tasks.length}`;
    progress.status = sortedCount === 0 ? 'PENDING' : sortedCount === tasks.length ? 'SORTED' : 'PARTIAL';
  }

  function syncShortage(state, task) {
    const index = state.shortageItems.findIndex((item) => item.id === task.id || (item.orderId === task.orderId && item.orderLineId === task.orderLineId));
    if (task.shortage === '是') {
      const record = {
        ...clone(task),
        id: task.id,
        orderId: task.orderId,
        orderLineId: task.orderLineId,
        shortageQty: Math.max(number(task.orderQty) - number(task.actualQty), 0),
        status: 'SHORTAGE'
      };
      if (index >= 0) state.shortageItems[index] = record;
      else state.shortageItems.unshift(record);
    } else if (index >= 0) state.shortageItems.splice(index, 1);
  }

  function syncOrder(state, orderId) {
    const order = getOrder(state, orderId);
    if (!order) return null;
    const tasks = taskList(state, orderId);
    order.sortingCompleted = tasks.length > 0 && tasks.every((task) => task.sortingCompleted);
    order.items = order.items.map((line) => {
      const task = tasks.find((item) => item.orderLineId === line.orderLineId);
      return task ? { ...line, actualQty: number(task.actualQty), sortingStatus: task.status, shortageQty: number(task.shortageQty) } : line;
    });
    order.orderLines = order.items;
    syncProgress(state, order);
    if (order.status !== 'SHIPPED' && order.status !== 'CLOSED' && order.status !== 'REJECTED') {
      if (order.sortingCompleted) order.status = 'READY_FOR_SHIPPING';
    }
    const shipping = state.shippingOrders.find((item) => item.orderId === orderId);
    if (shipping) {
      shipping.sortingStatus = order.sortingCompleted ? 'SORTED' : 'PENDING';
      shipping.items = tasks.map((task) => ({ ...clone(task), shippingQty: number(task.actualQty) }));
    }
    return order;
  }

  function createSortingTasks(state, order) {
    const existing = state.sortingTasks.filter((task) => task.orderId !== order.id);
    const tasks = order.items.map((line, index) => ({
      id: `SORT-${order.id}-${String(index + 1).padStart(3, '0')}`,
      sortingTaskId: `SORT-${order.id}-${String(index + 1).padStart(3, '0')}`,
      orderId: order.id,
      orderLineId: line.orderLineId,
      productId: line.productId || line.goodsCode || '',
      goodsCode: line.productId || line.goodsCode || '',
      goodsName: line.goodsName || '',
      isNetVegetable: line.isNetVegetable === true,
      customerId: order.customerId || '',
      customerName: order.customerName || '',
      canteen: order.canteen || '',
      orderNo: order.orderNo || '',
      orderQty: number(line.quantity),
      actualQty: 0,
      unit: line.unit || '',
      warehouse: order.warehouse || '中心仓',
      route: order.route || '',
      expectedAt: order.expectedAt || '',
      status: 'PENDING',
      sortingCompleted: false,
      shortage: '否',
      shortageQty: 0,
      progress: `0/${number(line.quantity)}`,
      sorter: '',
      sortingAt: '',
      operationLogs: [{ action: '创建', operator: order.creator || '系统', createdAt: now(), desc: `${order.creator || '系统'} 创建分拣任务` }]
    }));
    state.sortingTasks = [...tasks, ...existing];
  }

  function createShippingOrder(state, order) {
    const existing = state.shippingOrders.find((item) => item.orderId === order.id);
    if (existing) return existing;
    const created = {
      id: `SHIP-${order.id}`,
      shippingOrderId: `SHIP-${order.id}`,
      orderId: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId || '',
      customerName: order.customerName,
      canteen: order.canteen,
      receiver: order.receiver || '',
      phone: order.phone || '',
      address: order.address || '',
      route: order.route || '',
      warehouse: order.warehouse || '中心仓',
      shippingAmount: 0,
      sortingStatus: 'PENDING',
      status: 'PENDING',
      printed: '否',
      expectedAt: order.expectedAt || '',
      orderTag: order.orderTag || '',
      creator: order.creator || '系统',
      createdAt: now(),
      operationLogs: [{ action: '创建', operator: order.creator || '系统', createdAt: now(), desc: `${order.creator || '系统'} 创建发货单` }],
      items: []
    };
    state.shippingOrders.unshift(created);
    return created;
  }

  function createOutbound(state, order, status) {
    const existing = state.outboundOrders.find((item) => item.orderId === order.id);
    if (existing) return existing;
    const tasks = taskList(state, order.id);
    const outboundTime = order.shippingAt || now();
    const outboundId = nextOutboundNumber(state.outboundOrders, { outboundTime });
    const created = {
      id: outboundId,
      outboundOrderId: outboundId,
      orderId: order.id,
      orderNo: order.orderNo,
      relNo: order.orderNo,
      warehouse: order.warehouse || '中心仓',
      warehouseName: order.warehouse || '中心仓',
      outboundType: '销售出库',
      status,
      outboundTime,
      outboundAmt: tasks.reduce((sum, task) => sum + number(task.actualQty) * number(order.items.find((line) => line.orderLineId === task.orderLineId)?.unitPrice), 0).toFixed(2),
      creator: order.creator || '管理员',
      operationLogs: [{ action: '创建', operator: order.creator || '系统', createdAt: outboundTime, desc: `${order.creator || '系统'} 创建出库单` }],
      items: tasks.map((task) => {
        const line = order.items.find((item) => item.orderLineId === task.orderLineId) || {};
        return {
          orderId: order.id,
          orderLineId: task.orderLineId,
          productId: task.productId,
          productCode: task.productId,
          productName: task.goodsName,
          unit: task.unit,
          outboundQty: number(task.actualQty),
          currentStock: number(window.InventoryLedgerService.getBalance(task.productId, task.warehouse).currentStock),
          unitPrice: number(line.unitPrice),
          amount: number(task.actualQty) * number(line.unitPrice)
        };
      })
    };
    state.outboundOrders.unshift(created);
    return created;
  }

  function createOrderLogs(order, createdAt, creator) {
    const existing = Array.isArray(order.operationLogs) ? clone(order.operationLogs).filter((log) => log && (log.action || log.desc)) : [];
    return existing.length ? existing : [{ action: '创建订单', desc: `${creator} 创建订单 ${createdAt}` }];
  }

  function appendOperationLog(record, action, operator = '当前用户', desc = '') {
    if (!record) return;
    if (!Array.isArray(record.operationLogs)) record.operationLogs = [];
    const occurredAt = now();
    record.operationLogs.push({
      action,
      operator,
      createdAt: occurredAt,
      desc: desc || `${operator} ${action} ${occurredAt}`
    });
  }

  function completeOutbound(outbound) {
    if (outbound.completedAt) return outbound;
    outbound.status = '已完成';
    outbound.auditAt = now();
    outbound.completedAt = now();
    (outbound.items || []).forEach((item) => {
      const qty = number(item.outboundQty || item.quantity);
      if (qty <= 0) return;
      window.InventoryLedgerService.releasePendingOutbound({ productId: item.productId || item.productCode, warehouse: outbound.warehouseName || outbound.warehouse, qty, unit: item.unit, unitPrice: item.unitPrice, orderId: outbound.orderId || '', orderLineId: item.orderLineId || '', remark: '出库完成释放待出库占用' });
      window.InventoryLedgerService.outbound({ productId: item.productId || item.productCode, warehouse: outbound.warehouseName || outbound.warehouse, qty, unit: item.unit, unitPrice: item.unitPrice, orderId: outbound.orderId || '', orderLineId: item.orderLineId || '', remark: '出库完成扣减库存' });
    });
    return outbound;
  }

  function transitionSorting(state, taskId, action, payload = {}) {
    const task = getTask(state, taskId);
    if (!task) throw new Error('分拣任务不存在');
    const order = getOrder(state, task.orderId);
    if (!order) throw new Error('关联订单不存在');
    if (action === 'sort') {
      if (!['READY_FOR_SORTING', 'READY_FOR_SHIPPING'].includes(order.status)) {
        const error = new Error('订单尚未完成供货确认或审核，暂不能分拣');
        error.code = 'ORDER_NOT_READY_FOR_SORTING';
        throw error;
      }
      const actualQty = Math.max(0, number(payload.actualQty ?? task.orderQty));
      const oldQty = task.sortingCompleted ? number(task.actualQty) : 0;
      if (task.sortingCompleted && actualQty === oldQty) return task;
      const available = window.InventoryLedgerService.getAvailableQty(task.productId, task.warehouse) + oldQty;
      const settings = window.DemoStore.getSettings();
      if (settings.sortingInventoryThresholdEnabled && actualQty > available) {
        const error = new Error(`库存不足，可用库存为${available}${task.unit || ''}`);
        error.code = 'INVENTORY_SHORTAGE';
        throw error;
      }
      if (oldQty > 0) window.InventoryLedgerService.release({ productId: task.productId, warehouse: task.warehouse, qty: oldQty, unit: task.unit, orderId: task.orderId, orderLineId: task.orderLineId, remark: '重新分拣释放原预占' });
      if (actualQty > 0) window.InventoryLedgerService.reserve({ productId: task.productId, warehouse: task.warehouse, qty: actualQty, unit: task.unit, orderId: task.orderId, orderLineId: task.orderLineId, remark: '订单分拣预占' });
      task.actualQty = actualQty;
      task.status = 'SORTED';
      task.sortingCompleted = true;
      task.shortage = actualQty < number(task.orderQty) ? '是' : '否';
      task.shortageQty = Math.max(number(task.orderQty) - actualQty, 0);
      task.progress = `${actualQty}/${number(task.orderQty)}`;
      task.sorter = payload.sorter || task.sorter || '当前用户';
      task.sortingAt = now();
    } else if (action === 'resetSort') {
      if (task.sortingCompleted && number(task.actualQty) > 0) window.InventoryLedgerService.release({ productId: task.productId, warehouse: task.warehouse, qty: task.actualQty, unit: task.unit, orderId: task.orderId, orderLineId: task.orderLineId, remark: '重置分拣释放预占' });
      task.actualQty = 0;
      task.status = 'PENDING';
      task.sortingCompleted = false;
      task.shortage = '否';
      task.shortageQty = 0;
      task.progress = `0/${number(task.orderQty)}`;
      task.sorter = '';
      task.sortingAt = '';
    } else if (action === 'markShortage') {
      task.shortage = '是';
      task.shortageQty = Math.max(number(task.orderQty) - number(task.actualQty), 0);
    } else if (action === 'cancelShortage') {
      task.shortage = '否';
      task.shortageQty = 0;
    }
    appendOperationLog(task, action === 'sort' ? '完成分拣' : action === 'resetSort' ? '重置分拣' : action === 'markShortage' ? '标记短缺' : '取消短缺', task.sorter || '当前用户');
    syncShortage(state, task);
    syncOrder(state, task.orderId);
    return task;
  }

  window.OrderFlowService = {
    createOrder(data) {
      return window.DemoStore.transact((state) => {
        const sourceType = data.sourceType || (data.source === '客户下单' ? 'CUSTOMER' : 'ENTERPRISE');
        const orderId = data.orderId || `ORD-${Date.now()}`;
        const settings = state.settings;
        const status = sourceType === 'CUSTOMER'
          ? 'PENDING_CONFIRM'
          : settings.enterpriseOrderAuditEnabled ? 'PENDING_AUDIT' : 'READY_FOR_SHIPPING';
        const items = (data.items || []).map((item, index) => ({
          ...clone(item),
          id: `${orderId}-LINE-${String(index + 1).padStart(3, '0')}`,
          orderLineId: `${orderId}-LINE-${String(index + 1).padStart(3, '0')}`,
          orderId,
          productId: item.productId || item.goodsCode || item.productCode || '',
          goodsCode: item.productId || item.goodsCode || item.productCode || '',
          quantity: number(item.quantity),
          orderQty: number(item.quantity),
          subtotal: number(item.subtotal || number(item.quantity) * number(item.unitPrice))
        }));
        const order = {
          ...clone(data),
          id: orderId,
          orderId,
          sourceType,
          status,
          items,
          orderLines: items,
          productCount: items.length,
          receiptStatus: '未收货',
          receivedAt: '',
          supplement: '否',
          createdAt: data.createdAt || now(),
          createTime: data.createdAt || now(),
          creator: data.creator || '管理员',
          operationLogs: createOrderLogs(data, data.createdAt || now(), data.creator || '管理员'),
          updatedAt: now()
        };
        state.orders.unshift(order);
        state.orderLines = [...items, ...state.orderLines];
        createSortingTasks(state, order);
        createShippingOrder(state, order);
        syncOrder(state, order.id);
        return order;
      });
    },
    updateOrder(orderId, data) {
      return window.DemoStore.transact((state) => {
        const order = getOrder(state, orderId);
        if (!order) return null;
        const updates = clone(data);
        if (updates.status === 'PENDING' && !['PENDING_CONFIRM', 'PENDING_AUDIT'].includes(order.status)) delete updates.status;
        Object.assign(order, updates, { id: order.id, orderId: order.id, updatedAt: now() });
        if (Array.isArray(data.items)) {
          order.items = data.items.map((item, index) => ({
            ...clone(item),
            id: item.orderLineId || `${order.id}-LINE-${String(index + 1).padStart(3, '0')}`,
            orderLineId: item.orderLineId || `${order.id}-LINE-${String(index + 1).padStart(3, '0')}`,
            orderId: order.id,
            productId: item.productId || item.goodsCode || item.productCode || '',
            quantity: number(item.quantity),
            orderQty: number(item.quantity)
          }));
          state.orderLines = [...state.orderLines.filter((line) => line.orderId !== order.id), ...order.items];
          createSortingTasks(state, order);
        }
        syncOrder(state, order.id);
        return order;
      });
    },
    removeOrder(orderId) {
      return window.DemoStore.transact((state) => {
        const order = getOrder(state, orderId);
        if (!order) throw new Error('订单不存在或已删除');
        if (['SHIPPED', 'CLOSED'].includes(order.status)) {
          const error = new Error('已发货或已关闭订单不能删除');
          error.code = 'ORDER_NOT_DELETABLE';
          throw error;
        }
        const tasks = taskList(state, order.id);
        tasks.forEach((task) => {
          if (task.sortingCompleted && number(task.actualQty) > 0) {
            window.InventoryLedgerService.release({
              productId: task.productId,
              warehouse: task.warehouse,
              qty: task.actualQty,
              unit: task.unit,
              orderId: task.orderId,
              orderLineId: task.orderLineId,
              remark: '删除订单释放分拣预占'
            });
          }
        });
        state.orders = state.orders.filter((item) => item.id !== order.id);
        state.orderLines = state.orderLines.filter((item) => item.orderId !== order.id);
        state.sortingTasks = state.sortingTasks.filter((item) => item.orderId !== order.id);
        state.shippingOrders = state.shippingOrders.filter((item) => item.orderId !== order.id);
        state.outboundOrders = state.outboundOrders.filter((item) => item.orderId !== order.id);
        state.shortageItems = state.shortageItems.filter((item) => item.orderId !== order.id);
        state.sortingProgress = state.sortingProgress.filter((item) => item.id !== `PROGRESS-${order.id}`);
        return order;
      });
    },
    transition(resource, id, action, payload = {}) {
      return window.DemoStore.transact((state) => {
        if (resource === 'sortingItems') return transitionSorting(state, id, action, payload);
        if (resource === 'sortingProgress') {
          const progress = state.sortingProgress.find((item) => item.id === id);
          if (!progress) throw new Error('分拣客户记录不存在');
          state.sortingTasks.filter((task) => task.customerName === progress.customerName && task.canteen === progress.canteen).forEach((task) => transitionSorting(state, task.id, action, payload));
          return progress;
        }
        if (resource === 'orders') {
          const order = getOrder(state, id);
          if (!order) throw new Error('订单不存在');
          if (action === 'approve') {
            if (order.status !== 'PENDING_AUDIT') throw new Error('当前订单不在待审核状态');
            order.status = 'READY_FOR_SORTING';
            order.auditor = '当前用户';
            order.auditAt = now();
            appendOperationLog(order, '审核通过', order.auditor);
          } else if (action === 'confirm') {
            if (order.status !== 'PENDING_CONFIRM') throw new Error('当前订单不在待确认状态');
            order.status = 'READY_FOR_SORTING';
            order.confirmedAt = now();
            appendOperationLog(order, '确认供货', '当前用户');
          } else if (action === 'close') {
            order.status = 'CLOSED';
            appendOperationLog(order, '关闭订单', '当前用户');
          }
          else if (action === 'reject') {
            if (!['PENDING_CONFIRM', 'PENDING_AUDIT'].includes(order.status)) throw new Error('当前订单不能驳回');
            order.status = 'REJECTED';
            appendOperationLog(order, '驳回订单', '当前用户');
          }
          syncOrder(state, order.id);
          return order;
        }
        if (resource === 'shippingOrders' && action === 'ship') {
          const shipping = state.shippingOrders.find((item) => item.id === id || item.shippingOrderId === id);
          if (!shipping) throw new Error('发货单不存在');
          if (shipping.status === 'SHIPPED') return shipping;
          const tasks = taskList(state, shipping.orderId);
          if (!tasks.length || !tasks.every((task) => task.sortingCompleted)) {
            const error = new Error('请先完成订单全部明细的分拣操作');
            error.code = 'SORTING_REQUIRED';
            throw error;
          }
          const order = getOrder(state, shipping.orderId);
          let shippingAmount = 0;
          tasks.forEach((task) => {
            const line = order.items.find((item) => item.orderLineId === task.orderLineId);
            if (line) {
              line.shippedQty = number(task.actualQty);
              line.shippedAmount = number(task.actualQty) * number(line.unitPrice);
              shippingAmount += line.shippedAmount;
            }
            if (number(task.actualQty) > 0) window.InventoryLedgerService.release({ productId: task.productId, warehouse: task.warehouse, qty: task.actualQty, unit: task.unit, orderId: task.orderId, orderLineId: task.orderLineId, remark: '发货释放分拣预占' });
            if (number(task.actualQty) > 0) window.InventoryLedgerService.pendingOutbound({ productId: task.productId, warehouse: task.warehouse, qty: task.actualQty, unit: task.unit, orderId: task.orderId, orderLineId: task.orderLineId, remark: '发货后待出库占用' });
          });
          shipping.status = 'SHIPPED';
          shipping.sortingStatus = 'SORTED';
          shipping.shippingAmount = Number(shippingAmount.toFixed(2));
          shipping.items = tasks.map((task) => ({ ...clone(task), shippingQty: number(task.actualQty) }));
          order.status = 'SHIPPED';
          order.shippingAmount = Number(shippingAmount.toFixed(2));
          order.shippingAt = now();
          appendOperationLog(shipping, '完成发货', order.creator || '当前用户');
          appendOperationLog(order, '完成发货', order.creator || '当前用户');
          const outboundStatus = state.settings.outboundAuditEnabled ? '待审核' : '已完成';
          const outbound = createOutbound(state, order, outboundStatus);
          if (!state.settings.outboundAuditEnabled) completeOutbound(outbound);
          return shipping;
        }
        if (resource === 'outboundOrders' && (action === 'complete' || action === 'approve' || action === 'audit')) {
          const outbound = state.outboundOrders.find((item) => item.id === id || item.outboundOrderId === id);
          if (!outbound) throw new Error('出库单不存在');
          if (outbound.completedAt) return outbound;
          completeOutbound(outbound);
          appendOperationLog(outbound, '完成出库', '当前用户');
          return outbound;
        }
        throw new Error('不支持的业务操作');
      });
    },
    getProcessingDemand() {
      const snapshot = window.DemoStore.snapshot();
      return snapshot.sortingTasks.filter((task) => task.isNetVegetable && task.sortingCompleted).map((task) => ({
        ...clone(task),
        processingQty: number(task.actualQty),
        orderSortingQty: number(task.actualQty),
        remainingQty: Math.max(number(task.actualQty) - number(task.processedQty), 0)
      }));
    },
    resetDemo() { return window.DemoStore.reset(); }
  };
})();
