(function () {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const defaultOperatingEnterpriseName = '产品部学校食材集采供应链有限公司';
  const getOperatingEnterpriseName = () => {
    const session = window.DemoStore?.getSession?.();
    const company = window.DemoStore?.get?.('companies')?.find((item) => item.id === session?.companyId);
    return company?.name || defaultOperatingEnterpriseName;
  };

  const pageParams = new URLSearchParams(window.location.search);
  const categoryLevelOptions = [
    { value: 1, label: '一级分类' },
    { value: 2, label: '二级分类' },
    { value: 3, label: '三级分类' }
  ];
  const normalizeCategoryLevel = (value) => {
    const level = Number(value);
    return categoryLevelOptions.some((option) => option.value === level) ? level : 1;
  };
  const initialCategoryLevel = normalizeCategoryLevel(pageParams.get('categoryLevel'));
  const educationUnit = pageParams.get('region') || '';
  const regionName = String(educationUnit).replace(/\s*教育局\s*$/, '').trim();
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path><path d="M19 12H9"></path></svg>';
  const backAction = `window.location.href='./product-sales.html?tab=category&source=detail&categoryLevel=${initialCategoryLevel}';`;
  const pageTitle = regionName || '区域';
  document.title = `${pageTitle} - 集采企业版企业端`;
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const formatDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(defaultEndDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const passedStartDate = pageParams.get('startDate') || '';
  const passedEndDate = pageParams.get('endDate') || '';
  const hasPassedDateRange = Boolean(passedStartDate || passedEndDate);
  const initialDateRange = hasPassedDateRange
    ? [passedStartDate, passedEndDate]
    : [formatDate(defaultStartDate), formatDate(defaultEndDate)];
  const applyDateFilter = pageParams.get('applyDateFilter') === 'true';
  const initialCondition = { educationUnit };
  if (hasPassedDateRange && applyDateFilter) {
    initialCondition.dateRange = initialDateRange;
    initialCondition.dateType = pageParams.get('dateType') || 'expectedReturn';
  }
  const salesDateLabelOptions = [
    { label: '期望送达/退货时间', value: 'expectedReturn' },
    { label: '下单时间/退货时间', value: 'orderReturn' }
  ];
  const categoryKeys = [
    'stapleQty', 'oilQty', 'vegetableQty', 'meatBeanQty',
    'aquaticQty', 'dairyQty', 'seasoningQty', 'otherQty'
  ];
  const getColumnValue = (item, column) => typeof column.value === 'function'
    ? column.value(item)
    : item[column.key];
  const sumSummaryValue = (items, column) => items
    .reduce((total, item) => total + Number(getColumnValue(item, column) || 0), 0)
    .toFixed(2);
  const renderSummaryRow = ({ items, columns, separateExpandColumn }) => {
    const expandCell = separateExpandColumn ? '<td class="record-expand-cell"></td>' : '';
    const cells = columns.map((column, index) => {
      if (index === 0) return '<td class="record-summary-label">合计（元）</td>';
      return `<td>${sumSummaryValue(items, column)}</td>`;
    }).join('');
    return `<tr class="record-summary-row">${expandCell}${cells}</tr>`;
  };
  const normalizeSearchValue = (value) => String(value || '').trim().toLocaleLowerCase();
  const getSchoolCanteenKeyword = () => normalizeSearchValue(
    document.querySelector('#filter-schoolCanteen')?.value
  );
  const filterCanteenRows = (school, rows) => {
    const keyword = getSchoolCanteenKeyword();
    if (!keyword || normalizeSearchValue(school.schoolName).includes(keyword)) return rows;
    return rows.filter((row) => normalizeSearchValue(row.schoolName).includes(keyword));
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
  const getDetailColumns = ({ state } = {}) => {
    const level = normalizeCategoryLevel(state?.viewState?.categoryLevel);
    const categoryColumns = getCategoryLevelDefinitions(level).map((definition) => ({
      key: `category-${level}-${definition.key}`,
      label: definition.label,
      format: 'decimal',
      value: (item) => getCategoryStatValue(item, definition)
    }));
    return [
      { key: 'schoolName', label: '学校名称' },
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
  const renderCategoryLevelSwitcher = ({ state } = {}) => {
    const selectedLevel = normalizeCategoryLevel(state?.viewState?.categoryLevel);
    return `<div class="operations-filter-extra category-level-switch-row">
      <div class="category-level-switch" role="group" aria-label="切换分类层级">
        ${categoryLevelOptions.map((option) => `<button class="category-level-switch-button${selectedLevel === option.value ? ' is-active' : ''}" type="button" data-record-filter-extra="category-level" data-category-level="${option.value}" aria-pressed="${selectedLevel === option.value}">${option.label}</button>`).join('')}
      </div>
    </div>`;
  };
  const handleCategoryLevelAction = ({ action, element, state, load }) => {
    if (action !== 'category-level') return;
    const nextLevel = normalizeCategoryLevel(element.dataset.categoryLevel);
    if (String(element.dataset.categoryLevel) !== String(nextLevel)) return;
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

  const getCategorySalesDetailExportParams = () => {
    const dateRange = document.querySelector('#filter-wrap-dateRange');
    const startDate = dateRange?.querySelector('[data-date-start]')?.value || initialDateRange[0];
    const endDate = dateRange?.querySelector('[data-date-end]')?.value || startDate || initialDateRange[1];
    const dateType = document.querySelector('#filter-dateRange-label')?.value
      || pageParams.get('dateType')
      || 'expectedReturn';
    const params = new URLSearchParams({
      region: educationUnit,
      dateType,
      startDate,
      endDate,
      enterpriseName: getOperatingEnterpriseName()
    });
    const schoolCanteen = document.querySelector('#filter-schoolCanteen')?.value?.trim();
    if (schoolCanteen) params.set('schoolCanteen', schoolCanteen);
    params.set('applyDateFilter', String(hasPassedDateRange && applyDateFilter));
    return params;
  };
  const openCategorySalesDetailExportTemplate = (includeCanteens = true) => {
    const params = getCategorySalesDetailExportParams();
    params.set('includeCanteens', String(includeCanteens));
    const templateUrl = `./category-sales-detail-export-template.html?${params.toString()}`;
    const templateWindow = window.open(templateUrl, '_blank', 'noopener');
    if (!templateWindow) window.location.href = templateUrl;
  };
  const exportDetailStatistics = async ({ state, service, resource, columns, action, toast }) => {
    let schoolRows = state.items || [];
    if (state.total > schoolRows.length) {
      const result = await service.list(resource, {
        page: 1,
        pageSize: state.total,
        condition: state.condition
      });
      schoolRows = result.items || [];
    }
    const exportRows = [];
    schoolRows.forEach((school) => {
      exportRows.push(school);
      if (action.includeCanteens) exportRows.push(...buildCanteenRows(school));
    });
    const dateType = document.querySelector('#filter-dateRange-label')?.value
      || pageParams.get('dateType')
      || 'expectedReturn';
    const dateTypeLabel = salesDateLabelOptions.find((option) => option.value === dateType)?.label || salesDateLabelOptions[0].label;
    const dateParams = getCategorySalesDetailExportParams();
    const startDate = dateParams.get('startDate') || initialDateRange[0];
    const endDate = dateParams.get('endDate') || startDate || initialDateRange[1];
    const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const titleRow = new Array(columns.length).fill('');
    titleRow[0] = `商品分类销量统计（${regionName}）`;
    const periodRow = new Array(columns.length).fill('');
    periodRow[0] = `${dateTypeLabel}：${startDate}--${endDate}`;
    const exportTimeRow = new Array(columns.length).fill('');
    exportTimeRow[0] = `导出时间：${formatDateTime(new Date())}`;
    const rows = exportRows.map((item) => columns.map((column) => {
      if (typeof column.exportValue === 'function') return column.exportValue(item);
      if (typeof column.value === 'function') return column.value(item);
      return item[column.key] ?? '';
    }));
    const csv = [titleRow, periodRow, exportTimeRow, columns.map((column) => column.label), ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${regionName || '区域'}商品分类销量统计.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast?.('导出成功');
  };
  const detailExportAnnotation = {
    id: 'category-sales-detail-export-button',
    target: 'toolbar-action',
    actionKey: 'export',
    placement: 'left',
    entryMarkerPosition: 'left',
    title: '导出按钮',
    items: [
      '导出当前区域详情页全部列表信息；',
      '导出字段和当前区域详情页列表字段一致（不含操作项）；',
      '导出下拉可选择“学校”或“学校及食堂”。'
    ],
    popoverActions: [{
      key: 'view-category-sales-detail-export-template',
      label: '查看模版',
      className: 'btn btn-sm record-annotation-demo-action record-annotation-action'
    }],
    onAction: ({ key }) => {
      if (key === 'view-category-sales-detail-export-template') openCategorySalesDetailExportTemplate(true);
    }
  };

  const buildCanteenRows = (school) => {
    if (Array.isArray(school.canteens) && school.canteens.length) {
      const rows = school.canteens.map((canteen, index) => ({
        ...canteen,
        id: canteen.id || `${school.id}-canteen-${index + 1}`,
        educationUnit: school.educationUnit,
        schoolName: canteen.canteenName || canteen.name || canteen.canteen || canteen.schoolName || `第${index + 1}食堂`
      }));
      return filterCanteenRows(school, rows);
    }

    const canteenNames = ['第一食堂', '第二食堂'];
    const rows = canteenNames.map((canteenName, canteenIndex) => {
      const row = {
        id: `${school.id}-canteen-${canteenIndex + 1}`,
        educationUnit: school.educationUnit,
        schoolName: canteenName
      };
      categoryKeys.forEach((key) => {
        const total = Number(school[key] || 0);
        const firstCanteenValue = Number((total * 0.6).toFixed(2));
        row[key] = canteenIndex === 0
          ? firstCanteenValue
          : Number((total - firstCanteenValue).toFixed(2));
      });
      row.totalQty = categoryKeys.reduce((sum, key) => sum + Number(row[key] || 0), 0);
      return row;
    });
    return filterCanteenRows(school, rows);
  };

  window.RecordPageConfig = {
    title: pageTitle,
    pageClass: 'order-module-page category-sales-detail-page',
    pageHeader: `<div class="processing-detail-page-header record-page-detail-header">
      <button class="back-link" type="button" onclick="${backAction}" aria-label="返回商品分类销量">${backIcon}<span>返回</span></button>
      <h1>${escapeHtml(pageTitle)}</h1>
    </div>`,
    hideSequence: true,
    hideRowActions: true,
    selectable: false,
    initialViewState: { categoryLevel: initialCategoryLevel },
    toolbarInFilterExtra: true,
    filterExtra: renderCategoryLevelSwitcher,
    onFilterExtraAction: handleCategoryLevelAction,
    summaryRow: renderSummaryRow,
    annotations: [detailExportAnnotation],
    resource: 'categorySalesSchools',
    initialCondition,
    expandableRows: true,
    separateExpandColumn: true,
    expandedRows: buildCanteenRows,
    expandedByDefault: () => Boolean(getSchoolCanteenKeyword()),
    filters: [
      {
        key: 'dateRange',
        label: '期望送达/退货时间',
        type: 'dateRange',
        labelConditionKey: 'dateType',
        defaultLabelValue: 'expectedReturn',
        initialValue: initialDateRange,
        maxRangeDays: 365,
        hintText: '先选开始日期，再选结束日期，最多选择一年',
        labelOptions: salesDateLabelOptions
      },
      { key: 'schoolCanteen', label: '学校/食堂', placeholder: '请输入' }
    ],
    columns: getDetailColumns,
    toolbar: [{
      key: 'export',
      label: '导出',
      hoverDropdown: true,
      dropdownOptions: [
        {
          key: 'export-schools',
          label: '按学校导出',
          execute: () => openCategorySalesDetailExportTemplate(false)
        },
        {
          key: 'export-schools-canteens',
          label: '按学校及食堂导出',
          includeCanteens: true,
          execute: () => openCategorySalesDetailExportTemplate(true)
        }
      ]
    }]
  };
})();
