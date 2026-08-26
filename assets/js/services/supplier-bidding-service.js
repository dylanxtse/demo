(function () {
  const fallbackRows = [
    { id: 'JJ01000019', bidNo: 'JJ01000019', customer: '教育局', name: '演示数据2（勿动）', segment: '演示标段', segmentId: 'SEG-001', supplyStart: '2026-08-11', supplyEnd: '2026-08-13', varietyCount: 2, quoteStart: '2026-08-11 01:41:00', quoteEnd: '2026-08-11 01:43:00', bidStatus: '已开标', quoteStatus: '未中标', canQuote: false },
    { id: 'JJ01000009', bidNo: 'JJ01000009', customer: '教育局', name: '姜测试003', segment: '姜标段2', segmentId: 'SEG-003', supplyStart: '2026-08-10', supplyEnd: '2026-08-14', varietyCount: 2, quoteStart: '2026-08-10 20:14:00', quoteEnd: '2026-08-10 20:15:00', bidStatus: '已开标', quoteStatus: '已中标', canQuote: false },
    { id: 'JJ000008', bidNo: 'JJ000008', customer: '教育局', name: 'ysy测试02', segment: '测试标段', segmentId: 'SEG-006', supplyStart: '2026-08-11', supplyEnd: '2026-08-11', varietyCount: 3, quoteStart: '2026-08-10 19:22:00', quoteEnd: '2026-08-10 19:25:00', bidStatus: '已开标', quoteStatus: '未中标', canQuote: false },
    { id: 'JJ000007', bidNo: 'JJ000007', customer: '教育局', name: '测试01', segment: '测试标段', segmentId: 'SEG-006', supplyStart: '2026-08-10', supplyEnd: '2026-08-10', varietyCount: '', quoteStart: '2026-08-10 17:30:00', quoteEnd: '2026-08-10 17:40:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ000006', bidNo: 'JJ000006', customer: '教育局', name: '姜竞价01（勿动）', segment: '姜标段1', segmentId: 'SEG-004', supplyStart: '2026-08-10', supplyEnd: '2026-08-12', varietyCount: '', quoteStart: '2026-08-10 18:12:00', quoteEnd: '2026-08-10 18:26:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ01000003', bidNo: 'JJ01000003', customer: '教育局', name: '1111', segment: '标段一', segmentId: 'SEG-005', supplyStart: '2026-08-11', supplyEnd: '2026-08-31', varietyCount: '', quoteStart: '2026-08-10 13:21:00', quoteEnd: '2026-08-10 13:34:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ01000002', bidNo: 'JJ01000002', customer: '教育局', name: '9月竞价', segment: '测试标段', segmentId: 'SEG-006', supplyStart: '2026-08-12', supplyEnd: '2026-08-31', varietyCount: '', quoteStart: '2026-08-10 13:01:00', quoteEnd: '2026-08-10 13:10:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false }
  ];
  const quoteStorageKey = 'procurement-supplier-quotes-v1';
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function currentSupplier() {
    const body = document.body?.dataset || {};
    const session = window.DemoStore?.getSession?.() || {};
    return {
      id: body.supplierId || session.supplierId || 'SUP-004',
      name: body.supplierName || session.supplierName || '南皮供应商01'
    };
  }

  function readQuotes() {
    try { return JSON.parse(window.localStorage.getItem(quoteStorageKey) || '{}') || {}; } catch (error) { return {}; }
  }

  function writeQuotes(value) {
    try { window.localStorage.setItem(quoteStorageKey, JSON.stringify(value)); } catch (error) { /* file:// 页面可能禁用 localStorage */ }
  }

  function categoryMatches(productCategory, segmentCategory) {
    const product = String(productCategory || '').trim().replace(/\s+/g, '');
    const segment = String(segmentCategory || '').trim().replace(/\s+/g, '');
    if (!product || !segment) return false;
    if (product === segment || product.startsWith(`${segment}-`) || segment.startsWith(`${product}-`)) return true;
    return !product.includes('-') && product === segment.split('-')[0];
  }

  function getState() {
    return window.BiddingService?.getState?.() || null;
  }

  function getSupplier(state = getState()) {
    const supplier = currentSupplier();
    return state?.suppliers?.find((item) => item.id === supplier.id) || supplier;
  }

  function getAllowedSegments(state = getState()) {
    const supplier = getSupplier(state);
    return (state?.segments || []).filter((segment) => (
      segment.status === '启用' && Array.isArray(supplier.segmentIds) && supplier.segmentIds.includes(segment.id)
    ));
  }

  function getProductsForSegment(segmentId, state = getState()) {
    const segment = (state?.segments || []).find((item) => item.id === segmentId);
    if (!segment) return [];
    return (state.products || []).filter((product) => (
      (segment.categories || []).some((category) => categoryMatches(product.category, category))
    ));
  }

  function getRows() {
    const state = getState();
    if (!state) return clone(fallbackRows);
    const supplier = getSupplier(state);
    const allowedSegmentIds = new Set(getAllowedSegments(state).map((segment) => segment.id));
    const quotes = readQuotes();
    return (state.bids || [])
      .filter((bid) => allowedSegmentIds.has(bid.segmentId))
      .filter((bid) => !Array.isArray(bid.supplierIds) || !bid.supplierIds.length || bid.supplierIds.includes(supplier.id))
      .map((bid) => {
        const products = getProductsForSegment(bid.segmentId, state);
        const quoteKey = `${supplier.id}:${bid.id}`;
        const hasQuote = Array.isArray(quotes[quoteKey]) && quotes[quoteKey].length > 0;
        return {
          id: bid.id,
          bidNo: bid.bidNo,
          customer: bid.customer || '教育局',
          name: bid.name,
          segment: bid.segmentName || (state.segments || []).find((item) => item.id === bid.segmentId)?.name || '--',
          segmentId: bid.segmentId,
          categories: bid.categories || [],
          supplyStart: bid.supplyStart,
          supplyEnd: bid.supplyEnd,
          varietyCount: products.length || bid.varietyCount || 0,
          quoteStart: bid.quoteStart,
          quoteEnd: bid.quoteEnd,
          bidStatus: bid.status,
          quoteStatus: hasQuote ? '已报价' : (bid.status === '已开标' ? '未中标' : '未报价'),
          canQuote: ['待开标', '需求提报中'].includes(bid.status) && products.length > 0
        };
      });
  }

  window.SupplierBiddingService = {
    getCurrentSupplier() {
      return clone(getSupplier());
    },
    getRows,
    getQuoteProducts(rowId) {
      const state = getState();
      const row = getRows().find((item) => item.id === rowId);
      if (!state || !row) return [];
      const supplier = getSupplier(state);
      const quotes = readQuotes()[`${supplier.id}:${rowId}`] || [];
      const quoteMap = new Map(quotes.map((item) => [item.productId, item.price]));
      return getProductsForSegment(row.segmentId, state).map((product) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        category: product.category,
        unit: product.unit,
        brand: product.brand,
        spec: product.spec,
        indicator: product.indicator || '',
        image: product.image || '',
        type: product.type || '',
        price: quoteMap.get(product.id) || ''
      }));
    },
    getBidDetail(rowId) {
      const state = getState();
      const row = getRows().find((item) => item.id === rowId);
      if (!row) return null;
      const bid = state?.bids?.find((item) => item.id === rowId);
      return clone({
        ...row,
        projectNo: bid?.projectNo || '',
        demandDeadline: bid?.demandDeadline || '',
        openTime: bid?.openTime || '',
        openPlace: bid?.openPlace || '',
        school: bid?.school || '',
        schoolContact: bid?.schoolContact || '',
        encryption: Boolean(bid?.encryption),
        winnerSupplier: bid?.winnerSupplier || '--'
      });
    },
    saveQuotes(rowId, entries) {
      const row = getRows().find((item) => item.id === rowId);
      if (!row || !row.canQuote) throw new Error('当前竞价不在报价时间或不属于供应商可供货标段');
      const allowed = new Map(this.getQuoteProducts(rowId).map((item) => [item.id, item]));
      const normalized = entries.map((entry) => {
        const product = allowed.get(entry.productId);
        const price = Number(entry.price);
        if (!product || !Number.isFinite(price) || price <= 0) throw new Error('请填写全部商品的有效报价');
        return { productId: product.id, productCode: product.code, price: price.toFixed(2) };
      });
      if (!normalized.length || normalized.length !== allowed.size) throw new Error('只能对所选标段包含的全部商品报价');
      const supplier = getSupplier();
      const quotes = readQuotes();
      quotes[`${supplier.id}:${rowId}`] = normalized;
      writeQuotes(quotes);
      return clone(normalized);
    },
    filterRows(source, filters) {
      const keyword = String(filters.keyword || '').trim().toLowerCase();
      const start = String(filters.start || '');
      const end = String(filters.end || '');
      return source.filter((row) => {
        const textMatch = !keyword || `${row.bidNo} ${row.name}`.toLowerCase().includes(keyword);
        const segmentMatch = !filters.segment || row.segment === filters.segment;
        const bidStatusMatch = !filters.bidStatus || row.bidStatus === filters.bidStatus;
        const quoteStatusMatch = !filters.quoteStatus || row.quoteStatus === filters.quoteStatus;
        const startMatch = !start || row.supplyEnd >= start;
        const endMatch = !end || row.supplyStart <= end;
        return textMatch && segmentMatch && bidStatusMatch && quoteStatusMatch && startMatch && endMatch;
      });
    }
  };
})();
