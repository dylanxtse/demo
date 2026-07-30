(function () {
  window.MockProcessingOrders = [
    {
      id: 'JG20260728001',
      processingDate: '2026-07-28',
      warehouse: '主仓库',
      status: '已加工',
      operator: '管理员',
      remark: '日常净菜加工',
      costMode: 'auto',
      materials: [
        { productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG', stock: 120, avgPrice: 5.00, consumeQty: 50 }
      ],
      outputs: [
        { productCode: 'SP0300039', productName: '土豆丝', unit: '斤', refCoefficient: 1.2, refQty: 60, actualQty: 58, allocatedCost: '15.18', costPrice: '0.26' },
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', refCoefficient: 0.8, refQty: 40, actualQty: 39, allocatedCost: '234.82', costPrice: '6.02' }
      ],
      createTime: '2026-07-28 09:30:00'
    },
    {
      id: 'JG20260727002',
      processingDate: '2026-07-27',
      warehouse: '主仓库',
      status: '已加工',
      operator: '管理员',
      remark: '',
      costMode: 'manual',
      materials: [
        { productCode: 'SP0300025', productName: '大米', unit: 'KG', stock: 200, avgPrice: 19.00, consumeQty: 30 }
      ],
      outputs: [
        { productCode: 'SP0300024', productName: '三元牛奶', unit: '瓶', refCoefficient: 1.0, refQty: 30, actualQty: 30, costPrice: 19.00 }
      ],
      createTime: '2026-07-27 14:20:00'
    },
    {
      id: 'JG20260726003',
      processingDate: '2026-07-26',
      warehouse: '分仓库A',
      status: '草稿',
      operator: '管理员',
      remark: '待确认成品获得量',
      costMode: 'auto',
      materials: [
        { productCode: 'SP0300014', productName: '苹果', unit: '斤', stock: 80, avgPrice: 23.00, consumeQty: 20 }
      ],
      outputs: [
        { productCode: 'SP0300015', productName: '香蕉', unit: '斤', refCoefficient: 1.0, refQty: 20, actualQty: 20, costPrice: 23.00 }
      ],
      createTime: '2026-07-26 16:45:00'
    },
    {
      id: 'JG20260725004',
      processingDate: '2026-07-25',
      warehouse: '主仓库',
      status: '已作废',
      operator: '管理员',
      remark: '原料库存不足，作废重建',
      costMode: 'auto',
      materials: [
        { productCode: 'SP0300029', productName: '鲫鱼', unit: '斤', stock: 15, avgPrice: 15.00, consumeQty: 10 }
      ],
      outputs: [
        { productCode: 'SP0300031', productName: '鲫鱼', unit: 'L', refCoefficient: 1.0, refQty: 10, actualQty: 10, costPrice: 15.00 }
      ],
      createTime: '2026-07-25 10:00:00'
    },
    {
      id: 'JG20260724005',
      processingDate: '2026-07-24',
      warehouse: '主仓库',
      status: '已加工',
      operator: '管理员',
      remark: '',
      costMode: 'auto',
      materials: [
        { productCode: 'SP0300018', productName: '鸡蛋', unit: '斤', stock: 50, avgPrice: 22.00, consumeQty: 15 }
      ],
      outputs: [
        { productCode: 'SP0300039', productName: '土豆丝', unit: '斤', refCoefficient: 1.5, refQty: 22.5, actualQty: 22, allocatedCost: '25.74', costPrice: '1.17' },
        { productCode: 'SP0300020', productName: '西红柿', unit: 'KG', refCoefficient: 0.9, refQty: 13.5, actualQty: 13, allocatedCost: '304.26', costPrice: '23.40' }
      ],
      createTime: '2026-07-24 11:15:00'
    }
  ];
})();
