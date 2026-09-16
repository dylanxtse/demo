(function () {
  const defaultDates = {
    startDate: '2026-08-17',
    endDate: '2026-09-17'
  };

  const columns = [
    { key: 'customerCode', label: '客户编号' },
    { key: 'customerType', label: '客户类型' },
    { key: 'customerName', label: '客户名称' },
    { key: 'canteen', label: '食堂' },
    { key: 'orderCount', label: '订单数' },
    { key: 'returnCount', label: '退货单数' },
    { key: 'orderAmount', label: '下单金额', money: true },
    { key: 'shippingAmount', label: '发货金额', money: true },
    { key: 'returnAmount', label: '退货金额', money: true },
    { key: 'actualAmount', label: '实际金额', money: true },
    { key: 'actualRank', label: '实际金额排名' }
  ];

  const fallbackRows = [
    {
      id: 'CUSTOMER-SALE-001',
      statisticsDate: '2026-08-24',
      customerCode: '31010610002',
      customerType: '默认客户类型（学校）',
      customerName: '静安第1中学',
      canteen: '第2食堂',
      orderCount: 3,
      returnCount: 1,
      orderAmount: 21,
      shippingAmount: 63,
      returnAmount: 10,
      actualAmount: 53,
      actualRank: 1,
      warehouse: '中心仓',
      businessUnit: '学校'
    },
    {
      id: 'CUSTOMER-SALE-002',
      statisticsDate: '2026-09-05',
      customerCode: '31010610002',
      customerType: '默认客户类型（学校）',
      customerName: '静安第1中学',
      canteen: '静安第一中学食堂',
      orderCount: 4,
      returnCount: 0,
      orderAmount: 84,
      shippingAmount: 0,
      returnAmount: 0,
      actualAmount: 0,
      actualRank: 2,
      warehouse: '中心仓',
      businessUnit: '学校'
    }
  ];

  const selectOptions = {
    warehouse: ['中心仓', '北区仓', '临时仓'],
    businessUnit: ['学校', '机关单位'],
    customerType: ['默认客户类型（学校）', '学校', '幼儿园', '机关单位'],
    customerName: ['静安第1中学', '第一实验学校', '育才中学'],
    canteen: ['第2食堂', '静安第一中学食堂', '第一食堂', '高中部食堂']
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

  function formatCount(value, total = false) {
    return total ? Number(value || 0).toFixed(2) : String(Number(value || 0));
  }

  function normalizeRow(row, index) {
    const shippingAmount = Number(row.shippingAmount ?? row.shippedAmount ?? row.deliveryAmount ?? 0);
    const returnAmount = Number(row.returnAmount ?? 0);
    return {
      id: row.id || row.code || 'CUSTOMER-SALE-' + String(index + 1).padStart(3, '0'),
      statisticsDate: row.statisticsDate || row.date || row.deliveryDate || row.returnDate || '',
      customerCode: row.customerCode || row.customerId || row.code || '',
      customerType: row.customerType || row.type || '',
      customerName: row.customerName || row.name || '',
      canteen: row.canteen || row.canteenName || '',
      orderCount: Number(row.orderCount ?? row.orders ?? 0),
      returnCount: Number(row.returnCount ?? row.returns ?? 0),
      orderAmount: Number(row.orderAmount ?? row.orderedAmount ?? 0),
      shippingAmount,
      returnAmount,
      actualAmount: Number(row.actualAmount ?? (shippingAmount - returnAmount)),
      actualRank: row.actualRank ?? row.rank ?? '',
      warehouse: row.warehouse || '',
      businessUnit: row.businessUnit || row.parentUnit || ''
    };
  }

  function getRows() {
    try {
      const storedRows = window.DemoStore?.get?.('customerSales');
      if (Array.isArray(storedRows) && storedRows.length) {
        return storedRows.map(normalizeRow);
      }
    } catch (error) {
      // 页面没有客户统计资源时，继续使用可交互的示例数据。
    }
    return fallbackRows.map(normalizeRow);
  }

  function renderSelectField(key, label) {
    const options = [''].concat(selectOptions[key] || []);
    return [
      '<div class="operations-field customer-statistics-field">',
      '<label class="filter-label" for="customer-statistics-' + key + '">' + label + '</label>',
      '<select class="filter-select" id="customer-statistics-' + key + '" data-customer-filter="' + key + '" aria-label="' + label + '">',
      options.map((option) => '<option value="' + escapeHtml(option) + '">' + escapeHtml(option || '全部') + '</option>').join(''),
      '</select>',
      '</div>'
    ].join('');
  }

  function renderTableHead() {
    return '<tr>' + columns.map((column) => {
      if (column.key !== 'actualRank') {
        const info = column.key === 'actualAmount'
          ? '<span class="customer-statistics-info" title="实际金额=发货金额-退货金额">?</span>'
          : '';
        return '<th scope="col">' + column.label + info + '</th>';
      }
      return '<th scope="col"><button class="customer-statistics-sort-button is-desc" type="button" data-action="sort" aria-label="按实际金额排名排序" aria-sort="descending">'
        + column.label + '<span class="customer-statistics-sort-indicator" aria-hidden="true"></span></button></th>';
    }).join('') + '</tr>';
  }

  function renderCell(row, column) {
    if (column.money) return formatMoney(row[column.key]);
    if (['orderCount', 'returnCount'].includes(column.key)) return String(row[column.key] ?? 0);
    const value = row[column.key] == null || row[column.key] === '' ? '--' : row[column.key];
    return '<span class="customer-statistics-truncate" title="' + escapeHtml(value) + '">' + escapeHtml(value) + '</span>';
  }

  function sumRows(rows) {
    return rows.reduce((total, row) => {
      total.orderCount += Number(row.orderCount || 0);
      total.returnCount += Number(row.returnCount || 0);
      total.orderAmount += Number(row.orderAmount || 0);
      total.shippingAmount += Number(row.shippingAmount || 0);
      total.returnAmount += Number(row.returnAmount || 0);
      total.actualAmount += Number(row.actualAmount || 0);
      return total;
    }, {
      orderCount: 0,
      returnCount: 0,
      orderAmount: 0,
      shippingAmount: 0,
      returnAmount: 0,
      actualAmount: 0
    });
  }

  function renderEmptyRow() {
    return '<tr><td class="empty-cell" colspan="' + columns.length + '">暂无数据</td></tr>';
  }

  function renderBody(rows) {
    return rows.length
      ? rows.map((row) => '<tr>' + columns.map((column) => '<td>' + renderCell(row, column) + '</td>').join('') + '</tr>').join('')
      : renderEmptyRow();
  }

  function renderFooter(rows) {
    const total = sumRows(rows);
    return '<tr><td>合计</td><td></td><td></td><td></td>'
      + '<td>' + formatCount(total.orderCount, true) + '</td>'
      + '<td>' + formatCount(total.returnCount, true) + '</td>'
      + '<td>' + formatMoney(total.orderAmount) + '</td>'
      + '<td>' + formatMoney(total.shippingAmount) + '</td>'
      + '<td>' + formatMoney(total.returnAmount) + '</td>'
      + '<td>' + formatMoney(total.actualAmount) + '</td><td>--</td></tr>';
  }

  function render() {
    const content = [
      '<section class="page-card operations-page order-module-page customer-statistics-page" aria-label="客户统计">',
      '<div class="operations-filter filter-section customer-statistics-filter" role="search" aria-label="客户统计筛选条件">',
      '<div class="operations-filter-main">',
      '<div class="operations-filter-grid" data-operations-filter-grid>',
      '<div class="operations-field customer-statistics-date-field">',
      '<label class="filter-label" for="customer-statistics-date-display">期望送达/退货日期</label>',
      '<div class="customer-statistics-date-range date-range-picker operations-date-range" id="customerStatisticsDateRange">',
      '<input id="customer-statistics-date-display" class="filter-input date-range-display" type="text" readonly placeholder="请选择日期范围" aria-label="期望送达/退货日期">',
      '<input type="hidden" data-date-start data-customer-filter="startDate" value="' + defaultDates.startDate + '">',
      '<input type="hidden" data-date-end data-customer-filter="endDate" value="' + defaultDates.endDate + '">',
      '<span class="date-range-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>',
      '</div>',
      '</div>',
      renderSelectField('warehouse', '仓库'),
      renderSelectField('businessUnit', '上级单位'),
      renderSelectField('customerType', '客户类型'),
      renderSelectField('customerName', '客户名称'),
      renderSelectField('canteen', '食堂'),
      '</div>',
      '<div class="operations-filter-actions">',
      '<button class="btn btn-primary btn-sm" id="customer-statistics-query" type="button">查询</button>',
      '<button class="btn btn-sm" id="customer-statistics-reset" type="button">重置</button>',
      '</div>',
      '</div>',
      '<div class="customer-statistics-toolbar">',
      '<div class="customer-statistics-export-row"><button class="customer-statistics-export" id="customer-statistics-export" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg><span>导出</span></button></div>',
      '<p class="customer-statistics-note">订单发货后统计客户销量，展示客户的购买情况（待审核、待确认、待发货、已关闭的不在统计范围内）</p>',
      '</div>',
      '<div class="customer-statistics-table-container">',
      '<div class="customer-statistics-table-wrap"><table class="operations-table customer-statistics-table" aria-label="客户统计数据">',
      '<colgroup><col style="width:10%"><col style="width:10%"><col style="width:11%"><col style="width:10%"><col style="width:7%"><col style="width:8%"><col style="width:9%"><col style="width:9%"><col style="width:9%"><col style="width:9%"><col style="width:10%"></colgroup>',
      '<thead id="customerStatisticsTableHead">' + renderTableHead() + '</thead>',
      '<tbody id="customerStatisticsTableBody"></tbody>',
      '<tfoot id="customerStatisticsTableFoot"></tfoot>',
      '</table></div>',
      '<div class="pagination customer-statistics-pagination" id="customerStatisticsPagination"></div>',
      '</div>',
      '</section>'
    ].join('');

    const root = window.AppShell.mount({ title: '客户统计', content: content });
    const rows = getRows();
    const state = {
      page: 1,
      pageSize: 20,
      sort: 'desc',
      condition: { ...defaultDates },
      filteredRows: rows
    };

    const dateRangePicker = window.DateRangePicker?.create({
      container: root.querySelector('#customerStatisticsDateRange')
    });

    function collectCondition() {
      const condition = {};
      root.querySelectorAll('[data-customer-filter]').forEach((element) => {
        condition[element.dataset.customerFilter] = String(element.value || '').trim();
      });
      return condition;
    }

    function matches(row, condition) {
      const start = condition.startDate || defaultDates.startDate;
      const end = condition.endDate || defaultDates.endDate;
      if (row.statisticsDate && start && row.statisticsDate < start) return false;
      if (row.statisticsDate && end && row.statisticsDate > end) return false;
      return ['warehouse', 'businessUnit', 'customerType', 'customerName', 'canteen'].every((key) => {
        return !condition[key] || row[key] === condition[key];
      });
    }

    function sortRows(input) {
      return input.map((row, index) => ({ row, index })).sort((left, right) => {
        const difference = Number(right.row.actualAmount || 0) - Number(left.row.actualAmount || 0);
        if (difference !== 0) return state.sort === 'desc' ? difference : -difference;
        return left.index - right.index;
      }).map((item) => item.row);
    }

    function renderTable() {
      state.filteredRows = sortRows(rows.filter((row) => matches(row, state.condition)));
      const start = (state.page - 1) * state.pageSize;
      const pageRows = state.filteredRows.slice(start, start + state.pageSize);
      root.querySelector('#customerStatisticsTableBody').innerHTML = renderBody(pageRows);
      root.querySelector('#customerStatisticsTableFoot').innerHTML = renderFooter(state.filteredRows);
      const sortButton = root.querySelector('[data-action="sort"]');
      sortButton?.classList.toggle('is-desc', state.sort === 'desc');
      sortButton?.classList.toggle('is-asc', state.sort === 'asc');
      sortButton?.setAttribute('aria-sort', state.sort === 'desc' ? 'descending' : 'ascending');
      state.pagination?.update({ page: state.page, pageSize: state.pageSize, total: state.filteredRows.length });
    }

    function refresh() {
      state.condition = collectCondition();
      state.page = 1;
      renderTable();
    }

    function reset() {
      dateRangePicker?.setValue(defaultDates.startDate, defaultDates.endDate, false);
      root.querySelectorAll('select[data-customer-filter]').forEach((element) => { element.value = ''; });
      state.sort = 'desc';
      refresh();
    }

    function exportRows() {
      const csvCell = (value) => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
      const csvRows = [
        columns.map((column) => column.label),
        ...state.filteredRows.map((row) => columns.map((column) => {
          if (column.money) return formatMoney(row[column.key]);
          return row[column.key] == null ? '' : row[column.key];
        }))
      ];
      const csv = csvRows.map((row) => row.map(csvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = '客户统计.csv';
      link.click();
      URL.revokeObjectURL(url);
    }

    state.pagination = window.Pagination?.create({
      container: '#customerStatisticsPagination',
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
      if (event.target.closest('#customer-statistics-query')) return refresh();
      if (event.target.closest('#customer-statistics-reset')) return reset();
      if (event.target.closest('#customer-statistics-export')) return exportRows();
      if (event.target.closest('[data-action="sort"]')) {
        state.sort = state.sort === 'desc' ? 'asc' : 'desc';
        state.page = 1;
        renderTable();
      }
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.closest('[data-customer-filter]')) refresh();
    });

    renderTable();
  }

  render();
})();
