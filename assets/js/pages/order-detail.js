(function () {
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M19 12H9"/></svg>';
  const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const money = (value) => Number(value || 0).toFixed(2);
  const productIsNetVegetable = (line) => {
    const code = line.goodsCode || line.goodsId;
    const catalogProduct = (window.DemoStore?.get('products') || window.MockProducts || []).find((product) => product.code === code || product.id === code);
    if (catalogProduct) return Boolean(catalogProduct.isNetVegetable);
    return Boolean(line.isNetVegetable);
  };

  const formatTraceCode = (line) => {
    if (!line.goodsCode) return '--';
    const dateStr = (line.productionDate || '').replace(/-/g, '');
    return `SYM${dateStr}${line.goodsCode}`;
  };

  const statusMap = {
    DRAFT: '暂存',
    PENDING: '待审核',
    PENDING_CONFIRM: '待确认',
    PENDING_AUDIT: '待审核',
    READY_FOR_SORTING: '待分拣',
    READY_FOR_SHIPPING: '待发货',
    REJECTED: '已驳回',
    APPROVED: '已审核',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    SHIPPED: '已发货',
    CLOSED: '已关闭',
    REVOKED: '已撤销'
  };

  const getStatusClass = (status) => {
    if (status === 'COMPLETED' || status === 'SHIPPED') return 'online';
    if (['PENDING', 'PENDING_CONFIRM', 'PENDING_AUDIT', 'READY_FOR_SHIPPING', 'DRAFT'].includes(status)) return 'draft';
    if (['REJECTED', 'REVOKED'].includes(status)) return 'cancelled';
    return 'offline';
  };

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const orderNo = params.get('orderNo');

  function renderProductImg() {
    return `<div class="detail-product-img">图片</div>`;
  }

  function isMergeParent(order) {
    return order?.isMergeParent === true || order?.isMergeParent === 'true' || order?.isMergeParent === '是';
  }

  function renderOperationLogs(logs, order) {
    if (!logs || !logs.length) return '<span class="detail-empty">--</span>';
    return logs.map((log, index) => `
      <div class="detail-timeline-item">
        <div class="detail-timeline-node"></div>
        <div class="detail-timeline-content">
          <span class="detail-timeline-action">${escapeHtml(log.action)}</span>
          <span class="detail-timeline-desc">${escapeHtml(log.desc)}</span>
          ${isMergeParent(order) && index === 0 ? '<button class="detail-timeline-link" type="button" data-action="view-merge-snapshot">查看详情</button>' : ''}
        </div>
      </div>
    `).join('');
  }

  function getMergeSnapshotOrders(order) {
    if (Array.isArray(order?.mergeSourceOrderSnapshots) && order.mergeSourceOrderSnapshots.length) {
      return order.mergeSourceOrderSnapshots;
    }
    const sourceNumbers = Array.isArray(order?.mergeSourceOrderNos) ? order.mergeSourceOrderNos : [];
    const sourceIds = Array.isArray(order?.mergeSourceOrderIds) ? order.mergeSourceOrderIds : [];
    const sourceOrders = window.DemoStore?.get('orders') || window.MockOperations?.orders || [];
    return sourceOrders.filter((source) => sourceNumbers.includes(source.orderNo) || sourceIds.includes(source.id));
  }

  function snapshotInfoItem(label, value) {
    const displayValue = value == null || value === '' ? '--' : value;
    return `<div><span>${label}：</span><strong>${escapeHtml(displayValue)}</strong></div>`;
  }

  function renderMergeSnapshotBody(order) {
    const snapshots = getMergeSnapshotOrders(order);
    if (!snapshots.length) return '<div class="detail-empty">暂无合并原订单快照</div>';
    return snapshots.map((snapshot, index) => {
      const lines = Array.isArray(snapshot.items) ? snapshot.items : [];
      const status = statusMap[snapshot.status] || snapshot.status || '--';
      return `
        <section class="order-merge-snapshot-card">
          <div class="order-merge-snapshot-title"><span>${escapeHtml(snapshot.orderNo || '--')}</span></div>
          <div class="order-merge-snapshot-meta">
            ${snapshotInfoItem('客户名称', snapshot.customerName)}
            ${snapshotInfoItem('食堂', snapshot.canteen)}
            ${snapshotInfoItem('订单标签', snapshot.orderTag)}
            ${snapshotInfoItem('期望送达时间', snapshot.expectedAt)}
            ${snapshotInfoItem('单据来源', snapshot.source)}
            ${snapshotInfoItem('单据状态', status)}
            ${snapshotInfoItem('商品种类数', snapshot.productCount ?? lines.length)}
            ${snapshotInfoItem('下单金额', `¥${money(snapshot.orderAmount)}`)}
          </div>
          <table class="order-merge-snapshot-table">
            <thead><tr><th>商品</th><th>商品编号</th><th>计量单位</th><th>单价</th><th>下单数量</th><th>下单小计</th></tr></thead>
            <tbody>${lines.length ? lines.map((line) => {
              const quantity = line.quantity ?? line.orderQty ?? 0;
              const subtotal = line.subtotal ?? Number(quantity) * Number(line.unitPrice || 0);
              return `<tr><td>${escapeHtml(line.goodsName || line.productName || '--')}</td><td>${escapeHtml(line.goodsCode || line.productId || '--')}</td><td>${escapeHtml(line.unit || line.measurementUnit || '--')}</td><td>¥${money(line.unitPrice)}</td><td>${escapeHtml(quantity)}</td><td>¥${money(subtotal)}</td></tr>`;
            }).join('') : '<tr><td colspan="6" class="detail-empty">暂无商品明细</td></tr>'}</tbody>
          </table>
        </section>
      `;
    }).join('');
  }

  function openMergeSnapshotModal(order) {
    const overlay = document.getElementById('orderMergeSnapshotOverlay');
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="operations-modal-backdrop" data-merge-snapshot-backdrop>
        <section class="operations-modal is-detail order-merge-snapshot-modal" role="dialog" aria-modal="true" aria-label="合并订单详情">
          <header class="operations-modal-header"><h3>合并订单详情</h3><button type="button" data-action="close-merge-snapshot" aria-label="关闭">×</button></header>
          <div class="operations-modal-body"><div class="order-merge-snapshot-list">${renderMergeSnapshotBody(order)}</div></div>
          <footer class="operations-modal-footer"><button class="btn" type="button" data-action="close-merge-snapshot">关闭</button></footer>
        </section>
      </div>`;
  }

  function closeMergeSnapshotModal() {
    const overlay = document.getElementById('orderMergeSnapshotOverlay');
    if (overlay) overlay.innerHTML = '';
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
    const itemRows = lines.map((line, index) => {
      const productDisplay = window.DomUtils.formatProductDisplay(line);
      const productTag = productIsNetVegetable(line) ? '<span class="net-vegetable-tag">净菜</span>' : '';
      return `
      <tr>
        <td>${index + 1}</td>
        <td>${renderProductImg()}</td>
        <td>
          <span class="product-display-text" title="${escapeHtml(productDisplay)}">${productTag}${escapeHtml(productDisplay)}</span>
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
    `;
    }).join('');

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
                <th style="min-width:230px">商品名称（计量单位/品牌/规格）</th>
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
                <th>溯源码</th>
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
          <div class="detail-timeline">${renderOperationLogs(order.operationLogs, order)}</div>
        </div>
      </div>
    </div><div id="orderMergeSnapshotOverlay"></div>`;
  }

  async function loadOrder() {
    const direct = await window.OperationsService.get('orders', id);
    if (direct) return direct;
    if (orderNo) {
      const result = await window.OperationsService.list('orders', { page: 1, pageSize: 1000, condition: { orderNo } });
      const matched = result.items[0];
      if (matched) return matched;
    }
    return (window.DemoStore?.get('orders') || window.MockOperations?.orders || []).find((order) => order.id === id || (orderNo && order.orderNo === orderNo)) || null;
  }

  loadOrder().then((order) => {
    window.AppShell.mount({ title: '订单管理', content: render(order) });
    document.getElementById('pageContent').addEventListener('click', (event) => {
      if (event.target.closest('[data-action="back"]')) {
        window.location.href = './order-management.html';
        return;
      }
      if (event.target.closest('[data-action="view-merge-snapshot"]')) {
        openMergeSnapshotModal(order);
        return;
      }
      if (event.target.closest('[data-action="close-merge-snapshot"]') || event.target.matches('[data-merge-snapshot-backdrop]')) closeMergeSnapshotModal();
    });
  }).catch((error) => {
    window.AppShell.mount({ title: '订单管理', content: `<div class="page-card processing-detail-page order-detail-page"><div class="processing-detail-page-header"><button class="back-link" type="button" onclick="window.location.href='./order-management.html'">${backIcon}<span>返回</span></button><h1>订单详情</h1></div><div class="processing-detail-page-body"><div class="page-empty-state">${escapeHtml(error.message || '订单加载失败')}</div></div></div>` });
  });
})();
