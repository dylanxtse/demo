(function () {
  const service = window.SupplierBiddingService;
  const bidId = new URLSearchParams(window.location.search).get('id') || '';
  const row = service?.getBidDetail?.(bidId);

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const display = (value, fallback = '--') => value == null || value === '' ? fallback : escapeHtml(value);

  function formatDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    return match ? `${match[1]}-${Number(match[2])}-${Number(match[3])}` : display(value);
  }

  function formatDateTime(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (!match) return display(value);
    return `${match[1]}-${Number(match[2])}-${Number(match[3])}${match[4] ? ` ${Number(match[4])}:${match[5]}` : ''}`;
  }

  function unitLabel(value) {
    const units = { kg: '千克', KG: '千克', g: '克', G: '克', box: '箱', 箱: '箱', 斤: '斤', 桶: '桶', 瓶: '瓶', L: 'L', l: 'L' };
    return units[value] || value || '--';
  }

  function quantityLabel(product, index) {
    const unit = unitLabel(product.unit);
    return row.encryption ? `--${unit}` : `${120 + index * 20}${unit}`;
  }

  function latestPrice(product, index) {
    const prices = ['3.10', '5.78', '1.54', '3.67', '6.23', '3.67', '6.23'];
    return product.latestPrice || product.marketPrice || prices[index % prices.length];
  }

  function typeLabel(product) {
    return product.type || (product.brand && product.spec && product.spec !== '--' ? '预包装' : '农产品');
  }

  function productDescription(product, withIndicator = true) {
    const values = [product.code, product.brand || '--', product.spec || '--'];
    if (withIndicator) values.push(product.indicator || '--');
    return `${product.name || '--'}（${values.join(' / ')}）`;
  }

  function imageMarkup(product) {
    return product.image
      ? `<span class="supplier-bid-flow-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name || '商品图片')}"></span>`
      : '<span class="supplier-bid-flow-image">--</span>';
  }

  function numericSubtotal(product, index) {
    if (row.encryption || !product.price) return null;
    const amount = Number(product.price) * (120 + index * 20);
    return Number.isFinite(amount) ? amount.toFixed(2) : null;
  }

  function money(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : '--';
  }

  function renderNotFound() {
    const root = window.AppShell.mount({ title: '查看竞价', content: '', variant: 'supplier', emptyText: '竞价不存在' });
    root.querySelector('.page-empty-state').style.display = 'flex';
  }

  if (!row) {
    renderNotFound();
    return;
  }

  const products = service.getQuoteProducts(row.id);
  const customerLabel = row.school || row.customer || '--';
  const infoFields = [
    { label: '竞价编号', value: row.bidNo },
    { label: '供货周期', value: `${formatDate(row.supplyStart)} ~ ${formatDate(row.supplyEnd)}`, emphasis: true },
    { label: '需求截止时间', value: formatDateTime(row.demandDeadline) },
    { label: '开始报价时间', value: formatDateTime(row.quoteStart) },
    { label: '截止报价时间', value: formatDateTime(row.quoteEnd) },
    { label: '开标时间', value: formatDateTime(row.openTime) },
    { label: '标段', value: row.segment },
    { label: '客户', value: customerLabel },
    { label: '开标地点', value: row.openPlace }
  ];

  function renderInfoField(item) {
    return `<div class="supplier-bid-flow-field${item.emphasis ? ' is-emphasis' : ''}"><span class="label">${item.label}：</span><span class="value">${display(item.value)}</span></div>`;
  }

  function renderDemandRows(pageState) {
    const start = (pageState.page - 1) * pageState.pageSize;
    const visible = products.slice(start, start + pageState.pageSize);
    const rows = visible.map((product, index) => {
      const actualIndex = start + index;
      const subtotal = numericSubtotal(product, actualIndex);
      return `<tr>
        <td>${imageMarkup(product)}</td>
        <td><span class="supplier-bid-flow-product">${escapeHtml(productDescription(product, true))}</span></td>
        <td>${display(product.category)}</td>
        <td>${escapeHtml(typeLabel(product))}</td>
        <td>${escapeHtml(quantityLabel(product, actualIndex))}</td>
        <td>${escapeHtml(latestPrice(product, actualIndex))}</td>
        <td class="money">${product.price ? escapeHtml(product.price) : '--'}</td>
        <td class="money">${subtotal ? escapeHtml(money(subtotal)) : '--'}</td>
      </tr>`;
    }).join('');
    const total = products.reduce((sum, product, index) => sum + Number(numericSubtotal(product, index) || 0), 0);
    const totalText = total > 0 ? total.toFixed(2) : '--';
    return `<div class="supplier-bid-flow-table-wrap"><table class="supplier-bid-flow-table supplier-bid-detail-table">
      <colgroup><col class="col-image"><col class="col-product"><col class="col-category"><col class="col-type"><col class="col-quantity"><col class="col-latest"><col class="col-quote"><col class="col-subtotal"></colgroup>
      <thead><tr><th>图片</th><th>商品（编号/品牌/规格/指标说明）</th><th>分类</th><th>类型</th><th>预估数量</th><th>最新一次报价<br>（元）</th><th>报价（元）</th><th>小计（元）</th></tr></thead>
      <tbody>${rows || `<tr><td class="supplier-bid-flow-empty" colspan="8">暂无可查看的商品</td></tr>`}<tr class="total-row"><td colspan="7">合计</td><td>${escapeHtml(totalText)}</td></tr></tbody>
    </table></div>`;
  }

  function outcomeLabel() {
    const supplier = service.getCurrentSupplier?.() || {};
    if (row.winnerSupplier && row.winnerSupplier !== '--' && row.winnerSupplier === supplier.name) return '已中标';
    if (row.bidStatus === '已开标') return '未中标';
    return '待定';
  }

  function renderOutcomePanel() {
    const result = outcomeLabel();
    const resultClass = result === '待定' ? ' is-pending' : '';
    const quoteTotal = products.reduce((sum, product, index) => sum + Number(numericSubtotal(product, index) || 0), 0);
    return `<div class="supplier-bid-flow-table-wrap"><table class="supplier-bid-flow-table supplier-bid-flow-outcome-table">
      <colgroup><col class="col-supplier"><col class="col-outcome-status"><col class="col-result"><col class="col-outcome-total"></colgroup>
      <thead><tr><th>供应商</th><th>报价状态</th><th>中标结果</th><th>报价合计（元）</th></tr></thead>
      <tbody><tr><td>${display(service.getCurrentSupplier?.()?.name)}</td><td>${display(row.quoteStatus)}</td><td class="supplier-bid-flow-result${resultClass}">${result}</td><td class="money">${quoteTotal > 0 ? quoteTotal.toFixed(2) : '--'}</td></tr></tbody>
    </table></div>`;
  }

  const content = `<div class="page-card supplier-bid-flow-page supplier-bid-detail-page" id="supplierBidDetailPage">
    <header class="supplier-bid-flow-header">
      <div class="supplier-bid-flow-heading"><button class="supplier-bid-flow-back" type="button" data-action="back"><span class="supplier-bid-flow-back-icon" aria-hidden="true"></span><span>返回</span></button><h2>查看竞价</h2></div>
      <div class="supplier-bid-flow-status">状态：${display(row.winnerSupplier && row.winnerSupplier !== '--' ? '已中标' : row.bidStatus)}</div>
    </header>
    <section class="supplier-bid-flow-info" aria-label="竞价信息">${infoFields.map(renderInfoField).join('')}</section>
    <nav class="supplier-bid-flow-tabs" aria-label="竞价详情导航"><button type="button" class="is-active" data-detail-tab="demand">需求与报价</button><button type="button" data-detail-tab="outcome">中标情况</button></nav>
    <section class="supplier-bid-flow-panel" data-detail-panel>${renderDemandRows({ page: 1, pageSize: 10 })}</section>
    <div class="pagination supplier-bid-flow-pagination" id="supplierBidDetailPagination"></div>
  </div>`;

  const root = window.AppShell.mount({ title: '查看竞价', content, variant: 'supplier', emptyText: '查看竞价' });
  const page = root.querySelector('#supplierBidDetailPage');
  let activeTab = 'demand';
  const pager = window.Pagination.create({
    container: '#supplierBidDetailPagination',
    total: products.length,
    page: 1,
    pageSize: 10,
    pageSizeOptions: [10],
    onChange: (state) => {
      if (activeTab === 'demand') page.querySelector('[data-detail-panel]').innerHTML = renderDemandRows(state);
    }
  });

  function navigate(url) {
    if (window.AppNavigationGuard?.navigate) window.AppNavigationGuard.navigate(url);
    else window.location.href = url;
  }

  page.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back"]')) {
      navigate('./supplier-bidding-quotation.html');
      return;
    }
    const tab = event.target.closest('[data-detail-tab]');
    if (!tab) return;
    activeTab = tab.dataset.detailTab;
    page.querySelectorAll('[data-detail-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
    page.querySelector('[data-detail-panel]').innerHTML = activeTab === 'outcome' ? renderOutcomePanel() : renderDemandRows(pager.getState());
    page.querySelector('#supplierBidDetailPagination').hidden = activeTab !== 'demand';
  });
})();
