(function () {
  const orders = [
    { id: 'ORD-20260730-001', orderNo: 'DD202607300100001', customerName: '第一实验学校', canteen: '第一食堂', customerType: '学校', orderTag: '营养餐', orderAmount: 2860.5, shippingAmount: 0, returnAmount: 0, reconciliationAmount: 0, expectedAt: '2026-07-31 07:30', status: 'PENDING', receiptStatus: '待收货', productCount: 18, warehouse: '中心仓', supplement: '否', remark: '上午七点半前送达', route: '东城一线', driver: '张师傅', source: '客户下单', creator: '王采购', createdAt: '2026-07-30 09:18:22' },
    { id: 'ORD-20260729-012', orderNo: 'DD202607290200012', customerName: '阳光幼儿园', canteen: '园区食堂', customerType: '幼儿园', orderTag: '普通餐', orderAmount: 1568, shippingAmount: 1520, returnAmount: 48, reconciliationAmount: 1472, expectedAt: '2026-07-30 08:00', status: 'CONFIRMED', receiptStatus: '部分收货', productCount: 12, warehouse: '中心仓', supplement: '否', remark: '', route: '南城二线', driver: '李师傅', source: '平台添加', creator: '管理员', createdAt: '2026-07-29 14:36:10' },
    { id: 'ORD-20260728-006', orderNo: 'DD202607280300006', customerName: '育才中学', canteen: '高中部食堂', customerType: '学校', orderTag: '营养餐', orderAmount: 4388.6, shippingAmount: 4388.6, returnAmount: 0, reconciliationAmount: 4388.6, expectedAt: '2026-07-29 07:00', status: 'COMPLETED', receiptStatus: '已收货', productCount: 25, warehouse: '北区仓', supplement: '是', remark: '补单', route: '北城一线', driver: '周师傅', source: '客户下单', creator: '赵老师', createdAt: '2026-07-28 16:05:41' },
    { id: 'ORD-20260727-003', orderNo: 'DD202607270400003', customerName: '机关第二食堂', canteen: '二号食堂', customerType: '机关单位', orderTag: '普通餐', orderAmount: 973.2, shippingAmount: 0, returnAmount: 0, reconciliationAmount: 0, expectedAt: '2026-07-28 09:00', status: 'CLOSED', receiptStatus: '未收货', productCount: 8, warehouse: '中心仓', supplement: '否', remark: '客户取消', route: '西城一线', driver: '', source: '平台添加', creator: '管理员', createdAt: '2026-07-27 11:20:08' }
  ];

  const returns = [
    { id: 'RET-001', returnNo: 'TH202607300001', customerName: '阳光幼儿园', canteen: '园区食堂', goodsName: '鲫鱼(斤/--/--)', reason: '商品破损', orderNo: 'XS202607290012', inboundNo: 'RK202607300009', warehouse: '中心仓', status: 'PENDING', creator: '刘财务', createdAt: '2026-07-30 10:12:00' },
    { id: 'RET-002', returnNo: 'TH202607280003', customerName: '育才中学', canteen: '高中部食堂', goodsName: '大米(KG/--/--)', reason: '数量多发', orderNo: 'XS202607280006', inboundNo: 'RK202607290016', warehouse: '北区仓', status: 'APPROVED', creator: '赵老师', createdAt: '2026-07-28 15:42:36' },
    { id: 'RET-003', returnNo: 'TH202607260002', customerName: '第一实验学校', canteen: '第一食堂', goodsName: '鸡蛋(斤/--/--)', reason: '质量不符合要求', orderNo: 'XS202607260021', inboundNo: 'RK202607270011', warehouse: '中心仓', status: 'CLOSED', creator: '王采购', createdAt: '2026-07-26 17:08:25' }
  ];

  const tags = [
    { id: 'TAG-001', tagName: '营养餐', nutritious: '是', remark: '学校营养餐订单', status: 'ENABLE', createdAt: '2026-03-11 09:30:00' },
    { id: 'TAG-002', tagName: '普通餐', nutritious: '否', remark: '常规订单', status: 'ENABLE', createdAt: '2026-03-11 09:31:00' },
    { id: 'TAG-003', tagName: '应急保供', nutritious: '否', remark: '突发保供订单', status: 'DISABLE', createdAt: '2026-04-08 16:20:00' }
  ];

  const receiptChanges = [
    { id: 'CHG-001', changeNo: 'BG202607300001', beforeAmount: 1520, afterAmount: 1472, differenceAmount: -48, customerName: '阳光幼儿园', canteen: '园区食堂', goodsName: '鲫鱼(斤/--/--)', shippingAt: '2026-07-30 07:20', auditAt: '', auditor: '', orderNo: 'XS202607290012', status: 'PENDING', creator: '刘财务', createdAt: '2026-07-30 11:20:08' },
    { id: 'CHG-002', changeNo: 'BG202607290002', beforeAmount: 4388.6, afterAmount: 4328.6, differenceAmount: -60, customerName: '育才中学', canteen: '高中部食堂', goodsName: '大米(KG/--/--)', shippingAt: '2026-07-29 06:50', auditAt: '2026-07-29 15:22', auditor: '管理员', orderNo: 'XS202607280006', status: 'APPROVED', creator: '赵老师', createdAt: '2026-07-29 13:05:10' }
  ];

  const sortingItems = [
    { id: 'SORT-001', orderId: 'ORD-20260730-001', goodsName: '大白菜(斤/--/--)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 80, actualQty: 0, unit: '斤', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 236, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-002', orderId: 'ORD-20260730-001', goodsName: '鸡蛋(斤/--/--)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 35, actualQty: 35, unit: '斤', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 109, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-30 15:21', warehouse: '中心仓', category: '蛋奶类', shortage: '否', supplier: '新鲜农场', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-003', orderId: 'ORD-20260729-012', goodsName: '鲫鱼(斤/--/--)', customerName: '阳光幼儿园', canteen: '园区食堂', orderQty: 20, actualQty: 8, unit: '斤', route: '南城二线', orderNo: 'DD202607290200012', orderTag: '普通餐', shipped: '否', progress: '40%', remark: '库存不足', stock: 8, status: 'PARTIAL', sorter: '李分拣', sortingAt: '2026-07-30 15:30', warehouse: '中心仓', category: '水产品', shortage: '是', supplier: '海鲜供应商', expectedAt: '2026-07-31 08:00' },
    { id: 'SORT-004', orderId: 'ORD-20260728-006', goodsName: '大米(KG/--/--)', customerName: '育才中学', canteen: '高中部食堂', orderQty: 120, actualQty: 120, unit: 'KG', route: '北城一线', orderNo: 'DD202607280300006', orderTag: '营养餐', shipped: '是', progress: '100%', remark: '', stock: 520, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-29 05:50', warehouse: '北区仓', category: '主食', shortage: '否', supplier: '粮油供应商', expectedAt: '2026-07-29 07:00' }
  ];

  const sortingProgress = [
    { id: 'SPG-001', customerName: '第一实验学校', canteen: '第一食堂', sortedCount: 7, orderCount: 18, progress: '39%', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 07:30', route: '东城一线', consignee: '王老师', consigneePhone: '13800002001', consigneeAddress: '东城教育路18号' },
    { id: 'SPG-002', customerName: '阳光幼儿园', canteen: '园区食堂', sortedCount: 12, orderCount: 12, progress: '100%', status: 'SORTED', warehouse: '中心仓', expectedAt: '2026-07-31 08:00', route: '南城二线', consignee: '李老师', consigneePhone: '13800002002', consigneeAddress: '南城阳光路8号' },
    { id: 'SPG-003', customerName: '育才中学', canteen: '高中部食堂', sortedCount: 25, orderCount: 25, progress: '100%', status: 'SORTED', warehouse: '北区仓', expectedAt: '2026-07-29 07:00', route: '北城一线', consignee: '赵老师', consigneePhone: '13800002003', consigneeAddress: '北城育才路66号' }
  ];

  const shortageItems = sortingItems.filter((item) => item.shortage === '是').map((item) => ({
    ...item,
    status: 'SHORTAGE',
    shortageQty: item.orderQty - item.actualQty,
    purchaseOrder: item.id === 'SORT-003' ? 'CG202607300018' : ''
  }));
  shortageItems.push({
    id: 'SHORT-002',
    goodsName: '西红柿(KG/--/--)',
    category: '果蔬',
    supplier: '绿源供应商',
    customerName: '第一实验学校',
    canteen: '第一食堂',
    warehouse: '中心仓',
    orderQty: 45,
    actualQty: 20,
    shortageQty: 25,
    unit: 'KG',
    route: '东城一线',
    orderNo: 'XS202607300001',
    purchaseOrder: '',
    expectedAt: '2026-07-31 07:30',
    status: 'SHORTAGE',
    createdAt: '2026-07-30 15:50'
  });

  const sorters = [
    { id: 'SRT-001', sorterCode: 'FJ0001', sorterName: '陈分拣', username: 'chenfenjian', role: '分拣员', phone: '13800001121', warehouse: '中心仓', status: 'ENABLE', createdAt: '2026-03-20 10:12:00' },
    { id: 'SRT-002', sorterCode: 'FJ0002', sorterName: '李分拣', username: 'lifenjian', role: '分拣员', phone: '13800001122', warehouse: '中心仓', status: 'ENABLE', createdAt: '2026-03-20 10:16:00' },
    { id: 'SRT-003', sorterCode: 'FJ0003', sorterName: '王分拣', username: 'wangfenjian', role: '分拣组长', phone: '13800001123', warehouse: '北区仓', status: 'DISABLE', createdAt: '2026-04-09 09:06:00' }
  ];

  const warehouses = [
    { id: 'WH-001', warehouseCode: 'CK0001', warehouseName: '中心仓', address: '上海市浦东新区集采路18号', manager: '周仓管', phone: '13800001001', status: 'ENABLE', referenced: true, createdAt: '2025-10-18 09:30:00' },
    { id: 'WH-002', warehouseCode: 'CK0002', warehouseName: '北区仓', address: '上海市宝山区配送路6号', manager: '陈仓管', phone: '13800001002', status: 'ENABLE', referenced: true, createdAt: '2025-11-06 14:22:00' },
    { id: 'WH-003', warehouseCode: 'CK0003', warehouseName: '临时仓', address: '上海市嘉定区临仓路9号', manager: '李仓管', phone: '13800001003', status: 'DISABLE', referenced: false, createdAt: '2026-06-12 11:03:00' }
  ];

  const shippingOrders = [
    { id: 'SHIP-001', orderNo: 'XS202607300001', customerName: '第一实验学校', canteen: '第一食堂', receiver: '王老师', phone: '13800002001', address: '东城教育路18号', route: '东城一线', shippingAmount: 0, printed: '否', status: 'PENDING', sortingStatus: '部分分拣', warehouse: '中心仓', expectedAt: '2026-07-31 07:30', orderTag: '营养餐' },
    { id: 'SHIP-002', orderNo: 'XS202607290012', customerName: '阳光幼儿园', canteen: '园区食堂', receiver: '李老师', phone: '13800002002', address: '南城阳光路8号', route: '南城二线', shippingAmount: 1520, printed: '是', status: 'SHIPPED', sortingStatus: '已分拣', warehouse: '中心仓', expectedAt: '2026-07-30 08:00', orderTag: '普通餐' }
  ];

  const shippingDifferences = [
    { id: 'DIFF-001', orderNo: 'XS202607300001', goodsName: '大白菜(斤/--/--)', warehouse: '中心仓', stockQty: 236, sortingQty: 80, differenceQty: 156, status: 'PENDING', createdAt: '2026-07-30 15:40' },
    { id: 'DIFF-002', orderNo: 'XS202607290012', goodsName: '鲫鱼(斤/--/--)', warehouse: '中心仓', stockQty: 8, sortingQty: 20, differenceQty: -12, status: 'PENDING', createdAt: '2026-07-30 15:42' }
  ];

  const qualityReports = [
    { id: 'QR-001', inboundAt: '2026-07-30 06:20', inboundNo: 'RK202607300009', goodsName: '鲫鱼(斤/--/--)', partner: '海鲜供应商', inboundType: '采购入库', warehouse: '中心仓', reportStatus: '未上传', reportName: '', createdAt: '2026-07-30 06:20' },
    { id: 'QR-002', inboundAt: '2026-07-29 05:40', inboundNo: 'RK202607290016', goodsName: '大米(KG/--/--)', partner: '粮油供应商', inboundType: '采购入库', warehouse: '北区仓', reportStatus: '已上传', reportName: '大米质检报告.pdf', createdAt: '2026-07-29 05:40' }
  ];

  const inventoryCounts = [
    { id: 'COUNT-001', countNo: 'PD202607300001', countAt: '2026-07-30 14:00', warehouse: '中心仓', lossAmount: 86.5, overflowAmount: 22, counter: '周仓管', status: 'PENDING', creator: '管理员', createdAt: '2026-07-30 14:10', remark: '', items: [{ goodsCode: 'SP0300019', goodsName: '大白菜', category: '果蔬-叶菜类', unit: '斤', bookQty: 236, countQty: 196, costPrice: 2.16 }, { goodsCode: 'SP0300018', goodsName: '鸡蛋', category: '蛋奶类', unit: '斤', bookQty: 109, countQty: 113, costPrice: 5.5 }] },
    { id: 'COUNT-002', countNo: 'PD202607250003', countAt: '2026-07-25 16:00', warehouse: '北区仓', lossAmount: 0, overflowAmount: 128, counter: '陈仓管', status: 'APPROVED', creator: '管理员', createdAt: '2026-07-25 16:35', remark: '', items: [{ goodsCode: 'SP0300025', goodsName: '大米', category: '主食-粮食类', unit: 'KG', bookQty: 520, countQty: 550, costPrice: 4.27 }] },
    { id: 'COUNT-003', countNo: 'PD202607180002', countAt: '2026-07-18 15:30', warehouse: '中心仓', lossAmount: 30, overflowAmount: 0, counter: '周仓管', status: 'CLOSED', creator: '管理员', createdAt: '2026-07-18 16:02' }
  ];

  const inventoryLosses = [
    { id: 'LOSS-001', lossNo: 'SY202607300001', createdAt: '2026-07-30 16:10', type: '盘损', relationNo: 'PD202607300001', productCount: 1, amount: 86.4, warehouse: '中心仓', status: 'PENDING', creator: '周仓管', remark: '', items: [{ goodsCode: 'SP0300019', goodsName: '大白菜', unit: '斤', quantity: 40, price: 2.16, amount: 86.4, reason: '盘点差异' }] },
    { id: 'LOSS-002', lossNo: 'SY202607250002', createdAt: '2026-07-25 17:02', type: '盘溢', relationNo: 'PD202607250003', productCount: 1, amount: 128.1, warehouse: '北区仓', status: 'APPROVED', creator: '陈仓管', remark: '', items: [{ goodsCode: 'SP0300025', goodsName: '大米', unit: 'KG', quantity: 30, price: 4.27, amount: 128.1, reason: '盘点差异' }] }
  ];

  const openingInventory = [
    { id: 'OPEN-001', goodsCode: 'SP0300019', goodsName: '大白菜(斤/--/--)', category: '果蔬-果蔬二级', unit: '斤', openingQty: 200, openingPrice: 2.1, openingAmount: 420, inputType: '手工录入', warehouse: '中心仓', status: 'COMPLETED' },
    { id: 'OPEN-002', goodsCode: 'SP0300018', goodsName: '鸡蛋(斤/--/--)', category: '蛋奶类-蛋奶类二级', unit: '斤', openingQty: 100, openingPrice: 5.6, openingAmount: 560, inputType: '导入', warehouse: '中心仓', status: 'COMPLETED' },
    { id: 'OPEN-003', goodsCode: 'SP0300025', goodsName: '大米(KG/--/--)', category: '主食-粮食类', unit: 'KG', openingQty: 500, openingPrice: 4.2, openingAmount: 2100, inputType: '手工录入', warehouse: '北区仓', status: 'COMPLETED' }
  ];

  const inventoryBalance = [
    { id: 'BAL-001', goodsCode: 'SP0300019', goodsName: '大白菜(斤/--/--)', category: '果蔬-果蔬二级', warehouse: '中心仓', unit: '斤', transitStock: 80, currentStock: 236, averageCost: 2.18, totalAmount: 514.48, upperLimit: 500, lowerLimit: 80 },
    { id: 'BAL-002', goodsCode: 'SP0300018', goodsName: '鸡蛋(斤/--/--)', category: '蛋奶类-蛋奶类二级', warehouse: '中心仓', unit: '斤', transitStock: 0, currentStock: 109, averageCost: 5.72, totalAmount: 623.48, upperLimit: 300, lowerLimit: 60 },
    { id: 'BAL-003', goodsCode: 'SP0300025', goodsName: '大米(KG/--/--)', category: '主食-粮食类', warehouse: '北区仓', unit: 'KG', transitStock: 200, currentStock: 520, averageCost: 4.35, totalAmount: 2262, upperLimit: 1000, lowerLimit: 200 },
    { id: 'BAL-004', goodsCode: 'SP0300029', goodsName: '鲫鱼(斤/--/--)', category: '水产品-水产品二级', warehouse: '中心仓', unit: '斤', transitStock: 30, currentStock: 8, averageCost: 14.8, totalAmount: 118.4, upperLimit: 120, lowerLimit: 20 }
  ];

  const inventoryDetails = [
    { id: 'DET-001', goodsCode: 'SP0300019', goodsName: '大白菜(斤/--/--)', category: '果蔬-果蔬二级', warehouse: '中心仓', documentType: '采购入库', relationNo: 'RK202607300011', occurredAt: '2026-07-30 06:35', unit: '斤', occurredQty: 100, occurredAmount: 220, partner: '绿源供应商', productionDate: '2026-07-30', shelfLife: '3天', expiryDate: '2026-08-02', balance: 236, qualification: '已上传', remark: '' },
    { id: 'DET-002', goodsCode: 'SP0300019', goodsName: '大白菜(斤/--/--)', category: '果蔬-果蔬二级', warehouse: '中心仓', documentType: '销售出库', relationNo: 'CK202607300008', occurredAt: '2026-07-30 07:10', unit: '斤', occurredQty: -80, occurredAmount: -176, partner: '第一实验学校', productionDate: '2026-07-30', shelfLife: '3天', expiryDate: '2026-08-02', balance: 156, qualification: '已上传', remark: '订单出库' },
    { id: 'DET-003', goodsCode: 'SP0300025', goodsName: '大米(KG/--/--)', category: '主食-粮食类', warehouse: '北区仓', documentType: '期初库存', relationNo: 'QC202607010001', occurredAt: '2026-07-01 00:00', unit: 'KG', occurredQty: 500, occurredAmount: 2100, partner: '--', productionDate: '2026-06-20', shelfLife: '12个月', expiryDate: '2027-06-20', balance: 500, qualification: '已上传', remark: '' }
  ];

  window.MockOperations = {
    orders,
    returns,
    tags,
    receiptChanges,
    sortingItems,
    sortingProgress,
    shortageItems,
    sorters,
    warehouses,
    shippingOrders,
    shippingDifferences,
    qualityReports,
    inventoryCounts,
    inventoryLosses,
    openingInventory,
    inventoryBalance,
    inventoryDetails
  };
})();
