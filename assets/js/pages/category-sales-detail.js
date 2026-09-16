(function () {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const educationUnit = new URLSearchParams(window.location.search).get('region') || '';
  const regionName = String(educationUnit).replace(/\s*教育局\s*$/, '').trim();
  const backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path><path d="M19 12H9"></path></svg>';
  const backAction = "window.location.href='./product-sales.html?tab=category&source=detail';";
  const pageTitle = regionName || '区域';
  document.title = `${pageTitle} - 集采企业版企业端`;
  const categoryKeys = [
    'stapleQty', 'oilQty', 'vegetableQty', 'meatBeanQty',
    'aquaticQty', 'dairyQty', 'seasoningQty', 'otherQty'
  ];
  const sumSummaryValue = (items, key) => items
    .reduce((total, item) => total + Number(item[key] || 0), 0)
    .toFixed(2);
  const renderSummaryRow = ({ items, columns, separateExpandColumn }) => {
    const expandCell = separateExpandColumn ? '<td class="record-expand-cell"></td>' : '';
    const cells = columns.map((column, index) => {
      if (index === 0) return '<td class="record-summary-label">合计</td>';
      return `<td>${sumSummaryValue(items, column.key)}</td>`;
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
    summaryRow: renderSummaryRow,
    resource: 'categorySalesSchools',
    initialCondition: { educationUnit },
    expandableRows: true,
    separateExpandColumn: true,
    expandedRows: buildCanteenRows,
    expandedByDefault: () => Boolean(getSchoolCanteenKeyword()),
    filters: [
      { key: 'schoolCanteen', label: '学校/食堂', placeholder: '请输入' }
    ],
    columns: [
      { key: 'schoolName', label: '学校名称' },
      { key: 'stapleQty', label: '主食（米面粉点心类）', format: 'decimal' },
      { key: 'oilQty', label: '食油', format: 'decimal' },
      { key: 'vegetableQty', label: '果蔬', format: 'decimal' },
      { key: 'meatBeanQty', label: '肉（豆）制品', format: 'decimal' },
      { key: 'aquaticQty', label: '水产品', format: 'decimal' },
      { key: 'dairyQty', label: '蛋奶类', format: 'decimal' },
      { key: 'seasoningQty', label: '调料', format: 'decimal' },
      { key: 'otherQty', label: '其他材料', format: 'decimal' },
      { key: 'totalQty', label: '销量合计', format: 'decimal' }
    ],
    toolbar: [{ key: 'export', label: '导出' }]
  };
})();
