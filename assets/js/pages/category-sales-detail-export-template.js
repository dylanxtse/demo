(function () {
  const root = document.getElementById('categorySalesDetailExportTemplateApp');
  if (!root) return;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const money = (value) => Number(value || 0).toFixed(2);
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const formatDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const formatEducationUnit = (value) => String(value || '').replace(/\s*教育局\s*$/, '').trim();
  const params = new URLSearchParams(window.location.search);
  const regionName = formatEducationUnit(params.get('region')) || '区域';
  const includeCanteens = params.get('includeCanteens') !== 'false';
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
  const schoolKeyword = String(params.get('schoolCanteen') || '').trim().toLocaleLowerCase();
  const columns = [
    { key: 'schoolName', label: '学校名称' },
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
  const categoryKeys = columns.slice(1).map((column) => column.key);
  const schoolSeed = [
    { schoolName: `${regionName}第一中学`, stapleQty: 120, oilQty: 50, vegetableQty: 153, meatBeanQty: 85, aquaticQty: 56, dairyQty: 112, seasoningQty: 35, otherQty: 29 },
    { schoolName: `${regionName}实验小学`, stapleQty: 128, oilQty: 53, vegetableQty: 163, meatBeanQty: 91, aquaticQty: 60, dairyQty: 119, seasoningQty: 38, otherQty: 31 },
    { schoolName: `${regionName}中心幼儿园`, stapleQty: 136, oilQty: 56, vegetableQty: 173, meatBeanQty: 97, aquaticQty: 64, dairyQty: 126, seasoningQty: 41, otherQty: 33 }
  ];
  const schools = schoolSeed.map((school, index) => ({
    ...school,
    id: `detail-school-${index + 1}`,
    totalQty: categoryKeys.reduce((sum, key) => sum + Number(school[key] || 0), 0)
  })).filter((school) => !schoolKeyword
    || school.schoolName.toLocaleLowerCase().includes(schoolKeyword)
    || ['第一食堂', '第二食堂'].some((canteenName) => canteenName.toLocaleLowerCase().includes(schoolKeyword)));
  const canteenRows = (school) => ['第一食堂', '第二食堂'].map((schoolName, index) => {
    const row = { id: `${school.id}-canteen-${index + 1}`, schoolName };
    categoryKeys.forEach((key) => {
      const total = Number(school[key] || 0);
      const firstValue = Number((total * 0.6).toFixed(2));
      row[key] = index === 0 ? firstValue : Number((total - firstValue).toFixed(2));
    });
    return row;
  }).filter((row) => !schoolKeyword || row.schoolName.toLocaleLowerCase().includes(schoolKeyword) || school.schoolName.toLocaleLowerCase().includes(schoolKeyword));
  const totals = categoryKeys.reduce((result, key) => {
    result[key] = schools.reduce((sum, school) => sum + Number(school[key] || 0), 0);
    return result;
  }, {});
  const returnParams = new URLSearchParams({ region: params.get('region') || '' });
  ['dateType', 'startDate', 'endDate', 'schoolCanteen'].forEach((key) => {
    if (params.get(key)) returnParams.set(key, params.get(key));
  });
  const returnHref = `./category-sales-detail.html?${returnParams.toString()}`;
  const renderValue = (row, column) => column.key === 'schoolName' ? esc(row[column.key]) : money(row[column.key]);
  const renderCanteenRows = (school, groupClass) => canteenRows(school).map((row) => `
    <tr class="category-sales-detail-export-child-row${groupClass}">
      ${columns.map((column) => `<td>${column.key === 'schoolName' ? `<span class="category-sales-detail-export-child-label">${renderValue(row, column)}</span>` : renderValue(row, column)}</td>`).join('')}
    </tr>`).join('');
  const renderSchoolRows = (school, index, withCanteens) => {
    const groupClass = withCanteens
      ? ` category-sales-detail-export-school-group-${index % 2 === 1 ? 'odd' : 'even'}`
      : '';
    return `
    <tr class="category-sales-detail-export-parent-row${groupClass}">
      ${columns.map((column) => `<td>${renderValue(school, column)}</td>`).join('')}
    </tr>${withCanteens ? renderCanteenRows(school, groupClass) : ''}`;
  };
  const renderTemplateTable = (withCanteens) => `
    <div class="category-sales-export-template-block">
      <div class="category-sales-export-template-variant-title">${withCanteens ? '按学校及食堂导出' : '按学校导出'}</div>
      <div class="category-sales-export-template-table-wrap">
        <table class="category-sales-export-template-table category-sales-detail-export-template-table">
          <thead>
            <tr class="category-sales-export-template-title-row"><th colspan="${columns.length}"><div class="category-sales-export-template-title">商品分类销量统计（${esc(regionName)}）</div></th></tr>
            <tr class="category-sales-export-template-meta-row"><th colspan="${columns.length}"><div class="category-sales-export-template-meta"><span>${esc(statisticPeriod)}</span><span>导出时间：${esc(exportTime)}</span></div></th></tr>
            <tr class="category-sales-export-template-column-row">${columns.map((column) => `<th>${esc(column.label)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${schools.map((school, index) => renderSchoolRows(school, index, withCanteens)).join('')}
            <tr class="category-sales-export-template-summary-row"><td class="category-sales-export-template-summary-label">合计（元）</td>${categoryKeys.map((key) => `<td>${money(totals[key])}</td>`).join('')}</tr>
          </tbody>
        </table>
      </div>
    </div>`;
  const templateOrder = includeCanteens ? [true, false] : [false, true];

  root.innerHTML = `
    <main class="supplier-register-page category-sales-export-template-page category-sales-detail-export-template-page">
      <section class="supplier-register-section category-sales-export-template-section">
        <div class="supplier-register-section-inner category-sales-export-template-inner">
          ${templateOrder.map(renderTemplateTable).join('')}
        </div>
      </section>
      <div class="category-sales-export-template-actions"><a class="register-demo-button" href="${esc(returnHref)}">返回区域详情</a></div>
    </main>`;

})();
