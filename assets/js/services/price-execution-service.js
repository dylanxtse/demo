(function () {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadProductCatalog() {
    let products = [];
    if (typeof window.ProductService?.getList === 'function') products = window.ProductService.getList();
    else if (typeof window.DemoStore?.get === 'function') products = window.DemoStore.get('products');
    else if (Array.isArray(window.MockProducts)) products = window.MockProducts;

    return (Array.isArray(products) ? products : [])
      .filter((product) => product && (product.code || product.productCode || product.productId || product.id))
      .map((product, index) => ({
        seq: product.seq ?? index + 1,
        code: product.code || product.productCode || product.productId || product.id,
        name: product.name || product.productName || product.goodsName || '--',
        unit: product.unit || '--',
        brand: product.brand || '--',
        spec: product.spec || '--',
        category: product.category || '--',
        marketPrice: product.marketPrice || '',
        purchaseType: product.purchaseType || '供应商送货'
      }));
  }

  const demoSuppliers = ['绿源供应商', '粮油供应商', '乳业供应商', '南皮供应商01', '南皮供应商02', '平台默认供应商'];
  const executionCycleTemplates = [
    { start: '2026-09-15', end: '2026-09-21' },
    { start: '2026-10-12', end: '2026-10-18' },
    { start: '2026-11-09', end: '2026-11-15' },
    { start: '2026-12-07', end: '2026-12-13' },
    { start: '2027-01-11', end: '2027-01-17' },
    { start: '2027-02-08', end: '2027-02-14' },
    { start: '2027-03-08', end: '2027-03-14' }
  ];
  const futureCycleSets = [
    [1, 4],
    [2, 5],
    [3, 6],
    [1, 3, 6],
    [2, 4, 6],
    [1, 2, 4, 5]
  ];

  function money(value) {
    return Number(value).toFixed(4);
  }

  function buildExecutionDemo(product, index) {
    const catalogPrice = Number(product.marketPrice);
    const basePrice = Number.isFinite(catalogPrice) && catalogPrice > 0
      ? catalogPrice
      : 3 + (index % 7) * 1.25;
    const bidPrice = money(Math.max(0.01, basePrice * (0.9 + (index % 4) * 0.015)));
    const supplier = demoSuppliers[index % demoSuppliers.length];
    const bidNumber = Number(bidPrice);
    const currentCycleIndex = 0;
    const cycleIndexes = [currentCycleIndex, ...futureCycleSets[index % futureCycleSets.length]].sort((a, b) => a - b);
    const executionRecords = cycleIndexes.map((cycleIndex) => {
      const cycle = executionCycleTemplates[cycleIndex];
      const futureFactor = 1.02 + ((cycleIndex * 2 + index) % 5) * 0.015;
      return {
        executionCycle: `${cycle.start} 至 ${cycle.end}`,
        price: cycleIndex === currentCycleIndex ? bidPrice : money(bidNumber * futureFactor),
        supplier
      };
    });
    const currentPriceAvailable = index % 5 !== 0;
    const currentExecution = currentPriceAvailable ? executionRecords[0] : null;
    const availableExecutionRecords = currentPriceAvailable ? executionRecords : executionRecords.slice(1);
    return {
      supplier,
      currentPrice: currentPriceAvailable ? bidPrice : '',
      currentSource: currentPriceAvailable ? '中标价' : '',
      marketPrice: product.marketPrice || '',
      bidPrice: currentPriceAvailable ? bidPrice : '',
      executionRecords: availableExecutionRecords,
      currentExecution,
      futureExecutionRecords: executionRecords.slice(1),
      availableExecutionRecords
    };
  }

  function blankPriceFields() {
    return {
      supplier: '--',
      currentPrice: '',
      currentSource: '',
      manualPrice: '',
      agreementPrice: '',
      recentPrice: '',
      supplierQuote: '',
      marketPrice: '',
      bidPrice: '',
      executionRecords: [],
      currentExecution: null,
      futureExecutionRecords: [],
      availableExecutionRecords: []
    };
  }

  function buildRows(products, type) {
    return products.map((product) => ({
      id: `${type === 'sales' ? 'SAL' : 'PUR'}-${product.code}`,
      ...product,
      ...blankPriceFields(),
      ...buildExecutionDemo(product, product.seq - 1),
      ...(type === 'sales'
        ? { customerType: '', customerName: '--', district: '' }
        : {})
    }));
  }

  const productCatalog = loadProductCatalog();
  const purchaseRows = buildRows(productCatalog, 'purchase');
  const salesRows = buildRows(productCatalog, 'sales');
  const totals = { purchase: purchaseRows.length, sales: salesRows.length };

  window.PriceExecutionService = {
    getList(type = 'purchase') {
      return (type === 'sales' ? salesRows : purchaseRows).map((row) => clone(row));
    },
    getTotal(type = 'purchase') {
      return totals[type === 'sales' ? 'sales' : 'purchase'];
    }
  };
})();
