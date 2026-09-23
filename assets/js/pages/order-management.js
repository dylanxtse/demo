(function () {
  const service = window.OperationsService;
  const statusMap = {
    PENDING: ['待审核', 'warning'],
    PENDING_CONFIRM: ['待确认', 'warning'],
    PENDING_AUDIT: ['待审核', 'warning'],
    READY_FOR_SORTING: ['待分拣', 'info'],
    READY_FOR_SHIPPING: ['待发货', 'warning'],
    APPROVED: ['已审核', 'info'],
    CONFIRMED: ['已确认', 'success'],
    SHIPPED: ['已发货', 'success'],
    COMPLETED: ['已完成', 'success'],
    CLOSED: ['已关闭', 'danger']
    ,DRAFT: ['暂存', 'info']
    ,REJECTED: ['已驳回', 'danger']
    ,REVOKED: ['已撤销', 'danger']
  };
  const columns = [
    ['orderNo', '订单号'],
    ['customerName', '客户名称'],
    ['canteen', '食堂'],
    ['customerType', '客户类型'],
    ['orderTag', '订单标签'],
    ['orderAmount', '下单金额', 'money'],
    ['shippingAmount', '发货金额', 'money'],
    ['returnAmount', '退货金额', 'money'],
    ['reconciliationAmount', '对账金额', 'money'],
    ['expectedAt', '期望送达时间'],
    ['status', '单据状态', 'status'],
    ['receiptStatus', '收货状态'],
    ['productCount', '商品种类数'],
    ['warehouse', '仓库'],
    ['supplement', '是否补单'],
    ['remark', '备注'],
    ['shippingAt', '发货时间'],
    ['route', '线路'],
    ['driver', '司机'],
    ['acceptedAt', '验收时间'],
    ['source', '单据来源'],
    ['creator', '添加人']
  ];
  const state = {
    page: 1,
    pageSize: 20,
    total: 0,
    items: [],
    pagination: null,
    selected: new Set(),
    condition: {}
  };

  const content = `
    <section class="page-card operations-page order-module-page" aria-label="订单管理">
      <div class="operations-tabs order-view-tabs"><a class="operations-tab active" href="./order-management.html">订单列表</a><a class="operations-tab" href="./order-goods.html">订单商品</a></div>
      <div class="operations-filter filter-section">
        <div class="operations-filter-main">
          <div class="operations-filter-grid">
          <div class="operations-field expected-at-field"><label class="filter-label" for="expectedAt">期望送达时间</label><div class="date-input-control"><input class="filter-input" id="expectedAt" type="text" placeholder="请选择日期" readonly><span class="date-range-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span></div></div>
          <div class="operations-field"><label class="filter-label" for="customerName">客户名称</label><input class="filter-input" id="customerName" placeholder="请输入"></div>
          <div class="operations-field"><label class="filter-label" for="orderNo">订单号</label><input class="filter-input" id="orderNo" maxlength="40" placeholder="请输入订单号"></div>
          </div>
          <div class="operations-filter-actions">
            <button class="operations-filter-toggle" type="button" data-operations-filter-toggle>高级筛选<span class="toggle-arrow">▾</span></button>
            <button class="btn btn-primary btn-sm" id="queryButton">查询</button>
            <button class="btn btn-sm" id="resetButton">重置</button>
          </div>
        </div>
        <div class="operations-filter-advanced">
          <div class="operations-filter-grid">
          <div class="operations-field"><label class="filter-label" for="customerType">客户类型</label><select class="filter-select" id="customerType"><option value="">全部</option><option>学校</option><option>幼儿园</option><option>机关单位</option></select></div>
          <div class="operations-field"><label class="filter-label" for="orderTag">订单标签</label><select class="filter-select" id="orderTag"><option value="">全部</option><option>学生-营养餐</option><option>学生-非营养餐</option><option>学生-不区分</option><option>教师-营养餐</option><option>教师-非营养餐</option><option>教师-不区分</option><option>其他-非营养餐</option><option>其他-不区分</option></select></div>
          <div class="operations-field"><label class="filter-label" for="status">单据状态</label><select class="filter-select" id="status"><option value="">全部</option><option value="DRAFT">暂存</option><option value="PENDING_CONFIRM">待确认</option><option value="PENDING_AUDIT">待审核</option><option value="READY_FOR_SORTING">待分拣</option><option value="READY_FOR_SHIPPING">待发货</option><option value="REJECTED">已驳回</option><option value="SHIPPED">已发货</option><option value="CLOSED">已关闭</option><option value="REVOKED">已撤销</option></select></div>
          <div class="operations-field"><label class="filter-label" for="warehouse">仓库</label><select class="filter-select" id="warehouse"><option value="">全部</option><option>中心仓</option><option>北区仓</option><option>临时仓</option></select></div>
          <div class="operations-field"><label class="filter-label" for="source">单据来源</label><select class="filter-select" id="source"><option value="">全部</option><option>客户下单</option><option>平台添加</option><option>订单合并</option></select></div>
          <div class="operations-field"><label class="filter-label" for="receiptStatus">收货状态</label><select class="filter-select" id="receiptStatus"><option value="">全部</option><option>待收货</option><option>部分收货</option><option>已收货</option><option>未收货</option></select></div>
          <div class="operations-field"><label class="filter-label" for="orderType">订单类型</label><select class="filter-select" id="orderType"><option value="">全部</option><option>销售订单</option><option>临时订单</option></select></div>
          <div class="operations-field"><label class="filter-label" for="netVegetable">是否净菜</label><select class="filter-select" id="netVegetable"><option value="">全部</option><option value="net">净菜</option><option value="non-net">非净菜</option></select></div>
          <div class="operations-field"><label class="filter-label" for="isMerged">是否合单</label><select class="filter-select" id="isMerged"><option value="" selected>全部</option><option value="是">是</option><option value="否">否</option></select></div>
          </div>
        </div>
      </div>
      <div class="operations-toolbar">
        <div class="operations-toolbar-main">
          <button class="btn btn-primary btn-sm" id="addButton">添加订单</button>
          <button class="btn btn-sm btn-blue" id="batchConfirmButton">批量确认</button>
          <button class="btn btn-sm btn-blue" id="batchMergeButton">批量合单</button>
        </div>
        <div class="operations-toolbar-side">
          <button class="btn btn-sm" id="exportButton">导出</button>
        </div>
      </div>
      <div class="operations-table-container">
        <div class="operations-table-wrap">
          <table class="operations-table">
            <thead id="tableHead"></thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>
        <div class="pagination" id="pagination"></div>
      </div>
    </section>
    <div id="operationsOverlay"></div>
  `;

  const root = window.AppShell.mount({ title: '订单管理', content });
  const $ = (selector) => root.querySelector(selector);
  const overlay = $('#operationsOverlay');
  const expectedAtPicker = window.DatePicker?.mount({
    input: '#expectedAt',
    panelId: 'orderExpectedAtPickerPanel'
  });

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function statusHtml(status) {
    const [label, type] = statusMap[status] || [status || '--', ''];
    return `<span class="operation-status ${type}">${escapeHtml(label)}</span>`;
  }

  function money(value) {
    return Number(value || 0).toFixed(2);
  }

  function toast(message, type = '') {
    root.querySelector('.operations-toast')?.remove();
    const element = document.createElement('div');
    element.className = `operations-toast ${type}`;
    element.textContent = message;
    root.appendChild(element);
    window.setTimeout(() => element.remove(), 2200);
  }

  function collectCondition() {
    const condition = {};
    ['orderNo', 'customerName', 'customerType', 'status', 'orderTag', 'warehouse', 'source', 'expectedAt', 'receiptStatus', 'orderType', 'netVegetable', 'isMerged']
      .forEach((key) => {
        const value = $(`#${key}`).value.trim();
        if (value) condition[key] = value;
      });
    return condition;
  }

  function renderHead() {
    $('#tableHead').innerHTML = `<tr>
      <th><input type="checkbox" id="selectAll" aria-label="选择全部"></th>
      <th>序号</th>
      ${columns.map((column) => `<th>${column[1]}</th>`).join('')}
      <th>操作</th>
    </tr>`;
  }

  function visibleActions(item) {
    const actions = [];
    if (item.status === 'PENDING_AUDIT') actions.push({ key: 'approve', label: '审核' });
    if (item.status === 'PENDING_CONFIRM') actions.push({ key: 'confirm', label: '确认供货' });
    if (['DRAFT', 'PENDING', 'PENDING_AUDIT', 'PENDING_CONFIRM', 'REJECTED'].includes(item.status)) actions.push({ key: 'edit', label: '编辑' });
    actions.push({ key: 'copy', label: '复制' });
    if (isMergeParent(item) && isReadyForShipping(item)) actions.push({ key: 'unmerge', label: '取消合并' });
    if (!['SHIPPED', 'CLOSED'].includes(item.status)) actions.push({ key: 'close', label: '关闭' });
    if (['PENDING_AUDIT', 'PENDING_CONFIRM'].includes(item.status)) actions.push({ key: 'delete', label: '删除', danger: true });
    return actions;
  }

  function renderBody() {
    if (!state.items.length) {
      $('#tableBody').innerHTML = `<tr><td class="empty-cell" colspan="${columns.length + 3}">暂无数据</td></tr>`;
      return;
    }
    $('#tableBody').innerHTML = state.items.map((item, index) => `
      <tr data-id="${escapeHtml(item.id)}">
        <td><input type="checkbox" class="row-select" aria-label="选择订单" ${state.selected.has(item.id) ? 'checked' : ''}></td>
        <td>${(state.page - 1) * state.pageSize + index + 1}</td>
        ${columns.map(([key, , format]) => {
          let value = item[key];
          if (format === 'money') value = money(value);
          if (format === 'status') return `<td>${statusHtml(value)}</td>`;
          if (key === 'orderNo') {
            const isMergeParent = item.isMergeParent === true || item.isMergeParent === 'true' || item.isMergeParent === '是';
            const mergeBadge = isMergeParent ? '<span class="order-merge-parent-badge" aria-label="合并父订单">合</span>' : '';
            return `<td><button class="cell-link order-goods-link" data-action="view"><span class="order-number-line">${mergeBadge}<span>${escapeHtml(value)}</span></span><small>${escapeHtml(item.createdAt || '--')}</small></button></td>`;
          }
          return `<td title="${escapeHtml(value)}">${escapeHtml(value || '--')}</td>`;
        }).join('')}
        <td><div class="cell-actions operation-actions">${visibleActions(item).map((action) =>
          `<button class="btn-text ${action.danger ? 'danger' : ''}" data-action="${action.key}">${action.label}</button>`
        ).join('')}</div></td>
      </tr>
    `).join('');
  }

  function renderPagination() {
    state.pagination?.update({ page: state.page, pageSize: state.pageSize, total: state.total });
  }

  function updateSelection() {
    const selectAll = $('#selectAll');
    if (selectAll) {
      selectAll.checked = state.items.length > 0 && state.items.every((item) => state.selected.has(item.id));
      selectAll.indeterminate = !selectAll.checked && state.items.some((item) => state.selected.has(item.id));
    }
  }

  async function load() {
    try {
      const result = await service.list('orders', {
        page: state.page,
        pageSize: state.pageSize,
        condition: state.condition
      });
      state.items = result.items;
      state.total = result.total;
      renderHead();
      renderBody();
      renderPagination();
      updateSelection();
    } catch (error) {
      state.items = [];
      state.total = 0;
      renderHead();
      renderBody();
      renderPagination();
      toast(error.message || '数据加载失败', 'error');
    }
  }

  function closeModal() {
    overlay.innerHTML = '';
  }

  function modal(title, body, footer, detail = false, modalClass = '') {
    overlay.innerHTML = `
      <div class="operations-modal-backdrop">
        <section class="operations-modal ${detail ? 'is-detail' : ''} ${modalClass}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <header class="operations-modal-header"><h3>${escapeHtml(title)}</h3><button data-modal-close aria-label="关闭">×</button></header>
          <div class="operations-modal-body">${body}</div>
          <footer class="operations-modal-footer">${footer}</footer>
        </section>
      </div>`;
  }

  function dateKey(value) {
    const source = String(value ?? '').trim().replace(/\//g, '-');
    const match = source.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    return match
      ? `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
      : source;
  }

  function dateTimeKey(value) {
    const source = String(value ?? '').trim().replace(/\//g, '-');
    const date = dateKey(source);
    const match = source.match(/[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return date;
    return `${date} ${String(match[1]).padStart(2, '0')}:${match[2]}:${match[3] || '00'}`;
  }

  function customerCanteenKey(order) {
    return `${order.customerName || order.customerId || ''}\u0000${order.canteen || ''}`;
  }

  function orderStatus(order) {
    return window.BusinessRules?.normalizeStatus?.('orders', order?.status)
      || String(order?.status || '').trim();
  }

  function isMergeParent(order) {
    return order?.isMergeParent === true || order?.isMergeParent === 'true' || order?.isMergeParent === '是';
  }

  function isReadyForShipping(order) {
    return orderStatus(order) === 'READY_FOR_SHIPPING' || order?.status === '待发货';
  }

  function lineProductId(line) {
    return String(line?.productId || line?.goodsCode || line?.productCode || line?.goodsId || '').trim();
  }

  function lineUnit(line) {
    return String(line?.unit || line?.measurementUnit || line?.unitName || '').trim();
  }

  function linePrice(line) {
    const value = line?.unitPrice ?? line?.orderPrice ?? line?.price;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function linePriceKey(line) {
    const price = linePrice(line);
    return price == null ? String(line?.unitPrice ?? line?.orderPrice ?? line?.price ?? '') : price.toFixed(4);
  }

  function lineQuantity(line) {
    const value = line?.quantity ?? line?.orderQty ?? line?.qty ?? 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function orderItems(order) {
    return order?.items || order?.orderLines || [];
  }

  function hasGeneratedPurchaseOrder(order, purchaseLines) {
    const directPurchaseOrder = [
      order?.purchaseOrderNo,
      order?.purchaseOrderId,
      order?.purchaseOrderGenerated === true ? '已生成采购单' : ''
    ].some((value) => String(value ?? '').trim());
    if (directPurchaseOrder) return true;

    const orderLineHasPurchaseOrder = (line) => Boolean(
      line?.purchaseOrderNo
      || line?.purchaseOrderId
      || line?.allocation?.purchaseOrderNo
      || line?.allocation?.status === '已生成采购单'
      || line?.purchaseStatus === '已生成采购单'
    );
    if (orderItems(order).some(orderLineHasPurchaseOrder)) return true;

    return purchaseLines.some((line) => {
      const sameOrder = line?.orderId === order.id
        || line?.orderNo === order.orderNo
        || line?.orderId === order.orderNo;
      return sameOrder && orderLineHasPurchaseOrder(line);
    });
  }

  function hasActiveMergeParent(order) {
    const allOrders = window.DemoStore?.get?.('orders') || [];
    const orderIds = new Set(allOrders.filter((item) => isMergeParent(item) && !['REVOKED', 'CLOSED'].includes(orderStatus(item)))
      .flatMap((item) => Array.isArray(item.mergeSourceOrderIds) ? item.mergeSourceOrderIds : []));
    const orderNos = new Set(allOrders.filter((item) => isMergeParent(item) && !['REVOKED', 'CLOSED'].includes(orderStatus(item)))
      .flatMap((item) => Array.isArray(item.mergeSourceOrderNos) ? item.mergeSourceOrderNos : []));
    return orderIds.has(order.id) || orderNos.has(order.orderNo);
  }

  function getOrderPriceMap(order) {
    const prices = new Map();
    let hasConflict = false;
    orderItems(order).forEach((line) => {
      const productId = lineProductId(line);
      const unit = lineUnit(line);
      if (!productId || !unit) return;
      const productKey = `${productId}\u0000${unit}`;
      const priceKey = linePriceKey(line);
      if (prices.has(productKey) && prices.get(productKey) !== priceKey) hasConflict = true;
      else prices.set(productKey, priceKey);
    });
    return { prices, hasConflict };
  }

  function priceMapsConflict(left, right) {
    return [...left.entries()].some(([productKey, priceKey]) => right.has(productKey) && right.get(productKey) !== priceKey);
  }

  function mergePriceMaps(target, source) {
    source.forEach((priceKey, productKey) => target.set(productKey, priceKey));
  }

  function mergeBaseKey(order) {
    return JSON.stringify([
      customerCanteenKey(order),
      dateKey(order.expectedAt),
      String(order.source || '').trim(),
      String(order.orderTag || '').trim()
    ]);
  }

  function buildBatchMergeGroups(orders) {
    const purchaseLines = (window.DemoStore?.get?.('purchaseTasks') || []).flatMap((task) => task.orderLines || []);
    const excluded = [];
    const buckets = new Map();

    orders.forEach((order) => {
      const priceResult = getOrderPriceMap(order);
      const reasons = [];
      if (isMergeParent(order)) reasons.push('合单父订单不可再次合单');
      if (hasActiveMergeParent(order)) reasons.push('已存在合单父订单');
      if (!isReadyForShipping(order)) reasons.push('状态不是待发货');
      if (hasGeneratedPurchaseOrder(order, purchaseLines)) reasons.push('已生成采购单');
      if (priceResult.hasConflict) reasons.push('订单内部相同商品价格不一致');
      if (reasons.length) {
        excluded.push({ order, reasons });
        return;
      }
      const key = mergeBaseKey(order);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({ order, prices: priceResult.prices });
    });

    const groups = [];
    buckets.forEach((entries) => {
      const compatibleGroups = [];
      entries.forEach((entry) => {
        const target = compatibleGroups.find((group) => !priceMapsConflict(group.prices, entry.prices));
        if (target) {
          target.orders.push(entry.order);
          mergePriceMaps(target.prices, entry.prices);
        } else {
          compatibleGroups.push({ orders: [entry.order], prices: new Map(entry.prices) });
        }
      });

      compatibleGroups.forEach((group) => {
        if (group.orders.length < 2) {
          group.orders.forEach((order) => excluded.push({ order, reasons: ['没有找到可配对的合单订单'] }));
          return;
        }
        groups.push(buildBatchMergeGroup(group.orders));
      });
    });

    return { groups, excluded };
  }

  function buildBatchMergeGroup(orders) {
    const first = orders[0];
    const items = new Map();
    orders.forEach((order) => orderItems(order).forEach((line, index) => {
      const productId = lineProductId(line);
      const unit = lineUnit(line);
      const price = linePrice(line);
      const productKey = `${productId || `line-${order.id}-${index}`}\u0000${unit}\u0000${linePriceKey(line)}`;
      const current = items.get(productKey) || {
        productId: productId || '--',
        productName: line.goodsName || line.productName || '--',
        unit: unit || '--',
        price,
        quantity: 0,
        orderNos: new Set()
      };
      current.quantity += lineQuantity(line);
      current.orderNos.add(order.orderNo || order.id || '--');
      items.set(productKey, current);
    }));
    return {
      orderIds: orders.map((order) => order.id),
      orderNos: orders.map((order) => order.orderNo || order.id || '--'),
      customerId: first.customerId || '',
      customerType: first.customerType || '',
      orders: orders.map((order) => ({
        orderNo: order.orderNo || order.id || '--',
        expectedAt: dateTimeKey(order.expectedAt) || '--',
        productCount: order.productCount ?? orderItems(order).length,
        orderAmount: order.orderAmount
      })),
      customerName: first.customerName || '--',
      canteen: first.canteen || '--',
      orderTag: first.orderTag || '--',
      expectedAt: dateKey(first.expectedAt) || '--',
      source: first.source || '--',
      warehouse: first.warehouse || '',
      route: first.route || '',
      driver: first.driver || '',
      creator: first.creator || '系统',
      orderAmount: orders.reduce((total, order) => total + Number(order.orderAmount || 0), 0),
      mergeSourceOrderIds: orders.map((order) => order.id),
      mergeSourceOrderNos: orders.map((order) => order.orderNo || order.id || '--'),
      mergeSourceOrderSnapshots: orders.map((order) => mergeOrderSnapshot(order)),
      items: [...items.values()].map((item) => ({ ...item, orderNos: [...item.orderNos] }))
    };
  }

  function mergeOrderSnapshot(order) {
    return {
      orderNo: order.orderNo || order.id || '--',
      customerName: order.customerName || '--',
      canteen: order.canteen || '--',
      orderTag: order.orderTag || '--',
      expectedAt: order.expectedAt || '--',
      source: order.source || '--',
      status: order.status || '--',
      orderAmount: order.orderAmount,
      productCount: order.productCount ?? orderItems(order).length,
      items: orderItems(order).map((line) => {
        const quantity = lineQuantity(line);
        const unitPrice = linePrice(line) ?? 0;
        return {
          goodsName: line.goodsName || line.productName || '--',
          goodsCode: lineProductId(line) || '--',
          unit: lineUnit(line) || '--',
          unitPrice,
          quantity,
          subtotal: line.subtotal ?? quantity * unitPrice
        };
      })
    };
  }

  function renderBatchMergeGroups(groups) {
    return groups.map((group) => `
      <section class="order-batch-merge-group">
        <div class="order-batch-merge-meta">
          <div><span>客户名称：</span><strong>${escapeHtml(group.customerName)}</strong></div>
          <div><span>食堂：</span><strong>${escapeHtml(group.canteen)}</strong></div>
          <div><span>订单标签：</span><strong>${escapeHtml(group.orderTag)}</strong></div>
          <div><span>期望送达时间：</span><strong>${escapeHtml(group.expectedAt)}</strong></div>
          <div><span>单据来源：</span><strong>${escapeHtml(group.source)}</strong></div>
          <div class="order-batch-merge-meta-orders"><span>订单笔数：</span><strong>${group.orders.length} 笔</strong></div>
        </div>
        <div class="order-batch-merge-table-wrap">
          <table class="operations-table order-batch-merge-table">
            <thead><tr><th>订单号</th><th>期望送达时间</th><th>下单商品数</th><th>下单金额</th></tr></thead>
            <tbody>${group.orders.map((order) => `
              <tr>
                <td>${escapeHtml(order.orderNo)}</td>
                <td>${escapeHtml(order.expectedAt)}</td>
                <td>${escapeHtml(order.productCount)}</td>
                <td>¥${money(order.orderAmount)}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      </section>
    `).join('');
  }

  function openBatchMergeModal(plan, selectedCount) {
    const { groups } = plan;
    const mergeableCount = groups.reduce((total, group) => total + group.orderIds.length, 0);
    const body = `
      <div class="order-batch-merge-summary">已选择 <strong>${selectedCount}</strong> 笔订单，<strong>${mergeableCount}</strong> 笔可合单订单，共生成 <strong>${groups.length}</strong> 组合单。</div>
      <div class="order-batch-merge-groups">${renderBatchMergeGroups(groups)}</div>
    `;
    modal(
      '合单确认',
      body,
      '<button class="btn" type="button" data-modal-close>取消</button><button class="btn btn-primary" type="button" id="confirmBatchMerge">确认合单</button>',
      true,
      'order-batch-merge-modal'
    );
    $('#confirmBatchMerge').onclick = async () => {
      try {
        const mergeTime = Date.now();
        await Promise.all(groups.map(async (group, index) => {
          const mergeId = `MERGE-${mergeTime}-${String(index + 1).padStart(2, '0')}`;
          await createMergedParentOrder(group, mergeId);
          await Promise.all(group.orderIds.map((id) => service.update('orders', id, {
            status: 'MERGED',
            isMerged: '是',
            mergeOrderId: mergeId
          })));
        }));
        state.selected.clear();
        closeModal();
        toast(`合单成功，共生成${groups.length}组`);
        await load();
      } catch (error) {
        toast(error.message || '合单失败', 'error');
      }
    };
  }

  async function createMergedParentOrder(group, mergeId) {
    const items = group.items.map((item) => ({
      goodsName: item.productName || '--',
      goodsCode: item.productId || '',
      productId: item.productId || '',
      unit: item.unit || '--',
      unitPrice: item.price ?? 0,
      quantity: item.quantity,
      orderQty: item.quantity,
      subtotal: Number((item.quantity * Number(item.price ?? 0)).toFixed(2))
    }));
    const created = await service.create('orders', {
      customerId: group.customerId,
      customerName: group.customerName,
      canteen: group.canteen,
      customerType: group.customerType,
      orderTag: group.orderTag,
      expectedAt: group.expectedAt,
      source: '订单合并',
      sourceType: 'ENTERPRISE',
      status: 'READY_FOR_SHIPPING',
      orderAmount: group.orderAmount,
      shippingAmount: 0,
      returnAmount: 0,
      reconciliationAmount: 0,
      warehouse: group.warehouse,
      route: group.route,
      driver: group.driver,
      creator: group.creator || '系统',
      remark: '',
      isMerged: '是',
      isMergeParent: true,
      mergeOrderId: mergeId,
      mergeSourceOrderIds: group.mergeSourceOrderIds,
      mergeSourceOrderNos: group.mergeSourceOrderNos,
      mergeSourceOrderSnapshots: group.mergeSourceOrderSnapshots,
      items
    });
    return service.update('orders', created.id, {
      status: 'READY_FOR_SHIPPING',
      source: '订单合并',
      isMerged: '是',
      isMergeParent: true,
      mergeOrderId: mergeId,
      mergeSourceOrderIds: group.mergeSourceOrderIds,
      mergeSourceOrderNos: group.mergeSourceOrderNos,
      mergeSourceOrderSnapshots: group.mergeSourceOrderSnapshots
    });
  }

  async function handleBatchMerge() {
    const ids = [...state.selected];
    if (ids.length < 2) return toast('请至少勾选两个订单后再合单', 'error');
    try {
      const orders = (await Promise.all(ids.map((id) => service.get('orders', id)))).filter(Boolean);
      if (orders.length !== ids.length) return toast('部分订单已不存在，请刷新后重试', 'error');
      const plan = buildBatchMergeGroups(orders);
      const mergeableCount = plan.groups.reduce((total, group) => total + group.orderIds.length, 0);
      if (mergeableCount < 2) return toast('所选订单中没有至少两笔符合合单规则的订单', 'error');
      openBatchMergeModal(plan, orders.length);
    } catch (error) {
      toast(error.message || '合单校验失败', 'error');
    }
  }

  function showDetail(item) {
    window.location.href = `./order-detail.html?id=${encodeURIComponent(item.id)}`;
  }

  function mergeSourceOrders(parent) {
    const allOrders = window.DemoStore?.get?.('orders') || [];
    const sourceIds = new Set(Array.isArray(parent.mergeSourceOrderIds) ? parent.mergeSourceOrderIds : []);
    const sourceNos = new Set(Array.isArray(parent.mergeSourceOrderNos) ? parent.mergeSourceOrderNos : []);
    return allOrders.filter((order) => order.id !== parent.id && (sourceIds.has(order.id)
      || sourceNos.has(order.orderNo)
      || (parent.mergeOrderId && order.mergeOrderId === parent.mergeOrderId)));
  }

  async function cancelBatchMerge(parent) {
    if (!isMergeParent(parent) || !isReadyForShipping(parent)) throw new Error('当前合并订单不可取消合并');
    const sourceOrders = mergeSourceOrders(parent);
    if (sourceOrders.length < 2) throw new Error('未找到合并前的原订单');
    await Promise.all(sourceOrders.map((source) => service.update('orders', source.id, {
      status: 'READY_FOR_SHIPPING',
      isMerged: '否',
      mergeOrderId: ''
    })));
    const cancelledAt = window.BusinessRules?.now?.() || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const operationLogs = [...(Array.isArray(parent.operationLogs) ? parent.operationLogs : []), {
      action: '取消合并',
      operator: '当前用户',
      createdAt: cancelledAt,
      desc: '当前用户 取消合并'
    }];
    await service.update('orders', parent.id, {
      status: 'REVOKED',
      isMerged: '否',
      mergeCancelledAt: cancelledAt,
      operationLogs
    });
  }

  function formField(field, item) {
    const value = item?.[field.key] ?? field.defaultValue ?? '';
    const control = field.options
      ? `<select name="${field.key}"><option value="">请选择</option>${field.options.map((option) => `<option value="${option}" ${String(value) === option ? 'selected' : ''}>${option}</option>`).join('')}</select>`
      : field.type === 'textarea'
        ? `<textarea name="${field.key}" placeholder="请输入">${escapeHtml(value)}</textarea>`
        : `<input name="${field.key}" type="${field.type || 'text'}" value="${escapeHtml(value)}" placeholder="${field.placeholder || '请输入'}">`;
    return `<div class="operations-form-item ${field.required ? 'required' : ''}">
      <label>${field.label}</label><div class="operations-form-control">${control}<div class="operations-field-error"></div></div>
    </div>`;
  }

  function confirmAction(title, message, callback) {
    modal(title, `<p style="margin:0;text-align:center;color:var(--text-secondary)">${escapeHtml(message)}</p>`,
      '<button class="btn" data-modal-close>取消</button><button class="btn btn-primary" id="confirmModalAction">确定</button>'
    , false, 'is-confirm');
    $('#confirmModalAction').onclick = async () => {
      try {
        await callback();
        closeModal();
        toast('操作成功');
        await load();
      } catch (error) {
        toast(error.message || '操作失败', 'error');
      }
    };
  }

  async function handleRowAction(action, id) {
    const item = await service.get('orders', id);
    if (!item) return toast('记录不存在或已删除', 'error');
    if (action === 'view') return showDetail(item);
    if (action === 'unmerge') {
      return confirmAction('取消合并', '取消合并后父订单将撤销，原订单恢复为待发货，是否确认？', () => cancelBatchMerge(item));
    }
    if (action === 'edit') {
      window.location.href = `./order-add.html?mode=edit&id=${encodeURIComponent(item.id)}`;
      return;
    }
    if (action === 'approve') {
      window.location.href = `./order-add.html?mode=audit&id=${encodeURIComponent(item.id)}`;
      return;
    }
    if (action === 'confirm') {
      window.location.href = `./order-add.html?mode=confirm&id=${encodeURIComponent(item.id)}`;
      return;
    }
    if (action === 'copy') {
      window.location.href = `./order-add.html?mode=copy&id=${encodeURIComponent(item.id)}`;
      return;
    }
    if (action === 'delete') {
      return confirmAction('删除订单', '删除后订单将不再显示，且无法恢复，是否确认删除？', () => service.remove('orders', id));
    }
    const transitionLabels = { close: ['关闭订单', '确定要关闭该订单吗？'] };
    const info = transitionLabels[action];
    if (info) confirmAction(info[0], info[1], () => service.transition('orders', id, action));
  }

  root.addEventListener('click', async (event) => {
    const close = event.target.closest('[data-modal-close]');
    if (close) return closeModal();
    const filterToggle = event.target.closest('[data-operations-filter-toggle]');
    if (filterToggle) {
      const expanded = filterToggle.classList.toggle('is-active');
      filterToggle.closest('.operations-filter')?.querySelector('.operations-filter-advanced')?.classList.toggle('is-visible', expanded);
      return;
    }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      const row = actionButton.closest('tr[data-id]');
      if (row) return handleRowAction(actionButton.dataset.action, row.dataset.id);
    }
    if (event.target.id === 'queryButton') {
      state.condition = collectCondition();
      state.page = 1;
      state.selected.clear();
      return load();
    }
    if (event.target.id === 'resetButton') {
      root.querySelectorAll('.operations-filter input, .operations-filter select').forEach((field) => { field.value = ''; });
      expectedAtPicker?.clear(false);
      state.condition = {};
      state.page = 1;
      state.selected.clear();
      return load();
    }
    if (event.target.id === 'addButton') {
      window.location.href = './order-add.html';
      return;
    }
    if (event.target.id === 'batchConfirmButton') {
      return confirmAction('批量确认', '确定要确认选中的订单吗？', async () => {
        const ids = [...state.selected];
        if (!ids.length) throw new Error('请选择要操作的订单');
        await service.batch('orders', ids, 'confirm');
        state.selected.clear();
      });
    }
    if (event.target.id === 'batchMergeButton') return handleBatchMerge();
    if (event.target.id === 'exportButton') {
      const csv = await service.export('orders', { condition: state.condition }, columns.map(([key, label]) => ({ key, label })));
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '订单列表.csv';
      link.click();
      URL.revokeObjectURL(url);
      return toast('导出成功');
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.id === 'selectAll') {
      state.items.forEach((item) => event.target.checked ? state.selected.add(item.id) : state.selected.delete(item.id));
      renderBody();
      updateSelection();
    }
    if (event.target.classList.contains('row-select')) {
      const id = event.target.closest('tr').dataset.id;
      event.target.checked ? state.selected.add(id) : state.selected.delete(id);
      updateSelection();
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.closest('.operations-filter')) {
      state.condition = collectCondition();
      state.page = 1;
      load();
    }
    if (event.key === 'Escape' && overlay.innerHTML) closeModal();
  });

  state.pagination = window.Pagination.create({
    container: '#pagination',
    page: state.page,
    pageSize: state.pageSize,
    total: state.total,
    pageSizeOptions: [10, 20, 50],
    onChange: ({ page, pageSize }) => {
      state.page = page;
      state.pageSize = pageSize;
      return load();
    }
  });

  load();
})();
