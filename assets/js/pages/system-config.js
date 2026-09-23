(function () {
  const defaults = {
    addOperationProduct: true,
    marketInquiryPriceMode: 'min',
    orderCutoffDays: '0',
    orderCutoffTime: '',
    autoMergeEnabled: false,
    autoMergeTime: '08:00',
    autoMergeLastRunAt: '',
    autoMergeLastSummary: null,
    orderPricePriority1: '手动定价',
    orderPricePriority2: '',
    orderPricePriority3: '',
    orderPricePriority4: '',
    allowClientEditPrice: false,
    purchasePriceMode: '竞价模式',
    purchasePricePriority1: '中标价',
    purchasePricePriority2: '',
    purchasePricePriority3: '',
    autoInbound: false,
    sortingLowerThreshold: '',
    sortingUpperThreshold: '',
    sortingBlock: false,
    sortingNoShip: false,
    printerType: '佳博',
    autoOutbound: false,
    refrigeratedTempMin: '',
    refrigeratedTempMax: '',
    refrigeratedHumidityMin: '',
    refrigeratedHumidityMax: '',
    regularTempMin: '',
    regularTempMax: '',
    regularHumidityMin: '',
    regularHumidityMax: '',
    amountDecimal: '2',
    quantityDecimal: '0'
  };

  const selectOptions = {
    orderPricePriority1: ['手动定价', '近一次销售价', '市场价', '协议价'],
    orderPricePriority2: ['近一次销售价', '手动定价', '市场价', '协议价'],
    orderPricePriority3: ['市场价', '手动定价', '近一次销售价', '协议价'],
    orderPricePriority4: ['协议价', '市场价', '近一次销售价', '手动定价'],
    purchasePriceMode: ['竞价模式', '询价模式', '协议价模式'],
    purchasePricePriority1: ['中标价', '近一次采购价', '市场价'],
    purchasePricePriority2: ['近一次采购价', '中标价', '市场价'],
    purchasePricePriority3: ['市场价', '中标价', '近一次采购价'],
    printerType: ['佳博', '佳能', '惠普', '其他']
  };

  const lockedBlankKeys = new Set([
    'orderPricePriority2', 'orderPricePriority3', 'orderPricePriority4',
    'purchasePricePriority2', 'purchasePricePriority3'
  ]);
  const lockedValueSettings = {
    orderPricePriority1: '手动定价',
    purchasePriceMode: '竞价模式',
    purchasePricePriority1: '中标价'
  };
  const optionMarkup = (key, includeBlank = false) => `${includeBlank ? '<option value=""></option>' : ''}${selectOptions[key].map((option) => `<option value="${option}">${option}</option>`).join('')}`;
  const help = (text) => `<span class="config-help ui-tooltip-trigger" data-ui-tooltip="${window.DomUtils.escapeHtml(text)}" tabindex="0" role="img" aria-label="${window.DomUtils.escapeHtml(text)}">?</span>`;
  const clearButton = (key) => `<button class="config-clear" type="button" data-clear="${key}">清空</button>`;
  const configSelect = (key, className = '', options = {}) => `<select class="config-select ${className}" data-config="${key}" aria-label="${key}" ${options.disabled ? 'disabled' : ''}>${optionMarkup(key, options.includeBlank)}</select>`;
  const configInput = (key, placeholder = '请输入', className = '') => `<input class="config-input ${className}" data-config="${key}" placeholder="${placeholder}" autocomplete="off">`;
  const configCheckbox = (key, label, helpText = '') => `${helpText ? '<span class="config-checkbox-with-help">' : ''}<label class="config-checkbox"><input type="checkbox" data-config="${key}"><span class="config-checkmark"></span><span>${label}</span></label>${helpText ? `${help(helpText)}</span>` : ''}`;
  const configSwitch = (key, label, helpText = '') => `${helpText ? '<span class="config-checkbox-with-help">' : ''}<label class="config-switch"><input type="checkbox" data-config="${key}"><span class="config-switch-track" aria-hidden="true"></span><span>${label}</span></label>${helpText ? `${help(helpText)}</span>` : ''}`;
  const configRadio = (key, value, label) => `<label class="config-radio"><input type="radio" name="${key}" value="${value}" data-radio-config="${key}"><span class="config-radiomark"></span><span>${label}</span></label>`;

  const content = `
    <section class="page-card system-config-page" aria-label="业务配置">
      <div class="system-config-scroll">
        <h2 class="system-config-title">商品配置</h2>
        <div class="config-row product-permission-row">
          <div class="config-label">供应商管理商品权限</div>
          ${configCheckbox('addOperationProduct', '添加操作商品', '供应商添加商品后是否自动加入操作商品')}
        </div>

        <h2 class="system-config-title">市场询价配置</h2>
        <div class="config-row market-price-row">
          <div class="config-label">市场询价商品第一行最终确认价格</div>
          <div class="config-radio-group">
            ${configRadio('marketInquiryPriceMode', 'min', '按填写的询价市场价最低价回显')}
            ${configRadio('marketInquiryPriceMode', 'avg', '按填写的询价市场价平均价回显')}
            ${configRadio('marketInquiryPriceMode', 'empty', '默认回显为空')}
          </div>
        </div>

        <h2 class="system-config-title">订单配置</h2>
        <div class="config-row cutoff-row">
          <div class="config-label">截单时间</div>
          <div class="config-inline-fields">
            <span>提前</span>${configInput('orderCutoffDays', '请输入', 'config-days-input')}<span>天</span>${clearButton('orderCutoffDays')}
            <span class="config-time-wrap">${configInput('orderCutoffTime', '选择时间', 'config-time-input')}<span class="config-clock">◷</span></span>${clearButton('orderCutoffTime')}
          </div>
        </div>
        <div class="config-row priority-row">
          <div class="config-label">下单单价取值优先级</div>
          <div class="config-priority-group">
            <span>1.</span>${configSelect('orderPricePriority1', 'config-locked-select', { disabled: true })}
            <span>2.</span>${configSelect('orderPricePriority2', 'config-locked-select', { disabled: true, includeBlank: true })}
            <span>3.</span>${configSelect('orderPricePriority3', 'config-locked-select', { disabled: true, includeBlank: true })}
            <span>4.</span>${configSelect('orderPricePriority4', 'config-locked-select', { disabled: true, includeBlank: true })}
          </div>
        </div>
        <div class="config-row permission-row">
          <div class="config-label">客户端下单修改单价权限</div>
          ${configCheckbox('allowClientEditPrice', '修改单价')}
        </div>
        <div class="config-row auto-merge-row">
          <div class="config-label">自动合单配置</div>
          <div class="auto-merge-fields">
            ${configSwitch('autoMergeEnabled', '开启自动合单', '开启后将每天对期望时间为明天的订单进行合并')}
            <div class="auto-merge-time-line" id="autoMergeTimeLine">
              <span class="auto-merge-time-label">自动合单时间</span>
              <input class="config-input auto-merge-time-input" data-config="autoMergeTime" type="time" aria-label="自动合单时间">
            </div>
          </div>
        </div>

        <h2 class="system-config-title">采购配置</h2>
        <div class="config-row purchase-mode-row">
          <div class="config-label">采购价模式</div>
          ${configSelect('purchasePriceMode', 'config-locked-select', { disabled: true })}
        </div>
        <div class="config-row priority-row purchase-priority-row">
          <div class="config-label">采购单价取值优先级</div>
          <div class="config-priority-group">
            <span>1.</span>${configSelect('purchasePricePriority1', 'config-locked-select', { disabled: true })}
            <span>2.</span>${configSelect('purchasePricePriority2', 'config-locked-select', { disabled: true, includeBlank: true })}
            <span>3.</span>${configSelect('purchasePricePriority3', 'config-locked-select', { disabled: true, includeBlank: true })}
            <button class="config-apply" type="button" data-action="apply-purchase">应用</button>
          </div>
        </div>
        <div class="config-row permission-row">
          <div class="config-label">采购单收货${help('收货完成后可按配置自动生成入库记录')}</div>
          ${configCheckbox('autoInbound', '自动入库')}
        </div>

        <h2 class="system-config-title">分拣配置</h2>
        <div class="config-row threshold-row">
          <div class="config-label">分拣阈值</div>
          <div class="threshold-fields">
            <div class="threshold-line">数量低于 ${configInput('sortingLowerThreshold')}<span>%，系统进行通知，如果不需要则留空</span>${clearButton('sortingLowerThreshold')}</div>
            <div class="threshold-line">数量高于 ${configInput('sortingUpperThreshold')}<span>%，系统进行通知，如果不需要则留空</span>${clearButton('sortingUpperThreshold')}</div>
            ${configCheckbox('sortingBlock', '超过阈值不能分拣')}
            ${configCheckbox('sortingNoShip', '商品未分拣禁止发货')}
          </div>
        </div>
        <div class="config-row printer-row">
          <div class="config-label">打印机设置</div>
          ${configSelect('printerType', 'printer-select')}
        </div>

        <h2 class="system-config-title">发货配置</h2>
        <div class="config-row permission-row shipping-row">
          <div class="config-label">发货出库${help('勾选后发货完成会自动生成出库结果')}</div>
          ${configCheckbox('autoOutbound', '自动出库（注：出库单价为0的商品，勾选后无法自动完成出库）')}
        </div>

        <h2 class="system-config-title">配送配置</h2>
        <div class="config-row vehicle-row">
          <div class="config-label vehicle-label">冷藏车</div>
          <div class="vehicle-fields">
            <div class="vehicle-line">预警温度下限 ${configInput('refrigeratedTempMin')}<span>℃</span>预警温度上限 ${configInput('refrigeratedTempMax')}<span>℃</span>${clearButton('refrigeratedTempMin,refrigeratedTempMax')}</div>
            <div class="vehicle-line">预警湿度下限 ${configInput('refrigeratedHumidityMin')}<span>℃</span>预警湿度上限 ${configInput('refrigeratedHumidityMax')}<span>℃</span>${clearButton('refrigeratedHumidityMin,refrigeratedHumidityMax')}</div>
          </div>
        </div>
        <div class="config-row vehicle-row">
          <div class="config-label vehicle-label">普通车</div>
          <div class="vehicle-fields">
            <div class="vehicle-line">预警温度下限 ${configInput('regularTempMin')}<span>℃</span>预警温度上限 ${configInput('regularTempMax')}<span>℃</span>${clearButton('regularTempMin,regularTempMax')}</div>
            <div class="vehicle-line">预警湿度下限 ${configInput('regularHumidityMin')}<span>℃</span>预警湿度上限 ${configInput('regularHumidityMax')}<span>℃</span>${clearButton('regularHumidityMin,regularHumidityMax')}</div>
          </div>
        </div>

        <h2 class="system-config-title">通用配置</h2>
        <div class="config-row decimal-row">
          <div class="config-label">金额小数位配置</div>
          <div class="config-radio-group compact-radio-group">
            ${configRadio('amountDecimal', '0', '整数')}
            ${configRadio('amountDecimal', '1', '1位')}
            ${configRadio('amountDecimal', '2', '2位数')}
            ${configRadio('amountDecimal', '4', '4位')}
          </div>
        </div>
        <div class="config-row decimal-row">
          <div class="config-label">数量小数位配置</div>
          <div class="config-radio-group compact-radio-group">
            ${configRadio('quantityDecimal', '0', '整数')}
            ${configRadio('quantityDecimal', '1', '1位')}
            ${configRadio('quantityDecimal', '2', '2位数')}
            ${configRadio('quantityDecimal', '4', '4位')}
          </div>
        </div>
      </div>
      <div class="config-toast" id="configStatus" role="status" aria-live="polite" hidden>配置已保存</div>
    </section>`;

  const root = window.AppShell.mount({ title: '业务配置', content });
  const persistedSettings = window.DemoStore.getSettings() || {};
  const normalizedSettings = { ...lockedValueSettings };
  lockedBlankKeys.forEach((key) => { normalizedSettings[key] = ''; });
  if (Object.entries(normalizedSettings).some(([key, value]) => persistedSettings[key] !== value)) {
    window.DemoStore.updateSettings(normalizedSettings);
  }
  let savedSettings = { ...defaults, ...persistedSettings, ...normalizedSettings };
  let pendingScrollPosition = null;
  let autoMergeScheduleTimer = null;
  let lastAutoMergeScheduleKey = '';

  function autoMergeDateKey(value) {
    const source = String(value ?? '').trim().replace(/\//g, '-');
    const match = source.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    return match
      ? `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
      : source;
  }

  function autoMergeStatus(order) {
    return window.BusinessRules?.normalizeStatus?.('orders', order?.status)
      || String(order?.status || '').trim();
  }

  function autoMergeIsParent(order) {
    return order?.isMergeParent === true || order?.isMergeParent === 'true' || order?.isMergeParent === '是';
  }

  function autoMergeIsMerged(order) {
    return order?.isMerged === true || order?.isMerged === 'true' || order?.isMerged === '是'
      || Boolean(order?.mergeOrderId);
  }

  function autoMergeItems(order) {
    return Array.isArray(order?.items) ? order.items : (Array.isArray(order?.orderLines) ? order.orderLines : []);
  }

  function autoMergeProductId(line) {
    return String(line?.productId || line?.goodsCode || line?.productCode || line?.goodsId || '').trim();
  }

  function autoMergeUnit(line) {
    return String(line?.unit || line?.measurementUnit || line?.unitName || '').trim();
  }

  function autoMergePrice(line) {
    const value = Number(line?.unitPrice ?? line?.orderPrice ?? line?.price);
    return Number.isFinite(value) ? value : null;
  }

  function autoMergeQuantity(line) {
    const value = Number(line?.quantity ?? line?.orderQty ?? line?.qty ?? 0);
    return Number.isFinite(value) ? value : 0;
  }

  function autoMergePriceMap(order) {
    const prices = new Map();
    let conflict = false;
    autoMergeItems(order).forEach((line) => {
      const productId = autoMergeProductId(line);
      const unit = autoMergeUnit(line);
      if (!productId || !unit) return;
      const productKey = `${productId}\u0000${unit}`;
      const price = autoMergePrice(line);
      const priceKey = price == null ? String(line?.unitPrice ?? line?.orderPrice ?? line?.price ?? '') : price.toFixed(4);
      if (prices.has(productKey) && prices.get(productKey) !== priceKey) conflict = true;
      else prices.set(productKey, priceKey);
    });
    return { prices, conflict };
  }

  function autoMergePriceConflict(left, right) {
    return [...left.entries()].some(([productKey, priceKey]) => right.has(productKey) && right.get(productKey) !== priceKey);
  }

  function autoMergeBaseKey(order) {
    return JSON.stringify([
      order.customerName || order.customerId || '',
      order.canteen || '',
      autoMergeDateKey(order.expectedAt),
      String(order.source || '').trim(),
      String(order.orderTag || '').trim()
    ]);
  }

  function autoMergeHasPurchaseOrder(order) {
    if (order.purchaseOrderNo || order.purchaseOrderId || order.purchaseOrderGenerated === true) return true;
    return autoMergeItems(order).some((line) => line.purchaseOrderNo || line.purchaseOrderId || line.purchaseStatus === '已生成采购单');
  }

  function autoMergeSnapshot(order) {
    return {
      orderNo: order.orderNo || order.id || '--',
      customerName: order.customerName || '--',
      canteen: order.canteen || '--',
      orderTag: order.orderTag || '--',
      expectedAt: order.expectedAt || '--',
      source: order.source || '--',
      status: order.status || '--',
      orderAmount: order.orderAmount,
      productCount: order.productCount ?? autoMergeItems(order).length,
      items: autoMergeItems(order).map((line) => {
        const quantity = autoMergeQuantity(line);
        const unitPrice = autoMergePrice(line) ?? 0;
        return {
          goodsName: line.goodsName || line.productName || '--',
          goodsCode: autoMergeProductId(line) || '--',
          unit: autoMergeUnit(line) || '--',
          unitPrice,
          quantity,
          subtotal: line.subtotal ?? quantity * unitPrice
        };
      })
    };
  }

  function buildAutoMergeGroups(orders) {
    const buckets = new Map();
    orders.forEach((order) => {
      const priceResult = autoMergePriceMap(order);
      if (priceResult.conflict) return;
      const key = autoMergeBaseKey(order);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({ order, prices: priceResult.prices });
    });

    const groups = [];
    buckets.forEach((entries) => {
      const compatibleGroups = [];
      entries.forEach((entry) => {
        const target = compatibleGroups.find((group) => !autoMergePriceConflict(group.prices, entry.prices));
        if (!target) {
          compatibleGroups.push({ orders: [entry.order], prices: new Map(entry.prices) });
          return;
        }
        target.orders.push(entry.order);
        entry.prices.forEach((price, productKey) => target.prices.set(productKey, price));
      });
      compatibleGroups.filter((group) => group.orders.length >= 2).forEach((group) => groups.push(group.orders));
    });
    return groups;
  }

  function buildAutoMergeParentPayload(orders, mergeId) {
    const first = orders[0];
    const itemMap = new Map();
    orders.forEach((order) => autoMergeItems(order).forEach((line, index) => {
      const productId = autoMergeProductId(line) || `line-${order.id}-${index}`;
      const unit = autoMergeUnit(line) || '--';
      const price = autoMergePrice(line) ?? 0;
      const key = `${productId}\u0000${unit}\u0000${price.toFixed(4)}`;
      const current = itemMap.get(key) || {
        goodsName: line.goodsName || line.productName || '--',
        goodsCode: productId,
        productId,
        unit,
        unitPrice: price,
        quantity: 0
      };
      current.quantity += autoMergeQuantity(line);
      itemMap.set(key, current);
    }));
    const items = [...itemMap.values()].map((item) => ({
      ...item,
      orderQty: item.quantity,
      subtotal: Number((item.quantity * item.unitPrice).toFixed(2))
    }));
    const orderNos = orders.map((order) => order.orderNo || order.id || '--');
    return {
      customerId: first.customerId || '',
      customerName: first.customerName || '--',
      canteen: first.canteen || '--',
      customerType: first.customerType || '',
      orderTag: first.orderTag || '--',
      expectedAt: autoMergeDateKey(first.expectedAt) || '--',
      source: '订单合并',
      sourceType: 'ENTERPRISE',
      status: 'READY_FOR_SHIPPING',
      orderAmount: orders.reduce((total, order) => total + Number(order.orderAmount || 0), 0),
      shippingAmount: 0,
      returnAmount: 0,
      reconciliationAmount: 0,
      warehouse: first.warehouse || '',
      route: first.route || '',
      driver: first.driver || '',
      creator: '系统',
      remark: '',
      isMerged: '是',
      isMergeParent: true,
      mergeOrderId: mergeId,
      mergeSourceOrderIds: orders.map((order) => order.id),
      mergeSourceOrderNos: orderNos,
      mergeSourceOrderSnapshots: orders.map(autoMergeSnapshot),
      productCount: items.length,
      items,
      operationLogs: [{
        action: '创建订单',
        operator: '系统',
        createdAt: window.BusinessRules?.now?.() || new Date().toISOString().slice(0, 19).replace('T', ' '),
        desc: '系统 自动合单创建订单'
      }]
    };
  }

  async function executeAutoMerge(trigger = 'manual') {
    const settings = window.DemoStore.getSettings() || {};
    if (!settings.autoMergeEnabled && trigger === 'scheduled') return null;
    if (!settings.autoMergeEnabled) throw new Error('请先开启自动合单');
    if (!settings.autoMergeTime) throw new Error('请先设置自动合单时间');
    if (!window.OperationsService) throw new Error('订单服务尚未加载');

    const allOrders = window.DemoStore.get('orders') || [];
    const eligible = allOrders.filter((order) => {
      if (autoMergeIsParent(order) || autoMergeIsMerged(order)) return false;
      if (!['READY_FOR_SHIPPING', '待发货'].includes(autoMergeStatus(order))) return false;
      return !autoMergeHasPurchaseOrder(order);
    });
    const groups = buildAutoMergeGroups(eligible);
    const runAt = window.BusinessRules?.now?.() || new Date().toISOString().slice(0, 19).replace('T', ' ');
    let createdCount = 0;
    for (const [index, orders] of groups.entries()) {
      const mergeId = `MERGE-AUTO-${Date.now()}-${String(index + 1).padStart(2, '0')}`;
      const parent = await window.OperationsService.create('orders', buildAutoMergeParentPayload(orders, mergeId));
      await Promise.all(orders.map((order) => window.OperationsService.update('orders', order.id, {
        status: 'MERGED',
        isMerged: '是',
        mergeOrderId: mergeId
      })));
      if (parent) createdCount += 1;
    }
    const summary = {
      trigger,
      queriedOrders: allOrders.length,
      eligibleOrders: eligible.length,
      mergeGroups: groups.length,
      createdParents: createdCount,
      message: groups.length ? `生成 ${createdCount} 组订单合单` : '无可合单订单'
    };
    window.DemoStore.updateSettings({ autoMergeLastRunAt: runAt, autoMergeLastSummary: summary });
    savedSettings = { ...savedSettings, autoMergeLastRunAt: runAt, autoMergeLastSummary: summary };
    updateAutoMergeControls();
    showConfigStatus(`自动合单执行完成：${summary.message}`);
    return summary;
  }

  function updateAutoMergeControls() {
    const checkbox = root.querySelector('[data-config="autoMergeEnabled"]');
    const timeInput = root.querySelector('[data-config="autoMergeTime"]');
    const timeLine = root.querySelector('#autoMergeTimeLine');
    if (!checkbox || !timeInput) return;
    const enabled = checkbox.checked;
    timeInput.disabled = !enabled;
    timeLine?.classList.toggle('is-disabled', !enabled);
  }

  function checkAutoMergeSchedule() {
    const settings = window.DemoStore.getSettings() || {};
    if (!settings.autoMergeEnabled || !/^\d{2}:\d{2}$/.test(String(settings.autoMergeTime || ''))) return;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (currentTime !== settings.autoMergeTime) return;
    const scheduleKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${currentTime}`;
    if (lastAutoMergeScheduleKey === scheduleKey) return;
    lastAutoMergeScheduleKey = scheduleKey;
    executeAutoMerge('scheduled').catch((error) => showConfigStatus(error.message || '自动合单执行失败', 'error'));
  }

  function readScrollPosition() {
    const scroll = root.querySelector('.system-config-scroll');
    return {
      scrollTop: scroll?.scrollTop || 0,
      pageTop: window.scrollY || 0
    };
  }

  function restoreScrollPosition(position) {
    if (!position) return;
    const scroll = root.querySelector('.system-config-scroll');
    if (scroll) scroll.scrollTop = position.scrollTop;
    if (typeof window.scrollTo === 'function') window.scrollTo(0, position.pageTop);
    const restore = () => {
      if (scroll) scroll.scrollTop = position.scrollTop;
      if (typeof window.scrollTo === 'function') window.scrollTo(0, position.pageTop);
    };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(restore);
    else window.setTimeout(restore, 0);
  }

  function applySettingsToForm() {
    root.querySelectorAll('[data-config]').forEach((element) => {
      const key = element.dataset.config;
      if (element.type === 'checkbox') element.checked = Boolean(savedSettings[key]);
      else element.value = savedSettings[key] ?? '';
    });
    root.querySelectorAll('[data-radio-config]').forEach((element) => {
      element.checked = String(savedSettings[element.dataset.radioConfig] ?? defaults[element.dataset.radioConfig]) === element.value;
    });
  }

  function readFormSettings() {
    const next = {};
    root.querySelectorAll('[data-config]').forEach((element) => {
      const key = element.dataset.config;
      next[key] = element.type === 'checkbox' ? element.checked : element.value;
    });
    root.querySelectorAll('[data-radio-config]:checked').forEach((element) => {
      next[element.dataset.radioConfig] = element.value;
    });
    return next;
  }

  function showConfigStatus(message, type = '') {
    const status = root.querySelector('#configStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
    status.hidden = false;
    window.clearTimeout(status._hideTimer);
    status._hideTimer = window.setTimeout(() => { status.hidden = true; }, 2200);
  }

  function persistSettings() {
    const scrollPosition = pendingScrollPosition || readScrollPosition();
    const next = readFormSettings();
    if (next.autoMergeEnabled && !next.autoMergeTime) {
      showConfigStatus('请设置自动合单时间', 'error');
      updateAutoMergeControls();
      return false;
    }
    window.DemoStore.updateSettings(next);
    savedSettings = Object.assign(savedSettings, next);
    restoreScrollPosition(scrollPosition);
    pendingScrollPosition = null;
    updateAutoMergeControls();
    showConfigStatus('配置已保存');
    return true;
  }

  applySettingsToForm();
  updateAutoMergeControls();
  autoMergeScheduleTimer = window.setInterval(checkAutoMergeSchedule, 1000);

  root.addEventListener('pointerdown', (event) => {
    if (event.target.closest('[data-config], [data-radio-config], .config-radio, .config-checkbox, [data-clear]')) {
      pendingScrollPosition = readScrollPosition();
    }
  }, true);
  root.addEventListener('focusin', (event) => {
    if (!pendingScrollPosition && event.target.matches('[data-config], [data-radio-config]')) {
      pendingScrollPosition = readScrollPosition();
    }
  }, true);

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-config], [data-radio-config]')) persistSettings();
  });
  root.addEventListener('input', (event) => {
    if (event.target.matches('.config-input')) persistSettings();
  });
  root.addEventListener('click', (event) => {
    const clear = event.target.closest('[data-clear]');
    if (clear) {
      clear.dataset.clear.split(',').forEach((key) => {
        const input = root.querySelector(`[data-config="${key}"]`);
        if (input) input.value = '';
      });
      persistSettings();
    }
    if (event.target.closest('[data-action="apply-purchase"]')) persistSettings();
  });
})();
