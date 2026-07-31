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
                <option>待确认</option>
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
          <div class="action-controls action-controls-multi">
            <div class="action-controls-row">
              <button class="btn btn-primary btn-sm btn-fixed" type="button" data-action="query">查询</button>
              <button class="btn btn-sm btn-fixed" type="button" data-action="reset">重置</button>
            </div>
            <div class="action-controls-row">
              <button class="btn btn-sm btn-fixed" type="button" data-action="export">${downloadIcon}导出</button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-cell" rowspan="2"><span class="custom-checkbox" role="checkbox" aria-checked="false" data-action="toggle-all"></span></th>
                <th rowspan="2">加工单号</th>
                <th rowspan="2" class="processing-record-material-col">加工原料</th>
                <th rowspan="2">原料用量</th>
                <th colspan="2">加工成品</th>
                <th rowspan="2">原料出库单</th>
                <th rowspan="2">成品入库单</th>
                <th rowspan="2">加工日期</th>
                <th rowspan="2">状态</th>
                <th rowspan="2">操作人</th>
                <th rowspan="2">操作</th>
              </tr>
              <tr>
                <th class="processing-record-product-col">成品商品</th>
                <th>实际获得量</th>
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
        <div class="processing-form-footer processing-detail-footer" id="recDetailFooter"></div>
    </div>
  `;

  const state = {
    orders: [],
    visibleOrders: [],
    selectedIds: new Set(),
    dateStart: '',
    dateEnd: ''
  };
  let recordDatePicker = null;

  function escapeHtml(value) {
    return window.DomUtils.escapeHtml(value);
  }

  function productNetTag(productCode) {
    if (!productCode) return '';
    const products = window.ProductService?.getList?.() || window.MockProducts || [];
    const product = products.find((p) => p.code === productCode);
    return product?.isNetVegetable ? '<span class="net-vegetable-tag">净菜</span>' : '';
  }

  function renderOperationLogs(logs) {
    if (!logs || !logs.length) return '<span class="detail-empty">--</span>';
    return logs.map((log) => `
      <div class="detail-timeline-item">
        <div class="detail-timeline-node"></div>
        <div class="detail-timeline-content">
          <span class="detail-timeline-action">${escapeHtml(log.action)}</span>
          <span class="detail-timeline-desc">${escapeHtml(log.desc)}</span>
        </div>
      </div>
    `).join('');
  }

  function renderAttachments(attachments) {
    if (!attachments || !attachments.length) return '<span class="detail-empty">--</span>';
    return attachments.map((file) => `
      <div class="detail-attachment-item">
        <div class="detail-attachment-thumb">${escapeHtml(file.format)}</div>
        <div class="detail-attachment-info">
          <span class="detail-attachment-name">${escapeHtml(file.name)}</span>
          <span class="detail-attachment-meta">${escapeHtml(file.format.toUpperCase())} · ${escapeHtml(file.size)}</span>
        </div>
      </div>
    `).join('');
  }

  function getStatusClass(status) {
    if (status === '已完成') return 'online';
    if (status === '待确认') return 'pending';
    if (status === '待审核') return 'draft';
    if (status === '已驳回') return 'cancelled';
    return 'offline';
  }

  function getDisplayStatus(order) {
    const status = order.status;
    return { 已加工: '已完成', 草稿: '待确认', 已作废: '已驳回' }[status] || status;
  }

  function getRelatedOrderId(order, type) {
    const keys = type === 'outbound'
      ? ['outboundOrderId', 'outboundId', 'materialOutboundOrderId', 'materialOutboundId']
      : ['inboundOrderId', 'inboundId', 'outputInboundOrderId', 'outputInboundId'];
    return keys.map((key) => order[key]).find(Boolean) || '';
  }

  function renderRelatedOrderLink(order, type) {
    const id = getRelatedOrderId(order, type);
    if (!id) return '--';
    const detailPage = type === 'outbound' ? 'outbound-detail.html' : 'inbound-detail.html';
    return `<a class="code-link related-order-link" href="./${detailPage}?id=${encodeURIComponent(id)}&returnTo=${encodeURIComponent('processing-record.html')}">${escapeHtml(id)}</a>`;
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

  function renderRowActions(order) {
    const id = escapeHtml(order.id);
    const status = getDisplayStatus(order);
    const detailButton = `<button class="btn-text" type="button" data-row-action="detail" data-id="${id}">详情</button>`;
    if (status === '待确认') {
      return `<button class="btn-text" type="button" data-row-action="detail" data-id="${id}">确认</button>${detailButton}`;
    }
    if (status === '待审核') {
      return `<button class="btn-text" type="button" data-row-action="detail" data-id="${id}">审核</button>${detailButton}`;
    }
    return detailButton;
  }

  function summarizeConsumeQty(materials) {
    if (!materials || materials.length === 0) return '--';
    return materials.map((m) => `${m.consumeQty}${escapeHtml(m.unit)}`).join('，');
  }

  function renderOrderRows(order) {
    const outputs = (order.outputs || []).slice(0, 2);
    const outputCount = (order.outputs || []).length;
    const visibleOutputs = outputs.length > 0 ? outputs : [{ productName: '--', actualQty: '--', unit: '' }];
    const rowSpan = visibleOutputs.length;
    const sharedCells = (index) => index === 0 ? `
      <td class="checkbox-cell" rowspan="${rowSpan}"><span class="custom-checkbox ${state.selectedIds.has(order.id) ? 'checked' : ''}" role="checkbox" aria-checked="${state.selectedIds.has(order.id)}" data-action="toggle-row" data-id="${escapeHtml(order.id)}"></span></td>
      <td rowspan="${rowSpan}"><button class="btn-text code-link" type="button" data-row-action="detail" data-id="${escapeHtml(order.id)}">${escapeHtml(order.id)}</button></td>
      <td rowspan="${rowSpan}" class="processing-record-material-col">${summarizeMaterials(order.materials)}</td>
      <td rowspan="${rowSpan}">${summarizeConsumeQty(order.materials)}</td>
    ` : '';
    const tailCells = (index) => index === 0 ? `
      <td rowspan="${rowSpan}">${renderRelatedOrderLink(order, 'outbound')}</td>
      <td rowspan="${rowSpan}">${renderRelatedOrderLink(order, 'inbound')}</td>
      <td rowspan="${rowSpan}">${escapeHtml(order.processingDate)}</td>
      <td rowspan="${rowSpan}"><span class="status-tag ${getStatusClass(getDisplayStatus(order))}">${escapeHtml(getDisplayStatus(order))}</span></td>
      <td rowspan="${rowSpan}">${escapeHtml(order.operator)}</td>
      <td class="action-cell" rowspan="${rowSpan}">${renderRowActions(order)}</td>
    ` : '';

    const rowClass = visibleOutputs.length > 1 ? 'is-multi-output' : 'is-single-output';
    return visibleOutputs.map((output, index) => `
      <tr class="processing-record-sub-row ${rowClass}" data-order-id="${escapeHtml(order.id)}">
        ${sharedCells(index)}
        <td class="record-output-product-cell processing-record-product-col">
          <span class="record-output-product">${escapeHtml(output.productName || '--')}${outputCount > 2 && index === 1 ? `<button class="btn-text record-output-more" type="button" data-row-action="detail" data-id="${escapeHtml(order.id)}">更多</button>` : ''}</span>
        </td>
        <td class="record-output-qty-cell">${escapeHtml(output.actualQty !== '' && output.actualQty != null ? `${output.actualQty}${output.unit || ''}` : '--')}</td>
        ${tailCells(index)}
      </tr>
    `).join('');
  }

  function renderTable(orders = state.visibleOrders) {
    state.visibleOrders = orders;
    const tbody = document.getElementById('recTableBody');
    tbody.innerHTML = orders.map(renderOrderRows).join('');
    document.querySelector('.processing-record-page .page-total').textContent = `共 ${orders.length} 条数据`;
    updateToggleAllCheckbox();
  }

  function updateToggleAllCheckbox() {
    const checkbox = document.querySelector('.processing-record-page [data-action="toggle-all"]');
    if (!checkbox) return;
    const allChecked = state.visibleOrders.length > 0 && state.visibleOrders.every((order) => state.selectedIds.has(order.id));
    checkbox.classList.toggle('checked', allChecked);
    checkbox.setAttribute('aria-checked', String(allChecked));
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

  function showOperationToast(message) {
    let toast = document.getElementById('processingRecordToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'processingRecordToast';
      toast.className = 'processing-record-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showOperationToast.timer);
    showOperationToast.timer = setTimeout(() => toast.classList.remove('visible'), 2000);
  }

  function renderDetailFooter(order, displayStatus) {
    const id = escapeHtml(order.id);
    const returnButton = '<button class="btn" type="button" data-action="back-to-list">返回</button>';
    if (displayStatus === '待确认') {
      return `<button class="btn btn-primary" type="button" data-action="detail-submit" data-id="${id}">确认保存</button>${returnButton}`;
    }
    if (displayStatus === '待审核') {
      return `
        <button class="btn btn-primary" type="button" data-action="detail-audit" data-approved="true" data-id="${id}">审核通过</button>
        <button class="btn btn-danger" type="button" data-action="detail-audit" data-approved="false" data-id="${id}">审核驳回</button>
        ${returnButton}
      `;
    }
    return returnButton;
  }

  function showDetail(id) {
    const order = state.orders.find((o) => o.id === id);
    if (!order) return;
    const displayStatus = getDisplayStatus(order);
    const statusClass = getStatusClass(displayStatus);
    const materialRows = (order.materials || []).map((m) => `
      <tr>
        <td>${productNetTag(m.productCode)}${escapeHtml(m.productName)}</td>
        <td>${escapeHtml(m.unit)}</td>
        <td>${m.stock ?? '--'}</td>
        <td>${m.avgPrice ?? '--'}</td>
        <td>${m.consumeQty ?? '--'}</td>
        <td>${((Number(m.consumeQty) || 0) * (Number(m.avgPrice) || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

    const outputRows = (order.outputs || []).map((o) => `
      <tr>
        <td>${productNetTag(o.productCode)}${escapeHtml(o.productName)}</td>
        <td>${escapeHtml(o.unit)}</td>
        <td>${o.refCoefficient ?? '--'}</td>
        <td>${o.refQty ?? '--'}</td>
        <td>${o.actualQty ?? '--'}</td>
        <td>${o.allocatedCost || '--'}</td>
        <td>${o.costPrice ? `${o.costPrice}/${escapeHtml(o.unit || '--')}` : '--'}</td>
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
      <div class="processing-detail-section">
        <h3>备注</h3>
        <div class="detail-remark-box">${escapeHtml(order.remark || '--')}</div>
      </div>
      <div class="processing-detail-section">
        <h3>附件</h3>
        <div class="detail-attachment-list">${renderAttachments(order.attachments)}</div>
      </div>
      <div class="processing-detail-section">
        <h3>操作记录</h3>
        <div class="detail-timeline">${renderOperationLogs(order.operationLogs)}</div>
      </div>
    `;
    document.getElementById('recDetailFooter').innerHTML = renderDetailFooter(order, displayStatus);
    document.querySelector('.processing-record-page').style.display = 'none';
    const detailPage = document.getElementById('recDetailPage');
    detailPage.style.display = 'flex';
  }

  function closeDetail() {
    document.querySelector('.processing-record-page').style.display = '';
    document.getElementById('recDetailPage').style.display = 'none';
    document.getElementById('recDetailFooter').innerHTML = '';
    if (new URLSearchParams(window.location.search).has('id')) {
      window.history.replaceState(null, '', './processing-record.html');
    }
  }

  function finishDetailOperation(updatedOrder) {
    if (!updatedOrder) {
      showOperationToast('操作失败，请刷新后重试');
      return false;
    }
    closeDetail();
    loadOrders();
    filterOrders();
    showOperationToast('操作成功');
    return true;
  }

  function bindEvents() {
    const root = document.querySelector('.processing-record-page');
    root.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'query') { filterOrders(); return; }
      if (action === 'reset') { resetFilters(); return; }
      if (action === 'back-to-list') { closeDetail(); return; }
      if (action === 'toggle-all') {
        const checkbox = event.target.closest('.custom-checkbox');
        const checked = !checkbox.classList.contains('checked');
        state.visibleOrders.forEach((order) => {
          if (checked) state.selectedIds.add(order.id);
          else state.selectedIds.delete(order.id);
        });
        renderTable(state.visibleOrders);
        return;
      }
      if (action === 'toggle-row') {
        const checkbox = event.target.closest('.custom-checkbox');
        const id = checkbox.dataset.id;
        if (state.selectedIds.has(id)) state.selectedIds.delete(id);
        else state.selectedIds.add(id);
        renderTable(state.visibleOrders);
        return;
      }

      const rowAction = event.target.closest('[data-row-action]');
      if (rowAction) {
        const id = rowAction.dataset.id;
        if (rowAction.dataset.rowAction === 'detail') {
          showDetail(id);
          return;
        }
      }
    });

    root.addEventListener('mouseover', (event) => {
      const row = event.target.closest('tr[data-order-id]');
      if (!row || row.contains(event.relatedTarget)) return;
      const orderId = row.dataset.orderId;
      root.querySelectorAll(`tr[data-order-id="${orderId}"]`).forEach((item) => item.classList.add('is-order-hover'));
    });

    root.addEventListener('mouseout', (event) => {
      const row = event.target.closest('tr[data-order-id]');
      if (!row || row.contains(event.relatedTarget)) return;
      const orderId = row.dataset.orderId;
      root.querySelectorAll(`tr[data-order-id="${orderId}"]`).forEach((item) => item.classList.remove('is-order-hover'));
    });

    document.getElementById('recDetailPage').addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'back-to-list') {
        closeDetail();
        return;
      }
      const actionButton = event.target.closest('[data-action]');
      if (action === 'detail-submit') {
        finishDetailOperation(window.ProcessingService.submit(actionButton.dataset.id));
        return;
      }
      if (action === 'detail-audit') {
        const approved = actionButton.dataset.approved === 'true';
        finishDetailOperation(window.ProcessingService.audit(actionButton.dataset.id, approved));
      }
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
