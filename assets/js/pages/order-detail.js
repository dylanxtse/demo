(function () {
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M19 12H9"/></svg>';
  const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const money = (value) => Number(value || 0).toFixed(2);

  const formatTraceCode = (line) => {
    if (!line.goodsCode) return '--';
    const dateStr = (line.productionDate || '').replace(/-/g, '');
    return `SYM${dateStr}${line.goodsCode}`;
  };

  const statusMap = {
    DRAFT: '暂存',
    PENDING: '待审核',
    REJECTED: '已驳回',
    APPROVED: '已审核',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CLOSED: '已关闭'
  };

  const getStatusClass = (status) => {
    if (status === 'COMPLETED') return 'online';
    if (status === 'PENDING' || status === 'DRAFT') return 'draft';
    if (status === 'REJECTED') return 'cancelled';
    return 'offline';
  };

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  function renderProductImg() {
    return `<div class="detail-product-img">图片</div>`;
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

  function infoItem(label, value) {
    return `<div class="info-item"><span class="info-label">${label}：</span><span class="info-value">${escapeHtml(value || '--')}</span></div>`;
  }

  function render(order) {
    if (!order) {
      return `<div class="page-card processing-detail-page order-detail-page">
        <div class="processing-detail-page-header">
          <button class="back-link" type="button" data-action="back">${backIcon}<span>返回</span></button>
          <h1>订单详情</h1>
        </div>
        <div class="processing-detail-page-body"><div class="page-empty-state">未找到订单</div></div>
      </div>`;
    }

    const lines = order.items && order.items.length ? order.items : [];
    const itemRows = lines.map((line, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${renderProductImg()}</td>
        <td>
          <div class="detail-product-name">${line.isNetVegetable ? '<span class="net-vegetable-tag">净菜</span>' : ''}${escapeHtml(line.goodsName)}</div>
          <div class="detail-product-sub">(${escapeHtml(line.unit)}/${escapeHtml(line.brand || '--')}/${escapeHtml(line.spec || '--')})</div>
        </td>
        <td>${escapeHtml(line.goodsCode || line.goodsId || '--')}</td>
        <td>${escapeHtml(line.unit)}</td>
        <td>${money(line.unitPrice)}</td>
        <td>${line.quantity || 0}</td>
        <td>${money(line.subtotal ?? line.quantity * line.unitPrice)}</td>
        <td>${line.shippedQty || 0}</td>
        <td>${money(line.shippedAmount)}</td>
        <td>${line.returnQty || 0}</td>
        <td>${money(line.returnAmount)}</td>
        <td>${line.reconciliationQty || 0}</td>
        <td>${money(line.reconciliationAmount)}</td>
        <td>${line.acceptedQty || 0}</td>
        <td>${money(line.acceptedAmount)}</td>
        <td>${escapeHtml(formatTraceCode(line))}</td>
        <td>${escapeHtml(line.remark || '--')}</td>
        <td>${escapeHtml(line.productionDate || '--')}</td>
        <td>${(line.inspectionImages && line.inspectionImages.length) ? `${line.inspectionImages.length}张` : '--'}</td>
        <td>${(line.inspectionVideos && line.inspectionVideos.length) ? `${line.inspectionVideos.length}个` : '--'}</td>
      </tr>
    `).join('');

    return `<div class="page-card processing-detail-page order-detail-page">
      <div class="processing-detail-page-header">
        <button class="back-link" type="button" data-action="back">${backIcon}<span>返回</span></button>
        <h1>订单详情</h1>
        <div class="detail-header-status">
          <span class="detail-header-status-label">单据状态</span>
          <span class="status-tag ${getStatusClass(order.status)}">${escapeHtml(statusMap[order.status] || order.status || '--')}</span>
        </div>
      </div>
      <div class="processing-detail-page-body">
        <div class="processing-detail-section">
          <h3>基本信息</h3>
          <div class="processing-detail-info">
            ${infoItem('订单号', order.orderNo)}
            ${infoItem('客户名称', order.customerName)}
            ${infoItem('食堂', order.canteen)}
            ${infoItem('采购类型', order.purchaseType || '销售订单')}
            ${infoItem('订单标签', order.orderTag)}
            ${infoItem('期望送达时间', order.expectedAt)}
            ${infoItem('单据来源', order.source)}
            ${infoItem('添加时间', order.createdAt)}
            ${infoItem('制单人', order.creator)}
            ${infoItem('发货时间', order.shippingAt)}
            ${infoItem('司机', order.driver)}
            ${infoItem('验收时间', order.acceptedAt)}
            ${infoItem('是否补单', order.supplement)}
            ${order.rejectReason ? infoItem('驳回原因', order.rejectReason) : ''}
          </div>
        </div>
        <div class="processing-detail-section">
          <h3>商品信息</h3>
          <div class="order-detail-table-wrap">
          <table class="processing-detail-table order-detail-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>图片</th>
                <th style="min-width:230px">商品名称(计量单位/品牌/规格)</th>
                <th>商品编号</th>
                <th>计量单位</th>
                <th>下单单价</th>
                <th>下单数量</th>
                <th>下单小计</th>
                <th>发货数量</th>
                <th>发货小计</th>
                <th>退货数量</th>
                <th>退货小计</th>
                <th>对账数量</th>
                <th>对账小计</th>
                <th>验货数量</th>
                <th>验货金额</th>
                <th>编码</th>
                <th>备注</th>
                <th>生产日期</th>
                <th>验货图片</th>
                <th>验货视频</th>
              </tr>
            </thead>
            <tbody>${itemRows || '<tr><td colspan="21" style="text-align:center;color:var(--text-tertiary);">暂无明细</td></tr>'}</tbody>
          </table>
          </div>
        </div>
        <div class="processing-detail-section">
          <h3>备注</h3>
          <div class="detail-remark-box">${escapeHtml(order.remark || '--')}</div>
        </div>
        <div class="processing-detail-section">
          <h3>操作记录</h3>
          <div class="detail-timeline">${renderOperationLogs(order.operationLogs)}</div>
        </div>
      </div>
    </div>`;
  }

  window.OperationsService.get('orders', id).then((order) => {
    window.AppShell.mount({ title: '订单管理', content: render(order) });
    document.getElementById('pageContent').addEventListener('click', (event) => {
      if (event.target.closest('[data-action="back"]')) {
        window.location.href = './order-management.html';
      }
    });
  }).catch((error) => {
    window.AppShell.mount({ title: '订单管理', content: `<div class="page-card processing-detail-page order-detail-page"><div class="processing-detail-page-header"><button class="back-link" type="button" onclick="window.location.href='./order-management.html'">${backIcon}<span>返回</span></button><h1>订单详情</h1></div><div class="processing-detail-page-body"><div class="page-empty-state">${escapeHtml(error.message || '订单加载失败')}</div></div></div>` });
  });
})();
