(function () {
  const service = window.SchoolOrderService;
  if (!service) return;

  const params = new URLSearchParams(window.location.search);
  const mode = ['add', 'edit', 'copy', 'audit'].includes(params.get('mode')) ? params.get('mode') : 'add';
  const orderId = params.get('id') || '';
  const sourceOrder = orderId ? service.get(orderId) : null;
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const money = (value) => number(value).toFixed(2);
  const nowText = () => {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const productLabel = (product) => `${product.name}(${product.unit || '--'}/${product.brand || '--'}/${product.spec || '--'})`;
  const titleMap = { add: '添加订单', edit: '编辑订单', copy: '复制订单', audit: '审核订单' };
  const title = titleMap[mode];
  const readOnly = mode === 'audit';
  const catalog = service.getProductCatalog();
  const defaultItems = mode === 'add'
    ? Array.from({ length: 10 }, () => ({ id: '', productCode: '', productName: '', unit: '', brand: '--', spec: '--', orderQty: 0, orderPrice: 0, agreementPrice: '', recentSalePrice: '', marketPrice: '', remark: '' }))
    : clone(sourceOrder?.items || []);
  const state = { items: defaultItems, total: 0 };

  function navigate(url) {
    if (window.AppNavigationGuard?.navigate) window.AppNavigationGuard.navigate(url);
    else window.location.href = url;
  }

  function currentProduct(code) {
    return catalog.find((product) => String(product.code) === String(code)) || null;
  }

  function lineValue(line, key, fallback = '') {
    return line?.[key] == null ? fallback : line[key];
  }

  function productOptions(selected = '') {
    return [`<option value="">请选择商品</option>`, ...catalog.map((product) => `<option value="${escapeHtml(product.code)}" ${String(product.code) === String(selected) ? 'selected' : ''}>${escapeHtml(productLabel(product))}</option>`)].join('');
  }

  function renderLine(line, index) {
    const product = currentProduct(line.productCode);
    const name = line.productName || product?.name || '';
    const unit = line.unit || product?.unit || '';
    const recent = line.recentSalePrice === '' || line.recentSalePrice == null ? (product?.marketPrice ?? '') : line.recentSalePrice;
    const market = line.marketPrice === '' || line.marketPrice == null ? (product?.marketPrice ?? '') : line.marketPrice;
    const qty = number(line.orderQty);
    const price = number(line.orderPrice);
    const lockedProduct = readOnly || mode === 'edit';
    const lockedPrice = readOnly || mode === 'edit' || (mode === 'copy' && Boolean(line.productCode));
    const lockedInputs = readOnly;
    const remark = lineValue(line, 'remark', '') === '--' ? '' : lineValue(line, 'remark', '');
    return `<tr data-line-index="${index}">
      <td>${index + 1}</td>
      <td><span class="school-order-image-placeholder" aria-label="商品图片">图片</span></td>
      <td><select class="form-table-select" data-field="productCode" aria-label="第${index + 1}行商品" ${lockedProduct ? 'disabled' : ''}>${productOptions(line.productCode)}</select></td>
      <td data-cell="unit">${escapeHtml(unit || '--')}</td>
      <td><input class="table-number-input" data-field="orderQty" type="number" min="0" step="0.01" value="${escapeHtml(qty)}" aria-label="第${index + 1}行下单数量" ${lockedInputs ? 'disabled' : ''}></td>
      <td><input class="table-number-input" data-field="orderPrice" type="number" min="0" step="0.01" value="${escapeHtml(price)}" aria-label="第${index + 1}行下单单价" ${lockedPrice ? 'disabled' : ''}></td>
      <td data-cell="subtotal">${money(qty * price)}</td>
      <td data-cell="agreement">${lineValue(line, 'agreementPrice', '') === '' ? '--' : money(lineValue(line, 'agreementPrice'))}</td>
      <td data-cell="recent">${recent === '' ? '--' : money(recent)}</td>
      <td data-cell="market">${market === '' ? '--' : money(market)}</td>
      <td><input class="table-remark-input" data-field="remark" type="text" value="${escapeHtml(remark)}" aria-label="第${index + 1}行备注" ${lockedInputs ? 'disabled' : ''}></td>
    </tr>`;
  }

  function collectItems(page) {
    return [...page.querySelectorAll('#schoolOrderGoodsBody tr[data-line-index]')].map((row, index) => {
      const old = state.items[index] || {};
      const code = row.querySelector('[data-field="productCode"]')?.value || old.productCode || '';
      const product = currentProduct(code);
      const price = Math.max(0, number(row.querySelector('[data-field="orderPrice"]')?.value ?? old.orderPrice));
      return {
        id: old.id || `SOL-NEW-${Date.now()}-${index}`,
        productCode: code,
        productName: product?.name || old.productName || '',
        unit: product?.unit || old.unit || '',
        brand: product?.brand || old.brand || '--',
        spec: product?.spec || old.spec || '--',
        orderQty: Math.max(0, number(row.querySelector('[data-field="orderQty"]')?.value ?? old.orderQty)),
        orderPrice: price,
        agreementPrice: old.agreementPrice ?? '',
        recentSalePrice: product?.marketPrice ?? old.recentSalePrice ?? '',
        marketPrice: product?.marketPrice ?? old.marketPrice ?? '',
        remark: row.querySelector('[data-field="remark"]')?.value ?? old.remark ?? ''
      };
    });
  }

  function updateLine(row, page) {
    const index = Number(row.dataset.lineIndex);
    const items = collectItems(page);
    const line = items[index] || {};
    state.items[index] = { ...(state.items[index] || {}), ...line };
    row.querySelector('[data-cell="subtotal"]').textContent = money(number(line.orderQty) * number(line.orderPrice));
    state.total = items.reduce((sum, item) => sum + number(item.orderQty) * number(item.orderPrice), 0);
    page.querySelector('#schoolOrderTotal').textContent = money(state.total);
  }

  function renderItems(page) {
    page.querySelector('#schoolOrderGoodsBody').innerHTML = state.items.map(renderLine).join('');
    state.total = state.items.reduce((sum, item) => sum + number(item.orderQty) * number(item.orderPrice), 0);
    page.querySelector('#schoolOrderTotal').textContent = money(state.total);
  }

  function setError(page, message = '') {
    page.querySelector('#schoolOrderFormError').textContent = message;
  }

  function openModal({ title: modalTitle, body, footer, className = '' }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'operations-modal-backdrop';
    backdrop.innerHTML = `<div class="operations-modal ${className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(modalTitle)}">
      <div class="operations-modal-header"><h3>${escapeHtml(modalTitle)}</h3><button type="button" data-modal-close aria-label="关闭">×</button></div>
      <div class="operations-modal-body">${body}</div>
      <div class="operations-modal-footer">${footer}</div>
    </div>`;
    document.body.appendChild(backdrop);
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-modal-close], [data-modal-cancel]')) close();
    });
    return { backdrop, close };
  }

  function openProductPicker(page) {
    state.items = collectItems(page);
    const selectedCodes = new Set(state.items.map((item) => item.productCode).filter(Boolean));
    const modal = openModal({
      title: '批量添加商品',
      className: 'school-order-picker-modal',
      body: `<div class="school-order-picker-list"><div class="school-order-picker-row header"><span></span><span>商品名称（计量单位/品牌/规格）</span><span>商品编号</span><span>参考价</span></div>${catalog.map((product) => `<label class="school-order-picker-row"><input type="checkbox" value="${escapeHtml(product.code)}" ${selectedCodes.has(product.code) ? 'checked' : ''}><span>${escapeHtml(productLabel(product))}</span><span>${escapeHtml(product.code)}</span><span>${money(product.marketPrice)}</span></label>`).join('')}</div>`,
      footer: `<button type="button" class="btn" data-modal-cancel>取消</button><button type="button" class="btn btn-primary" data-modal-confirm>添加选中商品</button>`
    });
    modal.backdrop.querySelector('[data-modal-confirm]').addEventListener('click', () => {
      const codes = [...modal.backdrop.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
      const chosen = codes.map(currentProduct).filter(Boolean);
      const next = state.items.slice();
      chosen.forEach((product) => {
        if (next.some((item) => item.productCode === product.code)) return;
        const blankIndex = next.findIndex((item) => !item.productCode);
        const item = { id: `SOL-NEW-${Date.now()}-${product.code}`, productCode: product.code, productName: product.name, unit: product.unit, brand: product.brand, spec: product.spec, orderQty: 0, orderPrice: product.marketPrice, agreementPrice: '', recentSalePrice: product.marketPrice, marketPrice: product.marketPrice, remark: '' };
        if (blankIndex >= 0) next[blankIndex] = item;
        else next.push(item);
      });
      state.items = next;
      renderItems(page);
      modal.close();
    });
  }

  function buildPayload(page) {
    const items = collectItems(page);
    return {
      supplierName: page.querySelector('#schoolOrderSupplier').value,
      expectedAt: page.querySelector('#schoolOrderExpectedAt').value,
      canteen: page.querySelector('#schoolOrderCanteen').value,
      orderTag: page.querySelector('#schoolOrderTag').value,
      remark: page.querySelector('#schoolOrderRemark').value,
      items
    };
  }

  function save(page, status = '') {
    setError(page, '');
    const payload = buildPayload(page);
    if (!payload.supplierName || !payload.expectedAt || !payload.canteen || !payload.orderTag) {
      setError(page, '请完整填写供货企业、期望送达时间、食堂和订单标签');
      return;
    }
    if (status !== '草稿' && !payload.items.some((item) => item.productName && item.orderQty > 0)) {
      setError(page, '请至少添加一条商品并填写下单数量');
      return;
    }
    if (mode === 'edit') service.update(orderId, { ...payload, ...(status ? { status } : {}) });
    else service.create({ ...payload, status: status || '待发货', source: '平台下单' });
    navigate('./school-order-management.html');
  }

  function render() {
    if (['edit', 'copy', 'audit'].includes(mode) && !sourceOrder) {
      navigate('./school-order-management.html');
      return;
    }
    const order = sourceOrder || {};
    const supplier = order.supplierName || '';
    const expectedAt = order.expectedAt || nowText();
    const canteen = order.canteen || '';
    const tag = order.orderTag || '';
    const remark = order.remark === '--' ? '' : (order.remark || '');
    const supplierDisabled = readOnly || mode === 'edit';
    const expectedDisabled = readOnly || mode === 'edit';
    const basicDisabled = readOnly;
    const content = `<section class="school-order-form-page" id="schoolOrderFormPage" aria-label="${escapeHtml(title)}">
      <header class="school-order-form-header"><button type="button" class="school-order-form-back" data-action="back" aria-label="返回订单管理">‹ <span>返回</span></button><h1>${escapeHtml(title)}</h1></header>
      <div class="school-order-form-body">
        ${mode === 'audit' ? '<p class="school-order-form-readonly-note">当前为审核视图，请核对订单基础信息与商品明细后完成审核。</p>' : ''}
        ${mode === 'copy' ? `<p class="school-order-form-context">复制订单：${escapeHtml(order.orderNo || '')}。保存后将生成新的订单号。</p>` : mode === 'edit' ? `<p class="school-order-form-context">订单号：${escapeHtml(order.orderNo || '')}</p>` : ''}
        <section class="school-order-form-section">
          <div class="school-order-form-section-title"><h2>基础信息</h2></div>
          <div class="school-order-basic-grid">
            <div class="school-order-basic-field required"><label for="schoolOrderSupplier">供货企业</label><select id="schoolOrderSupplier" ${supplierDisabled ? 'disabled' : ''}><option value="">请选择供货企业</option>${(service.suppliers || [service.SUPPLIER_NAME]).map((item) => `<option value="${escapeHtml(item)}" ${supplier === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
            <div class="school-order-basic-field required"><label for="schoolOrderExpectedAt">期望送达时间</label><input id="schoolOrderExpectedAt" class="form-control" type="text" value="${escapeHtml(expectedAt)}" ${expectedDisabled ? 'disabled' : ''}></div>
            <div class="school-order-basic-field required"><label for="schoolOrderCanteen">食堂</label><select id="schoolOrderCanteen" ${basicDisabled ? 'disabled' : ''}><option value="">请选择食堂</option>${(service.canteens || []).map((item) => `<option value="${escapeHtml(item)}" ${canteen === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
            <div class="school-order-basic-field required"><label for="schoolOrderTag">订单标签</label><select id="schoolOrderTag" ${basicDisabled ? 'disabled' : ''}><option value="">请选择订单标签</option>${(service.tags || []).map((item) => `<option value="${escapeHtml(item)}" ${tag === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
          </div>
        </section>
        <section class="school-order-form-section">
          <div class="school-order-form-section-title school-order-goods-heading"><h2>商品信息</h2>${!readOnly ? '<button type="button" class="btn btn-primary btn-sm" data-action="batch-add">批量添加商品</button>' : ''}</div>
          <div class="school-order-form-table-wrap"><table class="school-order-form-table"><colgroup><col class="col-seq"><col class="col-image"><col class="col-name"><col class="col-unit"><col class="col-qty"><col class="col-price"><col class="col-subtotal"><col class="col-agreement"><col class="col-recent"><col class="col-market"><col class="col-remark"></colgroup><thead><tr><th>序号</th><th>图片</th><th>商品名称（计量单位/品牌/规格）</th><th>计量单位</th><th class="required-head">下单数量</th><th class="required-head">下单单价</th><th>下单小计</th><th>协议价</th><th>最近一次销售价</th><th>市场价</th><th>备注</th></tr></thead><tbody id="schoolOrderGoodsBody"></tbody><tfoot><tr><td colspan="6">金额合计（元）</td><td id="schoolOrderTotal">0.00</td><td colspan="4"></td></tr></tfoot></table></div>
          <div class="school-order-form-error" id="schoolOrderFormError" role="alert"></div>
        </section>
        <section class="school-order-remark"><label class="school-order-remark-label" for="schoolOrderRemark">订单备注</label><div class="school-order-remark-wrap"><textarea id="schoolOrderRemark" maxlength="100" ${readOnly ? 'disabled' : ''}>${escapeHtml(remark)}</textarea><span class="school-order-remark-count"><span id="schoolOrderRemarkCount">${escapeHtml(remark.length)}</span>/100</span></div></section>
      </div>
      <footer class="school-order-form-actions"><button type="button" class="btn" data-action="back">返回</button>${readOnly ? '<button type="button" class="btn btn-danger" data-action="reject">驳回</button><button type="button" class="btn btn-primary" data-action="approve">审核通过</button>' : '<button type="button" class="btn" data-action="draft">暂存</button><button type="button" class="btn btn-primary" data-action="save">保存订单</button>'}</footer>
    </section>`;
    const root = window.AppShell.mount({ title, content, variant: 'school', companyName: service.SCHOOL_NAME, emptyText: title });
    const page = root.querySelector('#schoolOrderFormPage');
    renderItems(page);

    page.addEventListener('input', (event) => {
      const row = event.target.closest('tr[data-line-index]');
      if (row) updateLine(row, page);
      if (event.target.id === 'schoolOrderRemark') page.querySelector('#schoolOrderRemarkCount').textContent = event.target.value.length;
    });
    page.addEventListener('change', (event) => {
      const row = event.target.closest('tr[data-line-index]');
      if (!row) return;
      if (event.target.dataset.field === 'productCode') {
        const product = currentProduct(event.target.value);
        const index = Number(row.dataset.lineIndex);
        state.items[index] = { ...(state.items[index] || {}), productCode: product?.code || '', productName: product?.name || '', unit: product?.unit || '', brand: product?.brand || '--', spec: product?.spec || '--', orderPrice: product?.marketPrice || 0, recentSalePrice: product?.marketPrice ?? '', marketPrice: product?.marketPrice ?? '' };
        row.querySelector('[data-cell="unit"]').textContent = product?.unit || '--';
        row.querySelector('[data-field="orderPrice"]').value = product?.marketPrice ?? 0;
        row.querySelector('[data-cell="recent"]').textContent = product ? money(product.marketPrice) : '--';
        row.querySelector('[data-cell="market"]').textContent = product ? money(product.marketPrice) : '--';
      }
      updateLine(row, page);
    });
    page.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'back') navigate('./school-order-management.html');
      else if (action === 'batch-add') openProductPicker(page);
      else if (action === 'draft') save(page, '草稿');
      else if (action === 'save') save(page);
      else if (action === 'approve') { service.approve(orderId); navigate('./school-order-management.html'); }
      else if (action === 'reject') { service.reject(orderId, window.prompt('请输入驳回原因', '订单信息需补充') || '订单信息需补充'); navigate('./school-order-management.html'); }
    });
  }

  render();
})();
