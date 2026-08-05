(function () {
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M19 12H9"/></svg>';
  const escapeHtml = (value) => window.DomUtils.escapeHtml(value);
  const getStatusClass = (status) => status === 'COMPLETED' ? 'online' : (status === 'PENDING_AUDIT' ? 'draft' : 'offline');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const returnTo = ['processing-record.html', 'outbound.html', 'inbound.html'].includes(params.get('returnTo'))
    ? params.get('returnTo')
    : 'inbound.html';
  const order = window.InboundService.getDetail(id);

  function renderProductImg() {
    return `<div class="detail-product-img">图片</div>`;
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

  function render() {
    if (!order) {
      return `<div class="page-card processing-detail-page"><div class="processing-detail-page-header"><button class="back-link" type="button" data-action="back-to-list">${backIcon}<span>返回</span></button><h1>入库单详情</h1></div><div class="processing-detail-page-body"><div class="page-empty-state">未找到入库单</div></div></div>`;
    }
    const itemRows = (order.items || []).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${renderProductImg()}</td>
        <td>
          <div class="detail-product-name">${escapeHtml(item.productName)}</div>
          <div class="detail-product-sub">(${escapeHtml(item.unit)}/${escapeHtml(item.brand || '--')}/${escapeHtml(item.spec || '--')})</div>
        </td>
        <td>${escapeHtml(item.unit)}</td>
        <td>${escapeHtml(String(item.actualQty ?? '--'))}</td>
        <td>${escapeHtml(String(item.unitPrice ?? '--'))}</td>
        <td>${escapeHtml(String(item.amount ?? '--'))}</td>
        <td>${escapeHtml(item.productionDate || '--')}</td>
        <td>${(() => { const c = (item.qualityFiles && item.qualityFiles.length) || 0; return c > 0 ? `${c}份` : '--'; })()}</td>
      </tr>
    `).join('');

    return `<div class="page-card processing-detail-page inbound-detail-page">
      <div class="processing-detail-page-header">
        <button class="back-link" type="button" data-action="back-to-list">${backIcon}<span>返回</span></button>
        <h1>入库单详情</h1>
        <div class="detail-header-status">
          <span class="detail-header-status-label">单据状态</span>
          <span class="status-tag ${getStatusClass(order.status)}">${escapeHtml(window.BusinessRules.statusLabel('inboundOrders', order.status))}</span>
        </div>
      </div>
      <div class="processing-detail-page-body">
        <div class="processing-detail-section">
          <h3>基本信息</h3>
          <div class="processing-detail-info">
            <div class="info-item"><span class="info-label">入库单号：</span><span class="info-value">${escapeHtml(order.id)}</span></div>
            <div class="info-item"><span class="info-label">仓库：</span><span class="info-value">${escapeHtml(order.warehouseName)}</span></div>
            <div class="info-item"><span class="info-label">入库类型：</span><span class="info-value">${escapeHtml(order.entryType)}</span></div>
            <div class="info-item"><span class="info-label">关联单号：</span><span class="info-value">${escapeHtml(order.relNo)}</span></div>
            <div class="info-item"><span class="info-label">入库时间：</span><span class="info-value">${escapeHtml(order.entryTime)}</span></div>
            <div class="info-item"><span class="info-label">供应商/采购员/客户：</span><span class="info-value">${escapeHtml(order.supplierPurchaserCustomerName)}</span></div>
            <div class="info-item"><span class="info-label">采购负责人：</span><span class="info-value">${escapeHtml(order.purchaserLeaderName)}</span></div>
            <div class="info-item"><span class="info-label">制单人：</span><span class="info-value">${escapeHtml(order.creator)}</span></div>
          </div>
        </div>
        <div class="processing-detail-section">
          <h3>入库明细</h3>
          <table class="processing-detail-table inbound-detail-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>图片</th>
                <th style="min-width:230px">商品名称(计量单位/品牌/规格)</th>
                <th>计量单位</th>
                <th>入库数量</th>
                <th>单价</th>
                <th>入库金额</th>
                <th>生产日期</th>
                <th>质检报告</th>
              </tr>
            </thead>
            <tbody>${itemRows || '<tr><td colspan="9" style="text-align:center;color:var(--text-tertiary);">暂无明细</td></tr>'}</tbody>
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
      </div>
    </div>`;
  }

  window.AppShell.mount({ title: '入库管理', content: render() });
  document.getElementById('pageContent').addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back-to-list"]')) window.location.href = `./${returnTo}`;
  });
})();
