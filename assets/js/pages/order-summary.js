(function () {
  const columns = [
    { key: 'date', label: '期望送达/退货日期' },
    { key: 'customerCount', label: '下单客户数' },
    { key: 'orderCount', label: '订单数' },
    { key: 'returnCount', label: '退货数' },
    { key: 'orderAmount', label: '下单金额', money: true },
    { key: 'shippingAmount', label: '发货金额', money: true },
    { key: 'returnAmount', label: '退货金额', money: true },
    { key: 'actualAmount', label: '实际金额', money: true }
  ];

  const modeConfig = {
    shipping: {
      dateLabel: '发货/退货日期',
      tabLabel: '按发货/退货日期汇总'
    },
    expected: {
      dateLabel: '期望送达时间',
      tabLabel: '按期望送达时间汇总'
    }
  };

  const defaultDates = {
    startDate: '2026-08-05',
    endDate: '2026-09-05'
  };

  const summaryByDate = {
    '2026-08-05': {
      customerCount: 2,
      orderCount: 3,
      returnCount: 0,
      orderAmount: 156,
      shippingAmount: 1107,
      returnAmount: 0,
      actualAmount: 1107,
      warehouse: '中心仓',
      businessUnit: '学校',
      customerType: '学校',
      customerName: '第一实验学校',
      canteen: '第一食堂'
    },
    '2026-08-08': {
      customerCount: 1,
      orderCount: 2,
      returnCount: 0,
      orderAmount: 120,
      shippingAmount: 20,
      returnAmount: 0,
      actualAmount: 20,
      warehouse: '中心仓',
      businessUnit: '学校',
      customerType: '学校',
      customerName: '育才中学',
      canteen: '高中部食堂'
    },
    '2026-08-20': {
      customerCount: 1,
      orderCount: 1,
      returnCount: 0,
      orderAmount: 250,
      shippingAmount: 0,
      returnAmount: 0,
      actualAmount: 0,
      warehouse: '北区仓',
      businessUnit: '学校',
      customerType: '学校',
      customerName: '育才中学',
      canteen: '高中部食堂'
    }
  };

  const selectOptions = {
    warehouse: ['中心仓', '北区仓', '临时仓'],
    businessUnit: ['学校', '机关单位'],
    customerType: ['学校', '幼儿园', '机关单位'],
    customerName: ['第一实验学校', '育才中学'],
    canteen: ['第一食堂', '高中部食堂']
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return Number(value || 0).toFixed(2);
  }

  function dateToString(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function buildRows() {
    const rows = [];
    const start = new Date(2026, 7, 5);
    const end = new Date(2026, 8, 5);
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateText = dateToString(date);
      rows.push({
        id: 'SUMMARY-' + dateText,
        date: dateText,
        customerCount: 0,
        orderCount: 0,
        returnCount: 0,
        orderAmount: 0,
        shippingAmount: 0,
        returnAmount: 0,
        actualAmount: 0,
        warehouse: '中心仓',
        businessUnit: '学校',
        customerType: '学校',
        customerName: '',
        canteen: '',
        ...(summaryByDate[dateText] || {})
      });
    }
    return rows;
  }

  function renderSelectField(key, label) {
    const options = [''].concat(selectOptions[key] || []);
    return [
      '<div class="operations-field order-summary-field">',
      '<label class="filter-label" for="summary-' + key + '">' + label + '</label>',
      '<select class="filter-select" id="summary-' + key + '" data-summary-filter="' + key + '" aria-label="' + label + '">',
      options.map((option) => '<option value="' + escapeHtml(option) + '">' + escapeHtml(option || '全部') + '</option>').join(''),
      '</select>',
      '</div>'
    ].join('');
  }

  function renderTableHead(mode) {
    const dateLabel = modeConfig[mode].dateLabel;
    return '<thead><tr>' + columns.map((column) => {
      const info = column.key === 'actualAmount'
        ? '<span class="order-summary-info" title="实际金额=发货金额-退货金额">?</span>'
        : '';
      const label = column.key === 'date' ? dateLabel : column.label;
      return '<th scope="col">' + label + info + '</th>';
    }).join('') + '</tr></thead>';
  }

  function sumRows(rows) {
    return rows.reduce((total, row) => {
      total.customerCount += Number(row.customerCount || 0);
      total.orderCount += Number(row.orderCount || 0);
      total.returnCount += Number(row.returnCount || 0);
      total.orderAmount += Number(row.orderAmount || 0);
      total.shippingAmount += Number(row.shippingAmount || 0);
      total.returnAmount += Number(row.returnAmount || 0);
      total.actualAmount += Number(row.actualAmount || 0);
      return total;
    }, {
      customerCount: 0,
      orderCount: 0,
      returnCount: 0,
      orderAmount: 0,
      shippingAmount: 0,
      returnAmount: 0,
      actualAmount: 0
    });
  }

  function cellValue(row, column) {
    if (column.key === 'date') return escapeHtml(row.date);
    if (column.money) return formatMoney(row[column.key]);
    return escapeHtml(row[column.key]);
  }

  function renderBody(rows) {
    if (!rows.length) {
      return '<tbody><tr><td class="empty-cell" colspan="' + columns.length + '">暂无数据</td></tr></tbody>';
    }
    return '<tbody>' + rows.map((row) => (
      '<tr>' + columns.map((column) => '<td>' + cellValue(row, column) + '</td>').join('') + '</tr>'
    )).join('') + '</tbody>';
  }

  function renderFooter(rows) {
    const total = sumRows(rows);
    return '<tfoot><tr><td>合计</td>'
      + '<td>' + total.customerCount + '</td>'
      + '<td>' + total.orderCount + '</td>'
      + '<td>' + total.returnCount + '</td>'
      + '<td>' + formatMoney(total.orderAmount) + '</td>'
      + '<td>' + formatMoney(total.shippingAmount) + '</td>'
      + '<td>' + formatMoney(total.returnAmount) + '</td>'
      + '<td>' + formatMoney(total.actualAmount) + '</td></tr></tfoot>';
  }

  function render() {
    const content = [
      '<section class="page-card operations-page order-module-page order-summary-page" aria-label="订单汇总">',
      '<div class="operations-tabs">',
      '<button class="operations-tab active" type="button" data-view-tab="shipping">' + modeConfig.shipping.tabLabel + '</button>',
      '<button class="operations-tab" type="button" data-view-tab="expected">' + modeConfig.expected.tabLabel + '</button>',
      '</div>',
      '<div class="operations-filter filter-section order-summary-filter" data-order-summary-filter role="search">',
      '<div class="operations-filter-main">',
      '<div class="operations-filter-grid" data-operations-filter-grid>',
      '<div class="operations-field order-summary-field order-summary-date-field">',
      '<label class="filter-label" for="summary-date-range-display" data-summary-date-label>' + modeConfig.shipping.dateLabel + '</label>',
      '<div class="date-range-picker operations-date-range order-summary-date-range" id="summary-date-range">',
      '<input id="summary-date-range-display" class="filter-input date-range-display" type="text" readonly placeholder="请选择日期范围" aria-label="发货/退货日期">',
      '<input type="hidden" data-date-start data-summary-filter="startDate" value="' + defaultDates.startDate + '">',
      '<input type="hidden" data-date-end data-summary-filter="endDate" value="' + defaultDates.endDate + '">',
      '<span class="date-range-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>',
      '</div>',
      '</div>',
      renderSelectField('warehouse', '仓库'),
      renderSelectField('businessUnit', '上级单位'),
      renderSelectField('customerType', '客户类型'),
      renderSelectField('customerName', '客户名称'),
      renderSelectField('canteen', '食堂'),
      '</div>',
      '<div class="operations-filter-actions">',
      '<button class="btn btn-primary btn-sm" id="summary-query" type="button">查询</button>',
      '<button class="btn btn-sm" id="summary-reset" type="button">重置</button>',
      '</div>',
      '</div>',
      '<div class="order-summary-toolbar">',
      '<div class="order-summary-export-row"><button class="order-summary-export" id="summary-export" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg>导出</button></div>',
      '<p class="order-summary-note">下单即统计，展示整体销售情况（待审核与已关闭的不在统计范围内）；未关联订单的退货统计维度为退货日期。</p>',
      '</div>',
      '<div class="order-summary-table-container">',
      '<div class="order-summary-table-wrap is-active" data-summary-table="shipping"><table class="operations-table order-summary-table" aria-label="' + modeConfig.shipping.tabLabel + '"><colgroup>',
      '<col style="width:15%"><col style="width:12.5%"><col style="width:10%"><col style="width:10%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:15%">',
      '</colgroup><thead id="summary-head-shipping"></thead><tbody id="summary-body-shipping"></tbody><tfoot id="summary-foot-shipping"></tfoot></table></div>',
      '<div class="order-summary-table-wrap" data-summary-table="expected"><table class="operations-table order-summary-table" aria-label="' + modeConfig.expected.tabLabel + '"><colgroup>',
      '<col style="width:15%"><col style="width:12.5%"><col style="width:10%"><col style="width:10%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:15%">',
      '</colgroup><thead id="summary-head-expected"></thead><tbody id="summary-body-expected"></tbody><tfoot id="summary-foot-expected"></tfoot></table></div>',
      '<div class="pagination" id="summary-pagination"></div>',
      '</div>',
      '</section>'
    ].join('');

    const root = window.AppShell.mount({ title: '订单汇总', content: content });
    const datasets = {
      shipping: buildRows(),
      expected: buildRows()
    };
    const state = {
      page: 1,
      pageSize: 20,
      mode: 'shipping',
      filteredRows: datasets.shipping,
      condition: {}
    };
    const dateRangePicker = window.DateRangePicker?.create({
      container: root.querySelector('#summary-date-range')
    });

    function collectCondition() {
      const condition = {};
      root.querySelectorAll('[data-summary-filter]').forEach((element) => {
        condition[element.dataset.summaryFilter] = String(element.value || '').trim();
      });
      return condition;
    }

    function matches(row, condition) {
      const start = condition.startDate || defaultDates.startDate;
      const end = condition.endDate || defaultDates.endDate;
      if (start && row.date < start) return false;
      if (end && row.date > end) return false;
      const hasMetrics = Number(row.customerCount) > 0 || Number(row.orderCount) > 0
        || Number(row.returnCount) > 0 || Number(row.orderAmount) > 0
        || Number(row.shippingAmount) > 0 || Number(row.returnAmount) > 0;
      return ['warehouse', 'businessUnit', 'customerType', 'customerName', 'canteen'].every((key) => {
        if (!condition[key] || !hasMetrics) return true;
        return row[key] === condition[key];
      });
    }

    function renderTableForMode(mode, rows) {
      const start = (state.page - 1) * state.pageSize;
      const pageRows = rows.slice(start, start + state.pageSize);
      root.querySelector('#summary-head-' + mode).innerHTML = renderTableHead(mode).replace(/^<thead>|<\/thead>$/g, '');
      root.querySelector('#summary-body-' + mode).outerHTML = renderBody(pageRows).replace('<tbody>', '<tbody id="summary-body-' + mode + '">');
      root.querySelector('#summary-foot-' + mode).outerHTML = renderFooter(rows).replace('<tfoot>', '<tfoot id="summary-foot-' + mode + '">');
      root.querySelector('[data-summary-table="' + mode + '"]').classList.toggle('is-active', mode === state.mode);
    }

    function renderTables() {
      Object.keys(datasets).forEach((mode) => {
        const rows = datasets[mode].filter((row) => matches(row, state.condition));
        renderTableForMode(mode, rows);
      });
    }

    function refresh() {
      state.condition = collectCondition();
      state.filteredRows = datasets[state.mode].filter((row) => matches(row, state.condition));
      state.page = 1;
      renderTables();
      state.pagination.update({ page: state.page, pageSize: state.pageSize, total: state.filteredRows.length });
    }

    function exportRows() {
      const csvCell = (value) => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
      const exportColumns = columns.map((column) => column.key === 'date'
        ? { ...column, label: modeConfig[state.mode].dateLabel }
        : column);
      const csv = [
        exportColumns.map((column) => column.label),
        ...state.filteredRows.map((row) => exportColumns.map((column) => column.money ? formatMoney(row[column.key]) : row[column.key]))
      ].map((row) => row.map(csvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = '订单汇总.csv';
      link.click();
      URL.revokeObjectURL(url);
    }

    state.pagination = window.Pagination.create({
      container: '#summary-pagination',
      page: state.page,
      pageSize: state.pageSize,
      total: state.filteredRows.length,
      pageSizeOptions: [20, 50],
      showArrows: true,
      onChange: ({ page, pageSize }) => {
        state.page = page;
        state.pageSize = pageSize;
        renderTable();
      }
    });

    root.addEventListener('click', (event) => {
      const modeButton = event.target.closest('[data-view-tab]');
      if (modeButton) {
        state.mode = modeButton.dataset.viewTab || 'shipping';
        root.querySelectorAll('.operations-tab').forEach((element) => {
          const active = element.dataset.viewTab === state.mode;
          element.classList.toggle('active', active);
        });
        root.querySelector('[data-summary-date-label]').textContent = modeConfig[state.mode].dateLabel;
        root.querySelector('#summary-date-range-display').setAttribute('aria-label', modeConfig[state.mode].dateLabel);
        return refresh();
      }
      if (event.target.closest('#summary-query')) return refresh();
      if (event.target.closest('#summary-reset')) {
        dateRangePicker?.setValue(defaultDates.startDate, defaultDates.endDate, false);
        root.querySelectorAll('select[data-summary-filter]').forEach((element) => { element.value = ''; });
        return refresh();
      }
      if (event.target.closest('#summary-export')) return exportRows();
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.closest('[data-order-summary-filter]')) refresh();
    });

    renderTables();
  }

  render();
})();
