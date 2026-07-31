(function () {
  window.MockInboundOrders = [
    {
      id: 'RKD202607280300001',
      entryTime: '2026-07-28 17:27:56',
      supplierPurchaserCustomerName: '上海绿源农产品有限公司',
      entryType: '采购入库',
      entryAmt: '856.00',
      warehouseName: '生鲜仓库',
      relNo: 'CGD202607280300001',
      expectedDeliveryDate: '2026-07-28',
      status: '已完成',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '生鲜日配，到货正常',
      attachments: [
        { name: '入库验收单.pdf', format: 'pdf', size: '128KB' },
        { name: '现场照片.jpg', format: 'jpg', size: '856KB' }
      ],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-28 17:27:56' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-28 17:32:00' },
        { action: '审核', operator: '张三', desc: '张三 审核通过 2026-07-28 18:05:11' },
        { action: '完成', operator: '系统', desc: '系统 标记完成 2026-07-28 18:06:30' }
      ],
      items: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', brand: '--', spec: '--', conversionRate: 1, expectedQty: 50, damageQty: 0, actualQty: 50, unitPrice: '5.00', amount: '250.00', productionDate: '2026-07-27', qualityFiles: [{ name: '质检报告1.pdf' }, { name: '检测照片.jpg' }] },
        { productCode: 'SP0300020', productName: '西红柿', unit: 'KG', brand: '--', spec: '--', conversionRate: 1, expectedQty: 30, damageQty: 1, actualQty: 29, unitPrice: '20.00', amount: '580.00', productionDate: '2026-07-27', qualityFiles: [{ name: '质检合格证.pdf' }] }
      ]
    },
    {
      id: 'RKD202607280300002',
      entryTime: '2026-07-28 15:10:22',
      supplierPurchaserCustomerName: '北方粮油批发部',
      entryType: '采购入库',
      entryAmt: '760.00',
      warehouseName: '公司市区仓库',
      relNo: 'CGD202607270300002',
      expectedDeliveryDate: '2026-07-28',
      status: '待审核',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '大米验收入库，待审核',
      attachments: [],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-28 15:10:22' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-28 15:12:00' }
      ],
      items: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', brand: '--', spec: '--', conversionRate: 1, expectedQty: 40, damageQty: 0, actualQty: 40, unitPrice: '19.00', amount: '760.00', productionDate: '2026-07-20', qualityFiles: [] }
      ]
    },
    {
      id: 'RKD202607270300003',
      entryTime: '2026-07-27 09:45:30',
      supplierPurchaserCustomerName: '静安第1中学',
      entryType: '订单退货入库',
      entryAmt: '150.00',
      warehouseName: '生鲜仓库',
      relNo: 'DD202607260300005',
      expectedDeliveryDate: '2026-07-27',
      status: '已完成',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '客户退货，商品完好可二次销售',
      attachments: [
        { name: '退货说明.docx', format: 'docx', size: '64KB' }
      ],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-27 09:45:30' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-27 09:50:00' },
        { action: '审核', operator: '李四', desc: '李四 审核通过 2026-07-27 10:20:15' },
        { action: '完成', operator: '系统', desc: '系统 标记完成 2026-07-27 10:21:00' }
      ],
      items: [
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', brand: '--', spec: '--', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 6, unitPrice: '23.00', amount: '138.00', productionDate: '2026-07-24', qualityFiles: [] },
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', brand: '三元', spec: '10瓶1箱', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 1, unitPrice: '10.00', amount: '10.00', productionDate: '2026-07-24', qualityFiles: [{ name: '出厂检验报告.pdf' }] }
      ]
    },
    {
      id: 'RKD202607270300004',
      entryTime: '2026-07-27 11:20:08',
      supplierPurchaserCustomerName: '--',
      entryType: '报溢入库',
      entryAmt: '45.00',
      warehouseName: '东南区域仓库',
      relNo: '--',
      expectedDeliveryDate: '--',
      status: '已完成',
      purchaserLeaderName: '--',
      creator: '杨',
      remark: '',
      attachments: [],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-27 11:20:08' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-27 11:25:00' },
        { action: '审核', operator: '张三', desc: '张三 审核通过 2026-07-27 11:35:22' },
        { action: '完成', operator: '系统', desc: '系统 标记完成 2026-07-27 11:36:10' }
      ],
      items: [
        { productCode: 'SP0300018', productName: '鸡蛋', unit: '斤', brand: '--', spec: '--', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 2, unitPrice: '22.00', amount: '44.00', productionDate: '2026-07-25', qualityFiles: [] }
      ]
    },
    {
      id: 'RKD202607260300005',
      entryTime: '2026-07-26 14:35:12',
      supplierPurchaserCustomerName: '联营水产合作社',
      entryType: '联营采购入库',
      entryAmt: '300.00',
      warehouseName: '生鲜仓库',
      relNo: 'CGD202607260300010',
      expectedDeliveryDate: '2026-07-26',
      status: '待入库',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '联营采购鲫鱼，等待到货',
      attachments: [],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-26 14:35:12' }
      ],
      items: [
        { productCode: 'SP0300029', productName: '鲫鱼', unit: '斤', brand: '--', spec: '--', conversionRate: 1, expectedQty: 20, damageQty: 0, actualQty: 0, unitPrice: '15.00', amount: '300.00', productionDate: '', qualityFiles: [] }
      ]
    },
    {
      id: 'RKD202607250300006',
      entryTime: '2026-07-25 16:08:45',
      supplierPurchaserCustomerName: '上海绿源农产品有限公司',
      entryType: '采购入库',
      entryAmt: '468.00',
      warehouseName: '公司市区仓库',
      relNo: 'CGD202607250300006',
      expectedDeliveryDate: '2026-07-25',
      status: '已驳回',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '玉米到货量与订单不符，已驳回',
      attachments: [
        { name: '质检报告.png', format: 'png', size: '320KB' }
      ],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-25 16:08:45' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-25 16:13:00' },
        { action: '审核', operator: '李四', desc: '李四 驳回 2026-07-25 17:30:20' }
      ],
      items: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', brand: '--', spec: '--', conversionRate: 1, expectedQty: 60, damageQty: 0, actualQty: 45, unitPrice: '5.00', amount: '225.00', productionDate: '2026-07-24', qualityFiles: [{ name: '不合格报告.pdf' }] },
        { productCode: 'SP0300039', productName: '土豆丝', unit: '斤', brand: '--', spec: '--', conversionRate: 1, expectedQty: 25, damageQty: 2, actualQty: 23, unitPrice: '1.00', amount: '23.00', productionDate: '2026-07-24', qualityFiles: [{ name: '质检合格.pdf' }, { name: '现场照片.jpg' }] }
      ]
    },
    {
      id: 'RKD202607240300007',
      entryTime: '2026-07-24 10:50:33',
      supplierPurchaserCustomerName: '--',
      entryType: '单位转换入库',
      entryAmt: '110.00',
      warehouseName: '东南区域仓库',
      relNo: '--',
      expectedDeliveryDate: '--',
      status: '已完成',
      purchaserLeaderName: '--',
      creator: '杨',
      remark: '箱装牛奶转换为瓶装入库',
      attachments: [],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-24 10:50:33' },
        { action: '提交审核', operator: '杨', desc: '杨 提交审核 2026-07-24 10:55:00' },
        { action: '审核', operator: '张三', desc: '张三 审核通过 2026-07-24 11:15:08' },
        { action: '完成', operator: '系统', desc: '系统 标记完成 2026-07-24 11:16:00' }
      ],
      items: [
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', brand: '三元', spec: '10瓶1箱', conversionRate: 10, expectedQty: 0, damageQty: 0, actualQty: 11, unitPrice: '10.00', amount: '110.00', productionDate: '2026-07-20', qualityFiles: [] }
      ]
    },
    {
      id: 'RKD202607230300008',
      entryTime: '2026-07-23 17:15:00',
      supplierPurchaserCustomerName: '静安第11中学',
      entryType: '联营退货入库',
      entryAmt: '90.00',
      warehouseName: '生鲜仓库',
      relNo: 'DD202607220300012',
      expectedDeliveryDate: '2026-07-23',
      status: '已关闭',
      purchaserLeaderName: '杨',
      creator: '杨',
      remark: '联营客户退货，超期已关闭',
      attachments: [],
      operationLogs: [
        { action: '添加', operator: '杨', desc: '杨 添加入库单 2026-07-23 17:15:00' },
        { action: '关闭', operator: '系统', desc: '系统 超期自动关闭 2026-07-25 00:00:00' }
      ],
      items: [
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', brand: '--', spec: '--', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 4, unitPrice: '23.00', amount: '92.00', productionDate: '2026-07-20', qualityFiles: [] }
      ]
    }
  ];
})();
