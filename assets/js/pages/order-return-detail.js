(function () {
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const root = window.AppShell.mount({ title: '订单退货', content: document.getElementById('returnDetailTemplate').innerHTML });
  const content = document.getElementById('returnDetailContent');
  const statusMap = { PENDING: '待审核', APPROVED: '已审核', REJECTED: '已驳回', CLOSED: '已关闭' };
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const money = (value) => Number(value || 0).toFixed(2);
  const item = (label, value) => `<div class="order-detail-item"><dt>${label}</dt><dd>${esc(value || '--')}</dd></div>`;

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back"]')) window.location.href = './order-return.html';
  });

  window.OperationsService.get('returns', id).then((record) => {
    if (!record) return (content.innerHTML = '<div class="detail-empty">退货单不存在或已删除</div>');
    const lines = record.items?.length ? record.items : [{ goodsName: record.goodsName || '--', unit: '--', orderPrice: 0, shippedQty: 0, applyQty: 0, applyPrice: 0, applyAmount: 0, damageQty: 0, purchaseOrder: '--', remark: '' }];
    content.innerHTML = `<section class="order-status-strip"><span>单据状态</span><strong>${esc(statusMap[record.status] || record.status)}</strong></section>
      <section class="order-detail-section"><h2>退货信息</h2><dl class="order-detail-grid">
      ${item('退货单号', record.returnNo)}${item('客户名称', record.customerName)}${item('食堂名称', record.canteen)}${item('退货原因', record.reason)}
      ${item('关联订单号', record.orderNo)}${item('退货时间', record.createdAt)}${item('单据来源', record.source || '平台添加')}${item('退回仓库', record.warehouse)}
      ${item('司机', record.driver)}${item('验收时间', record.acceptedAt)}${item('制单人', record.creator)}${item('订单备注', record.remark)}
      ${item('附件', record.attachment)}${record.rejectReason ? item('驳回原因', record.rejectReason) : ''}</dl></section>
      <section class="order-detail-section"><div class="order-section-heading"><h2>退货商品</h2><strong>退款金额：¥${money(record.refundAmount)}</strong></div><div class="order-goods-table-wrap"><table class="order-goods-table">
      <thead><tr><th>序号</th><th>图片</th><th>单号</th><th>商品名称（计量单位/品牌/规格）</th><th>计量单位</th><th>下单单价</th><th>发货数量</th><th>退货数量</th><th>退货单价</th><th>退货金额</th><th>报损数量</th><th>关联采购单</th><th>备注</th></tr></thead>
      <tbody>${lines.map((line, index) => `<tr><td>${index + 1}</td><td><span class="goods-thumb">暂无图片</span></td><td>${esc(record.orderNo)}</td><td class="goods-name-cell">${esc(line.goodsName)}</td><td>${esc(line.unit)}</td><td>${money(line.orderPrice)}</td><td>${line.shippedQty || 0}</td><td>${line.applyQty || 0}</td><td>${money(line.applyPrice)}</td><td>${money(line.applyAmount ?? line.applyQty * line.applyPrice)}</td><td>${line.damageQty || 0}</td><td>${esc(line.purchaseOrder || '--')}</td><td>${esc(line.remark || '--')}</td></tr>`).join('')}</tbody>
      </table></div></section>`;
  });
})();
