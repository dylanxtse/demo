(function () {
  const root = document.getElementById('categorySalesExportTemplateApp');
  if (!root) return;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const formatEducationUnit = (value) => String(value || '').replace(/\s*教育局\s*$/, '').trim();
  const money = (value) => Number(value || 0).toFixed(2);
  const formatDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const params = new URLSearchParams(window.location.search);

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
  const requestedLevel = Number(params.get('categoryLevel'));
  const categoryLevel = categoryLevelDefinitions[requestedLevel] ? requestedLevel : 1;
  const categoryColumns = categoryLevelDefinitions[categoryLevel].map((definition) => ({
    key: `category-${categoryLevel}-${definition.key}`,
    label: definition.label,
    sourceKey: definition.sourceKey,
    ratio: definition.ratio,
    value: (row) => Number((Number(row?.[definition.sourceKey] || 0) * definition.ratio).toFixed(2))
  }));
  const columns = [
    { key: 'educationUnit', label: '区域' },
    ...categoryColumns,
    {
      key: `category-${categoryLevel}-totalQty`,
      label: '销量合计（元）',
      value: (row) => Number(categoryColumns
        .reduce((total, column) => total + Number(column.value(row) || 0), 0)
        .toFixed(2))
    }
  ];
  const rows = [
    { educationUnit: '孟村回族自治县教育局', stapleQty: 180, oilQty: 48, vegetableQty: 120, meatBeanQty: 72, aquaticQty: 36, dairyQty: 64, seasoningQty: 42, otherQty: 24, totalQty: 586 },
    { educationUnit: '石油分局教育局', stapleQty: 200, oilQty: 52, vegetableQty: 135, meatBeanQty: 78, aquaticQty: 41, dairyQty: 72, seasoningQty: 45, otherQty: 26, totalQty: 649 },
    { educationUnit: '海兴县教育局', stapleQty: 220, oilQty: 56, vegetableQty: 150, meatBeanQty: 84, aquaticQty: 46, dairyQty: 80, seasoningQty: 48, otherQty: 28, totalQty: 712 }
  ];
  const getColumnValue = (row, column) => typeof column.value === 'function'
    ? column.value(row)
    : row[column.key];
  const totals = columns.slice(1).reduce((result, column) => {
    result[column.key] = rows.reduce((sum, row) => sum + Number(getColumnValue(row, column) || 0), 0);
    return result;
  }, {});
  const dateTypeLabels = {
    expectedReturn: '期望送达/退货时间',
    orderReturn: '下单时间/退货时间'
  };
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(defaultEndDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const defaultStartDateText = formatDate(defaultStartDate);
  const defaultEndDateText = formatDate(defaultEndDate);
  const dateTypeLabel = dateTypeLabels.orderReturn;
  const startDate = params.get('startDate') || defaultStartDateText;
  const endDate = params.get('endDate') || (params.get('startDate') ? startDate : defaultEndDateText);
  const statisticPeriod = `${dateTypeLabel}：${startDate}--${endDate}`;
  const operatingEnterpriseName = params.get('enterpriseName')?.trim() || '产品部学校食材集采供应链有限公司';
  const exportTime = formatDateTime(new Date());
  const renderValue = (row, column) => column.key === 'educationUnit'
    ? esc(formatEducationUnit(getColumnValue(row, column)))
    : money(getColumnValue(row, column));
  const returnParams = new URLSearchParams({ tab: 'category', source: 'detail', categoryLevel: String(categoryLevel) });

  root.innerHTML = `
    <main class="supplier-register-page category-sales-export-template-page">
      <header class="supplier-register-header"><h1>商品分类销量统计</h1></header>
      <section class="supplier-register-section category-sales-export-template-section">
        <div class="supplier-register-section-inner category-sales-export-template-inner">
          <div class="category-sales-export-template-table-wrap">
            <table class="category-sales-export-template-table">
              <thead>
                <tr class="category-sales-export-template-title-row"><th colspan="${columns.length + 1}"><div class="category-sales-export-template-title">商品分类销量统计</div></th></tr>
                <tr class="category-sales-export-template-meta-row"><th colspan="${columns.length + 1}"><div class="category-sales-export-template-meta"><span>单位：${esc(operatingEnterpriseName)}</span><span>${esc(statisticPeriod)}</span><span>导出时间：${esc(exportTime)}</span></div></th></tr>
                <tr class="category-sales-export-template-column-row"><th>序号</th>${columns.map((column) => `<th>${esc(column.label)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `<tr><td>${index + 1}</td>${columns.map((column) => `<td>${renderValue(row, column)}</td>`).join('')}</tr>`).join('')}
                <tr class="category-sales-export-template-summary-row"><td></td><td class="category-sales-export-template-summary-label">合计（元）</td>${columns.slice(1).map((column) => `<td>${money(totals[column.key])}</td>`).join('')}</tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <div class="category-sales-export-template-actions"><a class="register-demo-button" href="./product-sales.html?${returnParams.toString()}">返回商品分类销量</a></div>
    </main>`;
})();
