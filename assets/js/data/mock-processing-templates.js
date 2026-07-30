(function () {
  window.MockProcessingTemplates = [
    {
      id: 'MB001',
      name: '土豆切丝',
      description: '土豆清洗后切丝',
      materials: [
        { warehouse: '主仓库', productCode: 'SP0300036', productName: '大玉米棒子', unit: 'KG' }
      ],
      outputs: [
        { warehouse: '主仓库', productCode: 'SP0300039', productName: '土豆丝', unit: '斤', refCoefficient: 1.2 }
      ],
      createTime: '2026-07-20 10:00:00'
    },
    {
      id: 'MB002',
      name: '复合果蔬加工',
      description: '苹果原料复合加工',
      materials: [
        { warehouse: '分仓库A', productCode: 'SP0300014', productName: '苹果', unit: '斤' }
      ],
      outputs: [
        { warehouse: '分仓库A', productCode: 'SP0300039', productName: '土豆丝', unit: '斤', refCoefficient: 1.5 },
        { warehouse: '分仓库A', productCode: 'SP0300020', productName: '西红柿', unit: 'KG', refCoefficient: 0.9 }
      ],
      createTime: '2026-07-22 14:30:00'
    },
    {
      id: 'MB003',
      name: '鲫鱼加工',
      description: '鲫鱼清洗分拣',
      materials: [
        { warehouse: '分仓库B', productCode: 'SP0300029', productName: '鲫鱼', unit: '斤' }
      ],
      outputs: [
        { warehouse: '分仓库B', productCode: 'SP0300031', productName: '鲫鱼', unit: 'L', refCoefficient: 0.85 }
      ],
      createTime: '2026-07-25 09:15:00'
    },
    {
      id: 'MB004',
      name: '大米分装',
      description: '大包装大米分装成小份',
      materials: [
        { warehouse: '主仓库', productCode: 'SP0300025', productName: '大米', unit: 'KG' }
      ],
      outputs: [
        { warehouse: '主仓库', productCode: 'SP0300034', productName: '黑大米', unit: '斤', refCoefficient: 1.0 }
      ],
      createTime: '2026-07-26 16:00:00'
    }
  ];
})();
