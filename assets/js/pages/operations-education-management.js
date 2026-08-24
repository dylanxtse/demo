(function () {
  const service = window.OperationsPlatformService;
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const regionOptions = {
    province: ['河北省'],
    city: ['沧州市'],
    district: ['孟村回族自治县', '石油分局', '海兴县', '东光县', '南大港', '南皮县', '沧县', '献县', '中捷产业园', '黄骅市', '市直属', '港城', '任丘', '盐山', '河间', '肃宁', '吴桥', '青县', '泊头市']
  };

  function renderRegionSelect(key, value = '') {
    const label = key === 'province' ? '省份' : key === 'city' ? '城市' : '区县';
    return `<select class="operations-admin-select" data-filter="${key}" aria-label="${label}">
      <option value="">请选择</option>
      ${regionOptions[key].map((option) => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
    </select>`;
  }

  function statusTag(status) {
    return `<span class="operations-admin-status ${status === '启用' ? 'is-enabled' : 'is-disabled'}">${escapeHtml(status)}</span>`;
  }

  function renderRows(page, state) {
    const body = page.querySelector('#operationsEducationBody');
    if (!body) return;
    const pager = state.pager?.getState() || { page: 1, pageSize: 20 };
    const start = (pager.page - 1) * pager.pageSize;
    const rows = state.filtered.slice(start, start + pager.pageSize);
    body.innerHTML = rows.length
      ? rows.map((row, index) => `<tr>
          <td><button type="button" class="operations-admin-link" data-action="edit" data-id="${escapeHtml(row.id)}">${escapeHtml(row.name)}</button></td>
          <td><div class="operations-region-tags"><span>${escapeHtml(row.province)}</span><span>${escapeHtml(row.city)}</span><span>${escapeHtml(row.district)}</span></div></td>
          <td>${escapeHtml(row.username)}</td>
          <td>${escapeHtml(row.contactName)}<button type="button" class="operations-admin-phone" data-action="phone" data-phone="${escapeHtml(row.phone)}">(${escapeHtml(row.phone)})</button></td>
          <td>${statusTag(row.status)}</td>
          <td><div class="operations-admin-actions operation-actions">
            <button type="button" class="operations-admin-action" data-action="reset-password" data-id="${escapeHtml(row.id)}">重置密码</button>
            <button type="button" class="operations-admin-action" data-action="edit" data-id="${escapeHtml(row.id)}">编辑</button>
            <button type="button" class="operations-admin-action" data-action="toggle" data-id="${escapeHtml(row.id)}">${row.status === '启用' ? '禁用' : '启用'}</button>
            <button type="button" class="operations-admin-action is-danger" data-action="delete" data-id="${escapeHtml(row.id)}">删除</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td class="operations-admin-empty" colspan="6">暂无符合条件的数据</td></tr>';
  }

  function showToast(message, type = '') {
    document.querySelector('.operations-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `operations-toast ${type}`.trim();
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  function openEditor(page, row, onSave) {
    const isEdit = Boolean(row);
    const value = row || { name: '', province: '河北省', city: '沧州市', district: '', username: '', contactName: '默认', phone: '', status: '启用' };
    const overlay = document.createElement('div');
    overlay.className = 'operations-admin-modal-backdrop';
    overlay.innerHTML = `<section class="operations-admin-modal" role="dialog" aria-modal="true" aria-label="${isEdit ? '编辑教育局' : '添加教育局'}">
      <header class="operations-admin-modal-header"><h3>${isEdit ? '编辑教育局' : '添加教育局'}</h3><button type="button" data-modal-close aria-label="关闭">×</button></header>
      <form class="operations-admin-modal-form">
        <label>教育局名称<span>*</span><input name="name" value="${escapeHtml(value.name)}" placeholder="请输入教育局名称" required></label>
        <label>行政区域<span>*</span><div class="operations-admin-modal-region">${renderRegionSelect('province', value.province)}${renderRegionSelect('city', value.city)}${renderRegionSelect('district', value.district)}</div></label>
        <label>用户名<span>*</span><input name="username" value="${escapeHtml(value.username)}" placeholder="请输入用户名" required></label>
        <label>监管联系人<input name="contactName" value="${escapeHtml(value.contactName)}" placeholder="请输入联系人"></label>
        <label>联系电话<input name="phone" value="${escapeHtml(value.phone)}" placeholder="请输入联系电话"></label>
        <footer><button type="button" class="btn" data-modal-close>取消</button><button type="submit" class="btn btn-primary">确定</button></footer>
      </form>
    </section>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-modal-close]')) close();
    });
    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.username || !data.province || !data.city || !data.district) {
        showToast('请完整填写必填项', 'error');
        return;
      }
      onSave({ ...value, ...data });
      close();
    });
  }

  function render() {
    const content = `<section class="page-card operations-admin-page" id="operationsEducationPage" aria-label="教育局管理">
      <form class="operations-admin-filters" id="operationsEducationFilters">
        <div class="operations-admin-region-filter"><label>行政区域</label><div class="operations-admin-region-controls">${renderRegionSelect('province', '河北省')}${renderRegionSelect('city', '沧州市')}${renderRegionSelect('district')}</div></div>
        <label class="operations-admin-keyword">教育局名称<input data-filter="keyword" type="text" placeholder="请输入"></label>
        <div class="operations-admin-filter-actions"><button type="submit" class="btn btn-primary btn-sm">查 询</button><button type="button" class="btn btn-sm" data-action="reset">重 置</button></div>
      </form>
      <div class="operations-admin-toolbar"><button type="button" class="btn btn-primary btn-sm" data-action="add">添加教育局</button></div>
      <div class="operations-admin-table-wrap"><table class="operations-admin-table"><colgroup><col class="col-name"><col class="col-region"><col class="col-user"><col class="col-contact"><col class="col-status"><col class="col-actions"></colgroup><thead><tr><th>教育局名称</th><th>行政区域</th><th>用户名</th><th>监管联系人</th><th>启用状态</th><th>操作</th></tr></thead><tbody id="operationsEducationBody"></tbody></table></div>
      <div class="pagination operations-admin-pagination" id="operationsEducationPagination"></div>
    </section>`;
    const root = window.AppShell.mount({ title: '教育局管理', content, variant: 'operations', emptyText: '教育局管理' });
    const page = root.querySelector('#operationsEducationPage');
    const state = { rows: service.getRows(), filtered: [], pager: null };

    const readFilters = () => Object.fromEntries([...page.querySelectorAll('[data-filter]')].map((field) => [field.dataset.filter, field.value]));
    const applyFilters = (resetPage = true) => {
      state.filtered = service.filterRows(state.rows, readFilters());
      state.pager?.update({ total: state.filtered.length, ...(resetPage ? { page: 1 } : {}) });
      renderRows(page, state);
    };

    state.filtered = service.filterRows(state.rows, readFilters());
    state.pager = window.Pagination.create({
      container: '#operationsEducationPagination',
      total: state.filtered.length,
      page: 1,
      pageSize: 20,
      pageSizeOptions: [20, 50, 100],
      onChange: () => renderRows(page, state)
    });
    renderRows(page, state);

    page.querySelector('#operationsEducationFilters').addEventListener('submit', (event) => {
      event.preventDefault();
      applyFilters(true);
    });
    page.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'reset') {
        page.querySelectorAll('[data-filter]').forEach((field) => { field.value = field.dataset.filter === 'province' ? '河北省' : field.dataset.filter === 'city' ? '沧州市' : ''; });
        applyFilters(true);
        return;
      }
      if (action === 'add') {
        openEditor(page, null, (data) => {
          const nextNumber = state.rows.length + 1;
          state.rows.unshift({ id: `EDU-${String(nextNumber).padStart(3, '0')}`, status: '启用', ...data });
          applyFilters(true);
          showToast('教育局已添加');
        });
        return;
      }
      if (action === 'phone') {
        showToast(`监管联系人电话：${event.target.dataset.phone}`);
        return;
      }
      const id = event.target.closest('[data-id]')?.dataset.id;
      const row = state.rows.find((item) => item.id === id);
      if (!row) return;
      if (action === 'edit') {
        openEditor(page, row, (data) => { Object.assign(row, data); applyFilters(false); showToast('教育局信息已更新'); });
      } else if (action === 'toggle') {
        row.status = row.status === '启用' ? '禁用' : '启用';
        renderRows(page, state);
        showToast(`已${row.status === '启用' ? '启用' : '禁用'}教育局`);
      } else if (action === 'delete') {
        state.rows = state.rows.filter((item) => item.id !== row.id);
        applyFilters(true);
        showToast('教育局已删除');
      } else if (action === 'reset-password') {
        showToast('密码已重置');
      }
    });
  }

  render();
})();
