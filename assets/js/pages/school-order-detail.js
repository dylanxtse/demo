(function () {
  const service = window.SchoolOrderService;
  if (!service) return;
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const order = service.get(id);
  if (!order) {
    window.location.href = './school-order-management.html';
    return;
  }

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const value = (item, fallback = '--') => item === '' || item == null ? fallback : escapeHtml(item);
  const amount = (item) => item == null || item === '' ? '--' : Number(item).toFixed(2).replace(/\.00$/, '');
  const qty = (item) => item == null || item === '' ? '--' : Number(item).toFixed(2).replace(/\.00$/, '');
  const lineDisplay = (line) => line.displayName || `${line.productName || line.goodsName || '--'}(${line.unit || '--'}/${line.brand || '--'}/${line.spec || '--'})`;
  const mediaCount = (items) => Array.isArray(items) && items.length ? `${items.length}项` : '--';
  const operationDescription = (log) => [
    log.operator || '',
    log.result || '',
    log.time || '',
    log.description || log.desc || ''
  ].filter(Boolean).join(' ');
  const renderOperationLogs = (logs) => {
    if (!logs || !logs.length) return '<span class="detail-empty">--</span>';
    return logs.map((log) => `
      <div class="detail-timeline-item">
        <div class="detail-timeline-node"></div>
        <div class="detail-timeline-content">
          <span class="detail-timeline-action">${escapeHtml(log.action || '--')}</span>
          <span class="detail-timeline-desc">${escapeHtml(operationDescription(log) || '--')}</span>
        </div>
      </div>
    `).join('');
  };

  function navigate(url) {
    if (window.AppNavigationGuard?.navigate) window.AppNavigationGuard.navigate(url);
    else window.location.href = url;
  }

  function render() {
    const lines = order.items || [];
    const content = `<section class="school-order-detail-page" id="schoolOrderDetailPage" aria-label="订单详情">
      <header class="school-order-detail-header"><button type="button" class="school-order-detail-back" data-action="back" aria-label="返回订单管理">‹ <span>返回</span></button><h1>订单详情</h1></header>
      <div class="school-order-detail-body">
        <section class="school-order-detail-summary" aria-label="订单基础信息">
          <dl><dt>订单号</dt><dd>${value(order.orderNo)}</dd></dl><dl><dt>供货企业</dt><dd title="${escapeHtml(order.supplierName)}">${value(order.supplierName)}</dd></dl><dl><dt>食堂</dt><dd>${value(order.canteen)}</dd></dl><dl><dt>订单标签</dt><dd>${value(order.orderTag)}</dd></dl>
          <dl><dt>期望送达时间</dt><dd>${value(order.expectedAt)}</dd></dl><dl><dt>单据来源</dt><dd>${value(order.source)}</dd></dl><dl><dt>添加时间</dt><dd>${value(order.createdAt)}</dd></dl><dl><dt>制单人</dt><dd>${value(order.creator)}</dd></dl>
          <dl><dt>发货时间</dt><dd>${value(order.shippingAt)}</dd></dl><dl><dt>司机</dt><dd>${value(order.driver)}</dd></dl><dl><dt>验收时间</dt><dd>${value(order.acceptedAt)}</dd></dl><dl><dt>是否补单</dt><dd>${value(order.supplement)}</dd></dl>
        </section>
        <section class="school-order-detail-section">
          <div class="school-order-detail-section-title"><h2>商品明细</h2></div>
          <div class="school-order-detail-table-wrap"><table class="school-order-detail-table"><colgroup>${Array.from({ length: 22 }, (_, index) => `<col data-col="${index + 1}">`).join('')}</colgroup><thead><tr>
            <th>序号</th><th>图片</th><th>商品名称（计量单位/品牌/规格）</th><th>质检报告</th><th>商品编号</th><th>计量单位</th><th>下单单价</th><th>下单数量</th><th>下单小计</th><th>发货数量</th><th>发货小计</th><th>验货数量</th><th>验货小计</th><th>退货数量</th><th>退货小计</th><th>对账数量</th><th>对账小计</th><th>溯源码</th><th>备注</th><th>生产日期</th><th>验货图片</th><th>验货视频</th>
          </tr></thead><tbody>${lines.map((line, index) => `<tr>
            <td>${index + 1}</td><td><span class="school-order-image-placeholder" aria-label="商品图片">图片</span></td><td class="detail-goods-name" title="${escapeHtml(lineDisplay(line))}">${escapeHtml(lineDisplay(line))}</td><td>${value(line.qualityReport)}</td><td>${value(line.productCode)}</td><td>${value(line.unit)}</td><td>${amount(line.orderPrice)}</td><td>${qty(line.orderQty)}</td><td>${amount(line.orderSubtotal)}</td><td>${qty(line.shippedQty)}</td><td>${amount(line.shippedSubtotal)}</td><td>${qty(line.acceptedQty)}</td><td>${amount(line.acceptedSubtotal)}</td><td>${qty(line.returnQty)}</td><td>${amount(line.returnSubtotal)}</td><td>${qty(line.reconciledQty)}</td><td>${amount(line.reconciledSubtotal)}</td><td class="detail-trace-code">${value(line.traceCode)}</td><td>${value(line.remark)}</td><td>${value(line.productionDate)}</td><td>${mediaCount(line.inspectionImages)}</td><td>${mediaCount(line.inspectionVideos)}</td>
          </tr>`).join('')}</tbody><tfoot><tr><td colspan="8">金额合计（元）</td><td>${amount(order.orderAmount)}</td><td></td><td>${amount(order.shippingAmount)}</td><td></td><td>${amount(order.acceptedAmount)}</td><td></td><td>${amount(order.returnAmount)}</td><td></td><td>${amount(order.reconciliationAmount)}</td><td colspan="5"></td></tr></tfoot></table></div>
        </section>
        <p class="school-order-detail-note">订单备注：${value(order.remark)}</p>
        <section class="processing-detail-section school-order-log-section"><h3>操作记录</h3><div class="detail-timeline">${renderOperationLogs(order.operationLogs)}</div></section>
      </div>
      <footer class="school-order-detail-actions"><button type="button" class="btn" data-action="back">返回</button></footer>
    </section>`;
    const root = window.AppShell.mount({ title: '订单详情', content, variant: 'school', companyName: service.SCHOOL_NAME, emptyText: '订单详情' });
    const page = root.querySelector('#schoolOrderDetailPage');
    page.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      if (button.dataset.action === 'back') navigate('./school-order-management.html');
    });
  }

  render();
})();
