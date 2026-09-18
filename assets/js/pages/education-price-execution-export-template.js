(function () {
  const root = document.getElementById('priceExecutionExportTemplateApp');
  if (!root) return;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const params = new URLSearchParams(window.location.search);
  const exportKey = params.get('exportKey') || '';
  const parsePayload = (raw) => {
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  };
  const storedExportPayload = (() => {
    if (!exportKey) return null;
    const readStorage = (storage) => {
      try { return storage?.getItem(exportKey) || ''; } catch { return ''; }
    };
    const raw = readStorage(window.sessionStorage) || readStorage(window.localStorage);
    return parsePayload(raw);
  })();
  const queryExportPayload = parsePayload(params.get('exportData'));
  const payloadCandidate = queryExportPayload || storedExportPayload;
  const hasExportPayload = payloadCandidate?.version === '20260918-3';
  const exportPayload = hasExportPayload ? payloadCandidate : {};
  const unitName = exportPayload.unit?.trim() || params.get('unit')?.trim() || '南皮县教育局';
  const requestedExecutionDate = exportPayload.executionDate || params.get('executionDate') || '';
  const selectedExecutionDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedExecutionDate)
    ? requestedExecutionDate
    : formatDate(new Date());
  const executionDate = selectedExecutionDate;
  const exportTime = formatDateTime(new Date());
  const normalizePrice = (value) => {
    const text = String(value ?? '').trim();
    return !text || text === '--' ? '' : value;
  };
  const executionRecordForDate = (row, date) => {
    if (!date) return null;
    const records = Array.isArray(row?.availableExecutionRecords)
      ? row.availableExecutionRecords
      : (Array.isArray(row?.executionRecords) ? row.executionRecords : []);
    return records.find((record) => {
      const dates = String(record.executionCycle || '').match(/\d{4}-\d{2}-\d{2}/g) || [];
      return dates.length >= 2 && date >= dates[0] && date <= dates[1];
    }) || null;
  };
  const fallbackRows = () => (window.PriceExecutionService?.getList?.('purchase') || []).map((row, index) => {
    const execution = executionRecordForDate(row, selectedExecutionDate);
    const currentExecution = row.currentExecution || null;
    const currentPrice = normalizePrice(row.currentPrice || currentExecution?.price);
    return {
      seq: index + 1,
      code: row.code,
      name: row.name,
      category: row.category,
      unit: row.unit,
      supplier: currentPrice ? String(currentExecution?.supplier || '').trim() : '',
      currentPrice,
      manualPrice: normalizePrice(row.manualPrice),
      bidPrice: normalizePrice(execution?.price || (selectedExecutionDate ? '' : row.bidPrice)),
      agreementPrice: normalizePrice(row.agreementPrice),
      recentPrice: normalizePrice(row.recentPrice),
      supplierQuote: normalizePrice(row.supplierQuote),
      marketPrice: ''
    };
  });
  const columns = [
    { key: 'code', label: '商品编号' },
    { key: 'name', label: '商品名称' },
    { key: 'category', label: '分类' },
    { key: 'unit', label: '计量单位' },
    { key: 'supplier', label: '供应商' },
    { key: 'currentPrice', label: '当前执行价格' },
    { key: 'bidPrice', label: '中标价' }
  ];
  const rows = hasExportPayload && Array.isArray(exportPayload.rows)
    ? exportPayload.rows
    : fallbackRows();
  const renderCellValue = (row, column) => row[column.key];

  root.innerHTML = `
    <main class="supplier-register-page education-price-execution-export-template-page">
      <section class="supplier-register-section education-price-execution-export-template-section">
        <div class="supplier-register-section-inner education-price-execution-export-template-inner">
          <div class="education-price-execution-export-template-table-wrap">
            <table class="education-price-execution-export-template-table">
              <thead>
                <tr class="education-price-execution-export-template-title-row"><th colspan="8">价格执行清单</th></tr>
                <tr class="education-price-execution-export-template-meta-row"><th colspan="8"><div class="education-price-execution-export-template-meta"><span>单位：${esc(unitName)}</span><span>执行日期：${esc(executionDate)}</span><span>导出时间：${esc(exportTime)}</span></div></th></tr>
                <tr><th>序号</th>${columns.map((column) => `<th>${esc(column.label)}</th>`).join('')}</tr>
              </thead>
              <tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td>${columns.map((column) => `<td>${esc(renderCellValue(row, column))}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      </section>
      <div class="education-price-execution-export-template-actions"><a class="register-demo-button" href="./education-price-execution-list.html">返回价格执行清单</a></div>
    </main>`;
})();
