(function () {
  const root = document.getElementById('supplierExportTemplateApp');
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
    ['1', '测试供应商', 'test_supplier', '默认', '18585858585', '--', '启用'],
    ['2', '七鲜', 'qixian_supplier', '刘小东', '13499998888', '2026-08-01 ~ 2030-09-30', '启用'],
    ['3', '南皮供应商02', 'nanpi_supplier02', '默认', '13888888888', '--', '启用'],
  ];

  root.innerHTML = `
    <main class="supplier-register-page supplier-export-template-page">
      <header class="supplier-register-header"><h1>供应商导出模版</h1></header>
      <section class="supplier-register-section supplier-export-template-section">
        <div class="supplier-register-section-inner supplier-export-template-inner">
          <div class="supplier-export-template-table-wrap">
            <table class="supplier-export-template-table">
              <thead><tr class="supplier-export-template-title-row"><th colspan="7">供应商档案-${esc(exportTime)}</th></tr><tr><th>序号</th><th>供应商名称</th><th>用户名</th><th>供应商联系人</th><th>联系电话</th><th>合作期限</th><th>状态</th></tr></thead>
              <tbody>${templateRows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      </section>
      <div class="supplier-export-template-actions"><a class="register-demo-button" href="./supplier-archive.html">返回供应商档案</a></div>
    </main>`;
})();
