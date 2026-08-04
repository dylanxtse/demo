(function () {
  const orders = [
    { id: 'ORD-20260730-001', orderNo: 'DD202607300100001', customerName: '第一实验学校', canteen: '第一食堂', customerType: '学校', orderTag: '营养餐', orderAmount: 2860.5, shippingAmount: 0, returnAmount: 0, reconciliationAmount: 0, expectedAt: '2026-07-31 07:30', status: 'PENDING', receiptStatus: '待收货', productCount: 18, warehouse: '中心仓', supplement: '否', remark: '上午七点半前送达', route: '东城一线', driver: '张师傅', source: '客户下单', creator: '王采购', createdAt: '2026-07-30 09:18:22', items: [
      { goodsName: '大白菜', isNetVegetable: false, goodsCode: 'SP0300019', unit: '斤', brand: '--', spec: '散装', unitPrice: 1.5, quantity: 80, subtotal: 120, shippedQty: 0, shippedAmount: 0, returnQty: 0, returnAmount: 0, reconciliationQty: 0, reconciliationAmount: 0, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-30', inspectionImages: [{ name: '验货照片1.jpg' }, { name: '验货照片2.jpg' }], inspectionVideos: [] },
      { goodsName: '鸡蛋', isNetVegetable: false, goodsCode: 'SP0300020', unit: '斤', brand: '农家', spec: '500g/份', unitPrice: 5.8, quantity: 35, subtotal: 203, shippedQty: 35, shippedAmount: 203, returnQty: 0, returnAmount: 0, reconciliationQty: 0, reconciliationAmount: 0, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-29', inspectionImages: [{ name: '鸡蛋验货.jpg' }], inspectionVideos: [{ name: '开箱验货.mp4' }] },
      { goodsName: '土豆', isNetVegetable: false, goodsCode: 'SP0300040', unit: '斤', brand: '农家优选', spec: '500g/份', unitPrice: 6.8, quantity: 50, subtotal: 340, shippedQty: 0, shippedAmount: 0, returnQty: 0, returnAmount: 0, reconciliationQty: 0, reconciliationAmount: 0, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-30', inspectionImages: [], inspectionVideos: [] }
    ], operationLogs: [
      { action: '创建', desc: '王采购 创建订单 2026-07-30 09:18:22' },
      { action: '提交审核', desc: '王采购 提交审核 2026-07-30 09:19:05' }
    ] },
    { id: 'ORD-20260729-012', orderNo: 'DD202607290200012', customerName: '阳光幼儿园', canteen: '园区食堂', customerType: '幼儿园', orderTag: '普通餐', orderAmount: 1568, shippingAmount: 1520, returnAmount: 48, reconciliationAmount: 1472, expectedAt: '2026-07-30 08:00', status: 'CONFIRMED', receiptStatus: '部分收货', productCount: 12, warehouse: '中心仓', supplement: '否', remark: '', route: '南城二线', driver: '李师傅', source: '平台添加', creator: '管理员', createdAt: '2026-07-29 14:36:10', items: [
      { goodsName: '鲫鱼', isNetVegetable: true, goodsCode: 'SP0300031', unit: '斤', brand: '--', spec: '--', unitPrice: 20, quantity: 20, subtotal: 400, shippedQty: 8, shippedAmount: 160, returnQty: 12, returnAmount: 240, reconciliationQty: 8, reconciliationAmount: 160, acceptedQty: 8, acceptedAmount: 160, remark: '库存不足', productionDate: '2026-07-29', inspectionImages: [{ name: '鲫鱼验货.jpg' }], inspectionVideos: [] },
      { goodsName: '西红柿', isNetVegetable: false, goodsCode: 'SP0300025', unit: 'KG', brand: '--', spec: '--', unitPrice: 4.5, quantity: 30, subtotal: 135, shippedQty: 30, shippedAmount: 135, returnQty: 0, returnAmount: 0, reconciliationQty: 30, reconciliationAmount: 135, acceptedQty: 30, acceptedAmount: 135, remark: '', productionDate: '2026-07-29', inspectionImages: [], inspectionVideos: [] },
      { goodsName: '猪肉', isNetVegetable: false, goodsCode: 'SP0300015', unit: '斤', brand: '双汇', spec: '500g/份', unitPrice: 18, quantity: 40, subtotal: 720, shippedQty: 40, shippedAmount: 720, returnQty: 0, returnAmount: 0, reconciliationQty: 40, reconciliationAmount: 720, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-29', inspectionImages: [{ name: '猪肉检疫.jpg' }, { name: '猪肉外观.jpg' }], inspectionVideos: [{ name: '验货视频.mp4' }] }
    ], operationLogs: [
      { action: '创建', desc: '管理员 创建订单 2026-07-29 14:36:10' },
      { action: '提交审核', desc: '管理员 提交审核 2026-07-29 14:37:00' },
      { action: '审核通过', desc: '管理员 审核通过 2026-07-29 15:00:00' },
      { action: '确认供货', desc: '管理员 确认供货 2026-07-29 16:20:00' }
    ] },
    { id: 'ORD-20260728-006', orderNo: 'DD202607280300006', customerName: '育才中学', canteen: '高中部食堂', customerType: '学校', orderTag: '营养餐', orderAmount: 4388.6, shippingAmount: 4388.6, returnAmount: 0, reconciliationAmount: 4388.6, expectedAt: '2026-07-29 07:00', status: 'COMPLETED', receiptStatus: '已收货', productCount: 25, warehouse: '北区仓', supplement: '是', remark: '补单', route: '北城一线', driver: '周师傅', source: '客户下单', creator: '赵老师', createdAt: '2026-07-28 16:05:41', items: [
      { goodsName: '大米', isNetVegetable: false, goodsCode: 'SP0300034', unit: '斤', brand: '--', spec: '--', unitPrice: 10, quantity: 120, subtotal: 1200, shippedQty: 120, shippedAmount: 1200, returnQty: 0, returnAmount: 0, reconciliationQty: 120, reconciliationAmount: 1200, acceptedQty: 120, acceptedAmount: 1200, remark: '', productionDate: '2026-07-28', inspectionImages: [{ name: '大米验货.jpg' }], inspectionVideos: [] },
      { goodsName: '大玉米棒子', isNetVegetable: true, goodsCode: 'SP0300036', unit: 'KG', brand: '--', spec: '--', unitPrice: 5, quantity: 80, subtotal: 400, shippedQty: 80, shippedAmount: 400, returnQty: 0, returnAmount: 0, reconciliationQty: 80, reconciliationAmount: 400, acceptedQty: 80, acceptedAmount: 400, remark: '', productionDate: '2026-07-28', inspectionImages: [], inspectionVideos: [] },
      { goodsName: '黑大米', isNetVegetable: false, goodsCode: 'SP0300035', unit: '斤', brand: '--', spec: '--', unitPrice: 10, quantity: 60, subtotal: 600, shippedQty: 60, shippedAmount: 600, returnQty: 0, returnAmount: 0, reconciliationQty: 60, reconciliationAmount: 600, acceptedQty: 60, acceptedAmount: 600, remark: '', productionDate: '2026-07-28', inspectionImages: [{ name: '黑米验货1.jpg' }, { name: '黑米验货2.jpg' }], inspectionVideos: [{ name: '验货过程.mp4' }] }
    ], operationLogs: [
      { action: '创建', desc: '赵老师 创建订单 2026-07-28 16:05:41' },
      { action: '提交审核', desc: '赵老师 提交审核 2026-07-28 16:06:20' },
      { action: '审核通过', desc: '管理员 审核通过 2026-07-28 17:00:00' },
      { action: '确认供货', desc: '管理员 确认供货 2026-07-28 17:30:00' },
      { action: '完成发货', desc: '周师傅 完成发货 2026-07-29 07:00:00' }
    ] },
    { id: 'ORD-20260727-003', orderNo: 'DD202607270400003', customerName: '机关第二食堂', canteen: '二号食堂', customerType: '机关单位', orderTag: '普通餐', orderAmount: 973.2, shippingAmount: 0, returnAmount: 0, reconciliationAmount: 0, expectedAt: '2026-07-28 09:00', status: 'CLOSED', receiptStatus: '未收货', productCount: 8, warehouse: '中心仓', supplement: '否', remark: '客户取消', route: '西城一线', driver: '', source: '平台添加', creator: '管理员', createdAt: '2026-07-27 11:20:08', items: [
      { goodsName: '牛奶', isNetVegetable: true, goodsCode: 'SP0300037', unit: '瓶', brand: '--', spec: '--', unitPrice: 5, quantity: 100, subtotal: 500, shippedQty: 0, shippedAmount: 0, returnQty: 0, returnAmount: 0, reconciliationQty: 0, reconciliationAmount: 0, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-27', inspectionImages: [], inspectionVideos: [] },
      { goodsName: '面包', isNetVegetable: false, goodsCode: 'SP0300042', unit: '个', brand: '桃李', spec: '100g/个', unitPrice: 3.5, quantity: 80, subtotal: 280, shippedQty: 0, shippedAmount: 0, returnQty: 0, returnAmount: 0, reconciliationQty: 0, reconciliationAmount: 0, acceptedQty: 0, acceptedAmount: 0, remark: '', productionDate: '2026-07-27', inspectionImages: [], inspectionVideos: [] }
    ], operationLogs: [
      { action: '创建', desc: '管理员 创建订单 2026-07-27 11:20:08' },
      { action: '关闭', desc: '管理员 关闭订单 2026-07-27 14:00:00' }
    ] }
  ];

  const returns = [
    { id: 'RET-001', returnNo: 'TH202607300001', customerName: '阳光幼儿园', canteen: '园区食堂', goodsName: '鲫鱼(斤/--/--)', reason: '商品破损', orderNo: 'XS202607290012', inboundNo: 'RK202607300009', warehouse: '中心仓', status: 'PENDING', creator: '刘财务', createdAt: '2026-07-30 10:12:00', refundAmount: 120.00, remark: '鲫鱼到货后部分死亡，需退货处理', items: [{ id: 'RL-1', goodsName: '鲫鱼(斤/--/--)', unit: '斤', orderPrice: 12.00, shippedQty: 20, returnedQty: 0, applyQty: 10, applyPrice: 12.00, applyAmount: 120.00, damageQty: 5, purchaseOrder: 'CG202607280001', remark: '部分死亡' }] },
    { id: 'RET-002', returnNo: 'TH202607280003', customerName: '育才中学', canteen: '高中部食堂', goodsName: '大米(KG/--/--)', reason: '数量多发', orderNo: 'XS202607280006', inboundNo: 'RK202607290016', warehouse: '北区仓', status: 'APPROVED', creator: '赵老师', createdAt: '2026-07-28 15:42:36', auditor: '管理员', auditAt: '2026-07-29 09:30:00', refundAmount: 240.00, remark: '发货数量超出下单数量', items: [{ id: 'RL-2', goodsName: '大米(KG/--/--)', unit: 'KG', orderPrice: 6.00, shippedQty: 100, returnedQty: 0, applyQty: 40, applyPrice: 6.00, applyAmount: 240.00, damageQty: 0, purchaseOrder: 'CG202607260003', remark: '多发40KG' }] },
    { id: 'RET-003', returnNo: 'TH202607260002', customerName: '第一实验学校', canteen: '第一食堂', goodsName: '鸡蛋(斤/--/--)', reason: '质量不符合要求', orderNo: 'XS202607260021', inboundNo: 'RK202607270011', warehouse: '中心仓', status: 'CLOSED', creator: '王采购', createdAt: '2026-07-26 17:08:25', auditor: '管理员', auditAt: '2026-07-27 10:15:00', acceptedAt: '2026-07-27 16:00:00', refundAmount: 180.00, remark: '鸡蛋有破损，质量不达标', items: [{ id: 'RL-3', goodsName: '鸡蛋(斤/--/--)', unit: '斤', orderPrice: 6.00, shippedQty: 50, returnedQty: 0, applyQty: 30, applyPrice: 6.00, applyAmount: 180.00, damageQty: 10, purchaseOrder: 'CG202607240008', remark: '部分破损' }] }
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
    // 第一实验学校 / 第一食堂 (东城一线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-001', orderId: 'ORD-20260730-001', goodsCode: 'SP0300019', isNetVegetable: false, goodsName: '大白菜(斤/--/散装)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 80, actualQty: 0, unit: '斤', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 236, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-002', orderId: 'ORD-20260730-001', goodsCode: 'SP0300018', isNetVegetable: false, goodsName: '鸡蛋(斤/农家/500g份)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 35, actualQty: 35, unit: '斤', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 109, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-31 06:21', warehouse: '中心仓', category: '蛋奶类', shortage: '否', supplier: '新鲜农场', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-003', orderId: 'ORD-20260730-001', goodsCode: 'SP0300040', isNetVegetable: true, goodsName: '土豆(斤/农家优选/500g份)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 50, actualQty: 50, unit: '斤', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 180, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-31 06:25', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-004', orderId: 'ORD-20260730-001', goodsCode: 'SP0300020', isNetVegetable: true, goodsName: '西红柿(KG/--/--)', customerName: '第一实验学校', canteen: '第一食堂', orderQty: 30, actualQty: 0, unit: 'KG', route: '东城一线', orderNo: 'DD202607300100001', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 95, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:30' },

    // 阳光幼儿园 / 园区食堂 (南城二线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-005', orderId: 'ORD-20260729-012', goodsCode: 'SP0300029', isNetVegetable: true, goodsName: '鲫鱼(斤/--/--)', customerName: '阳光幼儿园', canteen: '园区食堂', orderQty: 20, actualQty: 8, unit: '斤', route: '南城二线', orderNo: 'DD202607290200012', orderTag: '普通餐', shipped: '否', progress: '40%', remark: '库存不足', stock: 8, status: 'PARTIAL', sorter: '李分拣', sortingAt: '2026-07-31 06:30', warehouse: '中心仓', category: '水产品', shortage: '是', supplier: '海鲜供应商', expectedAt: '2026-07-31 08:00' },
    { id: 'SORT-006', orderId: 'ORD-20260729-012', goodsCode: 'SP0300020', isNetVegetable: true, goodsName: '西红柿(KG/--/--)', customerName: '阳光幼儿园', canteen: '园区食堂', orderQty: 15, actualQty: 15, unit: 'KG', route: '南城二线', orderNo: 'DD202607290200012', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 95, status: 'SORTED', sorter: '李分拣', sortingAt: '2026-07-31 06:35', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 08:00' },
    { id: 'SORT-007', orderId: 'ORD-20260729-012', goodsCode: 'SP0300015', isNetVegetable: false, goodsName: '猪肉(斤/双汇/500g份)', customerName: '阳光幼儿园', canteen: '园区食堂', orderQty: 40, actualQty: 40, unit: '斤', route: '南城二线', orderNo: 'DD202607290200012', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 120, status: 'SORTED', sorter: '李分拣', sortingAt: '2026-07-31 06:40', warehouse: '中心仓', category: '肉类', shortage: '否', supplier: '肉联供应商', expectedAt: '2026-07-31 08:00' },

    // 育才中学 / 高中部食堂 (北城一线, 北区仓) - expectedAt: 2026-07-31
    { id: 'SORT-008', orderId: 'ORD-20260728-006', goodsCode: 'SP0300034', isNetVegetable: true, goodsName: '大米(KG/--/--)', customerName: '育才中学', canteen: '高中部食堂', orderQty: 120, actualQty: 120, unit: 'KG', route: '北城一线', orderNo: 'DD202607280300006', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 520, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-31 05:50', warehouse: '北区仓', category: '主食', shortage: '否', supplier: '粮油供应商', expectedAt: '2026-07-31 07:00' },
    { id: 'SORT-009', orderId: 'ORD-20260728-006', goodsCode: 'SP0300036', isNetVegetable: false, goodsName: '大玉米棒子(KG/--/--)', customerName: '育才中学', canteen: '高中部食堂', orderQty: 80, actualQty: 80, unit: 'KG', route: '北城一线', orderNo: 'DD202607280300006', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 200, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-31 05:55', warehouse: '北区仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:00' },
    { id: 'SORT-010', orderId: 'ORD-20260728-006', goodsCode: 'SP0300035', isNetVegetable: false, goodsName: '黑大米(斤/--/--)', customerName: '育才中学', canteen: '高中部食堂', orderQty: 60, actualQty: 30, unit: '斤', route: '北城一线', orderNo: 'DD202607280300006', orderTag: '营养餐', shipped: '否', progress: '50%', remark: '部分分拣', stock: 90, status: 'PARTIAL', sorter: '王分拣', sortingAt: '2026-07-31 06:00', warehouse: '北区仓', category: '主食', shortage: '否', supplier: '粮油供应商', expectedAt: '2026-07-31 07:00' },

    // 第三小学 / 校园食堂 (东城一线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-011', orderId: 'ORD-20260730-008', goodsCode: 'SP0300037', isNetVegetable: true, goodsName: '牛奶(瓶/三元/--)', customerName: '第三小学', canteen: '校园食堂', orderQty: 100, actualQty: 0, unit: '瓶', route: '东城一线', orderNo: 'DD202607300100008', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 320, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '蛋奶类', shortage: '否', supplier: '乳业供应商', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-012', orderId: 'ORD-20260730-008', goodsCode: 'SP0300042', isNetVegetable: false, goodsName: '面包(个/桃李/100g个)', customerName: '第三小学', canteen: '校园食堂', orderQty: 80, actualQty: 80, unit: '个', route: '东城一线', orderNo: 'DD202607300100008', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 250, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-31 06:10', warehouse: '中心仓', category: '主食', shortage: '否', supplier: '烘焙供应商', expectedAt: '2026-07-31 07:30' },
    { id: 'SORT-013', orderId: 'ORD-20260730-008', goodsCode: 'SP0300039', isNetVegetable: true, goodsName: '土豆丝(斤/--/--)', customerName: '第三小学', canteen: '校园食堂', orderQty: 40, actualQty: 40, unit: '斤', route: '东城一线', orderNo: 'DD202607300100008', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 150, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-31 06:15', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:30' },

    // 实验幼儿园 / 食堂 (南城二线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-014', orderId: 'ORD-20260730-010', goodsCode: 'SP0300014', isNetVegetable: false, goodsName: '苹果(斤/--/--)', customerName: '实验幼儿园', canteen: '食堂', orderQty: 50, actualQty: 50, unit: '斤', route: '南城二线', orderNo: 'DD202607300100010', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 180, status: 'SORTED', sorter: '李分拣', sortingAt: '2026-07-31 06:20', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 08:30' },
    { id: 'SORT-015', orderId: 'ORD-20260730-010', goodsCode: 'SP0300024', isNetVegetable: false, goodsName: '三元牛奶(瓶/三元/10瓶1箱)', customerName: '实验幼儿园', canteen: '食堂', orderQty: 30, actualQty: 0, unit: '瓶', route: '南城二线', orderNo: 'DD202607300100010', orderTag: '普通餐', shipped: '否', progress: '0%', remark: '', stock: 85, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '蛋奶类', shortage: '否', supplier: '乳业供应商', expectedAt: '2026-07-31 08:30' },

    // 第七中学 / 初中部食堂 (北城一线, 北区仓) - expectedAt: 2026-07-31
    { id: 'SORT-016', orderId: 'ORD-20260730-015', goodsCode: 'SP0300034', isNetVegetable: false, goodsName: '大米(KG/--/--)', customerName: '第七中学', canteen: '初中部食堂', orderQty: 90, actualQty: 90, unit: 'KG', route: '北城一线', orderNo: 'DD202607300100015', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 520, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-31 05:30', warehouse: '北区仓', category: '主食', shortage: '否', supplier: '粮油供应商', expectedAt: '2026-07-31 07:00' },
    { id: 'SORT-017', orderId: 'ORD-20260730-015', goodsCode: 'SP0300019', isNetVegetable: true, goodsName: '大白菜(斤/--/散装)', customerName: '第七中学', canteen: '初中部食堂', orderQty: 60, actualQty: 0, unit: '斤', route: '北城一线', orderNo: 'DD202607300100015', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 50, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '北区仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:00' },
    { id: 'SORT-018', orderId: 'ORD-20260730-015', goodsCode: 'SP0300018', isNetVegetable: false, goodsName: '鸡蛋(斤/农家/500g份)', customerName: '第七中学', canteen: '初中部食堂', orderQty: 45, actualQty: 45, unit: '斤', route: '北城一线', orderNo: 'DD202607300100015', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 130, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-31 05:40', warehouse: '北区仓', category: '蛋奶类', shortage: '否', supplier: '新鲜农场', expectedAt: '2026-07-31 07:00' },

    // 机关第一食堂 / 一号食堂 (西城一线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-019', orderId: 'ORD-20260730-020', goodsCode: 'SP0300015', isNetVegetable: false, goodsName: '猪肉(斤/双汇/500g份)', customerName: '机关第一食堂', canteen: '一号食堂', orderQty: 30, actualQty: 30, unit: '斤', route: '西城一线', orderNo: 'DD202607300100020', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 120, status: 'SORTED', sorter: '陈分拣', sortingAt: '2026-07-31 06:00', warehouse: '中心仓', category: '肉类', shortage: '否', supplier: '肉联供应商', expectedAt: '2026-07-31 09:00' },
    { id: 'SORT-020', orderId: 'ORD-20260730-020', goodsCode: 'SP0300029', isNetVegetable: false, goodsName: '鲫鱼(斤/--/--)', customerName: '机关第一食堂', canteen: '一号食堂', orderQty: 15, actualQty: 0, unit: '斤', route: '西城一线', orderNo: 'DD202607300100020', orderTag: '普通餐', shipped: '否', progress: '0%', remark: '', stock: 5, status: 'PENDING', sorter: '', sortingAt: '', warehouse: '中心仓', category: '水产品', shortage: '否', supplier: '海鲜供应商', expectedAt: '2026-07-31 09:00' },

    // 育才中学 / 初中部食堂 (北城一线, 北区仓) - expectedAt: 2026-07-31
    { id: 'SORT-021', orderId: 'ORD-20260730-022', goodsCode: 'SP0300040', isNetVegetable: false, goodsName: '土豆(斤/农家优选/500g份)', customerName: '育才中学', canteen: '初中部食堂', orderQty: 70, actualQty: 70, unit: '斤', route: '北城一线', orderNo: 'DD202607300100022', orderTag: '营养餐', shipped: '否', progress: '100%', remark: '', stock: 180, status: 'SORTED', sorter: '王分拣', sortingAt: '2026-07-31 05:45', warehouse: '北区仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 07:00' },
    { id: 'SORT-022', orderId: 'ORD-20260730-022', goodsCode: 'SP0300020', isNetVegetable: true, goodsName: '西红柿(KG/--/--)', customerName: '育才中学', canteen: '初中部食堂', orderQty: 25, actualQty: 0, unit: 'KG', route: '北城一线', orderNo: 'DD202607300100022', orderTag: '营养餐', shipped: '否', progress: '0%', remark: '', stock: 0, status: 'SHORTAGE', sorter: '', sortingAt: '', warehouse: '北区仓', category: '果蔬', shortage: '是', supplier: '绿源供应商', expectedAt: '2026-07-31 07:00' },

    // 阳光幼儿园 / 分园食堂 (南城二线, 中心仓) - expectedAt: 2026-07-31
    { id: 'SORT-023', orderId: 'ORD-20260730-025', goodsCode: 'SP0300037', isNetVegetable: true, goodsName: '牛奶(瓶/三元/--)', customerName: '阳光幼儿园', canteen: '分园食堂', orderQty: 60, actualQty: 60, unit: '瓶', route: '南城二线', orderNo: 'DD202607300100025', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 320, status: 'SORTED', sorter: '李分拣', sortingAt: '2026-07-31 06:25', warehouse: '中心仓', category: '蛋奶类', shortage: '否', supplier: '乳业供应商', expectedAt: '2026-07-31 08:00' },
    { id: 'SORT-024', orderId: 'ORD-20260730-025', goodsCode: 'SP0300014', isNetVegetable: false, goodsName: '苹果(斤/--/--)', customerName: '阳光幼儿园', canteen: '分园食堂', orderQty: 40, actualQty: 40, unit: '斤', route: '南城二线', orderNo: 'DD202607300100025', orderTag: '普通餐', shipped: '否', progress: '100%', remark: '', stock: 180, status: 'SORTED', sorter: '李分拣', sortingAt: '2026-07-31 06:30', warehouse: '中心仓', category: '果蔬', shortage: '否', supplier: '绿源供应商', expectedAt: '2026-07-31 08:00' }
  ];

  // 为分拣列表中存在但订单档案尚未建模的订单补齐可下钻详情数据。
  const orderIds = new Set(orders.map((order) => order.orderNo));
  const missingSortingOrders = sortingItems.filter((item) => !orderIds.has(item.orderNo));
  const missingOrderGroups = new Map();
  missingSortingOrders.forEach((item) => {
    if (!missingOrderGroups.has(item.orderNo)) missingOrderGroups.set(item.orderNo, []);
    missingOrderGroups.get(item.orderNo).push(item);
  });
  missingOrderGroups.forEach((group, orderNo) => {
    const first = group[0];
    const items = group.map((item) => ({
      goodsName: String(item.goodsName || '').replace(/\([^)]*\)$/, ''),
      isNetVegetable: Boolean(item.isNetVegetable),
      goodsCode: item.goodsCode,
      unit: item.unit || '--',
      brand: '--',
      spec: '--',
      unitPrice: 0,
      quantity: Number(item.orderQty || 0),
      subtotal: 0,
      shippedQty: item.shipped === '是' ? Number(item.actualQty || 0) : 0,
      shippedAmount: 0,
      returnQty: 0,
      returnAmount: 0,
      reconciliationQty: 0,
      reconciliationAmount: 0,
      acceptedQty: Number(item.actualQty || 0),
      acceptedAmount: 0,
      remark: item.remark || '',
      productionDate: String(item.expectedAt || '').slice(0, 10),
      inspectionImages: [],
      inspectionVideos: []
    }));
    orders.push({
      id: first.orderId || `ORD-SORT-${orderNo}`,
      orderNo,
      customerName: first.customerName || '--',
      canteen: first.canteen || '--',
      customerType: '学校',
      orderTag: first.orderTag || '普通餐',
      orderAmount: 0,
      shippingAmount: 0,
      returnAmount: 0,
      reconciliationAmount: 0,
      expectedAt: first.expectedAt || '',
      status: group.every((item) => Number(item.actualQty || 0) >= Number(item.orderQty || 0)) ? 'COMPLETED' : 'PENDING',
      receiptStatus: '待收货',
      productCount: items.length,
      warehouse: first.warehouse || '',
      supplement: '否',
      remark: '',
      route: first.route || '',
      driver: '',
      source: '客户下单',
      creator: '系统模拟',
      createdAt: first.expectedAt || '',
      items,
      operationLogs: []
    });
  });

  const sortingProgress = [
    { id: 'SPG-001', customerName: '第一实验学校', canteen: '第一食堂', sortedCount: 2, orderCount: 4, progress: '2/4', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 07:30', route: '东城一线', consignee: '王老师', consigneePhone: '13800002001', consigneeAddress: '东城教育路18号' },
    { id: 'SPG-002', customerName: '阳光幼儿园', canteen: '园区食堂', sortedCount: 2, orderCount: 3, progress: '2/3', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 08:00', route: '南城二线', consignee: '李老师', consigneePhone: '13800002002', consigneeAddress: '南城阳光路8号' },
    { id: 'SPG-003', customerName: '育才中学', canteen: '高中部食堂', sortedCount: 2, orderCount: 3, progress: '2/3', status: 'PARTIAL', warehouse: '北区仓', expectedAt: '2026-07-31 07:00', route: '北城一线', consignee: '赵老师', consigneePhone: '13800002003', consigneeAddress: '北城育才路66号' },
    { id: 'SPG-004', customerName: '第三小学', canteen: '校园食堂', sortedCount: 2, orderCount: 3, progress: '2/3', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 07:30', route: '东城一线', consignee: '孙老师', consigneePhone: '13800002004', consigneeAddress: '东城文化路25号' },
    { id: 'SPG-005', customerName: '实验幼儿园', canteen: '食堂', sortedCount: 1, orderCount: 2, progress: '1/2', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 08:30', route: '南城二线', consignee: '周老师', consigneePhone: '13800002005', consigneeAddress: '南城实验路12号' },
    { id: 'SPG-006', customerName: '第七中学', canteen: '初中部食堂', sortedCount: 2, orderCount: 3, progress: '2/3', status: 'PARTIAL', warehouse: '北区仓', expectedAt: '2026-07-31 07:00', route: '北城一线', consignee: '吴老师', consigneePhone: '13800002006', consigneeAddress: '北城第七路99号' },
    { id: 'SPG-007', customerName: '机关第一食堂', canteen: '一号食堂', sortedCount: 1, orderCount: 2, progress: '1/2', status: 'PARTIAL', warehouse: '中心仓', expectedAt: '2026-07-31 09:00', route: '西城一线', consignee: '郑主任', consigneePhone: '13800002007', consigneeAddress: '西城政府路3号' },
    { id: 'SPG-008', customerName: '育才中学', canteen: '初中部食堂', sortedCount: 1, orderCount: 2, progress: '1/2', status: 'PARTIAL', warehouse: '北区仓', expectedAt: '2026-07-31 07:00', route: '北城一线', consignee: '赵老师', consigneePhone: '13800002008', consigneeAddress: '北城育才路66号' },
    { id: 'SPG-009', customerName: '阳光幼儿园', canteen: '分园食堂', sortedCount: 2, orderCount: 2, progress: '2/2', status: 'SORTED', warehouse: '中心仓', expectedAt: '2026-07-31 08:00', route: '南城二线', consignee: '李老师', consigneePhone: '13800002009', consigneeAddress: '南城阳光路8号附1号' }
  ];

  // 客户分拣按客户汇总商品；“是否净菜”按该客户是否包含净菜商品汇总。
  const netVegetableByCustomer = new Map();
  sortingItems.forEach((item) => {
    const key = `${item.customerName || ''}::${item.canteen || ''}`;
    netVegetableByCustomer.set(key, Boolean(netVegetableByCustomer.get(key) || item.isNetVegetable));
  });
  sortingProgress.forEach((item) => {
    const key = `${item.customerName || ''}::${item.canteen || ''}`;
    item.isNetVegetable = Boolean(netVegetableByCustomer.get(key));
  });

  const shortageItems = sortingItems.filter((item) => item.shortage === '是').map((item) => ({
    ...item,
    status: 'SHORTAGE',
    shortageQty: item.orderQty - item.actualQty,
    purchaseOrder: item.id === 'SORT-005' ? 'CG202607300018' : ''
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
