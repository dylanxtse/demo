(function () {
  const service = window.SupplierBiddingService;
  const bidId = new URLSearchParams(window.location.search).get('id') || '';
  const row = service?.getBidDetail?.(bidId);
  const draftStorageKey = 'procurement-supplier-quote-drafts-v1';

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

  function productDescription(product) {
    return `${product.name || '--'}（${product.unit || '--'} / ${product.brand || '--'} / ${product.spec || '--'}）`;
  }

  function imageMarkup(product) {
    return product.image
      ? `<span class="supplier-bid-flow-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name || '商品图片')}"></span>`
      : '<span class="supplier-bid-flow-image">--</span>';
  }

  function readJson(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)); } catch (error) { return fallback; }
  }

  function readDraft() {
    const drafts = readJson(draftStorageKey, {});
    return drafts[`${service.getCurrentSupplier().id}:${row.id}`] || {};
  }

  function writeDraft(entries) {
    const drafts = readJson(draftStorageKey, {});
    drafts[`${service.getCurrentSupplier().id}:${row.id}`] = Object.fromEntries(entries.map((entry) => [entry.productId, entry.price]));
    try { window.localStorage.setItem(draftStorageKey, JSON.stringify(drafts)); } catch (error) { /* file:// 页面可能禁用 localStorage */ }
  }

  function renderNotFound() {
    const root = window.AppShell.mount({ title: '竞价报价', content: '', variant: 'supplier', emptyText: '竞价不存在' });
    root.querySelector('.page-empty-state').style.display = 'flex';
  }

  if (!row) {
    renderNotFound();
    return;
  }

  const draft = readDraft();
  let products = service.getQuoteProducts(row.id).map((product) => ({ ...product, price: product.price || draft[product.id] || '' }));
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

  function subtotal(product, index) {
    if (row.encryption || !product.price) return '--';
    const amount = Number(product.price) * (120 + index * 20);
    return Number.isFinite(amount) ? amount.toFixed(2) : '--';
  }

  function renderRows() {
    const rows = products.map((product, index) => `<tr>
      <td>${imageMarkup(product)}</td>
      <td><span class="supplier-bid-flow-product">${escapeHtml(productDescription(product))}</span></td>
      <td>${display(product.category)}</td>
      <td>${escapeHtml(quantityLabel(product, index))}</td>
      <td>${escapeHtml(latestPrice(product, index))}</td>
      <td><input class="supplier-bid-quote-input" type="number" min="0.01" step="0.01" inputmode="decimal" data-quote-product="${escapeHtml(product.id)}" value="${escapeHtml(product.price)}" placeholder="请输入" ${row.canQuote ? '' : 'disabled'} aria-label="${escapeHtml(product.name)}报价"></td>
      <td class="supplier-bid-quote-subtotal">${escapeHtml(subtotal(product, index))}</td>
    </tr>`).join('');
    const total = products.reduce((sum, product, index) => sum + Number(subtotal(product, index) === '--' ? 0 : subtotal(product, index)), 0);
    return `<div class="supplier-bid-flow-table-wrap"><table class="supplier-bid-flow-table supplier-bid-quotation-table">
      <colgroup><col class="col-image"><col class="col-product"><col class="col-category"><col class="col-quantity"><col class="col-latest"><col class="col-quote"><col class="col-subtotal"></colgroup>
      <thead><tr><th>图片</th><th>商品（计量单位/品牌/规格）</th><th>分类</th><th>预估数量</th><th>最新一次报价<br>（元）</th><th>报价（元）</th><th>小计（元）</th></tr></thead>
      <tbody>${rows || `<tr><td class="supplier-bid-flow-empty" colspan="7">暂无可报价商品</td></tr>`}<tr class="total-row"><td colspan="6">合计</td><td>${total > 0 ? total.toFixed(2) : '--'}</td></tr></tbody>
    </table></div>`;
  }

  const content = `<div class="page-card supplier-bid-flow-page supplier-bid-quotation-form-page" id="supplierBidQuotationFormPage">
    <header class="supplier-bid-flow-header">
      <div class="supplier-bid-flow-heading"><button class="supplier-bid-flow-back" type="button" data-action="back"><span class="supplier-bid-flow-back-icon" aria-hidden="true"></span><span>返回</span></button><h2>竞价报价</h2></div>
      <div class="supplier-bid-flow-status">状态：${display(row.bidStatus)}</div>
    </header>
    <section class="supplier-bid-flow-info" aria-label="竞价信息">${infoFields.map(renderInfoField).join('')}</section>
    <div class="supplier-bid-quotation-toolbar"><button class="btn supplier-bid-import-button" type="button" data-action="import">批量导入</button><input class="supplier-bid-import-input" id="supplierQuoteImport" type="file" accept=".csv,.txt"></div>
    <section class="supplier-bid-flow-panel" data-quote-panel>${renderRows()}</section>
    <footer class="supplier-bid-quotation-footer"><button class="btn btn-primary" type="button" data-action="draft" ${row.canQuote ? '' : 'disabled'}>暂存</button><button class="btn btn-primary" type="button" data-action="save" ${row.canQuote ? '' : 'disabled'}>保存</button></footer>
  </div>`;

  const root = window.AppShell.mount({ title: '竞价报价', content, variant: 'supplier', emptyText: '竞价报价' });
  const page = root.querySelector('#supplierBidQuotationFormPage');
  const importInput = page.querySelector('#supplierQuoteImport');

  function showToast(message, error = false) {
    let toast = page.querySelector('.supplier-bid-flow-toast');
    if (!toast) {
      page.insertAdjacentHTML('beforeend', '<div class="supplier-bid-flow-toast" role="status"></div>');
      toast = page.querySelector('.supplier-bid-flow-toast');
    }
    toast.textContent = message;
    toast.classList.toggle('is-error', error);
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function collectEntries() {
    return [...page.querySelectorAll('[data-quote-product]')].map((input) => ({ productId: input.dataset.quoteProduct, price: input.value.trim() }));
  }

  function parseImport(text) {
    const productByCode = new Map(products.map((product) => [product.code, product]));
    const imported = [];
    String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
      const cells = line.split(/[,，\t]/).map((cell) => cell.trim().replace(/^"|"$/g, ''));
      const codeIndex = cells.findIndex((cell) => productByCode.has(cell));
      if (codeIndex < 0) return;
      const priceCell = cells.slice(codeIndex + 1).reverse().find((cell) => /^\d+(?:\.\d+)?$/.test(cell));
      if (priceCell) imported.push({ productId: productByCode.get(cells[codeIndex]).id, price: priceCell });
    });
    return imported;
  }

  function navigate(url) {
    if (window.AppNavigationGuard?.navigate) window.AppNavigationGuard.navigate(url);
    else window.location.href = url;
  }

  page.addEventListener('input', (event) => {
    if (!event.target.matches('[data-quote-product]')) return;
    const productIndex = products.findIndex((product) => product.id === event.target.dataset.quoteProduct);
    if (productIndex < 0) return;
    products[productIndex] = { ...products[productIndex], price: event.target.value.trim() };
    const subtotalCell = event.target.closest('tr')?.querySelector('.supplier-bid-quote-subtotal');
    if (subtotalCell) subtotalCell.textContent = subtotal(products[productIndex], productIndex);
    const total = products.reduce((sum, product, index) => sum + Number(subtotal(product, index) === '--' ? 0 : subtotal(product, index)), 0);
    const totalCell = page.querySelector('.supplier-bid-quotation-table .total-row td:last-child');
    if (totalCell) totalCell.textContent = total > 0 ? total.toFixed(2) : '--';
  });

  page.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back') {
      navigate('./supplier-bidding-quotation.html');
      return;
    }
    if (action === 'import') {
      importInput.click();
      return;
    }
    if (action === 'draft') {
      writeDraft(collectEntries());
      showToast('报价已暂存');
      return;
    }
    if (action !== 'save') return;
    try {
      const entries = collectEntries();
      service.saveQuotes(row.id, entries);
      products = service.getQuoteProducts(row.id);
      writeDraft(entries);
      page.querySelector('[data-quote-panel]').innerHTML = renderRows();
      showToast('报价已保存');
    } catch (error) {
      showToast(error.message || '报价保存失败', true);
    }
  });

  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      if (!imported.length) {
        showToast('未识别到可导入的商品报价', true);
      } else {
        const values = new Map(imported.map((entry) => [entry.productId, entry.price]));
        products = products.map((product) => ({ ...product, price: values.get(product.id) || product.price }));
        page.querySelector('[data-quote-panel]').innerHTML = renderRows();
        showToast(`已导入 ${imported.length} 条报价`);
      }
    } catch (error) {
      showToast('报价文件读取失败', true);
    }
    importInput.value = '';
  });
})();
