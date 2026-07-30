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
      items: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', conversionRate: 1, expectedQty: 50, damageQty: 0, actualQty: 50, unitPrice: '5.00', amount: '250.00', productionDate: '2026-07-27', qualityReport: '合格' },
        { productCode: 'SP0300020', productName: '西红柿', unit: 'KG', conversionRate: 1, expectedQty: 30, damageQty: 1, actualQty: 29, unitPrice: '20.00', amount: '580.00', productionDate: '2026-07-27', qualityReport: '合格' }
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
      items: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', conversionRate: 1, expectedQty: 40, damageQty: 0, actualQty: 40, unitPrice: '19.00', amount: '760.00', productionDate: '2026-07-20', qualityReport: '合格' }
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
      items: [
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 6, unitPrice: '23.00', amount: '138.00', productionDate: '2026-07-24', qualityReport: '合格' },
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 1, unitPrice: '10.00', amount: '10.00', productionDate: '2026-07-24', qualityReport: '合格' }
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
      remark: '盘点盘盈，鸡蛋多出2斤',
      items: [
        { productCode: 'SP0300018', productName: '鸡蛋', unit: '斤', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 2, unitPrice: '22.00', amount: '44.00', productionDate: '2026-07-25', qualityReport: '合格' }
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
      items: [
        { productCode: 'SP0300029', productName: '鲫鱼', unit: '斤', conversionRate: 1, expectedQty: 20, damageQty: 0, actualQty: 0, unitPrice: '15.00', amount: '300.00', productionDate: '', qualityReport: '' }
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
      items: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', conversionRate: 1, expectedQty: 60, damageQty: 0, actualQty: 45, unitPrice: '5.00', amount: '225.00', productionDate: '2026-07-24', qualityReport: '不合格' },
        { productCode: 'SP0300039', productName: '土豆丝', unit: '斤', conversionRate: 1, expectedQty: 25, damageQty: 2, actualQty: 23, unitPrice: '1.00', amount: '23.00', productionDate: '2026-07-24', qualityReport: '合格' }
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
      items: [
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', conversionRate: 10, expectedQty: 0, damageQty: 0, actualQty: 11, unitPrice: '10.00', amount: '110.00', productionDate: '2026-07-20', qualityReport: '合格' }
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
      items: [
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', conversionRate: 1, expectedQty: 0, damageQty: 0, actualQty: 4, unitPrice: '23.00', amount: '92.00', productionDate: '2026-07-20', qualityReport: '合格' }
      ]
    }
  ];
})();
