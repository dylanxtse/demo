(function () {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatEducationUnit = (value) => escapeHtml(String(value || '').replace(/\s*教育局\s*$/, '').trim());

  const renderActualRankHeader = (column, state) => {
    const direction = state?.sort?.key === column.key ? state.sort.direction : '';
    return `<span class="product-sales-sort-header">
      <span>${column.label}</span>
      <span class="product-sales-sort-buttons" aria-label="实际金额排名排序">
        <button class="product-sales-sort-button product-sales-sort-up${direction === 'asc' ? ' is-active' : ''}" type="button" data-record-sort="${column.key}" data-sort-direction="asc" aria-label="按实际金额排名正序排列" aria-pressed="${direction === 'asc'}"></button>
        <button class="product-sales-sort-button product-sales-sort-down${direction === 'desc' ? ' is-active' : ''}" type="button" data-record-sort="${column.key}" data-sort-direction="desc" aria-label="按实际金额排名倒序排列" aria-pressed="${direction === 'desc'}"></button>
      </span>
    </span>`;
  };

  const categorySalesColumns = [
    { key: 'educationUnit', label: '区域', render: (item) => formatEducationUnit(item.educationUnit) },
    { key: 'stapleQty', label: '主食（米面粉点心类）', format: 'decimal' },
    { key: 'oilQty', label: '食油', format: 'decimal' },
    { key: 'vegetableQty', label: '果蔬', format: 'decimal' },
    { key: 'meatBeanQty', label: '肉（豆）制品', format: 'decimal' },
    { key: 'aquaticQty', label: '水产品', format: 'decimal' },
    { key: 'dairyQty', label: '蛋奶类', format: 'decimal' },
    { key: 'seasoningQty', label: '调料', format: 'decimal' },
    { key: 'otherQty', label: '其他材料', format: 'decimal' },
    { key: 'totalQty', label: '销量合计', format: 'decimal' }
  ];

  const productSummaryKeys = new Set([
    'orderCount', 'orderQty', 'orderAmount', 'shippedQty', 'shippedAmount',
    'returnCount', 'returnQty', 'returnAmount', 'actualAmount'
  ]);
  const categorySummaryKeys = new Set([
    'stapleQty', 'oilQty', 'vegetableQty', 'meatBeanQty',
    'aquaticQty', 'dairyQty', 'seasoningQty', 'otherQty', 'totalQty'
  ]);
  const sumSummaryValue = (items, key) => items
    .reduce((total, item) => total + Number(item[key] || 0), 0)
    .toFixed(2);
  const renderSalesSummaryRow = (items, columns, summaryKeys, showSequence, showActions) => {
    const leading = showSequence ? '<td></td>' : '';
    const cells = columns.map((column, index) => {
      if (index === 0) return '<td class="record-summary-label">合计</td>';
      if (summaryKeys.has(column.key)) return `<td>${sumSummaryValue(items, column.key)}</td>`;
      return `<td>${column.key === 'actualRank' ? '--' : ''}</td>`;
    }).join('');
    const actions = showActions ? '<td>--</td>' : '';
    return `<tr class="record-summary-row">${leading}${cells}${actions}</tr>`;
  };
  const renderProductSummaryRow = ({ items, columns, showSequence, showActions }) =>
    renderSalesSummaryRow(items, columns, productSummaryKeys, showSequence, showActions);
  const renderCategorySummaryRow = ({ items, columns, showSequence, showActions }) =>
    renderSalesSummaryRow(items, columns, categorySummaryKeys, showSequence, showActions);

  const primaryCategories = [
    '主食（米面粉点心类）', '食油', '果蔬', '肉（豆）制品',
    '水产品', '蛋奶类', '调料', '其他材料'
  ];
  const salesDateLabelOptions = [
    { label: '期望送达/退货时间', value: 'expectedReturn' },
    { label: '下单时间/退货时间', value: 'orderReturn' }
  ];
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 1);
  const defaultSalesDateRange = [formatDate(previousDate), formatDate(previousDate)];
  const salesDateHint = '先选开始日期，再选结束日期，最多选择一年';
  const pageParams = new URLSearchParams(window.location.search);
  const initialTab = pageParams.get('tab') === 'category' && pageParams.get('source') === 'detail'
    ? 'category'
    : 'product';

  window.RecordPageConfig = {
    title: '商品销量',
    pageClass: 'order-module-page product-sales-page',
    initialTab,
    hideSequence: false,
    hideRowActions: true,
    showSelectionSummary: false,
    selectable: false,
    resource: 'productSales',
    summaryRow: renderProductSummaryRow,
    filters: [
      {
        key: 'dateRange',
        label: '期望送达/退货时间',
        type: 'dateRange',
        labelConditionKey: 'dateType',
        defaultLabelValue: 'expectedReturn',
        initialValue: defaultSalesDateRange,
        maxRangeDays: 365,
        hintText: salesDateHint,
        labelOptions: salesDateLabelOptions
      },
      { key: 'category', label: '分类', options: primaryCategories },
      { key: 'goodsName', label: '商品名称', placeholder: '请输入' },
      { key: 'warehouse', label: '仓库', options: ['中心仓', '北区仓', '临时仓'] },
      { key: 'businessUnit', label: '上级单位', options: ['学校', '机关单位'] },
      { key: 'customerType', label: '客户类型', options: ['学校', '幼儿园', '机关单位'] },
      { key: 'customerName', label: '客户名称', placeholder: '请输入' },
      { key: 'canteen', label: '食堂', placeholder: '请输入' }
    ],
    columns: [
      { key: 'goodsCode', label: '商品编号' },
      { key: 'goodsName', label: '商品名称（计量单位/品牌/规格）', productDisplay: true },
      { key: 'category', label: '商品分类' },
      { key: 'fullCategory', label: '完整分类' },
      { key: 'unit', label: '单位' },
      { key: 'orderCount', label: '订单数' },
      { key: 'orderQty', label: '下单数量', format: 'decimal' },
      { key: 'orderAmount', label: '下单金额', format: 'money' },
      { key: 'shippedQty', label: '发货数量', format: 'decimal' },
      { key: 'shippedAmount', label: '发货金额', format: 'money' },
      { key: 'returnCount', label: '退货数' },
      { key: 'returnQty', label: '退货数量', format: 'decimal' },
      { key: 'returnAmount', label: '退货金额', format: 'money' },
      { key: 'actualAmount', label: '实际金额', format: 'money' },
      { key: 'actualRank', label: '实际金额排名', headerRender: renderActualRankHeader }
    ],
    tabs: [
      {
        key: 'product',
        label: '商品销量'
      },
      {
        key: 'category',
        label: '商品分类销量',
        resource: 'categorySales',
        summaryRow: renderCategorySummaryRow,
        filters: [
          {
            key: 'dateRange',
            label: '期望送达/退货时间',
            type: 'dateRange',
            labelConditionKey: 'dateType',
            defaultLabelValue: 'expectedReturn',
            initialValue: defaultSalesDateRange,
            maxRangeDays: 365,
            hintText: salesDateHint,
            labelOptions: salesDateLabelOptions
          },
          { key: 'educationUnit', label: '区域', placeholder: '请输入' },
          { key: 'schoolName', label: '学校', placeholder: '请输入' }
        ],
        columns: categorySalesColumns,
        hideRowActions: false,
        rowActions: [{ key: 'view', label: '详情' }],
        detailHref: (item, context = {}) => {
          const params = new URLSearchParams({ region: item.educationUnit || '' });
          const dateRange = context.condition?.dateRange;
          if (Array.isArray(dateRange) && (dateRange[0] || dateRange[1])) {
            if (dateRange[0]) params.set('startDate', dateRange[0]);
            if (dateRange[1]) params.set('endDate', dateRange[1]);
            if (context.condition?.dateType) params.set('dateType', context.condition.dateType);
          }
          return `./category-sales-detail.html?${params.toString()}`;
        }
      }
    ],
    toolbar: [{ key: 'export', label: '导出' }]
  };
})();
