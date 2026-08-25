(function () {
  const service = window.SupplierBiddingService;
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const dateLabel = (row) => `${row.supplyStart}—${row.supplyEnd}`;
  const statusClass = (status) => status === '已开标' || status === '已中标' ? 'success' : 'pending';

  function renderStatus(status) {
    return `<span class="supplier-status supplier-status-${statusClass(status)}">${escapeHtml(status)}</span>`;
  }

  function renderRows(root, state) {
    const body = root.querySelector('#supplierBiddingBody');
    if (!body) return;
    const pageState = state.pager?.getState() || { page: 1, pageSize: 20 };
    const start = (pageState.page - 1) * pageState.pageSize;
    const visible = state.filtered.slice(start, start + pageState.pageSize);
    body.innerHTML = visible.length
      ? visible.map((row, index) => `<tr>
          <td>${start + index + 1}</td>
          <td class="supplier-bid-number">${escapeHtml(row.bidNo)}</td>
          <td>${escapeHtml(row.customer)}</td>
          <td class="supplier-cell-ellipsis" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.segment)}</td>
          <td>${escapeHtml(dateLabel(row))}</td>
          <td>${escapeHtml(row.varietyCount)}</td>
          <td>${escapeHtml(row.quoteStart)}</td>
          <td>${escapeHtml(row.quoteEnd)}</td>
          <td>${renderStatus(row.bidStatus)}</td>
          <td>${renderStatus(row.quoteStatus)}</td>
          <td><button class="supplier-quote-action" type="button" data-action="quote" data-id="${escapeHtml(row.id)}" ${row.canQuote ? '' : 'disabled'}>报价</button></td>
        </tr>`).join('')
      : '<tr><td class="supplier-empty-row" colspan="12">暂无符合条件的数据</td></tr>';
  }

  function render() {
    const rows = service.getRows();
    const segmentOptions = [...new Set(rows.map((row) => row.segment))];
    const content = `
      <div class="page-card supplier-quotation-page" id="supplierQuotationPage">
        <form class="supplier-quotation-filters" id="supplierQuotationFilters">
          <div class="supplier-filter-fields">
            <div class="supplier-filter-item">
              <label for="supplierBidKeyword">竞价编号/名称</label>
              <input id="supplierBidKeyword" data-filter="keyword" type="text" placeholder="请输入">
            </div>
            <div class="supplier-filter-item">
              <label for="supplierSupplyStart">供货周期</label>
              <div class="supplier-date-range">
                <input id="supplierSupplyStart" data-filter="start" type="text" value="2026-07-15" placeholder="请选择日期" aria-label="供货周期开始日期">
                <span aria-hidden="true">—</span>
                <input id="supplierSupplyEnd" data-filter="end" type="text" value="2026-08-14" placeholder="请选择日期" aria-label="供货周期结束日期">
                <svg class="supplier-calendar-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"></rect><line x1="16" y1="2.5" x2="16" y2="6"></line><line x1="8" y1="2.5" x2="8" y2="6"></line><line x1="3" y1="9" x2="21" y2="9"></line></svg>
              </div>
            </div>
            <div class="supplier-filter-item">
              <label for="supplierBidSegment">标段</label>
              <select id="supplierBidSegment" data-filter="segment">
                <option value="">全部</option>
                ${segmentOptions.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}
              </select>
            </div>
            <div class="supplier-filter-item">
              <label for="supplierBidStatus">竞价状态</label>
              <select id="supplierBidStatus" data-filter="bidStatus">
                <option value="">全部</option>
                <option value="待开标">待开标</option>
                <option value="已开标">已开标</option>
              </select>
            </div>
            <div class="supplier-filter-item">
              <label for="supplierQuoteStatus">报价状态</label>
              <select id="supplierQuoteStatus" data-filter="quoteStatus">
                <option value="">全部</option>
                <option value="未报价">未报价</option>
                <option value="已中标">已中标</option>
                <option value="未中标">未中标</option>
              </select>
            </div>
          </div>
          <div class="supplier-filter-actions">
            <button class="btn btn-primary btn-sm" type="submit">查询</button>
            <button class="btn btn-sm" type="button" data-action="reset">重置</button>
          </div>
        </form>
        <div class="supplier-quotation-table-wrap">
          <table class="supplier-quotation-table">
            <colgroup>
              <col class="col-index"><col class="col-bid-no"><col class="col-customer"><col class="col-name"><col class="col-segment"><col class="col-period"><col class="col-variety"><col class="col-time"><col class="col-time"><col class="col-status"><col class="col-status"><col class="col-action">
            </colgroup>
            <thead><tr>
              <th>序号</th><th>竞价编号</th><th>客户名称</th><th>竞价名称</th><th>标段</th><th>供货周期</th><th>品种数</th><th>开始报价时间</th><th>截止报价时间</th><th>竞价状态</th><th>报价状态</th><th>操作</th>
            </tr></thead>
            <tbody id="supplierBiddingBody"></tbody>
          </table>
        </div>
        <div class="pagination supplier-quotation-pagination" id="supplierBiddingPagination"></div>
        <div class="supplier-quote-modal" id="supplierQuoteModal" aria-hidden="true">
          <section class="supplier-quote-dialog" role="dialog" aria-modal="true" aria-labelledby="supplierQuoteTitle">
            <header class="supplier-quote-dialog-header"><div><h2 id="supplierQuoteTitle">填写竞价报价</h2><p data-quote-summary></p></div><button type="button" data-action="close-quote" aria-label="关闭">×</button></header>
            <div class="supplier-quote-dialog-body"><p class="supplier-quote-scope-hint">只能填写当前供应商已设置标段内的商品报价。</p><div class="supplier-quote-product-wrap"><table class="supplier-quote-product-table"><thead><tr><th>商品编号</th><th>商品名称</th><th>分类</th><th>计量单位</th><th>报价（元）</th></tr></thead><tbody data-quote-products></tbody></table></div></div>
            <footer class="supplier-quote-dialog-actions"><button class="btn btn-sm" type="button" data-action="close-quote">取消</button><button class="btn btn-primary btn-sm" type="button" data-action="save-quote">保存报价</button></footer>
          </section>
        </div>
      </div>
    `;
    const root = window.AppShell.mount({ title: '竞价报价', content, variant: 'supplier', emptyText: '竞价报价' });
    const page = root.querySelector('#supplierQuotationPage');
    const state = { rows, filtered: rows, pager: null };
    const quoteModal = page.querySelector('#supplierQuoteModal');
    let activeQuoteRow = null;
    const readFilters = () => Object.fromEntries([...page.querySelectorAll('[data-filter]')].map((field) => [field.dataset.filter, field.value]));
    const applyFilters = (resetPage = true) => {
      state.filtered = service.filterRows(state.rows, readFilters());
      state.pager?.update({ total: state.filtered.length, ...(resetPage ? { page: 1 } : {}) });
      renderRows(page, state);
    };

    state.pager = window.Pagination.create({
      container: '#supplierBiddingPagination',
      total: state.filtered.length,
      page: 1,
      pageSize: 20,
      pageSizeOptions: [20, 50, 100],
      onChange: () => renderRows(page, state)
    });
    renderRows(page, state);

    function showToast(message, error = false) {
      let toast = page.querySelector('.supplier-quote-toast');
      if (!toast) {
        page.insertAdjacentHTML('beforeend', '<div class="supplier-quote-toast" role="status"></div>');
        toast = page.querySelector('.supplier-quote-toast');
      }
      toast.textContent = message;
      toast.classList.toggle('is-error', error);
      toast.classList.add('is-visible');
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }

    function closeQuoteModal() {
      activeQuoteRow = null;
      quoteModal.classList.remove('is-open');
      quoteModal.setAttribute('aria-hidden', 'true');
    }

    function openQuoteModal(row) {
      const products = service.getQuoteProducts(row.id);
      if (!products.length) { showToast('当前标段暂无可报价商品', true); return; }
      activeQuoteRow = row;
      quoteModal.querySelector('[data-quote-summary]').textContent = `${row.bidNo}｜${row.name}｜${row.segment}`;
      quoteModal.querySelector('[data-quote-products]').innerHTML = products.map((product) => `<tr><td>${escapeHtml(product.code)}</td><td class="align-left">${escapeHtml(product.name)}</td><td class="align-left">${escapeHtml(product.category)}</td><td>${escapeHtml(product.unit || '--')}</td><td><input type="number" min="0.01" step="0.01" data-quote-product="${escapeHtml(product.id)}" value="${escapeHtml(product.price)}" placeholder="请输入报价"></td></tr>`).join('');
      quoteModal.classList.add('is-open');
      quoteModal.setAttribute('aria-hidden', 'false');
      quoteModal.querySelector('input[data-quote-product]')?.focus();
    }

    page.querySelector('#supplierQuotationFilters').addEventListener('submit', (event) => {
      event.preventDefault();
      applyFilters(true);
    });
    page.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'quote') {
        const row = state.rows.find((item) => item.id === event.target.closest('[data-id]')?.dataset.id);
        if (row?.canQuote) openQuoteModal(row);
        return;
      }
      if (action === 'close-quote') { closeQuoteModal(); return; }
      if (action === 'save-quote') {
        if (!activeQuoteRow) return;
        const entries = [...quoteModal.querySelectorAll('[data-quote-product]')].map((input) => ({ productId: input.dataset.quoteProduct, price: input.value.trim() }));
        try {
          service.saveQuotes(activeQuoteRow.id, entries);
          state.rows = service.getRows();
          applyFilters(false);
          closeQuoteModal();
          showToast('报价已保存');
        } catch (error) {
          showToast(error.message || '报价保存失败', true);
        }
        return;
      }
      if (action !== 'reset') return;
      page.querySelectorAll('[data-filter]').forEach((field) => {
        if (field.matches('select')) field.value = '';
        else field.value = '';
      });
      applyFilters(true);
    });
    quoteModal.addEventListener('click', (event) => {
      if (event.target === quoteModal) closeQuoteModal();
    });
  }

  render();
})();
