(function () {
  const storageKey = 'procurement-processing-orders';
  const dataVersionKey = 'procurement-processing-data-version';
  const dataVersion = '20260730-processing-v6';
  const configKey = 'procurement-processing-config';
  const defaultConfig = { auditEnabled: true };
  const customerCodes = { 全部: '03', 客户A: '01', 客户B: '02', 客户C: '03' };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCustomerCode(order) {
    const explicitCode = String(order.customerCode || '').replace(/\D/g, '').slice(-2);
    if (explicitCode) return explicitCode.padStart(2, '0');
    return customerCodes[order.customer] || '03';
  }

  function getDatePart(value) {
    const match = String(value || '').match(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    if (match) return `${match[1]}${match[2]}${match[3]}`;
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }

  function normalizeStatus(status) {
    return { 已加工: '已完成', 草稿: '待提交', 已作废: '已驳回' }[status] || status;
  }

  function isValidPrice(value) {
    return value !== '' && value !== null && value !== undefined
      && Number.isFinite(Number(value)) && Number(value) > 0;
  }

  function normalizeOutputBusinessData(order) {
    const outputs = Array.isArray(order.outputs) ? order.outputs.map((output) => ({ ...output })) : [];
    if (outputs.length === 0) return null;

    const materialCost = (order.materials || []).reduce((sum, material) => (
      sum + (Number(material.consumeQty) || 0) * (Number(material.avgPrice) || 0)
    ), 0);
    if (!(materialCost > 0)) return null;

    const normalizedOutputs = outputs.map((output) => ({
      ...output,
      refCoefficient: Number(output.refCoefficient) > 0 ? Number(output.refCoefficient) : 1,
      actualQty: Number(output.actualQty) > 0
        ? Number(output.actualQty)
        : Number(output.refQty) > 0 ? Number(output.refQty) : 0
    }));
    if (normalizedOutputs.some((output) => !(Number(output.actualQty) > 0))) return null;

    const totalActualQty = normalizedOutputs.reduce((sum, output) => sum + Number(output.actualQty), 0);
    const products = window.ProductService?.getList?.() || window.MockProducts || [];
    const salesOutputs = normalizedOutputs.map((output) => {
      const product = products.find((item) => item.code === output.productCode);
      const salesPrice = Number(product?.marketPrice);
      return {
        actualQty: Number(output.actualQty),
        salesPrice,
        salesAmount: Number(output.actualQty) * salesPrice
      };
    });
    const totalSalesAmount = salesOutputs.reduce((sum, output) => (
      sum + (Number.isFinite(output.salesAmount) && output.salesAmount > 0 ? output.salesAmount : 0)
    ), 0);
    const canUseSalesWeight = totalSalesAmount > 0 && salesOutputs.every((output) => output.salesAmount > 0);
    let allocatedTotal = 0;

    return normalizedOutputs.map((output, index) => {
      const allocation = canUseSalesWeight
        ? materialCost * (salesOutputs[index].salesAmount / totalSalesAmount)
        : materialCost * (Number(output.actualQty) / totalActualQty);
      const allocatedCost = index === normalizedOutputs.length - 1
        ? Math.max(materialCost - allocatedTotal, 0.01)
        : Math.max(Math.round(allocation * 100) / 100, 0.01);
      allocatedTotal = Math.round((allocatedTotal + allocatedCost) * 100) / 100;
      const costPrice = Math.max(Math.round((allocatedCost / Number(output.actualQty)) * 100) / 100, 0.01);
      return {
        ...output,
        allocatedCost: allocatedCost.toFixed(2),
        costPrice: costPrice.toFixed(2)
      };
    });
  }

  function hasValidProcessingPayload(order) {
    const materials = Array.isArray(order.materials) ? order.materials : [];
    const outputs = Array.isArray(order.outputs) ? order.outputs : [];
    return materials.length > 0
      && materials.every((material) => material.productCode && Number(material.consumeQty) > 0 && Number(material.avgPrice) > 0)
      && outputs.length > 0
      && outputs.every((output) => output.productCode
        && Number(output.refCoefficient) > 0
        && Number(output.actualQty) > 0
        && isValidPrice(output.costPrice));
  }

  function normalizeOrder(order, index) {
    const customerCode = getCustomerCode(order);
    const datePart = getDatePart(order.processingDate || order.createTime);
    const currentId = String(order.id || '');
    const isDemo4005 = currentId === 'JG20260724005' || currentId === 'JGD202607240300005';
    const normalizedMaterials = isDemo4005 && Array.isArray(order.materials)
      ? order.materials.slice(0, 1)
      : order.materials;
    const normalizedOutputs = normalizeOutputBusinessData({ ...order, materials: normalizedMaterials });
    if (!normalizedOutputs) return null;
    const normalizedBase = {
      ...order,
      materials: normalizedMaterials,
      outputs: normalizedOutputs,
      customerCode,
      status: normalizeStatus(order.status)
    };
    const normalizedOrder = currentId.startsWith('JGD')
      ? normalizedBase
      : {
        ...normalizedBase,
        id: `JGD${datePart}${customerCode}${(
          currentId.match(/^JG\d{8}(\d{3,5})$/)?.[1]
          || currentId.match(/(\d{1,5})$/)?.[1]
          || String(index + 1)
        ).padStart(5, '0')}`
      };
    return hasValidProcessingPayload(normalizedOrder) ? normalizedOrder : null;
  }

  function load() {
    const canonicalOrders = clone(window.MockProcessingOrders || []);
    const storedVersion = window.AppStorage?.read(dataVersionKey, '') || '';
    const storedOrders = storedVersion === dataVersion
      ? window.AppStorage?.read(storageKey, canonicalOrders)
      : canonicalOrders;
    const orders = clone(storedOrders || canonicalOrders).map(normalizeOrder).filter(Boolean);
    if (window.AppStorage) {
      window.AppStorage.write(dataVersionKey, dataVersion);
      window.AppStorage.write(storageKey, orders);
    }
    return orders;
  }

  function save(orders) {
    if (window.AppStorage) window.AppStorage.write(storageKey, orders);
  }

  function getConfig() {
    return { ...defaultConfig, ...(window.AppStorage?.read(configKey, defaultConfig) || {}) };
  }

  function saveConfig(config) {
    return Boolean(window.AppStorage?.write(configKey, { ...getConfig(), ...config }));
  }

  function generateId(processingDate, customerCode, orders) {
    const datePart = getDatePart(processingDate);
    const prefix = `JGD${datePart}${customerCode}`;
    const maxSequence = orders.reduce((max, order) => {
      if (!order.id.startsWith(prefix)) return max;
      const sequence = Number(order.id.slice(prefix.length)) || 0;
      return Math.max(max, sequence);
    }, 0);
    return `${prefix}${String(maxSequence + 1).padStart(5, '0')}`;
  }

  function getDocumentCollection(key, fallback) {
    return clone(window.AppStorage?.read(key, fallback || []) || []);
  }

  function saveDocumentCollection(key, value) {
    if (window.AppStorage) window.AppStorage.write(key, value);
  }

  function generateProcessingDocumentId(prefix, datePart, customerCode, order) {
    const processingSequence = Number(String(order.id || '').slice(-5)) || 1;
    return `${prefix}${datePart}${customerCode}${String(70000 + processingSequence).padStart(5, '0')}`;
  }

  function buildInboundItems(order) {
    return (order.outputs || []).map((output) => ({
      productCode: output.productCode,
      productName: output.productName,
      unit: output.unit,
      conversionRate: 1,
      expectedQty: Number(output.actualQty),
      damageQty: 0,
      actualQty: Number(output.actualQty),
      unitPrice: Number(output.costPrice).toFixed(2),
      amount: (Number(output.actualQty) * Number(output.costPrice)).toFixed(2),
      productionDate: order.processingDate || '',
      qualityReport: '合格'
    }));
  }

  function buildOutboundItems(order) {
    return (order.materials || []).map((material) => ({
      productCode: material.productCode,
      productName: material.productName,
      unit: material.unit,
      conversionRate: 1,
      currentStock: Number(material.stock) || 0,
      outboundQty: Number(material.consumeQty),
      unitPrice: Number(material.avgPrice).toFixed(2),
      amount: (Number(material.consumeQty) * Number(material.avgPrice)).toFixed(2),
      remark: '加工原料'
    }));
  }

  function ensureRelatedDocuments(order) {
    if (order.status !== '已完成') return order;
    const datePart = getDatePart(order.processingDate || order.createTime);
    const customerCode = getCustomerCode(order);
    const inboundOrders = getDocumentCollection('procurement-inbound-orders', window.MockInboundOrders);
    const outboundOrders = getDocumentCollection('procurement-outbound-orders', window.MockOutboundOrders);
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const inboundId = generateProcessingDocumentId('RKD', datePart, customerCode, order);
    const outboundId = generateProcessingDocumentId('CKD', datePart, customerCode, order);

    if (!inboundOrders.some((item) => item.id === inboundId)) {
      inboundOrders.unshift({
        id: inboundId,
        entryTime: now,
        supplierPurchaserCustomerName: '--',
        entryType: '加工入库',
        entryAmt: buildInboundItems(order).reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2),
        warehouseName: order.outputWarehouse || order.warehouse || '主仓库',
        relNo: order.id,
        expectedDeliveryDate: order.processingDate || '--',
        status: '已完成',
        purchaserLeaderName: order.operator || '管理员',
        creator: order.operator || '管理员',
        remark: order.remark || '加工成品入库',
        items: buildInboundItems(order)
      });
      saveDocumentCollection('procurement-inbound-orders', inboundOrders);
    } else {
      const inboundOrder = inboundOrders.find((item) => item.id === inboundId);
      if (inboundOrder && inboundOrder.relNo === order.id) {
        inboundOrder.items = buildInboundItems(order);
        inboundOrder.entryAmt = inboundOrder.items.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2);
        saveDocumentCollection('procurement-inbound-orders', inboundOrders);
      }
    }

    if (!outboundOrders.some((item) => item.id === outboundId)) {
      outboundOrders.unshift({
        id: outboundId,
        outboundTime: now,
        outboundType: '加工出库',
        outboundAmt: (order.materials || []).reduce((sum, material) => (
          sum + (Number(material.consumeQty) || 0) * (Number(material.avgPrice) || 0)
        ), 0).toFixed(2),
        warehouseName: order.materialWarehouse || order.warehouse || '主仓库',
        supplierPurchaserCustomerName: '--',
        relNo: order.id,
        status: '已完成',
        creator: order.operator || '管理员',
        remark: order.remark || '加工原料出库',
        items: buildOutboundItems(order)
      });
      saveDocumentCollection('procurement-outbound-orders', outboundOrders);
    } else {
      const outboundOrder = outboundOrders.find((item) => item.id === outboundId);
      if (outboundOrder && outboundOrder.relNo === order.id) {
        outboundOrder.items = buildOutboundItems(order);
        outboundOrder.outboundAmt = outboundOrder.items.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2);
        saveDocumentCollection('procurement-outbound-orders', outboundOrders);
      }
    }

    return { ...order, inboundOrderId: inboundId, outboundOrderId: outboundId, customerCode };
  }

  window.ProcessingService = {
    getList() {
      const orders = load().map(ensureRelatedDocuments);
      if (window.AppStorage) window.AppStorage.write(storageKey, orders);
      return clone(orders);
    },
    getDetail(id) {
      return this.getList().find((order) => order.id === id) || null;
    },
    create(data) {
      const orders = load();
      const now = new Date();
      const customerCode = getCustomerCode(data);
      const created = {
        ...data,
        customerCode,
        id: generateId(data.processingDate, customerCode, orders),
        status: data.status || '待提交',
        operator: data.operator || '管理员',
        createTime: now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      };
      orders.unshift(created);
      save(orders);
      return clone(created);
    },
    update(id, data) {
      const orders = load();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0) return null;
      orders[index] = ensureRelatedDocuments({ ...orders[index], ...data, id: orders[index].id });
      save(orders);
      return clone(orders[index]);
    },
    getConfig() {
      return getConfig();
    },
    setAuditEnabled(enabled) {
      return saveConfig({ auditEnabled: Boolean(enabled) });
    },
    submit(id) {
      const orders = load();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0 || !['待提交', '草稿'].includes(orders[index].status)) return null;
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
      orders[index] = ensureRelatedDocuments({
        ...orders[index],
        status: getConfig().auditEnabled ? '待审核' : '已完成',
        submittedAt: now
      });
      save(orders);
      return clone(orders[index]);
    },
    audit(id, approved) {
      const orders = load();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0 || orders[index].status !== '待审核') return null;
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
      orders[index] = ensureRelatedDocuments({
        ...orders[index],
        status: approved ? '已完成' : '已驳回',
        auditedAt: now,
        auditResult: approved ? '通过' : '驳回'
      });
      save(orders);
      return clone(orders[index]);
    },
    remove(id) {
      const orders = load();
      const filtered = orders.filter((order) => order.id !== id);
      save(filtered);
      return filtered.length < orders.length;
    },
    getProducts() {
      return window.ProductService ? window.ProductService.getList() : [];
    }
  };
})();
