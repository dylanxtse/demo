(function () {
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M19 12H9"/></svg>';
  const escapeHtml = (value) => window.DomUtils.escapeHtml(value);
  const getStatusClass = (status) => status === '已完成' ? 'online' : (status === '待审核' ? 'draft' : 'offline');
  const id = new URLSearchParams(window.location.search).get('id');
  const order = window.OutboundService.getDetail(id);

  function render() {
    if (!order) return `<div class="page-card processing-detail-page"><div class="processing-detail-page-header"><button class="back-link" type="button" data-action="back-to-list">${backIcon}<span>返回</span></button><h1>出库单详情</h1></div><div class="processing-detail-page-body"><div class="page-empty-state">未找到出库单</div></div></div>`;
    const itemRows = (order.items || []).map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.productName)}</td><td>${escapeHtml(item.unit)}</td><td>${escapeHtml(String(item.conversionRate ?? '--'))}</td><td>${escapeHtml(String(item.currentStock ?? '--'))}</td><td>${escapeHtml(String(item.outboundQty ?? '--'))}</td><td>${escapeHtml(String(item.unitPrice ?? '--'))}</td><td>${escapeHtml(String(item.amount ?? '--'))}</td><td>${escapeHtml(item.remark || '--')}</td></tr>`).join('');
    return `<div class="page-card processing-detail-page"><div class="processing-detail-page-header"><button class="back-link" type="button" data-action="back-to-list">${backIcon}<span>返回</span></button><h1>出库单详情</h1></div><div class="processing-detail-page-body">
      <div class="processing-detail-section"><h3>基本信息</h3><div class="processing-detail-info">
        <div class="info-item"><span class="info-label">出库单号：</span><span class="info-value">${escapeHtml(order.id)}</span></div><div class="info-item"><span class="info-label">出库时间：</span><span class="info-value">${escapeHtml(order.outboundTime)}</span></div><div class="info-item"><span class="info-label">出库类型：</span><span class="info-value">${escapeHtml(order.outboundType)}</span></div><div class="info-item"><span class="info-label">出库金额：</span><span class="info-value">${escapeHtml(order.outboundAmt)}</span></div><div class="info-item"><span class="info-label">仓库：</span><span class="info-value">${escapeHtml(order.warehouseName)}</span></div><div class="info-item"><span class="info-label">供应商/采购员/客户：</span><span class="info-value">${escapeHtml(order.supplierPurchaserCustomerName)}</span></div><div class="info-item"><span class="info-label">关联单号：</span><span class="info-value">${escapeHtml(order.relNo)}</span></div><div class="info-item"><span class="info-label">单据状态：</span><span class="info-value"><span class="status-tag ${getStatusClass(order.status)}">${escapeHtml(order.status)}</span></span></div><div class="info-item"><span class="info-label">添加人：</span><span class="info-value">${escapeHtml(order.creator)}</span></div><div class="info-item"><span class="info-label">备注：</span><span class="info-value">${escapeHtml(order.remark || '--')}</span></div>
      </div></div><div class="processing-detail-section"><h3>出库明细</h3><table class="processing-detail-table"><thead><tr><th>序号</th><th>商品名称</th><th>计量单位</th><th>换算率</th><th>现有库存</th><th>出库数量</th><th>出库单价</th><th>出库金额</th><th>备注</th></tr></thead><tbody>${itemRows || '<tr><td colspan="9">暂无数据</td></tr>'}</tbody></table></div>
    </div></div>`;
  }

  window.AppShell.mount({ title: '出库管理', content: render() });
  document.getElementById('pageContent').addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back-to-list"]')) window.location.href = './outbound.html';
  });
})();
