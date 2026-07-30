(function () {
  const statusMap = {
    DRAFT: '暂存',
    PENDING: '待审核',
    REJECTED: '已驳回',
    APPROVED: '已审核',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CLOSED: '已关闭'
  };
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const root = window.AppShell.mount({
    title: '订单管理',
    content: document.getElementById('orderDetailTemplate').innerHTML
  });
  const content = document.getElementById('orderDetailContent');

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function money(value) {
    return Number(value || 0).toFixed(2);
  }

  function infoItem(label, value) {
    return `<div class="order-detail-item"><dt>${label}</dt><dd>${escapeHtml(value || '--')}</dd></div>`;
  }

  function normalizeLines(order) {
    if (order.items?.length) return order.items;
    return [{
      id: 'FALLBACK',
      goodsName: '大白菜（斤/--/散装）',
      goodsCode: 'SP0300019',
      unit: '斤',
      unitPrice: Number(order.orderAmount || 0),
      quantity: Number(order.productCount || 1),
      subtotal: Number(order.orderAmount || 0),
      shippedQty: order.shippingAmount ? Number(order.productCount || 1) : 0,
      shippedAmount: Number(order.shippingAmount || 0),
      returnQty: 0,
      returnAmount: Number(order.returnAmount || 0),
      reconciliationQty: order.reconciliationAmount ? Number(order.productCount || 1) : 0,
      reconciliationAmount: Number(order.reconciliationAmount || 0),
      acceptedQty: 0,
      acceptedAmount: 0,
      remark: order.remark || ''
    }];
  }

  function render(order) {
    const lines = normalizeLines(order);
    content.innerHTML = `
      <section class="order-status-strip">
        <span>单据状态</span>
        <strong>${escapeHtml(statusMap[order.status] || order.status || '--')}</strong>
      </section>
      <section class="order-detail-section">
        <h2>订单信息</h2>
        <dl class="order-detail-grid">
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
          ${infoItem('供应商名称', order.supplierName)}
          ${infoItem('采购员', order.buyer)}
          ${infoItem('采购负责人', order.purchaseManager)}
          ${infoItem('订单备注', order.remark)}
          ${order.rejectReason ? infoItem('驳回原因', order.rejectReason) : ''}
        </dl>
      </section>
      <section class="order-detail-section">
        <div class="order-section-heading"><h2>商品信息</h2><button class="btn btn-sm" type="button" id="addFileButton">添加文件</button></div>
        <div class="order-goods-table-wrap">
          <table class="order-goods-table order-detail-goods">
            <thead><tr><th>序号</th><th>图片</th><th>商品名称（计量单位/品牌/规格）</th><th>质检报告</th><th>商品编号</th><th>计量单位</th><th>下单单价</th><th>下单数量</th><th>下单小计</th><th>发货数量</th><th>发货小计</th><th>退货数量</th><th>退货小计</th><th>对账数量</th><th>对账小计</th><th>验货数量</th><th>验货金额</th><th>溯源码</th><th>备注</th><th>生产日期</th><th>验货图片</th><th>验货视频</th></tr></thead>
            <tbody>${lines.map((line, index) => `<tr>
              <td>${index + 1}</td><td><span class="goods-thumb">暂无图片</span></td>
              <td class="goods-name-cell">${escapeHtml(line.goodsName)}</td>
              <td>${line.qualityReport ? `<button class="btn-text">${escapeHtml(line.qualityReport)}</button>` : '--'}</td>
              <td>${escapeHtml(line.goodsCode || line.goodsId || '--')}</td><td>${escapeHtml(line.unit)}</td>
              <td>${money(line.unitPrice)}</td><td>${line.quantity || 0}</td><td>${money(line.subtotal ?? line.quantity * line.unitPrice)}</td>
              <td>${line.shippedQty || 0}</td><td>${money(line.shippedAmount)}</td><td>${line.returnQty || 0}</td><td>${money(line.returnAmount)}</td>
              <td>${line.reconciliationQty || 0}</td><td>${money(line.reconciliationAmount)}</td><td>${line.acceptedQty || 0}</td><td>${money(line.acceptedAmount)}</td>
              <td><button class="btn-text" data-trace="${escapeHtml(line.goodsCode || line.goodsId || '')}">查看溯源码</button></td>
              <td>${escapeHtml(line.remark || '--')}</td><td>${escapeHtml(line.productionDate || '--')}</td>
              <td>${escapeHtml(line.acceptedImage || '--')}</td><td>${escapeHtml(line.acceptedVideo || '--')}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </section>`;
  }

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back"]')) window.location.href = './order-management.html';
    const trace = event.target.closest('[data-trace]');
    if (trace) window.alert(trace.dataset.trace ? `溯源码：${trace.dataset.trace}` : '暂无溯源码');
    if (event.target.closest('#addFileButton')) window.alert('当前为 Mock 演示，文件入口已预留。');
  });

  window.OperationsService.get('orders', id).then((order) => {
    if (!order) {
      content.innerHTML = '<div class="detail-empty">订单不存在或已删除</div>';
      return;
    }
    render(order);
  }).catch((error) => {
    content.innerHTML = `<div class="detail-empty">${escapeHtml(error.message || '订单加载失败')}</div>`;
  });
})();
