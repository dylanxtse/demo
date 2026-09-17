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

  const categoryLevelDefinitions = {
    1: [
      { key: 'staple', label: '主食（米面粉点心类）', sourceKey: 'stapleQty', ratio: 1 },
      { key: 'oil', label: '食油', sourceKey: 'oilQty', ratio: 1 },
      { key: 'vegetable', label: '果蔬', sourceKey: 'vegetableQty', ratio: 1 },
      { key: 'meat-bean', label: '肉（豆）制品', sourceKey: 'meatBeanQty', ratio: 1 },
      { key: 'aquatic', label: '水产品', sourceKey: 'aquaticQty', ratio: 1 },
      { key: 'dairy', label: '蛋奶类', sourceKey: 'dairyQty', ratio: 1 },
      { key: 'seasoning', label: '调料', sourceKey: 'seasoningQty', ratio: 1 },
      { key: 'other', label: '其他材料', sourceKey: 'otherQty', ratio: 1 }
    ],
    2: [
      { key: 'grain', label: '粮食类', sourceKey: 'stapleQty', ratio: 1 },
      { key: 'oil', label: '食油二级', sourceKey: 'oilQty', ratio: 1 },
      { key: 'leaf', label: '叶菜类', sourceKey: 'vegetableQty', ratio: 0.25 },
      { key: 'root', label: '根茎类', sourceKey: 'vegetableQty', ratio: 0.25 },
      { key: 'fruit', label: '茄果类', sourceKey: 'vegetableQty', ratio: 0.25 },
      { key: 'clean', label: '净菜类', sourceKey: 'vegetableQty', ratio: 0.25 },
      { key: 'meat', label: '肉（豆）制品二级', sourceKey: 'meatBeanQty', ratio: 1 },
      { key: 'freshwater', label: '淡水鱼类', sourceKey: 'aquaticQty', ratio: 0.5 },
      { key: 'aquatic-other', label: '水产品二级', sourceKey: 'aquaticQty', ratio: 0.5 },
      { key: 'dairy', label: '蛋奶类二级', sourceKey: 'dairyQty', ratio: 1 },
      { key: 'seasoning', label: '调味品二级', sourceKey: 'seasoningQty', ratio: 1 },
      { key: 'other', label: '其他二级', sourceKey: 'otherQty', ratio: 1 }
    ],
    3: [
      { key: 'rice', label: '米类', sourceKey: 'stapleQty', ratio: 0.55 },
      { key: 'flour', label: '面类', sourceKey: 'stapleQty', ratio: 0.45 },
      { key: 'peanut-oil', label: '花生油', sourceKey: 'oilQty', ratio: 0.4 },
      { key: 'soybean-oil', label: '豆油', sourceKey: 'oilQty', ratio: 0.6 },
      { key: 'leaf', label: '叶菜类', sourceKey: 'vegetableQty', ratio: 0.2 },
      { key: 'root', label: '根茎类', sourceKey: 'vegetableQty', ratio: 0.2 },
      { key: 'fruit', label: '茄果类', sourceKey: 'vegetableQty', ratio: 0.2 },
      { key: 'clean', label: '净菜类', sourceKey: 'vegetableQty', ratio: 0.4 },
      { key: 'meat', label: '肉类', sourceKey: 'meatBeanQty', ratio: 0.6 },
      { key: 'bean', label: '豆制品', sourceKey: 'meatBeanQty', ratio: 0.4 },
      { key: 'freshwater', label: '淡水鱼类', sourceKey: 'aquaticQty', ratio: 0.6 },
      { key: 'aquatic-other', label: '其他水产品', sourceKey: 'aquaticQty', ratio: 0.4 },
      { key: 'milk', label: '乳制品', sourceKey: 'dairyQty', ratio: 0.6 },
      { key: 'egg', label: '蛋类', sourceKey: 'dairyQty', ratio: 0.4 },
      { key: 'seasoning', label: '调味品', sourceKey: 'seasoningQty', ratio: 1 },
      { key: 'other', label: '其他材料', sourceKey: 'otherQty', ratio: 1 }
    ]
  };
  const getCategoryLevelDefinitions = (level) => categoryLevelDefinitions[level] || categoryLevelDefinitions[1];
  const getCategoryStatValue = (item, definition) => Number(
    (Number(item?.[definition.sourceKey] || 0) * definition.ratio).toFixed(2)
  );
  const getCategorySalesColumns = ({ state } = {}) => {
    const level = Number(state?.viewState?.categoryLevel) || 1;
    const definitions = getCategoryLevelDefinitions(level);
    const categoryColumns = definitions.map((definition) => ({
      key: `category-${level}-${definition.key}`,
      label: definition.label,
      format: 'decimal',
      value: (item) => getCategoryStatValue(item, definition)
    }));
    return [
      { key: 'educationUnit', label: '区域', render: (item) => formatEducationUnit(item.educationUnit) },
      ...categoryColumns,
      {
        key: `category-${level}-totalQty`,
        label: '销量合计（元）',
        format: 'decimal',
        value: (item) => Number(categoryColumns
          .reduce((total, column) => total + Number(column.value(item) || 0), 0)
          .toFixed(2))
      }
    ];
  };

  const productSummaryKeys = new Set([
    'orderCount', 'orderQty', 'orderAmount', 'shippedQty', 'shippedAmount',
    'returnCount', 'returnQty', 'returnAmount', 'actualAmount'
  ]);
  const categorySummaryKeys = new Set([
    'stapleQty', 'oilQty', 'vegetableQty', 'meatBeanQty',
    'aquaticQty', 'dairyQty', 'seasoningQty', 'otherQty', 'totalQty'
  ]);
  const sumSummaryValue = (items, column) => items
    .reduce((total, item) => total + Number(
      typeof column.value === 'function' ? column.value(item) : item[column.key] || 0
    ), 0)
    .toFixed(2);
  const renderSalesSummaryRow = (items, columns, summaryKeys, showSequence, showActions, summaryLabel = '合计') => {
    const leading = showSequence ? '<td></td>' : '';
    const cells = columns.map((column, index) => {
      if (index === 0) return `<td class="record-summary-label">${summaryLabel}</td>`;
      if (summaryKeys.has(column.key) || typeof column.value === 'function') return `<td>${sumSummaryValue(items, column)}</td>`;
      return `<td>${column.key === 'actualRank' ? '--' : ''}</td>`;
    }).join('');
    const actions = showActions ? '<td>--</td>' : '';
    return `<tr class="record-summary-row">${leading}${cells}${actions}</tr>`;
  };
  const renderProductSummaryRow = ({ items, columns, showSequence, showActions }) =>
    renderSalesSummaryRow(items, columns, productSummaryKeys, showSequence, showActions);
  const renderCategorySummaryRow = ({ items, columns, showSequence, showActions }) =>
    renderSalesSummaryRow(items, columns, categorySummaryKeys, showSequence, showActions, '合计（元）');

  const primaryCategories = [
    '主食（米面粉点心类）', '食油', '果蔬', '肉（豆）制品',
    '水产品', '蛋奶类', '调料', '其他材料'
  ];
  const getCategorySalesRegionOptions = () => {
    const rows = window.DemoStore?.get?.('categorySales') || window.MockOperations?.categorySales || [];
    const seen = new Set();
    return rows.map((row) => {
      const value = String(row?.educationUnit || '').trim();
      return {
        value,
        label: value.replace(/\s*教育局\s*$/, '').trim()
      };
    }).filter((option) => {
      if (!option.value || !option.label || seen.has(option.label)) return false;
      seen.add(option.label);
      return true;
    });
  };
  const categoryLevelOptions = [
    { value: 1, label: '一级分类' },
    { value: 2, label: '二级分类' },
    { value: 3, label: '三级分类' }
  ];
  const renderCategoryLevelSwitcher = ({ state } = {}) => {
    const selectedLevel = Number(state?.viewState?.categoryLevel) || 1;
    return `<div class="operations-filter-extra category-level-switch-row">
      <div class="category-level-switch" role="group" aria-label="切换分类层级">
        ${categoryLevelOptions.map((option) => `<button class="category-level-switch-button${selectedLevel === option.value ? ' is-active' : ''}" type="button" data-record-filter-extra="category-level" data-category-level="${option.value}" aria-pressed="${selectedLevel === option.value}">${option.label}</button>`).join('')}
      </div>
    </div>`;
  };
  const handleCategoryLevelAction = ({ action, element, state, load }) => {
    if (action !== 'category-level') return;
    const nextLevel = Number(element.dataset.categoryLevel);
    if (!categoryLevelOptions.some((option) => option.value === nextLevel)) return;
    if (!state.viewState) state.viewState = {};
    if (Number(state.viewState.categoryLevel) === nextLevel) return;
    state.viewState.categoryLevel = nextLevel;
    const host = element.closest('[data-operations-filter-extra-host]');
    host?.querySelectorAll('[data-category-level]').forEach((button) => {
      const active = Number(button.dataset.categoryLevel) === nextLevel;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    state.page = 1;
    state.selected.clear();
    state.expanded.clear();
    state.sort = {};
    return load();
  };
  const salesDateLabelOptions = [
    { label: '期望送达/退货时间', value: 'expectedReturn' },
    { label: '下单时间/退货时间', value: 'orderReturn' }
  ];
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(defaultEndDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const defaultSalesDateRange = [formatDate(defaultStartDate), formatDate(defaultEndDate)];
  const salesDateHint = '先选开始日期，再选结束日期，最多选择一年';
  const getCategorySalesExportParams = () => {
    const dateRange = document.querySelector('#filter-wrap-dateRange');
    const startDate = dateRange?.querySelector('[data-date-start]')?.value || defaultSalesDateRange[0];
    const endDate = dateRange?.querySelector('[data-date-end]')?.value || startDate || defaultSalesDateRange[1];
    const dateType = document.querySelector('#filter-dateRange-label')?.value || 'orderReturn';
    const params = new URLSearchParams({ dateType, startDate, endDate });
    const region = document.querySelector('#filter-educationUnit')?.value?.trim();
    const school = document.querySelector('#filter-schoolName')?.value?.trim();
    if (region) params.set('region', region);
    if (school) params.set('school', school);
    return params;
  };
  const openCategorySalesExportTemplate = () => {
    const templateUrl = `./category-sales-export-template.html?${getCategorySalesExportParams().toString()}`;
    const templateWindow = window.open(templateUrl, '_blank', 'noopener');
    if (!templateWindow) window.location.href = templateUrl;
  };
  const categorySalesDateAnnotation = {
    id: 'custom-1789559390858-1',
    target: 'custom',
    targetSelector: '[aria-label="商品销量"]',
    tab: 'category',
    placement: 'right',
    scope: 'page'
  };
  const categorySalesSchoolAnnotation = {
    id: 'custom-1789559533309-2',
    target: 'custom',
    targetSelector: 'section.page-card > div.operations-filter:nth-of-type(3)',
    tab: 'category',
    placement: 'right',
    scope: 'page'
  };
  const categorySalesExportAnnotation = {
    id: 'custom-1789559610289-3',
    target: 'custom',
    targetSelector: 'section.page-card > div.operations-toolbar:nth-of-type(4)',
    tab: 'category',
    placement: 'right',
    scope: 'page',
    title: '导出',
    popoverActions: [{
      key: 'view-category-sales-export-template',
      label: '查看模版',
      className: 'btn btn-sm record-annotation-demo-action record-annotation-action'
    }],
    onAction: ({ key }) => {
      if (key === 'view-category-sales-export-template') openCategorySalesExportTemplate();
    }
  };
  const pageParams = new URLSearchParams(window.location.search);
  const initialTab = pageParams.get('tab') === 'category' && pageParams.get('source') === 'detail'
    ? 'category'
    : 'product';

  window.RecordPageConfig = {
    title: '商品销量',
    pageClass: 'order-module-page product-sales-page',
    tabsToolbarSameRow: true,
    initialTab,
    initialViewState: { categoryLevel: 1 },
    hideSequence: false,
    hideRowActions: true,
    showSelectionSummary: false,
    selectable: false,
    resource: 'productSales',
    summaryRow: renderProductSummaryRow,
    annotations: [categorySalesDateAnnotation, categorySalesSchoolAnnotation, categorySalesExportAnnotation],
    filters: [
      {
        key: 'dateRange',
        label: '期望送达/退货时间',
        type: 'dateRange',
        labelConditionKey: 'dateType',
        defaultLabelValue: 'orderReturn',
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
        toolbarInFilterExtra: true,
        filterExtra: renderCategoryLevelSwitcher,
        onFilterExtraAction: handleCategoryLevelAction,
        summaryRow: renderCategorySummaryRow,
        filters: [
          {
            key: 'dateRange',
            label: '期望送达/退货时间',
            type: 'dateRange',
            labelConditionKey: 'dateType',
            defaultLabelValue: 'orderReturn',
            initialValue: defaultSalesDateRange,
            maxRangeDays: 365,
            hintText: salesDateHint,
            labelOptions: salesDateLabelOptions
          },
          { key: 'educationUnit', label: '区域', type: 'searchSelect', placeholder: '请选择', options: getCategorySalesRegionOptions },
          { key: 'schoolName', label: '学校', placeholder: '请输入' }
        ],
        columns: getCategorySalesColumns,
        hideRowActions: false,
        rowActions: [{ key: 'view', label: '详情' }],
        detailHref: (item, context = {}) => {
          const params = new URLSearchParams({ region: item.educationUnit || '' });
          const categoryLevel = Number(context.state?.viewState?.categoryLevel) || 1;
          if ([1, 2, 3].includes(categoryLevel)) params.set('categoryLevel', String(categoryLevel));
          const dateRange = context.condition?.dateRange;
          if (Array.isArray(dateRange) && (dateRange[0] || dateRange[1])) {
            if (dateRange[0]) params.set('startDate', dateRange[0]);
            if (dateRange[1]) params.set('endDate', dateRange[1]);
            if (context.condition?.dateType) params.set('dateType', context.condition.dateType);
            params.set('applyDateFilter', 'true');
          }
          return `./category-sales-detail.html?${params.toString()}`;
        }
      }
    ],
    toolbar: [{ key: 'export', label: '导出' }]
  };
})();
