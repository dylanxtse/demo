(function () {
  window.RecordPageConfig = {
    title: '仓库档案',
    pageClass: 'order-module-page warehouse-archive-page',
    resource: 'warehouses',
    selectable: false,
    filters: [
      { key: 'warehouseCode', label: '仓库编码', placeholder: '请输入仓库编码' },
      { key: 'warehouseName', label: '仓库名称', placeholder: '请输入' },
      { key: 'status', label: '启用状态', options: [
        { label: '启用', value: 'ENABLE' },
        { label: '禁用', value: 'DISABLE' }
      ] }
    ],
    columns: [
      { key: 'warehouseCode', label: '仓库编码', link: true },
      { key: 'warehouseName', label: '仓库名称' },
      { key: 'address', label: '地址' },
      { key: 'manager', label: '负责人' },
      { key: 'phone', label: '联系电话' },
      { key: 'status', label: '启用状态', format: 'status' },
      { key: 'createdAt', label: '添加时间' }
    ],
    toolbar: [{ key: 'add', label: '添加', primary: true }],
    rowActions: [
      { key: 'edit', label: '编辑' },
      { key: 'enable', label: '启用', transition: 'enable', visible: ['DISABLE'], message: '确定启用该仓库吗？' },
      { key: 'disable', label: '禁用', transition: 'disable', visible: ['ENABLE'], message: '确定禁用该仓库吗？' },
      { key: 'delete', label: '删除', danger: true }
    ],
    formFields: [
      { key: 'warehouseCode', label: '仓库编码', required: true, placeholder: '请输入仓库编码' },
      { key: 'warehouseName', label: '仓库名称', required: true, placeholder: '请输入仓库名称' },
      { key: 'address', label: '地址', required: true, placeholder: '请输入地址' },
      { key: 'manager', label: '负责人' },
      { key: 'phone', label: '联系电话' }
    ],
    createDefaults: { status: 'ENABLE', referenced: false },
    deleteMessage: '请再次确定是否删除该仓库？'
  };
})();
