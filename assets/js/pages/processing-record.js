(function () {
  const downloadIcon = '<svg class="icon-svg" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M19 12H9"/></svg>';

  const pageContent = `
    <div class="page-card processing-record-page">
      <div class="filter-section">
        <div class="filter-panel">
          <div class="filter-fields">
            <div class="filter-group">
              <label class="filter-label">加工日期</label>
              <div class="date-range-picker record-date-range-picker" id="recDateRange">
                <input class="filter-input date-range-display" id="recDateDisplay" placeholder="请选择日期" readonly>
                <span class="date-range-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                <input type="hidden" id="recDateStartFilter">
                <input type="hidden" id="recDateEndFilter">
              </div>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="recStatusFilter">状态</label>
              <select class="filter-select" id="recStatusFilter">
                <option>全部</option>
                <option>待审核</option>
                <option>已驳回</option>
                <option>已完成</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="recMaterialFilter">原料商品</label>
              <input class="filter-input" id="recMaterialFilter" placeholder="请输入原料名称">
            </div>
            <div class="filter-group">
              <label class="filter-label" for="recOrderFilter">加工单号</label>
              <input class="filter-input" id="recOrderFilter" placeholder="请输入加工单号">
            </div>
            <div class="filter-group">
              <label class="filter-label" for="recOutboundFilter">出库单号</label>
              <input class="filter-input" id="recOutboundFilter" placeholder="请输入出库单号">
            </div>
            <div class="filter-group">
              <label class="filter-label" for="recInboundFilter">入库单号</label>
              <input class="filter-input" id="recInboundFilter" placeholder="请输入入库单号">
            </div>
          </div>
          <div class="action-controls">
            <button class="btn btn-primary btn-sm btn-fixed" type="button" data-action="query">查询</button>
            <button class="btn btn-sm btn-fixed" type="button" data-action="reset">重置</button>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <div class="action-main"></div>
        <div class="action-controls">
          <button class="btn btn-sm btn-fixed" type="button">${downloadIcon}导出</button>
        </div>
      </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="center">序号</th>
                <th>加工单号</th>
                <th>加工日期</th>
                <th>仓库</th>
                <th>原料商品</th>
                <th>消耗量</th>
                <th>原料成本</th>
                <th>成品商品</th>
                <th>获得量</th>
                <th>成品入库价</th>
                <th>操作人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="recTableBody"></tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="page-total">共 0 条数据</span>
          <select class="page-size-select" aria-label="每页数量"><option>20 条/页</option><option>50 条/页</option><option>100 条/页</option></select>
          <div class="page-btns" id="recPageBtns"></div>
          <div class="page-jump">
            <span>跳至</span>
            <input type="text" value="1" aria-label="跳转页码">
            <span>页</span>
          </div>
        </div>
      </div>

    </div>
    <div class="page-card processing-detail-page" id="recDetailPage" style="display:none;">
        <div class="processing-detail-page-header">
          <button class="back-link" type="button" data-action="back-to-list">
            ${backIcon}
            <span>返回</span>
          </button>
          <h1>加工单详情</h1>
        </div>
        <div class="processing-detail-page-body" id="recDetailBody"></div>
    </div>
  `;

  const state = {
    orders: [],
    visibleOrders: [],
    dateStart: '',
    dateEnd: ''
  };
  let recordDatePicker = null;

  function escapeHtml(value) {
    return window.DomUtils.escapeHtml(value);
  }

  function getStatusClass(status) {
    if (status === '已完成') return 'online';
    if (status === '待审核') return 'draft';
    if (status === '已驳回') return 'cancelled';
    return 'offline';
  }

  function getDisplayStatus(order) {
    const status = order.status;
    return { 已加工: '已完成', 草稿: '待审核', 已作废: '已驳回' }[status] || status;
  }

  function getRelatedOrderId(order, type) {
    const keys = type === 'outbound'
      ? ['outboundOrderId', 'outboundId', 'materialOutboundOrderId', 'materialOutboundId']
      : ['inboundOrderId', 'inboundId', 'outputInboundOrderId', 'outputInboundId'];
    return keys.map((key) => order[key]).find(Boolean) || '';
  }

  function loadOrders() {
    const all = window.ProcessingService.getList();
    state.orders = all;
  }

  function calcMaterialCost(materials) {
    if (!materials || materials.length === 0) return '--';
    const total = materials.reduce((sum, m) => sum + (Number(m.consumeQty) || 0) * (Number(m.avgPrice) || 0), 0);
    return total.toFixed(2);
  }

  function summarizeMaterials(materials) {
    if (!materials || materials.length === 0) return '--';
    if (materials.length === 1) return escapeHtml(materials[0].productName);
    return `${escapeHtml(materials[0].productName)} 等${materials.length}种`;
  }

  function summarizeOutputs(outputs) {
    if (!outputs || outputs.length === 0) return '--';
    if (outputs.length === 1) return escapeHtml(outputs[0].productName);
    return `${escapeHtml(outputs[0].productName)} 等${outputs.length}种`;
  }

  function summarizeConsumeQty(materials) {
    if (!materials || materials.length === 0) return '--';
    return materials.map((m) => `${m.consumeQty}${escapeHtml(m.unit)}`).join('，');
  }

  function summarizeActualQty(outputs) {
    if (!outputs || outputs.length === 0) return '--';
    return outputs.map((o) => `${o.actualQty || '--'}${escapeHtml(o.unit)}`).join('，');
  }

  function summarizeCostPrice(outputs, costMode) {
    if (!outputs || outputs.length === 0) return '--';
    if (costMode === 'manual') {
      return outputs.map((o) => o.costPrice ? `${o.costPrice}/${o.unit || '--'}` : '--').join('，');
    }
    return '自动分摊';
  }

  function renderTable(orders = state.visibleOrders) {
    state.visibleOrders = orders;
    const tbody = document.getElementById('recTableBody');
    tbody.innerHTML = orders.map((order, index) => `
      <tr>
        <td class="seq-cell">${index + 1}</td>
        <td><button class="btn-text code-link" type="button" data-row-action="detail" data-id="${escapeHtml(order.id)}">${escapeHtml(order.id)}</button></td>
        <td>${escapeHtml(order.processingDate)}</td>
        <td>${escapeHtml(order.warehouse)}</td>
        <td>${summarizeMaterials(order.materials)}</td>
        <td>${summarizeConsumeQty(order.materials)}</td>
        <td>${calcMaterialCost(order.materials)}</td>
        <td>${summarizeOutputs(order.outputs)}</td>
        <td>${summarizeActualQty(order.outputs)}</td>
        <td>${summarizeCostPrice(order.outputs, order.costMode)}</td>
        <td>${escapeHtml(order.operator)}</td>
        <td class="action-cell">
          <button class="btn-text" type="button" data-row-action="detail" data-id="${escapeHtml(order.id)}">查看</button>
        </td>
      </tr>
    `).join('');
    document.querySelector('.processing-record-page .page-total').textContent = `共 ${orders.length} 条数据`;
  }

  function filterOrders() {
    const value = (id) => document.getElementById(id)?.value.trim() || '';
    const orderId = value('recOrderFilter').toLowerCase();
    const materialName = value('recMaterialFilter').toLowerCase();
    const status = value('recStatusFilter');
    const outboundId = value('recOutboundFilter').toLowerCase();
    const inboundId = value('recInboundFilter').toLowerCase();
    const dateStart = value('recDateStartFilter');
    const dateEnd = value('recDateEndFilter');
    const result = state.orders.filter((order) => (
      (!orderId || order.id.toLowerCase().includes(orderId)) &&
      (!materialName || (order.materials || []).some((m) => m.productName.toLowerCase().includes(materialName))) &&
      (status === '全部' || getDisplayStatus(order) === status) &&
      (!outboundId || getRelatedOrderId(order, 'outbound').toLowerCase().includes(outboundId)) &&
      (!inboundId || getRelatedOrderId(order, 'inbound').toLowerCase().includes(inboundId)) &&
      (!dateStart || order.processingDate >= dateStart) &&
      (!dateEnd || order.processingDate <= dateEnd)
    ));
    renderTable(result);
  }

  function resetFilters() {
    ['recOrderFilter', 'recMaterialFilter', 'recOutboundFilter', 'recInboundFilter'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('recStatusFilter').value = '全部';
    state.dateStart = '';
    state.dateEnd = '';
    document.getElementById('recDateStartFilter').value = '';
    document.getElementById('recDateEndFilter').value = '';
    recordDatePicker?.clear(false);
    filterOrders();
  }

  function showDetail(id) {
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    const displayStatus = getDisplayStatus(order);
    const statusClass = getStatusClass(displayStatus);
    const materialRows = (order.materials || []).map((m) => `
      <tr>
        <td>${escapeHtml(m.productName)}</td>
        <td>${escapeHtml(m.unit)}</td>
        <td>${m.stock ?? '--'}</td>
        <td>${m.avgPrice ?? '--'}</td>
        <td>${m.consumeQty ?? '--'}</td>
        <td>${((Number(m.consumeQty) || 0) * (Number(m.avgPrice) || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

    const outputRows = (order.outputs || []).map((o) => `
      <tr>
        <td>${escapeHtml(o.productName)}</td>
        <td>${escapeHtml(o.unit)}</td>
        <td>${o.refCoefficient ?? '--'}</td>
        <td>${o.refQty ?? '--'}</td>
        <td>${o.actualQty ?? '--'}</td>
        <td>${o.allocatedCost || '--'}</td>
        <td>${o.costPrice ? `${o.costPrice}/${escapeHtml(o.unit || '--')}` : (order.costMode === 'manual' ? '--' : '自动分摊')}</td>
      </tr>
    `).join('');

    document.getElementById('recDetailBody').innerHTML = `
      <div class="processing-detail-section">
        <h3>基本信息</h3>
        <div class="processing-detail-info">
          <div class="info-item"><span class="info-label">加工单号：</span><span class="info-value">${escapeHtml(order.id)}</span></div>
          <div class="info-item"><span class="info-label">加工日期：</span><span class="info-value">${escapeHtml(order.processingDate)}</span></div>
          <div class="info-item"><span class="info-label">原料出库：</span><span class="info-value">${escapeHtml(order.materialWarehouse || order.warehouse || '--')}</span></div>
          <div class="info-item"><span class="info-label">成品入库：</span><span class="info-value">${escapeHtml(order.outputWarehouse || order.warehouse || '--')}</span></div>
          <div class="info-item"><span class="info-label">状态：</span><span class="info-value"><span class="status-tag ${statusClass}">${escapeHtml(displayStatus)}</span></span></div>
          <div class="info-item"><span class="info-label">操作人：</span><span class="info-value">${escapeHtml(order.operator)}</span></div>
          <div class="info-item"><span class="info-label">创建时间：</span><span class="info-value">${escapeHtml(order.createTime)}</span></div>
          <div class="info-item"><span class="info-label">成本模式：</span><span class="info-value">${order.costMode === 'auto' ? '按原料成本及实际获得量计算' : '手动输入成品入库单价'}</span></div>
          <div class="info-item"><span class="info-label">备注：</span><span class="info-value">${escapeHtml(order.remark || '--')}</span></div>
        </div>
      </div>
      <div class="processing-detail-section">
        <h3>原料消耗</h3>
        <table class="processing-detail-table">
          <thead>
            <tr><th>原料商品</th><th>单位</th><th>当前库存</th><th>库存均价</th><th>消耗量</th><th>原料成本</th></tr>
          </thead>
          <tbody>${materialRows || '<tr><td colspan="6">暂无数据</td></tr>'}</tbody>
        </table>
      </div>
      <div class="processing-detail-section">
        <h3>成品产出</h3>
        <table class="processing-detail-table">
          <thead>
            <tr><th>成品商品</th><th>单位</th><th>参考系数</th><th>参考获得量</th><th>实际获得量</th><th>分摊成本</th><th>成品入库单价</th></tr>
          </thead>
          <tbody>${outputRows || '<tr><td colspan="7">暂无数据</td></tr>'}</tbody>
        </table>
      </div>
    `;
    document.querySelector('.processing-record-page').style.display = 'none';
    const detailPage = document.getElementById('recDetailPage');
    detailPage.style.display = 'flex';
  }

  function closeDetail() {
    document.querySelector('.processing-record-page').style.display = '';
    document.getElementById('recDetailPage').style.display = 'none';
  }

  function bindEvents() {
    const root = document.querySelector('.processing-record-page');
    root.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'query') { filterOrders(); return; }
      if (action === 'reset') { resetFilters(); return; }
      if (action === 'back-to-list') { closeDetail(); return; }

      const rowAction = event.target.closest('[data-row-action]');
      if (rowAction && rowAction.dataset.rowAction === 'detail') {
        showDetail(rowAction.dataset.id);
      }
    });

    document.getElementById('recDetailPage').addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'back-to-list') closeDetail();
    });

    ['recOrderFilter', 'recMaterialFilter', 'recOutboundFilter', 'recInboundFilter'].forEach((id) => {
      document.getElementById(id).addEventListener('keydown', (event) => {
        if (event.key === 'Enter') filterOrders();
      });
    });

  }

  const params = new URLSearchParams(window.location.search);
  const detailId = params.get('id');

  window.AppShell.mount({ title: '加工记录', content: pageContent });
  recordDatePicker = window.DateRangePicker.mount({
    container: '#recDateRange',
    displayInput: '#recDateDisplay',
    startInput: '#recDateStartFilter',
    endInput: '#recDateEndFilter',
    panelId: 'recCalendarPanel',
    onChange: ({ startDate, endDate }) => {
      state.dateStart = startDate;
      state.dateEnd = endDate;
      filterOrders();
    }
  });
  loadOrders();
  state.visibleOrders = [...state.orders];
  renderTable();
  bindEvents();

  if (detailId) {
    setTimeout(() => showDetail(detailId), 100);
  }
})();
