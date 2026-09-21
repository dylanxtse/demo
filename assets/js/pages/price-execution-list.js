(function () {
  const pageVariant = window.PriceExecutionPageVariant || 'enterprise';
  const isEducationPage = pageVariant === 'education';
  const openEducationPriceExecutionExportTemplate = () => {
    const selectedDate = document.getElementById('priceFilter-executionDate')?.value?.trim() || '';
    const exportKey = `price-execution-export-${Date.now()}`;
    const exportPayload = JSON.stringify({
      version: '20260918-3',
      unit: pageVariant === 'education' ? '南皮县教育局' : '',
      executionDate: selectedDate,
      rows: getPurchaseExportRows()
    });
    try { window.localStorage?.setItem(exportKey, exportPayload); } catch {}
    try { window.sessionStorage?.setItem(exportKey, exportPayload); } catch {}
    const params = new URLSearchParams();
    if (selectedDate) params.set('executionDate', selectedDate);
    params.set('exportKey', exportKey);
    const query = params.toString();
    const templateUrl = `./education-price-execution-export-template.html${query ? `?${query}` : ''}`;
    const templateWindow = window.open(templateUrl, '_blank', 'noopener');
    if (!templateWindow) window.location.href = templateUrl;
  };
  const educationPriceExecutionExportAnnotation = pageVariant === 'education'
    ? {
      id: 'custom-1789694063789-2',
      target: 'custom',
      targetSelector: '[data-action="export"]',
      placement: 'right',
      scope: 'page',
      title: '导出',
      popoverActions: [{
        key: 'view-price-execution-export-template',
        label: '查看模版',
        className: 'btn btn-sm record-annotation-demo-action record-annotation-action'
      }],
      onAction: ({ key }) => {
        if (key === 'view-price-execution-export-template') openEducationPriceExecutionExportTemplate();
      }
    }
    : null;
  const downloadIcon = '<svg class="icon-svg" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  const uploadIcon = '<svg class="icon-svg" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M12 16V4"/><polyline points="7 9 12 4 17 9"/><path d="M5 20h14"/></svg>';
  const calendarIcon = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

  function currentDateValue() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const pageContent = `
    <div class="page-card price-execution-page${isEducationPage ? ' education-price-execution-page' : ''}" id="priceExecutionPage">
      <section class="price-query-panel" aria-label="价格执行清单查询">
        <div class="price-filter-fields" id="priceFilterFields"></div>
        <div class="price-filter-actions">
          <button class="btn btn-primary btn-sm" type="button" data-action="query">查询</button>
          <button class="btn btn-sm" type="button" data-action="reset">重置</button>
        </div>
      </section>

      <div class="price-toolbar">
        <div class="price-toolbar-right">
          <button class="btn btn-sm" type="button" data-action="export">${downloadIcon}导出</button>
        </div>
      </div>

      <div class="price-table-container">
        <div class="price-table-wrapper">
          <table class="data-table price-data-table">
            <thead id="priceTableHead"></thead>
            <tbody id="priceTableBody"></tbody>
          </table>
        </div>
        <div class="pagination price-pagination" id="pricePagination"></div>
      </div>
    </div>

    <div class="price-import-mask" id="priceImportMask" aria-hidden="true">
      <div class="price-import-dialog" role="dialog" aria-modal="true" aria-labelledby="priceImportTitle">
        <div class="price-import-header">
          <h2 id="priceImportTitle">导入订价</h2>
          <button class="price-dialog-close" type="button" data-action="close-import" aria-label="关闭">×</button>
        </div>
        <div class="price-import-body">
          <div class="price-import-template">
            <span>请先下载模板，按模板填写价格数据</span>
            <button class="btn-text" type="button" data-action="download-template">下载模板</button>
          </div>
          <div class="price-file-row">
            <button class="btn btn-sm" type="button" data-action="choose-file">${uploadIcon}上传文件</button>
            <span id="priceFileName">未选择文件</span>
            <input id="priceFileInput" type="file" accept=".xlsx" hidden>
          </div>
          <div class="price-import-tip">只能上传xlsx文件，且不超过10M</div>
        </div>
        <div class="price-import-footer">
          <button class="btn btn-sm" type="button" data-action="close-import">取消</button>
          <button class="btn btn-primary btn-sm" type="button" data-action="confirm-import">导入</button>
        </div>
      </div>
    </div>

    <div class="price-detail-mask" id="priceDetailMask" aria-hidden="true">
      <div class="price-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="priceDetailTitle">
        <div class="price-detail-header">
          <h2 id="priceDetailTitle">执行价格</h2>
          <button class="price-dialog-close" type="button" data-action="close-price-detail" aria-label="关闭">×</button>
        </div>
        <div class="price-detail-body">
          <table class="data-table price-detail-table">
            <thead><tr><th>执行周期</th><th>供应商</th><th>价格</th></tr></thead>
            <tbody id="priceDetailBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="price-toast" id="priceToast" role="status" aria-live="polite"></div>
  `;

  const state = {
    mode: 'purchase',
    rows: [],
    filteredRows: [],
    page: 1,
    pageSize: 20,
    editing: false,
    pagination: null,
    baseTotal: 0,
    total: 0,
    executionDatePicker: null,
    category: '',
    categoryExpanded: new Set()
  };

  const filters = {
    purchase: pageVariant === 'education'
      ? [
        { key: 'supplier', label: '供应商', type: 'input', placeholder: '请输入供应商名称' },
        { key: 'category', label: '商品分类', type: 'select', placeholder: '全部' },
        { key: 'name', label: '商品名称', type: 'input', placeholder: '请输入名称/编号' },
        { key: 'executionDate', label: '执行日期', type: 'date' },
        { key: 'executionPriceStatus', label: '有无执行价格', type: 'select', placeholder: '全部' }
      ]
      : [
        { key: 'purchaseType', label: '采购类型', type: 'select', placeholder: '请选择' },
        { key: 'category', label: '商品分类', type: 'select', placeholder: '全部' },
        { key: 'name', label: '商品名称', type: 'input', placeholder: '请输入名称/编号' },
        { key: 'executionDate', label: '执行日期', type: 'date' },
        { key: 'executionPriceStatus', label: '有无执行价格', type: 'select', placeholder: '全部' }
      ],
    sales: [
      { key: 'customerType', label: '客户类型', type: 'select', placeholder: '请选择' },
      { key: 'customerName', label: '客户名称', type: 'input', placeholder: '请输入客户名称' },
      { key: 'district', label: '区县', type: 'select', placeholder: '全部' },
      { key: 'category', label: '商品分类', type: 'select', placeholder: '全部' },
      { key: 'name', label: '商品名称', type: 'input', placeholder: '请输入名称/编号' }
    ]
  };

  const priceTypeOptions = {
    purchase: ['手动定价', '协议价', '近一次采购价', '供应商报价', '市场价', '中标价'],
    sales: ['手动定价', '协议价', '近一次销售价', '市场价']
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function uniqueValues(field) {
    return [...new Set(state.rows.map((row) => row[field]).filter(Boolean))];
  }

  function optionList(field, placeholder) {
    let values;
    if (field === 'priceType') values = priceTypeOptions[state.mode];
    else if (field === 'purchaseType') values = ['供应商送货', '市场自采'];
    else if (field === 'customerType') values = ['学校', '幼儿园', '机关单位'];
    else if (field === 'executionPriceStatus') values = ['有', '无'];
    else values = uniqueValues(field);
    return [`<option value="">${escapeHtml(placeholder)}</option>`, ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)].join('');
  }

  function categoryParts(value) {
    return String(value || '').split('-').map((part) => part.trim()).filter(Boolean);
  }

  function buildCategoryTree() {
    const roots = [];
    const maps = [new Map()];
    state.rows.forEach((row) => {
      const parts = categoryParts(row.category);
      let levelNodes = roots;
      let parentValue = '';
      parts.forEach((label, index) => {
        const value = parts.slice(0, index + 1).join('-');
        if (!maps[index]) maps[index] = new Map();
        let node = maps[index].get(value);
        if (!node) {
          node = { value, label, level: index + 1, parent: parentValue, children: [] };
          maps[index].set(value, node);
          levelNodes.push(node);
        }
        parentValue = value;
        levelNodes = node.children;
      });
    });
    return roots;
  }

  function renderCategoryTree() {
    const tree = document.getElementById('priceCategoryTree');
    if (!tree) return;
    const renderNodes = (nodes) => nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const expanded = state.categoryExpanded.has(node.value);
      const selected = state.category === node.value;
      return `<div class="price-category-node" role="treeitem" aria-level="${node.level}" aria-expanded="${hasChildren ? expanded : 'false'}">
        <div class="price-category-row${selected ? ' is-selected' : ''}">
          ${hasChildren
            ? `<button class="price-category-toggle${expanded ? ' is-expanded' : ''}" type="button" data-category-toggle="${escapeHtml(node.value)}" aria-label="${expanded ? '收起' : '展开'}${escapeHtml(node.label)}" aria-expanded="${expanded}">${expanded ? '▾' : '▸'}</button>`
            : '<span class="price-category-toggle is-empty" aria-hidden="true"></span>'}
          <button class="price-category-option" type="button" data-category-select="${escapeHtml(node.value)}" data-category-label="${escapeHtml(node.label)}" title="${escapeHtml(node.value)}">${escapeHtml(node.label)}</button>
        </div>
        ${hasChildren && expanded ? `<div class="price-category-children" role="group">${renderNodes(node.children)}</div>` : ''}
      </div>`;
    }).join('');
    const selectedLabel = state.category ? state.category.split('-').slice(-1)[0] : '请选择商品分类';
    tree.innerHTML = renderNodes(buildCategoryTree());
    const valueElement = document.getElementById('priceCategoryValue');
    if (valueElement) {
      valueElement.textContent = selectedLabel;
      valueElement.classList.toggle('is-placeholder', !state.category);
      valueElement.title = state.category || '请选择商品分类';
    }
  }

  function toggleCategoryPicker(force) {
    const picker = document.querySelector('.price-category-picker');
    const trigger = document.getElementById('priceCategoryTrigger');
    const menu = document.getElementById('priceCategoryMenu');
    const shouldOpen = typeof force === 'boolean' ? force : !picker?.classList.contains('is-open');
    if (!picker || !trigger || !menu) return;
    picker.classList.toggle('is-open', shouldOpen);
    trigger.setAttribute('aria-expanded', String(shouldOpen));
    picker.setAttribute('aria-expanded', String(shouldOpen));
    menu.hidden = !shouldOpen;
    if (shouldOpen) renderCategoryTree();
  }

  function selectCategory(value) {
    state.category = value || '';
    toggleCategoryPicker(false);
    renderCategoryTree();
  }

  function renderCategoryFilter() {
    return `<div class="price-category-picker" role="combobox" aria-haspopup="tree" aria-expanded="false">
      <button class="price-category-trigger" id="priceCategoryTrigger" type="button" data-category-trigger aria-controls="priceCategoryTree" aria-expanded="false">
        <span class="price-category-value is-placeholder" id="priceCategoryValue">请选择商品分类</span>
      </button>
      <div class="price-category-menu" id="priceCategoryMenu" hidden>
        <div class="price-category-tree" id="priceCategoryTree" role="tree"></div>
      </div>
    </div>`;
  }

  function renderDateFilter(id) {
    return `<div class="date-input-control price-execution-date-control">
      <input class="filter-input price-execution-date-input" id="${id}" type="text" value="${currentDateValue()}" placeholder="请选择日期" readonly>
      <span class="date-range-icon" aria-hidden="true">${calendarIcon}</span>
    </div>`;
  }

  function mountExecutionDatePicker() {
    state.executionDatePicker?.destroy();
    state.executionDatePicker = null;
    const input = document.getElementById('priceFilter-executionDate');
    if (input && window.DatePicker?.mount) {
      state.executionDatePicker = window.DatePicker.mount({
        input,
        panelId: 'priceExecutionDatePickerPanel'
      });
    }
  }

  function renderFilterFields() {
    const fields = filters[state.mode];
    document.getElementById('priceFilterFields').innerHTML = fields.map((field) => {
      const id = `priceFilter-${field.key}`;
      const isCategory = field.key === 'category';
      const control = isCategory
        ? renderCategoryFilter()
        : field.type === 'select'
        ? `<select class="filter-select" id="${id}">${optionList(field.key, field.placeholder)}</select>`
        : field.type === 'date'
        ? renderDateFilter(id)
        : `<input class="filter-input" id="${id}" type="${field.type === 'date' ? 'date' : 'text'}"${field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ''}>`;
      return `<div class="filter-group price-filter-group${isCategory ? ' price-category-group' : ''}"><label class="filter-label" for="${isCategory ? 'priceCategoryTrigger' : id}">${escapeHtml(field.label)}</label>${control}</div>`;
    }).join('');
    mountExecutionDatePicker();
    renderCategoryTree();
  }

  function getFilterValue(key) {
    if (key === 'category') return state.category;
    return document.getElementById(`priceFilter-${key}`)?.value.trim() || '';
  }

  function categoryMatches(rowCategory, selectedCategory) {
    const value = String(rowCategory || '').trim();
    return value === selectedCategory || value.startsWith(`${selectedCategory}-`);
  }

  function executionRecords(row) {
    return Array.isArray(row.availableExecutionRecords)
      ? row.availableExecutionRecords
      : (Array.isArray(row.executionRecords) ? row.executionRecords : []);
  }

  function executionRecordForDate(row, date) {
    if (!date) return null;
    return executionRecords(row).find((record) => {
      const dates = String(record.executionCycle || '').match(/\d{4}-\d{2}-\d{2}/g) || [];
      if (dates.length < 2) return false;
      return date >= dates[0] && date <= dates[1];
    }) || null;
  }

  function displayExecution(row) {
    return row.currentExecution || null;
  }

  function currentExecutionSupplier(row) {
    const execution = displayExecution(row);
    const currentPrice = String(row.currentPrice || execution?.price || '').trim();
    if (!currentPrice || currentPrice === '--') return '';
    return String(execution?.supplier || '').trim();
  }

  function displayBidExecution(row) {
    const selectedDate = getFilterValue('executionDate');
    return selectedDate
      ? executionRecordForDate(row, selectedDate)
      : (row.currentExecution || null);
  }

  function hasExecutionPrice(row) {
    const price = String(displayBidExecution(row)?.price || '').trim();
    return Boolean(price && price !== '--');
  }

  function applyFilters(resetPage = true) {
    const name = getFilterValue('name').toLowerCase();
    const supplier = getFilterValue('supplier').toLowerCase();
    const customerName = getFilterValue('customerName').toLowerCase();
    const category = getFilterValue('category');
    const priceType = getFilterValue('priceType');
    const executionPriceStatus = getFilterValue('executionPriceStatus');
    const filtered = state.rows.filter((row) => {
      if (getFilterValue('purchaseType') && row.purchaseType !== getFilterValue('purchaseType')) return false;
      const rowSupplier = isEducationPage && state.mode === 'purchase' ? currentExecutionSupplier(row) : row.supplier;
      if (supplier && !String(rowSupplier || '').toLowerCase().includes(supplier)) return false;
      if (getFilterValue('customerType') && row.customerType !== getFilterValue('customerType')) return false;
      if (getFilterValue('district') && row.district !== getFilterValue('district')) return false;
      if (category && !categoryMatches(row.category, category)) return false;
      if (executionPriceStatus === '有' && !hasExecutionPrice(row)) return false;
      if (executionPriceStatus === '无' && hasExecutionPrice(row)) return false;
      if (priceType && !priceTypeMatches(row, priceType)) return false;
      if (name && !`${row.name} ${row.code}`.toLowerCase().includes(name)) return false;
      if (customerName && !String(row.customerName || '').toLowerCase().includes(customerName)) return false;
      return true;
    });
    state.filteredRows = filtered;
    state.total = hasActiveFilter() ? filtered.length : state.baseTotal;
    if (resetPage) state.page = 1;
    state.pagination?.update({ total: state.total, page: state.page, pageSize: state.pageSize });
    renderTable();
  }

  function priceTypeMatches(row, type) {
    const map = state.mode === 'purchase'
      ? { '手动定价': 'manualPrice', '协议价': 'agreementPrice', '近一次采购价': 'recentPrice', '供应商报价': 'supplierQuote', '市场价': 'marketPrice', '中标价': 'bidPrice' }
      : { '手动定价': 'manualPrice', '协议价': 'agreementPrice', '近一次销售价': 'recentPrice', '市场价': 'marketPrice' };
    return row[map[type]] && row[map[type]] !== '--';
  }

  function renderPrice(value, source = '') {
    if (!value || value === '--') return '<span class="price-empty">--</span>';
    return `<span class="price-value-wrap">${source ? `<span class="price-source-tag">${escapeHtml(source)}</span>` : ''}<span>${escapeHtml(value)}</span></span>`;
  }

  function renderClearedPrice() {
    return renderPrice('--');
  }

  function renderBlankPrice() {
    return '<span class="price-empty" aria-hidden="true"></span>';
  }

  const priceSourceShortLabels = {
    手动定价: '手',
    协议价: '协',
    近一次采购价: '近',
    近一次销售价: '近',
    供应商报价: '供',
    市场价: '市',
    中标价: '中'
  };

  function renderCurrentPrice(row) {
    const execution = displayExecution(row);
    const source = execution ? '中标价' : String(row.currentSource || '');
    const currentPrice = String(row.currentPrice || execution?.price || '').trim();
    if (!currentPrice || currentPrice === '--') {
      const hasFuturePrice = Array.isArray(row.futureExecutionRecords) && row.futureExecutionRecords.length > 0;
      if (!hasFuturePrice) return '<span class="price-current-no-price">暂无执行价格</span>';
      return `<button class="price-current-link price-current-link-pending" type="button" data-action="show-current-price" data-price-id="${escapeHtml(row.id)}" aria-label="查看${escapeHtml(row.name)}未来执行价格" title="当前暂无中标价，存在未来执行价格">待生效</button>`;
    }
    const shortSource = priceSourceShortLabels[source] || source.slice(0, 1);
    return `<button class="price-current-link" type="button" data-action="show-current-price" data-price-id="${escapeHtml(row.id)}" aria-label="查看${escapeHtml(row.name)}执行价格">
      <span class="price-source-tag" title="${escapeHtml(source)}" aria-label="${escapeHtml(source)}">${escapeHtml(shortSource)}</span>
      <span class="price-current-value">${escapeHtml(currentPrice)}</span>
    </button>`;
  }

  function renderProductName(row) {
    const display = `${row.name || '--'}（${row.unit || '--'}/${row.brand || '--'}/${row.spec || '--'}）`;
    return `<span class="price-product-name product-display-text" title="${escapeHtml(display)}">${escapeHtml(display)}</span>`;
  }

  function renderManualCell(row) {
    if (!state.editing) return renderPrice(row.manualPrice);
    const value = row.manualPrice === '--' ? '' : row.manualPrice;
    return `<input class="price-inline-input" data-manual-id="${escapeHtml(row.id)}" value="${escapeHtml(value)}" placeholder="请输入单价" inputmode="decimal">`;
  }

  function renderPurchaseHead() {
    const priceHeaders = isEducationPage
      ? '<th class="price-current-col">当前执行价格</th><th class="price-bid-col">中标价</th>'
      : '<th class="price-current-col">当前执行价格</th><th>手动订价 <span class="price-help-icon" title="手动订价说明" aria-label="手动订价说明">?</span></th><th>中标价</th><th>协议价</th><th>近一次采购价</th><th>供应商报价</th><th>市场价</th>';
    return `<tr>
      <th class="price-seq-col">序号</th><th class="price-image-col">图片</th><th class="price-code-col">商品编号</th>
      <th class="price-name-col">商品名称（计量单位/品牌/规格）</th><th class="price-category-col">分类</th><th class="price-unit-col">计量单位</th>
      <th class="price-partner-col">供应商</th>${priceHeaders}
    </tr>`;
  }

  function renderSalesHead() {
    return `<tr>
      <th class="price-seq-col">序号</th><th class="price-image-col">图片</th><th class="price-code-col">商品编号</th>
      <th class="price-partner-col">客户名称</th><th class="price-name-col">商品名称（计量单位/品牌/规格）</th><th class="price-category-col">商品分类</th>
      <th class="price-unit-col">计量单位</th><th class="price-current-col">当前执行价格</th><th>手动订价 <span class="price-help-icon" title="手动订价说明" aria-label="手动订价说明">?</span></th><th>协议价</th>
      <th>近一次销售价</th><th>市场价</th>
    </tr>`;
  }

  function renderPurchaseRow(row, index) {
    const priceCells = isEducationPage
      ? `<td class="price-current-col">${renderCurrentPrice(row)}</td><td class="price-bid-col">${renderExecutionBidPrice(row)}</td>`
      : `<td class="price-current-col">${renderCurrentPrice(row)}</td><td>${renderPrice(row.manualPrice)}</td><td>${renderExecutionBidPrice(row)}</td><td>${renderPrice(row.agreementPrice)}</td><td>${renderPrice(row.recentPrice)}</td><td>${renderPrice(row.supplierQuote)}</td><td>${renderPrice(row.marketPrice)}</td>`;
    const supplier = isEducationPage ? currentExecutionSupplier(row) : row.supplier;
    return `<tr>
      <td class="price-seq-col">${row.seq ?? index + 1 + (state.page - 1) * state.pageSize}</td>
      <td class="price-image-col img-cell"><div class="product-img" aria-label="商品图片">图片</div></td>
      <td class="price-code-col">${escapeHtml(row.code)}</td><td class="price-name-col">${renderProductName(row)}</td>
      <td class="price-category-col">${escapeHtml(row.category)}</td><td class="price-unit-col">${escapeHtml(row.unit)}</td>
      <td class="price-partner-col">${escapeHtml(supplier)}</td>${priceCells}
    </tr>`;
  }

  function renderExecutionBidPrice(row) {
    const selectedDate = getFilterValue('executionDate');
    const execution = displayBidExecution(row);
    const price = String(execution?.price || (selectedDate ? '' : row.bidPrice) || '').trim();
    if (!price || price === '--') return '<span aria-hidden="true"></span>';
    return renderPrice(price);
  }

  function renderSalesRow(row, index) {
    return `<tr>
      <td class="price-seq-col">${row.seq ?? index + 1 + (state.page - 1) * state.pageSize}</td>
      <td class="price-image-col img-cell"><div class="product-img" aria-label="商品图片">图片</div></td>
      <td class="price-code-col">${escapeHtml(row.code)}</td><td class="price-partner-col">${escapeHtml(row.customerName)}</td>
      <td class="price-name-col">${renderProductName(row)}</td><td class="price-category-col">${escapeHtml(row.category)}</td>
      <td class="price-unit-col">${escapeHtml(row.unit)}</td><td class="price-current-col">${renderCurrentPrice(row)}</td>
      <td>${renderManualCell(row)}</td><td>${renderClearedPrice()}</td><td>${renderClearedPrice()}</td><td>${renderClearedPrice()}</td>
    </tr>`;
  }

  function renderTable() {
    const start = (state.page - 1) * state.pageSize;
    const visibleCount = Math.min(state.pageSize, Math.max(0, state.total - start));
    const visibleRows = visibleCount && state.filteredRows.length
      ? Array.from({ length: visibleCount }, (_, offset) => ({
        ...state.filteredRows[(start + offset) % state.filteredRows.length],
        seq: start + offset + 1
      }))
      : [];
    const table = document.querySelector('.price-data-table');
    if (table) table.dataset.priceTableMode = state.mode;
    document.getElementById('priceTableHead').innerHTML = state.mode === 'purchase' ? renderPurchaseHead() : renderSalesHead();
    document.getElementById('priceTableBody').innerHTML = visibleRows.length
      ? visibleRows.map((row, index) => state.mode === 'purchase' ? renderPurchaseRow(row, index) : renderSalesRow(row, index)).join('')
      : `<tr><td class="price-empty-row" colspan="${state.mode === 'purchase' ? (isEducationPage ? 9 : 14) : 12}">暂无符合条件的数据</td></tr>`;
    const editButton = document.getElementById('editPricingBtn');
    if (editButton) editButton.textContent = state.editing ? '完成编辑' : '编辑订价';
    if (state.pagination) state.pagination.update({ total: state.total, page: state.page, pageSize: state.pageSize });
  }

  function hasActiveFilter() {
    return ['purchaseType', 'supplier', 'customerType', 'district', 'category', 'priceType', 'name', 'customerName', 'executionDate', 'executionPriceStatus']
      .some((key) => getFilterValue(key));
  }

  function renderMode() {
    state.editing = false;
    state.page = 1;
    state.category = '';
    state.categoryExpanded.clear();
    state.rows = window.PriceExecutionService.getList(state.mode);
    state.filteredRows = [...state.rows];
    state.baseTotal = window.PriceExecutionService.getTotal?.(state.mode) || state.rows.length;
    state.total = state.baseTotal;
    renderFilterFields();
    document.querySelectorAll('.price-mode-tab').forEach((tab) => {
      const active = tab.dataset.priceMode === state.mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.sales-only-action').forEach((element) => {
      element.hidden = state.mode !== 'sales';
    });
    document.querySelectorAll('.sales-pricing-action').forEach((element) => {
      element.hidden = state.mode !== 'sales';
    });
    state.pagination?.update({ total: state.total, page: 1, pageSize: state.pageSize });
    renderTable();
  }

  function toast(message, type = '') {
    const element = document.getElementById('priceToast');
    element.textContent = message;
    element.className = `price-toast visible ${type}`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('visible'), 2200);
  }

  function openImport() {
    const mask = document.getElementById('priceImportMask');
    mask.classList.add('is-open');
    mask.setAttribute('aria-hidden', 'false');
  }

  function closeImport() {
    const mask = document.getElementById('priceImportMask');
    mask.classList.remove('is-open');
    mask.setAttribute('aria-hidden', 'true');
  }

  function openCurrentPrice(id) {
    const row = state.rows.find((item) => item.id === id);
    if (!row) return;
    const records = executionRecords(row);
    document.getElementById('priceDetailTitle').textContent = '执行价格';
    document.getElementById('priceDetailBody').innerHTML = records.length
      ? records.map((record) => `<tr><td>${escapeHtml(record.executionCycle)}</td><td>${escapeHtml(record.supplier)}</td><td>${escapeHtml(record.price)}</td></tr>`).join('')
      : '<tr><td class="price-detail-empty" colspan="3">暂无执行价格</td></tr>';
    const mask = document.getElementById('priceDetailMask');
    mask.classList.add('is-open');
    mask.setAttribute('aria-hidden', 'false');
  }

  function closeCurrentPrice() {
    const mask = document.getElementById('priceDetailMask');
    mask.classList.remove('is-open');
    mask.setAttribute('aria-hidden', 'true');
  }

  function finishEditing() {
    const inputs = document.querySelectorAll('[data-manual-id]');
    let changed = 0;
    inputs.forEach((input) => {
      const row = state.rows.find((item) => item.id === input.dataset.manualId);
      if (!row) return;
      const raw = input.value.trim();
      if (raw && !/^\d+(\.\d{1,4})?$/.test(raw)) {
        input.focus();
        toast('单价请输入最多4位小数的数字', 'error');
        return;
      }
      const next = raw ? Number(raw).toFixed(4) : '--';
      if (row.manualPrice !== next) changed += 1;
      row.manualPrice = next;
      if (state.mode === 'sales' && next !== '--') {
        row.currentPrice = next;
        row.currentSource = '手动定价';
      }
    });
    state.editing = false;
    renderTable();
    toast(changed ? `已保存${changed}条订价` : '订价未发生变化');
  }

  function exportValue(value) {
    const text = String(value ?? '').trim();
    return !text || text === '--' ? '' : value;
  }

  function getPurchaseExportRows() {
    const selectedDate = getFilterValue('executionDate');
    return state.filteredRows.map((row, index) => ({
      seq: index + 1,
      code: row.code,
      name: row.name,
      category: row.category,
      unit: row.unit,
      supplier: isEducationPage ? currentExecutionSupplier(row) : row.supplier,
      currentPrice: exportValue(row.currentPrice),
      manualPrice: exportValue(row.manualPrice),
      bidPrice: exportValue(displayBidExecution(row)?.price || (selectedDate ? '' : row.bidPrice)),
      agreementPrice: exportValue(row.agreementPrice),
      recentPrice: exportValue(row.recentPrice),
      supplierQuote: exportValue(row.supplierQuote),
      marketPrice: isEducationPage ? '' : exportValue(row.marketPrice)
    }));
  }

  function exportRows() {
    const headers = state.mode === 'purchase'
      ? (isEducationPage
        ? ['序号', '商品编号', '商品名称', '分类', '计量单位', '供应商', '当前执行价格', '中标价']
        : ['序号', '商品编号', '商品名称', '分类', '计量单位', '供应商', '当前执行价格', '手动订价', '中标价', '协议价', '近一次采购价', '供应商报价', '市场价'])
      : ['序号', '商品编号', '客户名称', '商品名称', '商品分类', '计量单位', '当前执行价格', '手动定价', '协议价', '近一次销售价', '市场价'];
    const rows = state.mode === 'purchase'
      ? getPurchaseExportRows().map((row) => isEducationPage
        ? [row.seq, row.code, row.name, row.category, row.unit, row.supplier, row.currentPrice, row.bidPrice]
        : [row.seq, row.code, row.name, row.category, row.unit, row.supplier, row.currentPrice, row.manualPrice, row.bidPrice, row.agreementPrice, row.recentPrice, row.supplierQuote, row.marketPrice])
      : state.filteredRows.map((row, index) => [index + 1, row.code, row.customerName, row.name, row.category, row.unit, exportValue(row.currentPrice), exportValue(row.manualPrice), exportValue(row.agreementPrice), exportValue(row.recentPrice), exportValue(row.marketPrice)]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }));
    link.download = `${state.mode === 'purchase' ? '采购' : '销售'}价执行清单.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast('导出成功');
  }

  function bindEvents(root) {
    const categoryTree = document.getElementById('priceCategoryTree');
    categoryTree?.addEventListener('click', (event) => {
      const categoryToggle = event.target.closest('[data-category-toggle]');
      if (!categoryToggle || !categoryTree.contains(categoryToggle)) return;
      event.preventDefault();
      event.stopPropagation();
      const value = categoryToggle.dataset.categoryToggle;
      if (state.categoryExpanded.has(value)) state.categoryExpanded.delete(value);
      else state.categoryExpanded.add(value);
      renderCategoryTree();
    });

    root.addEventListener('click', (event) => {
      const categoryTrigger = event.target.closest('[data-category-trigger]');
      if (categoryTrigger) {
        toggleCategoryPicker();
        return;
      }
      const categoryOption = event.target.closest('[data-category-select]');
      if (categoryOption) {
        selectCategory(categoryOption.dataset.categorySelect || '');
        return;
      }
      const modeTab = event.target.closest('.price-mode-tab[data-price-mode]');
      if (modeTab) {
        state.mode = modeTab.dataset.priceMode;
        renderMode();
        return;
      }
      const actionElement = event.target.closest('[data-action]');
      if (!actionElement) return;
      const action = actionElement.dataset.action;
      if (action === 'query') { applyFilters(); return; }
      if (action === 'reset') {
        document.getElementById('priceFilterFields').querySelectorAll('input, select').forEach((element) => { element.value = ''; });
        const defaultExecutionDate = currentDateValue();
        if (state.executionDatePicker) state.executionDatePicker.setValue(defaultExecutionDate, false);
        else {
          const executionDateInput = document.getElementById('priceFilter-executionDate');
          if (executionDateInput) executionDateInput.value = defaultExecutionDate;
        }
        state.category = '';
        state.categoryExpanded.clear();
        toggleCategoryPicker(false);
        renderCategoryTree();
        applyFilters();
        return;
      }
      if (action === 'edit-pricing') {
        if (state.editing) finishEditing();
        else { state.editing = true; renderTable(); }
        return;
      }
      if (action === 'open-import') { openImport(); return; }
      if (action === 'close-import') { closeImport(); return; }
      if (action === 'show-current-price') { openCurrentPrice(actionElement.dataset.priceId); return; }
      if (action === 'close-price-detail') { closeCurrentPrice(); return; }
      if (action === 'choose-file') { document.getElementById('priceFileInput').click(); return; }
      if (action === 'confirm-import') {
        if (!document.getElementById('priceFileInput').files.length) { toast('请先选择xlsx文件', 'error'); return; }
        closeImport();
        toast('订价导入成功');
        return;
      }
      if (action === 'download-template') { toast('订价导入模板下载中'); return; }
      if (action === 'purchase-to-sales') { toast('已按采购价生成销售价草稿'); return; }
      if (action === 'sync-pricing') { toast('销售订价同步成功'); return; }
      if (action === 'export') { exportRows(); }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.price-category-picker')) toggleCategoryPicker(false);
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.closest('#priceFilterFields')) applyFilters();
      if (event.key === 'Escape') closeCurrentPrice();
    });

    document.getElementById('priceImportMask').addEventListener('click', (event) => {
      if (event.target.id === 'priceImportMask') closeImport();
    });
    document.getElementById('priceDetailMask').addEventListener('click', (event) => {
      if (event.target.id === 'priceDetailMask') closeCurrentPrice();
    });
    document.getElementById('priceFileInput').addEventListener('change', (event) => {
      const file = event.target.files[0];
      document.getElementById('priceFileName').textContent = file ? file.name : '未选择文件';
    });
  }

  const root = window.AppShell.mount({ title: '价格执行清单', content: pageContent, variant: pageVariant });
  if (educationPriceExecutionExportAnnotation && window.AnnotationOverlay?.mount) {
    window.AnnotationOverlay.mount(root.querySelector('#pageContent') || root, [educationPriceExecutionExportAnnotation]);
  }
  state.rows = window.PriceExecutionService.getList(state.mode);
  state.filteredRows = [...state.rows];
  state.baseTotal = window.PriceExecutionService.getTotal?.(state.mode) || state.rows.length;
  state.total = state.baseTotal;
  renderFilterFields();
  bindEvents(root);
  state.pagination = window.Pagination.create({
    container: '#pricePagination',
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    pageSizeOptions: [20, 50, 100],
    maxVisiblePages: 5,
    onChange: ({ page, pageSize }) => {
      state.page = page;
      state.pageSize = pageSize;
      renderTable();
    }
  });
  renderTable();
})();
