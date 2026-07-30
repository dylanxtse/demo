(function () {
  const service = window.OperationsService;
  const params = new URLSearchParams(window.location.search);
  const customerName = params.get('customer') || '';
  const canteen = params.get('canteen') || '';
  const expectedDate = params.get('date') || '';
  const selected = new Set();
  let items = [];

  const content = `
    <section class="page-card sorting-module-page sorting-customer-detail-page">
      <div class="sorting-detail-header">
        <button class="btn btn-sm" type="button" data-action="back">← 返回</button>
        <div><strong>客户名称：</strong><span id="detailCustomer"></span></div>
        <div><strong>食堂：</strong><span id="detailCanteen"></span></div>
        <div><strong>期望送达时间：</strong><span id="detailDate"></span></div>
      </div>
      <div class="operations-status-tabs" id="detailStatusTabs">
        <button class="operations-status-tab active" type="button" data-status="">全部</button>
        <button class="operations-status-tab" type="button" data-status="PENDING">未分拣</button>
        <button class="operations-status-tab" type="button" data-status="PARTIAL">部分分拣</button>
        <button class="operations-status-tab" type="button" data-status="SORTED">已分拣</button>
        <button class="operations-status-tab" type="button" data-status="SHORTAGE">缺货</button>
      </div>
      <div class="operations-toolbar">
        <div class="operations-toolbar-main">
          <button class="btn btn-primary btn-sm" type="button" data-action="batch-sort">一键分拣</button>
          <button class="btn btn-sm" type="button" data-action="batch-reset">一键重置分拣</button>
          <button class="btn btn-sm" type="button" data-action="batch-shortage">批量标记缺货</button>
        </div>
        <div class="operations-toolbar-side"><span class="operations-summary" id="detailSelection">已选择 0 条</span></div>
      </div>
      <div class="operations-table-container">
        <div class="operations-table-wrap">
          <table class="operations-table">
            <thead><tr><th><input id="detailSelectAll" type="checkbox" aria-label="选择全部"></th><th>序号</th><th>商品名称（计量单位/品牌/规格）</th><th>订单号</th><th>下单数量</th><th>实际数量</th><th>计量单位</th><th>库存</th><th>分拣状态</th><th>分拣员</th><th>分拣时间</th><th>操作</th></tr></thead>
            <tbody id="detailBody"></tbody>
          </table>
        </div>
        <div class="operations-pagination"><span id="detailTotal">共 0 条数据</span></div>
      </div>
      <div id="detailOverlay"></div>
    </section>`;

  const root = window.AppShell.mount({ title: '客户分拣', content });
  root.querySelector('#detailCustomer').textContent = customerName || '--';
  root.querySelector('#detailCanteen').textContent = canteen || '--';
  root.querySelector('#detailDate').textContent = expectedDate || '--';

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function statusText(status) {
    return { PENDING: '未分拣', PARTIAL: '部分分拣', SORTED: '已分拣', SHORTAGE: '缺货' }[status] || status || '--';
  }

  function toast(message, type = '') {
    root.querySelector('.operations-toast')?.remove();
    const element = document.createElement('div');
    element.className = `operations-toast ${type}`;
    element.textContent = message;
    root.appendChild(element);
    window.setTimeout(() => element.remove(), 2200);
  }

  function updateSelection() {
    root.querySelector('#detailSelection').textContent = `已选择 ${selected.size} 条`;
    const selectAll = root.querySelector('#detailSelectAll');
    selectAll.checked = items.length > 0 && items.every((item) => selected.has(item.id));
    selectAll.indeterminate = !selectAll.checked && items.some((item) => selected.has(item.id));
  }

  function render() {
    const body = root.querySelector('#detailBody');
    body.innerHTML = items.length ? items.map((item, index) => `
      <tr data-id="${escapeHtml(item.id)}">
        <td><input class="detail-row-select" type="checkbox" ${selected.has(item.id) ? 'checked' : ''} aria-label="选择数据"></td>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.goodsName)}</td>
        <td>${escapeHtml(item.orderNo)}</td>
        <td>${escapeHtml(item.orderQty)}</td>
        <td><input class="quantity-input detail-actual-qty" type="number" min="0" value="${escapeHtml(item.actualQty)}" aria-label="实际数量"></td>
        <td>${escapeHtml(item.unit)}</td>
        <td>${escapeHtml(item.stock)}</td>
        <td><span class="operation-status ${item.status === 'SORTED' ? 'success' : item.status === 'PARTIAL' ? 'warning' : 'danger'}">${statusText(item.status)}</span></td>
        <td>${escapeHtml(item.sorter || '--')}</td>
        <td>${escapeHtml(item.sortingAt || '--')}</td>
        <td><div class="cell-actions">
          ${item.status !== 'SORTED' && item.status !== 'SHORTAGE' ? '<button class="btn-text" data-row-action="sort">分拣</button><span class="divider">|</span><button class="btn-text" data-row-action="markShortage">标记缺货</button>' : '<button class="btn-text" data-row-action="resetSort">重置</button>'}
        </div></td>
      </tr>`).join('') : '<tr><td class="empty-cell" colspan="12">暂无数据</td></tr>';
    root.querySelector('#detailTotal').textContent = `共 ${items.length} 条数据`;
    updateSelection();
  }

  async function load(status = '') {
    const condition = { customerName };
    if (canteen) condition.canteen = canteen;
    if (expectedDate) condition.expectedAt = expectedDate;
    if (status) condition.status = status;
    const result = await service.list('sortingItems', { page: 1, pageSize: 100, condition });
    items = result.items;
    selected.clear();
    render();
  }

  function confirmAction(title, message, callback) {
    const overlay = root.querySelector('#detailOverlay');
    overlay.innerHTML = `<div class="operations-modal-backdrop"><section class="operations-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><header class="operations-modal-header"><h3>${escapeHtml(title)}</h3><button data-close>×</button></header><div class="operations-modal-body"><p class="sorting-confirm-text">${escapeHtml(message)}</p></div><footer class="operations-modal-footer"><button class="btn" data-close>取消</button><button class="btn btn-primary" data-confirm>确定</button></footer></section></div>`;
    overlay.querySelectorAll('[data-close]').forEach((button) => button.onclick = () => { overlay.innerHTML = ''; });
    overlay.querySelector('[data-confirm]').onclick = async () => {
      try {
        await callback();
        overlay.innerHTML = '';
        toast('操作成功');
        await load(root.querySelector('.operations-status-tab.active')?.dataset.status || '');
      } catch (error) {
        toast(error.message || '操作失败', 'error');
      }
    };
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back') window.location.href = './sorting-management.html';
    if (action?.startsWith('batch-')) {
      const ids = [...selected];
      const transition = { 'batch-sort': 'sort', 'batch-reset': 'resetSort', 'batch-shortage': 'markShortage' }[action];
      if (!ids.length) return toast('请选择要操作的数据', 'error');
      confirmAction('批量操作', '确定对选中商品执行该操作吗？', () => service.batch('sortingItems', ids, transition));
    }
    const statusButton = event.target.closest('[data-status]');
    if (statusButton) {
      root.querySelectorAll('[data-status]').forEach((button) => button.classList.toggle('active', button === statusButton));
      load(statusButton.dataset.status);
    }
    const rowButton = event.target.closest('[data-row-action]');
    if (rowButton) {
      const id = rowButton.closest('tr').dataset.id;
      confirmAction(rowButton.textContent.trim(), '确定执行该操作吗？', () => service.transition('sortingItems', id, rowButton.dataset.rowAction));
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.id === 'detailSelectAll') {
      items.forEach((item) => event.target.checked ? selected.add(item.id) : selected.delete(item.id));
      render();
    }
    if (event.target.classList.contains('detail-row-select')) {
      const id = event.target.closest('tr').dataset.id;
      event.target.checked ? selected.add(id) : selected.delete(id);
      updateSelection();
    }
    if (event.target.classList.contains('detail-actual-qty')) {
      const id = event.target.closest('tr').dataset.id;
      const value = Number(event.target.value);
      if (!Number.isFinite(value) || value < 0) return toast('实际数量不能小于 0', 'error');
      service.update('sortingItems', id, { actualQty: value }).then(() => toast('实际数量已保存')).catch((error) => toast(error.message, 'error'));
    }
  });

  load().catch((error) => toast(error.message || '数据加载失败', 'error'));
})();
