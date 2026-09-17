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

  const columns = [
    { key: 'educationUnit', label: '区域' },
    { key: 'stapleQty', label: '主食（米面粉点心类）' },
    { key: 'oilQty', label: '食油' },
    { key: 'vegetableQty', label: '果蔬' },
    { key: 'meatBeanQty', label: '肉（豆）制品' },
    { key: 'aquaticQty', label: '水产品' },
    { key: 'dairyQty', label: '蛋奶类' },
    { key: 'seasoningQty', label: '调料' },
    { key: 'otherQty', label: '其他材料' },
    { key: 'totalQty', label: '销量合计（元）' }
  ];
  const rows = [
    { educationUnit: '孟村回族自治县教育局', stapleQty: 180, oilQty: 48, vegetableQty: 120, meatBeanQty: 72, aquaticQty: 36, dairyQty: 64, seasoningQty: 42, otherQty: 24, totalQty: 586 },
    { educationUnit: '石油分局教育局', stapleQty: 200, oilQty: 52, vegetableQty: 135, meatBeanQty: 78, aquaticQty: 41, dairyQty: 72, seasoningQty: 45, otherQty: 26, totalQty: 649 },
    { educationUnit: '海兴县教育局', stapleQty: 220, oilQty: 56, vegetableQty: 150, meatBeanQty: 84, aquaticQty: 46, dairyQty: 80, seasoningQty: 48, otherQty: 28, totalQty: 712 }
  ];
  const totals = columns.reduce((result, column) => {
    if (column.key === 'educationUnit') return result;
    result[column.key] = rows.reduce((sum, row) => sum + Number(row[column.key] || 0), 0);
    return result;
  }, {});
  const params = new URLSearchParams(window.location.search);
  const dateTypeLabels = {
    expectedReturn: '期望送达/退货时间',
    orderReturn: '下单时间/退货时间'
  };
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 1);
  const defaultDate = formatDate(previousDate);
  const dateTypeLabel = dateTypeLabels[params.get('dateType')] || dateTypeLabels.expectedReturn;
  const startDate = params.get('startDate') || defaultDate;
  const endDate = params.get('endDate') || startDate;
  const statisticPeriod = `${dateTypeLabel}：${startDate}--${endDate}`;
  const exportTime = formatDateTime(new Date());
  const renderValue = (row, column) => column.key === 'educationUnit'
    ? esc(formatEducationUnit(row[column.key]))
    : money(row[column.key]);

  root.innerHTML = `
    <main class="supplier-register-page category-sales-export-template-page">
      <header class="supplier-register-header"><h1>商品分类销量统计</h1></header>
      <section class="supplier-register-section category-sales-export-template-section">
        <div class="supplier-register-section-inner category-sales-export-template-inner">
          <div class="category-sales-export-template-table-wrap">
            <table class="category-sales-export-template-table">
              <thead>
                <tr class="category-sales-export-template-title-row"><th colspan="11"><div class="category-sales-export-template-title">商品分类销量统计</div></th></tr>
                <tr class="category-sales-export-template-meta-row"><th colspan="11"><div class="category-sales-export-template-meta"><span>${esc(statisticPeriod)}</span><span>导出时间：${esc(exportTime)}</span></div></th></tr>
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
      <div class="category-sales-export-template-actions"><a class="register-demo-button" href="./product-sales.html?tab=category">返回商品分类销量</a></div>
    </main>`;
})();
