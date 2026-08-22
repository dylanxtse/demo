(function () {
  const companies = window.DemoStore?.get('companies') || [];
  const subsidiaryOptions = companies
    .filter((company) => company.type === 'SUBSIDIARY')
    .map((company) => ({
      value: company.id,
      label: company.name
    }));
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const getAddedAtValue = (item) => {
    const value = item?.createdAt;
    if (!value) return '--';
    return window.BusinessRules?.normalizeDateTime?.(value, String(value)) || value;
  };
  const formatAddedAt = (item) => escapeHtml(getAddedAtValue(item));
  const getOptionalValue = (item, key) => {
    const value = item?.[key];
    return value === '' || value == null ? '--' : String(value);
  };
  const managerColumn = {
    key: 'manager',
    label: '负责人',
    render: (item) => escapeHtml(getOptionalValue(item, 'manager')),
    exportValue: (item) => getOptionalValue(item, 'manager')
  };
  const phoneColumn = {
    key: 'phone',
    label: '联系电话',
    render: (item) => escapeHtml(getOptionalValue(item, 'phone')),
    exportValue: (item) => getOptionalValue(item, 'phone')
  };
  const getOperatingCompanyNames = (item) => {
    const ids = Array.isArray(item?.operatingCompanyIds)
      ? item.operatingCompanyIds
      : [item?.operatingCompanyId || item?.companyId].filter(Boolean);
    const currentCompanies = window.DemoStore?.get('companies') || companies;
    const names = ids.map((id) => {
      const company = currentCompanies.find((item) => item.id === id);
      return company?.name || id;
    }).filter(Boolean);
    return names.length ? names.join('、') : (item?.operatingCompanyName || '未分配');
  };

  const operatingCompanyColumn = {
    key: 'operatingCompanyIds',
    label: '运营分公司',
    render: (item) => escapeHtml(getOperatingCompanyNames(item)),
    exportValue: getOperatingCompanyNames
  };
  const createdAtColumn = {
    key: 'createdAt',
    label: '添加时间',
    render: formatAddedAt,
    exportValue: getAddedAtValue
  };
  const openWarehouseExportTemplate = () => {
    const templateUrl = './warehouse-export-template.html';
    const templateWindow = window.open(templateUrl, '_blank', 'noopener');
    if (!templateWindow) window.location.href = templateUrl;
  };

  window.RecordPageConfig = {
    title: '仓库档案',
    pageClass: 'order-module-page warehouse-archive-page',
    resource: 'warehouses',
    selectable: true,
    customSelection: true,
    exportTitle: '仓库档案',
    exportTemplateHref: './warehouse-export-template.html',
    enableAdvancedFilter: false,
    addModalKey: 'warehouse-add',
    annotations: [
      {
        id: 'warehouse-list-header',
        target: 'table-header',
        title: '仓库列表',
        items: [
          '勾选框固定显示。',
          '新增负责人、联系电话、运营分公司字段。',
          '一个仓库由多个分公司运营时，运营分公司省略显示为“等*家单位”。',
          '列表操作项固定显示。'
        ]
      },
      {
        id: 'warehouse-add-modal',
        target: 'add-modal',
        placement: 'right',
        scope: 'modal',
        entryScope: 'page',
        modalKey: 'warehouse-add',
        anchorPosition: 'modal-header-right',
        title: '添加仓库弹窗',
        items: [
          '新增负责人、联系电话、运营分公司字段。',
          '负责人、联系电话为非必填。',
          '运营分公司为非必填，支持多选。',
          '运营分公司选项默认最多显示5行，超出后弹窗内容支持上下滑动。'
        ]
      },
      {
        id: 'warehouse-filter-fields',
        target: 'filter',
        placement: 'left',
        title: '仓库查询项',
        items: [
          '新增运营分公司和负责人/联系电话查询项。',
          '运营分公司为下拉单选框，默认选中“全部”。',
          '负责人/联系电话为搜索框，支持按仓库负责人姓名或联系电话查询。'
        ]
      },
      {
        id: 'warehouse-detail-modal',
        target: 'detail-modal',
        placement: 'right',
        title: '查看仓库',
        headerColumn: 'warehouseCode',
        items: [
          '新增显示仓库编码、负责人、联系电话、运营分公司和添加时间。',
          '字段在弹窗中按单列方式展示。'
        ]
      },
      {
        id: 'warehouse-export-button',
        target: 'toolbar-action',
        actionKey: 'export',
        placement: 'left',
        entryMarkerPosition: 'left',
        title: '导出按钮',
        items: [
          '点击导出时校验是否已勾选列表项目。',
          '未勾选时提示“请先勾选要导出的仓库”。'
        ],
        popoverActions: [{
          key: 'view-warehouse-export-template',
          label: '查看导出模版',
          className: 'btn btn-sm record-annotation-demo-action record-annotation-action'
        }],
        onAction: ({ key }) => {
          if (key === 'view-warehouse-export-template') openWarehouseExportTemplate();
        }
      }
    ],
    filters: [
      { key: 'warehouseCode', label: '仓库编码', placeholder: '请输入仓库编码' },
      { key: 'warehouseName', label: '仓库名称', placeholder: '请输入' },
      { key: 'operatingCompanyIds', label: '运营分公司', options: subsidiaryOptions },
      { key: 'contact', label: '负责人/联系电话', placeholder: '请输入负责人/联系电话' },
      { key: 'dateRange', label: '添加时间', type: 'dateRange', placeholder: '请选择添加时间' }
    ],
    columns: [
      { key: 'warehouseCode', label: '仓库编码', link: true },
      { key: 'warehouseName', label: '仓库名称' },
      { key: 'address', label: '地址' },
      managerColumn,
      phoneColumn,
      operatingCompanyColumn,
      createdAtColumn
    ],
    detailTitle: '查看仓库',
    detailVariant: 'warehouse-detail',
    detailColumns: [
      { key: 'warehouseCode', label: '仓库编码' },
      { key: 'warehouseName', label: '仓库名称' },
      { key: 'address', label: '地址' },
      managerColumn,
      phoneColumn,
      operatingCompanyColumn,
      createdAtColumn
    ],
    toolbar: [
      { key: 'add', label: '添加', primary: true },
      {
        key: 'export',
        label: '导出',
        side: true,
        className: 'warehouse-export-button',
        icon: 'download',
        requiresSelection: true,
        selectionError: '请先勾选要导出的仓库',
        exportSelected: true,
        fileName: '仓库档案.csv'
      }
    ],
    rowActions: [
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除', danger: true }
    ],
    formFields: [
      { key: 'warehouseName', label: '仓库名称', required: true, placeholder: '请输入仓库名称' },
      { key: 'address', label: '地址', required: true, fullRow: true, placeholder: '请输入地址' },
      { key: 'manager', label: '负责人', placeholder: '请输入负责人' },
      { key: 'phone', label: '联系电话', placeholder: '请输入联系电话' },
      { key: 'operatingCompanyIds', label: '运营分公司', options: subsidiaryOptions, multiple: true, fullRow: true, placeholder: '可多选运营分公司' }
    ],
    createDefaults: { status: 'ENABLE', referenced: false },
    deleteMessage: '请再次确定是否删除该仓库？'
  };
})();
