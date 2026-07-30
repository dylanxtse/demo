(function () {
  window.MockOutboundOrders = [
    {
      id: 'CKD202607280300001',
      outboundTime: '2026-07-28 16:45:20',
      outboundType: '销售出库',
      outboundAmt: '460.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '静安第1中学',
      relNo: 'DD202607280300001',
      status: '已完成',
      creator: '杨',
      remark: '学校食堂日常配送',
      items: [
        { productCode: 'SP0300020', productName: '西红柿', unit: 'KG', conversionRate: 1, currentStock: 120, outboundQty: 15, unitPrice: '20.00', amount: '300.00', remark: '' },
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', conversionRate: 1, currentStock: 80, outboundQty: 7, unitPrice: '23.00', amount: '161.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607280300002',
      outboundTime: '2026-07-28 14:20:10',
      outboundType: '销售出库',
      outboundAmt: '380.00',
      warehouseName: '公司市区仓库',
      supplierPurchaserCustomerName: '静安第2中学',
      relNo: 'DD202607280300002',
      status: '待出库',
      creator: '杨',
      remark: '待仓库备货出库',
      items: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', conversionRate: 1, currentStock: 200, outboundQty: 20, unitPrice: '19.00', amount: '380.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607270300003',
      outboundTime: '2026-07-27 10:15:30',
      outboundType: '销售出库',
      outboundAmt: '250.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '静安第11中学',
      relNo: 'DD202607270300003',
      status: '已完成',
      creator: '杨',
      remark: '食堂配送已完成',
      items: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', conversionRate: 1, currentStock: 50, outboundQty: 50, unitPrice: '5.00', amount: '250.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607270300004',
      outboundTime: '2026-07-27 15:33:42',
      outboundType: '采购退货出库',
      outboundAmt: '180.00',
      warehouseName: '公司市区仓库',
      supplierPurchaserCustomerName: '北方粮油批发部',
      relNo: 'CGD202607250300006',
      status: '待审核',
      creator: '杨',
      remark: '大米质量问题，退货待审核',
      items: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', conversionRate: 1, currentStock: 180, outboundQty: 9, unitPrice: '19.00', amount: '171.00', remark: '临期退回' }
      ]
    },
    {
      id: 'CKD202607260300005',
      outboundTime: '2026-07-26 09:50:18',
      outboundType: '销售出库',
      outboundAmt: '330.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '静安第1中学',
      relNo: 'DD202607260300005',
      status: '已完成',
      creator: '杨',
      remark: '每日生鲜配送',
      items: [
        { productCode: 'SP0300018', productName: '鸡蛋', unit: '斤', conversionRate: 1, currentStock: 50, outboundQty: 15, unitPrice: '22.00', amount: '330.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607260300006',
      outboundTime: '2026-07-26 11:40:05',
      outboundType: '联营采购出库',
      outboundAmt: '300.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '联营水产合作社',
      relNo: 'CGD202607260300010',
      status: '已完成',
      creator: '杨',
      remark: '联营出库给合作方',
      items: [
        { productCode: 'SP0300029', productName: '鲫鱼', unit: '斤', conversionRate: 1, currentStock: 30, outboundQty: 20, unitPrice: '15.00', amount: '300.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607250300007',
      outboundTime: '2026-07-25 14:05:50',
      outboundType: '销售出库',
      outboundAmt: '200.00',
      warehouseName: '东南区域仓库',
      supplierPurchaserCustomerName: '静安第2中学',
      relNo: 'DD202607250300007',
      status: '已驳回',
      creator: '杨',
      remark: '客户取消订单，出库已驳回',
      items: [
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', conversionRate: 1, currentStock: 60, outboundQty: 20, unitPrice: '10.00', amount: '200.00', remark: '客户取消' }
      ]
    },
    {
      id: 'CKD202607240300008',
      outboundTime: '2026-07-24 16:18:22',
      outboundType: '报损出库',
      outboundAmt: '66.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '--',
      relNo: '--',
      status: '已完成',
      creator: '杨',
      remark: '鸡蛋破损3斤，报损处理',
      items: [
        { productCode: 'SP0300018', productName: '鸡蛋', unit: '斤', conversionRate: 1, currentStock: 45, outboundQty: 3, unitPrice: '22.00', amount: '66.00', remark: '运输破损' }
      ]
    },
    {
      id: 'CKD202607230300009',
      outboundTime: '2026-07-23 10:30:15',
      outboundType: '销售出库',
      outboundAmt: '420.00',
      warehouseName: '公司市区仓库',
      supplierPurchaserCustomerName: '静安第11中学',
      relNo: 'DD202607230300009',
      status: '已完成',
      creator: '杨',
      remark: '日常配送',
      items: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', conversionRate: 1, currentStock: 190, outboundQty: 10, unitPrice: '19.00', amount: '190.00', remark: '' },
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', conversionRate: 1, currentStock: 80, outboundQty: 23, unitPrice: '10.00', amount: '230.00', remark: '' }
      ]
    },
    {
      id: 'CKD202607150300010',
      outboundTime: '2026-07-15 09:20:40',
      outboundType: '单位转换出库',
      outboundAmt: '100.00',
      warehouseName: '东南区域仓库',
      supplierPurchaserCustomerName: '--',
      relNo: '--',
      status: '已完成',
      creator: '杨',
      remark: '箱转瓶单位转换出库',
      items: [
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', conversionRate: 10, currentStock: 100, outboundQty: 10, unitPrice: '10.00', amount: '100.00', remark: '转换出库' }
      ]
    },
    {
      id: 'CKD202607100300011',
      outboundTime: '2026-07-10 13:55:28',
      outboundType: '联营采购退货出库',
      outboundAmt: '150.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '联营水产合作社',
      relNo: 'CGD202607080300015',
      status: '已关闭',
      creator: '杨',
      remark: '联营退货超期，已关闭处理',
      items: [
        { productCode: 'SP0300029', productName: '鲫鱼', unit: '斤', conversionRate: 1, currentStock: 25, outboundQty: 10, unitPrice: '15.00', amount: '150.00', remark: '联营退回' }
      ]
    },
    {
      id: 'CKD202607010300012',
      outboundTime: '2026-07-01 15:40:12',
      outboundType: '其他出库',
      outboundAmt: '23.00',
      warehouseName: '生鲜仓库',
      supplierPurchaserCustomerName: '--',
      relNo: '--',
      status: '已完成',
      creator: '杨',
      remark: '员工食堂领用',
      items: [
        { productCode: 'SP0300039', productName: '土豆丝', unit: '斤', conversionRate: 1, currentStock: 40, outboundQty: 23, unitPrice: '1.00', amount: '23.00', remark: '内部领用' }
      ]
    }
  ];
})();
