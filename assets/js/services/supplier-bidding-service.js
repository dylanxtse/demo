(function () {
  const rows = [
    { id: 'JJ01000019', bidNo: 'JJ01000019', customer: '交发集团', name: '演示数据2（勿动）', segment: '演示标段', supplyStart: '2026-08-11', supplyEnd: '2026-08-13', varietyCount: 2, quoteStart: '2026-08-11 01:41:00', quoteEnd: '2026-08-11 01:43:00', bidStatus: '已开标', quoteStatus: '未中标', canQuote: false },
    { id: 'JJ01000009', bidNo: 'JJ01000009', customer: '交发集团', name: '姜测试003', segment: '姜标段2', supplyStart: '2026-08-10', supplyEnd: '2026-08-14', varietyCount: 2, quoteStart: '2026-08-10 20:14:00', quoteEnd: '2026-08-10 20:15:00', bidStatus: '已开标', quoteStatus: '已中标', canQuote: false },
    { id: 'JJ000008', bidNo: 'JJ000008', customer: '交发集团', name: 'ysy测试02', segment: '测试标段', supplyStart: '2026-08-11', supplyEnd: '2026-08-11', varietyCount: 3, quoteStart: '2026-08-10 19:22:00', quoteEnd: '2026-08-10 19:25:00', bidStatus: '已开标', quoteStatus: '未中标', canQuote: false },
    { id: 'JJ000007', bidNo: 'JJ000007', customer: '交发集团', name: '测试01', segment: '测试标段', supplyStart: '2026-08-10', supplyEnd: '2026-08-10', varietyCount: '', quoteStart: '2026-08-10 17:30:00', quoteEnd: '2026-08-10 17:40:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ000006', bidNo: 'JJ000006', customer: '交发集团', name: '姜竞价01（勿动）', segment: '姜标段1', supplyStart: '2026-08-10', supplyEnd: '2026-08-12', varietyCount: '', quoteStart: '2026-08-10 18:12:00', quoteEnd: '2026-08-10 18:26:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ01000003', bidNo: 'JJ01000003', customer: '交发集团', name: '1111', segment: '标段一', supplyStart: '2026-08-11', supplyEnd: '2026-08-31', varietyCount: '', quoteStart: '2026-08-10 13:21:00', quoteEnd: '2026-08-10 13:34:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false },
    { id: 'JJ01000002', bidNo: 'JJ01000002', customer: '交发集团', name: '9月竞价', segment: '测试标段', supplyStart: '2026-08-12', supplyEnd: '2026-08-31', varietyCount: '', quoteStart: '2026-08-10 13:01:00', quoteEnd: '2026-08-10 13:10:00', bidStatus: '待开标', quoteStatus: '未报价', canQuote: false }
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  window.SupplierBiddingService = {
    getRows() {
      return clone(rows);
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
