(function () {
  const root = document.getElementById('warehouseExportTemplateApp');
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
  const exportTime = formatDateTime(new Date());
  const templateRows = [
    ['1', 'CK0163824', '中心仓', '上海市浦东新区集采路18号', '周仓管', '13800001001', '东城学校食材供应链有限公司、西城学校食材供应链有限公司', '2025-10-18 09:30:00'],
    ['2', 'CK0148176', '北区仓', '上海市宝山区配送路6号', '陈仓管', '13800001002', '西城学校食材供应链有限公司', '2025-11-06 14:22:00'],
    ['3', 'CK0193052', '临时仓', '上海市嘉定区临仓路9号', '李仓管', '13800001003', '东城学校食材供应链有限公司', '2026-06-12 11:03:00']
  ];

  root.innerHTML = `
    <main class="supplier-register-page warehouse-export-template-page">
      <header class="supplier-register-header"><h1>仓库导出模版</h1></header>
      <section class="supplier-register-section warehouse-export-template-section">
        <div class="supplier-register-section-inner warehouse-export-template-inner">
          <div class="warehouse-export-template-table-wrap">
            <table class="warehouse-export-template-table">
              <thead>
                <tr class="warehouse-export-template-title-row"><th colspan="8">仓库档案-${esc(exportTime)}</th></tr>
                <tr><th>序号</th><th>仓库编码</th><th>仓库名称</th><th>地址</th><th>负责人</th><th>联系电话</th><th>运营分公司</th><th>添加时间</th></tr>
              </thead>
              <tbody>${templateRows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      </section>
      <div class="warehouse-export-template-actions"><a class="register-demo-button" href="./warehouse-archive.html">返回仓库档案</a></div>
    </main>`;
})();
