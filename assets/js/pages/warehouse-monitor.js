(function () {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const state = {
    keyword: '',
    points: [],
    selectedId: '',
    warehouseId: '',
    editingId: '',
    confirmingId: ''
  };

  const content = `
    <section class="page-card warehouse-monitor-page" aria-label="仓库监控">
      <div class="warehouse-monitor-main">
        <aside class="warehouse-monitor-points" aria-label="视频点位列表">
          <div class="warehouse-monitor-points-header">
            <span class="warehouse-monitor-points-title">视频点位</span>
            <button id="addMonitorPointButton" class="btn btn-primary btn-sm" type="button">新增点位</button>
          </div>
          <div id="monitorWarehouseScope" class="warehouse-monitor-warehouse-scope"></div>
          <div class="warehouse-monitor-point-search">
            <input id="pointSearchInput" class="warehouse-monitor-point-search-input" type="search" placeholder="搜索点位">
          </div>
          <div id="monitorPointList" class="warehouse-monitor-point-list"></div>
        </aside>
        <section class="warehouse-monitor-view" aria-label="视频画面">
          <div class="warehouse-monitor-view-header">
            <div>
              <h1 id="monitorViewTitle" class="warehouse-monitor-view-title">请选择视频点位</h1>
              <p id="monitorViewDescription" class="warehouse-monitor-view-description"></p>
            </div>
            <div id="monitorViewActions" class="warehouse-monitor-view-actions"></div>
          </div>
          <div class="warehouse-monitor-video-shell">
            <div id="monitorVideoLoading" class="warehouse-monitor-video-loading" aria-live="polite">
              <span class="warehouse-monitor-video-loading-spinner" aria-hidden="true"></span>
              <span>正在加载视频画面</span>
            </div>
            <img id="monitorVideoSnapshot" class="warehouse-monitor-video-snapshot is-hidden" alt="仓储视频截图">
            <div id="monitorVideoPlaceholder" class="warehouse-monitor-video-placeholder">
              <strong>视频画面</strong>
              <span>选择左侧点位后加载视频</span>
              <button id="monitorVideoRetry" class="btn btn-sm warehouse-monitor-video-retry is-hidden" type="button">点击刷新</button>
            </div>
          </div>
          <p id="monitorViewAddress" class="warehouse-monitor-address"></p>
        </section>
      </div>
    </section>
    <div id="monitorPointOverlay"></div>`;

  const root = window.AppShell.mount({ title: '仓库监控', content });
  const $ = (selector) => root.querySelector(selector);

  function selectedPoint() {
    return state.points.find((point) => point.id === state.selectedId) || null;
  }

  function accessContext() {
    return window.WarehouseMonitorService.getAccessContext();
  }

  function normalizeWarehouseSelection(context) {
    if (!context.canSwitch) {
      state.warehouseId = '';
      return;
    }
    if (!context.warehouses.some((warehouse) => warehouse.id === state.warehouseId)) {
      state.warehouseId = context.warehouses[0]?.id || '';
    }
  }

  function visibleWarehouseIds(context) {
    return context.canSwitch ? [state.warehouseId].filter(Boolean) : context.warehouseIds;
  }

  function renderWarehouseScope(context) {
    const host = $('#monitorWarehouseScope');
    const warehouses = context.warehouses || [];
    if (context.canSwitch) {
      host.innerHTML = `<label class="warehouse-monitor-warehouse-switcher" for="monitorWarehouseSelect">
        <span>所属仓库</span>
        <select id="monitorWarehouseSelect"${warehouses.length ? '' : ' disabled'}>
          ${warehouses.length ? warehouses.map((warehouse) => `<option value="${escapeHtml(warehouse.id)}" ${warehouse.id === state.warehouseId ? 'selected' : ''}>${escapeHtml(warehouse.warehouseName)}</option>`).join('') : '<option value="">暂无仓库</option>'}
        </select>
      </label>`;
      return;
    }
    const names = warehouses.map((warehouse) => warehouse.warehouseName).join('、');
    host.innerHTML = `<div class="warehouse-monitor-warehouse-switcher is-fixed" title="分公司仅可查看当前运营的仓库">
      <span>所属仓库</span>
      <select id="monitorWarehouseSelect" disabled aria-label="固定运营仓库"><option value="">${escapeHtml(names || '暂无运营仓库')}</option></select>
    </div>`;
  }

  function showSnapshotLoadFailure(pointId) {
    const snapshot = $('#monitorVideoSnapshot');
    const elapsed = Date.now() - Number(snapshot.dataset.loadingStartedAt || Date.now());
    window.setTimeout(() => {
      if (snapshot.dataset.pointId !== state.selectedId || snapshot.dataset.pointId !== pointId) return;
      $('#monitorVideoLoading').classList.add('is-hidden');
      snapshot.classList.add('is-hidden');
      $('#monitorVideoPlaceholder').classList.remove('is-hidden');
      $('#monitorVideoPlaceholder').querySelector('strong').textContent = '加载失败';
      $('#monitorVideoPlaceholder').querySelector('span').textContent = '当前视频无法加载';
      $('#monitorVideoRetry').classList.remove('is-hidden');
    }, Math.max(0, 2000 - elapsed));
  }

  function renderPointList() {
    const list = $('#monitorPointList');
    if (!state.points.length) {
      list.innerHTML = '<div class="warehouse-monitor-empty-list">暂无视频点位</div>';
      return;
    }
    list.innerHTML = state.points.map((point) => `
      <div class="warehouse-monitor-point-item ${point.id === state.selectedId ? 'is-active' : ''}" role="button" tabindex="0" data-point-id="${escapeHtml(point.id)}">
        <span class="warehouse-monitor-point-name">${escapeHtml(point.name)}</span>
        <span class="warehouse-monitor-point-warehouse">${escapeHtml(window.WarehouseMonitorService.getWarehouseName(point.warehouseId))}</span>
        <span class="warehouse-monitor-point-description">${escapeHtml(point.description || '暂无描述')}</span>
        <span class="warehouse-monitor-point-actions">
          <button type="button" data-action="edit-point" data-point-id="${escapeHtml(point.id)}">编辑</button>
          <button type="button" class="danger" data-action="delete-point" data-point-id="${escapeHtml(point.id)}">删除</button>
        </span>
      </div>`).join('');
  }

  function renderView() {
    const point = selectedPoint();
    const title = $('#monitorViewTitle');
    const description = $('#monitorViewDescription');
    const address = $('#monitorViewAddress');
    const actions = $('#monitorViewActions');
    const snapshot = $('#monitorVideoSnapshot');
    const loading = $('#monitorVideoLoading');
    const placeholder = $('#monitorVideoPlaceholder');
    const retry = $('#monitorVideoRetry');
    if (!point) {
      title.textContent = state.points.length ? '请选择视频点位' : '暂无视频点位';
      description.textContent = '';
      address.textContent = '';
      actions.innerHTML = '';
      snapshot.removeAttribute('src');
      snapshot.dataset.pointId = '';
      snapshot.dataset.loadingStartedAt = '';
      snapshot.classList.add('is-hidden');
      loading.classList.add('is-hidden');
      retry.classList.add('is-hidden');
      placeholder.classList.remove('is-hidden');
      placeholder.querySelector('span').textContent = state.points.length ? '选择左侧点位后加载视频' : '请先新增视频点位';
      return;
    }
    title.textContent = point.name;
    description.textContent = point.description || '暂无描述';
    address.textContent = `视频地址：${point.videoAddress}`;
    actions.innerHTML = `
      <button class="btn btn-sm" type="button" data-view-action="edit">编辑点位</button>
      <button class="btn btn-danger btn-sm" type="button" data-view-action="delete">删除点位</button>`;
    const option = (window.WarehouseMonitorService.videoOptions || []).find((item) => item.value === point.videoAddress);
    snapshot.dataset.pointId = point.id;
    snapshot.dataset.loadingStartedAt = String(Date.now());
    snapshot.alt = `${point.name}仓储视频截图`;
    snapshot.classList.add('is-hidden');
    placeholder.classList.add('is-hidden');
    retry.classList.add('is-hidden');
    placeholder.querySelector('strong').textContent = '视频画面';
    loading.classList.remove('is-hidden');
    loading.querySelector('span:last-child').textContent = '正在加载视频画面';
    if (!option?.thumbnail) {
      loading.classList.add('is-hidden');
      placeholder.classList.remove('is-hidden');
      placeholder.querySelector('span').textContent = '当前点位暂无视频画面';
      return;
    }
    if (option.loadFailure) {
      snapshot.removeAttribute('src');
      showSnapshotLoadFailure(point.id);
      return;
    }
    snapshot.src = option.thumbnail;
  }

  function render() {
    const context = accessContext();
    normalizeWarehouseSelection(context);
    renderWarehouseScope(context);
    state.points = window.WarehouseMonitorService.list(state.keyword, { warehouseIds: visibleWarehouseIds(context) });
    if (!state.points.some((point) => point.id === state.selectedId)) state.selectedId = state.points[0]?.id || '';
    renderPointList();
    renderView();
  }

  function closeModal() {
    $('#monitorPointOverlay').innerHTML = '';
    state.editingId = '';
    state.confirmingId = '';
  }

  function renderWarehouseOptions(currentValue = '', context = accessContext()) {
    const options = context.warehouses || [];
    return `<option value="">请选择所属仓库</option>${options.map((warehouse) => `
      <option value="${escapeHtml(warehouse.id)}" ${warehouse.id === currentValue ? 'selected' : ''}>${escapeHtml(warehouse.warehouseName)}</option>`).join('')}`;
  }

  function showPointForm(point = null) {
    state.editingId = point?.id || '';
    const isEdit = Boolean(point);
    const context = accessContext();
    const warehouseOptions = context.warehouses || [];
    const currentWarehouseId = warehouseOptions.some((warehouse) => warehouse.id === point?.warehouseId)
      ? point.warehouseId
      : warehouseOptions[0]?.id || '';
    $('#monitorPointOverlay').innerHTML = `
      <div class="operations-modal-backdrop">
        <section class="operations-modal warehouse-monitor-modal" role="dialog" aria-modal="true" aria-label="${isEdit ? '编辑视频点位' : '新增视频点位'}">
          <header class="operations-modal-header"><h3>${isEdit ? '编辑视频点位' : '新增视频点位'}</h3><button type="button" data-monitor-close aria-label="关闭">×</button></header>
          <div class="operations-modal-body">
            <form id="monitorPointForm" class="warehouse-monitor-form">
              <div class="warehouse-monitor-form-field"><label class="required" for="monitorPointWarehouse">所属仓库</label><select id="monitorPointWarehouse" name="warehouseId"${warehouseOptions.length ? '' : ' disabled'}>${renderWarehouseOptions(currentWarehouseId, context)}</select><div id="monitorPointWarehouseError" class="warehouse-monitor-form-error"></div></div>
              <div class="warehouse-monitor-form-field"><label class="required" for="monitorPointName">点位名称</label><input id="monitorPointName" name="name" value="${escapeHtml(point?.name || '')}" placeholder="请输入点位名称" maxlength="50"><div id="monitorPointNameError" class="warehouse-monitor-form-error"></div></div>
              <div class="warehouse-monitor-form-field"><label for="monitorPointDescription">点位描述</label><textarea id="monitorPointDescription" name="description" placeholder="请输入点位描述（选填）" maxlength="200">${escapeHtml(point?.description || '')}</textarea></div>
              <div class="warehouse-monitor-form-field"><label class="required" for="monitorPointVideoAddress">视频地址</label><input id="monitorPointVideoAddress" name="videoAddress" type="url" inputmode="url" value="${escapeHtml(point?.videoAddress || '')}" placeholder="请输入视频地址" maxlength="500"><div id="monitorPointVideoError" class="warehouse-monitor-form-error"></div></div>
              <div id="monitorPointFormError" class="warehouse-monitor-form-error"></div>
            </form>
          </div>
          <footer class="operations-modal-footer"><button class="btn" type="button" data-monitor-close>取消</button><button id="monitorPointSave" class="btn btn-primary" type="button">保存</button></footer>
        </section>
      </div>`;
    $('#monitorPointName').focus();
  }

  function savePoint() {
    const name = $('#monitorPointName').value.trim();
    const warehouseId = $('#monitorPointWarehouse').value.trim();
    const description = $('#monitorPointDescription').value.trim();
    const videoAddress = $('#monitorPointVideoAddress').value.trim();
    const nameError = $('#monitorPointNameError');
    const warehouseError = $('#monitorPointWarehouseError');
    const videoError = $('#monitorPointVideoError');
    const formError = $('#monitorPointFormError');
    nameError.textContent = '';
    warehouseError.textContent = '';
    videoError.textContent = '';
    formError.textContent = '';
    if (!name) { nameError.textContent = '请输入点位名称'; return; }
    if (!warehouseId) { warehouseError.textContent = '请选择所属仓库'; return; }
    if (!videoAddress) { videoError.textContent = '请输入视频地址'; return; }
    try {
      const saved = state.editingId
        ? window.WarehouseMonitorService.update(state.editingId, { name, warehouseId, description, videoAddress })
        : window.WarehouseMonitorService.create({ name, warehouseId, description, videoAddress });
      state.selectedId = saved.id;
      if (accessContext().canSwitch) state.warehouseId = warehouseId;
      closeModal();
      render();
    } catch (error) {
      formError.textContent = error.message || '保存失败';
    }
  }

  function refreshSnapshot() {
    const point = selectedPoint();
    const snapshot = $('#monitorVideoSnapshot');
    const loading = $('#monitorVideoLoading');
    const placeholder = $('#monitorVideoPlaceholder');
    const retry = $('#monitorVideoRetry');
    const option = (window.WarehouseMonitorService.videoOptions || []).find((item) => item.value === point?.videoAddress);
    if (!point || !option?.thumbnail) return;
    snapshot.dataset.pointId = point.id;
    snapshot.dataset.loadingStartedAt = String(Date.now());
    snapshot.classList.add('is-hidden');
    placeholder.classList.add('is-hidden');
    retry.classList.add('is-hidden');
    placeholder.querySelector('strong').textContent = '视频画面';
    loading.classList.remove('is-hidden');
    loading.querySelector('span:last-child').textContent = '正在加载视频画面';
    const separator = option.thumbnail.includes('?') ? '&' : '?';
    if (option.loadFailure) {
      snapshot.removeAttribute('src');
      showSnapshotLoadFailure(point.id);
      return;
    }
    snapshot.src = `${option.thumbnail}${separator}retry=${Date.now()}`;
  }

  function showDeleteConfirm(id) {
    const point = window.WarehouseMonitorService.get(id);
    if (!point) return;
    state.confirmingId = id;
    $('#monitorPointOverlay').innerHTML = `
      <div class="operations-modal-backdrop">
        <section class="operations-modal is-confirm warehouse-monitor-modal" role="dialog" aria-modal="true" aria-label="删除视频点位">
          <header class="operations-modal-header"><h3>删除视频点位</h3><button type="button" data-monitor-close aria-label="关闭">×</button></header>
          <div class="operations-modal-body"><p class="warehouse-monitor-confirm-text">确定删除点位“${escapeHtml(point.name)}”吗？删除后将无法恢复。</p></div>
          <footer class="operations-modal-footer"><button class="btn" type="button" data-monitor-close>取消</button><button id="monitorPointDeleteConfirm" class="btn btn-danger" type="button">确定</button></footer>
        </section>
      </div>`;
  }

  function confirmDelete() {
    const id = state.confirmingId;
    const point = window.WarehouseMonitorService.get(id);
    if (!point) return closeModal();
    window.WarehouseMonitorService.remove(id);
    if (state.selectedId === id) state.selectedId = '';
    closeModal();
    render();
  }

  root.addEventListener('click', (event) => {
    const retry = event.target.closest('#monitorVideoRetry');
    if (retry) return refreshSnapshot();
    const close = event.target.closest('[data-monitor-close]');
    if (close) return closeModal();
    const add = event.target.closest('#addMonitorPointButton');
    if (add) return showPointForm();
    const save = event.target.closest('#monitorPointSave');
    if (save) return savePoint();
    const deleteConfirm = event.target.closest('#monitorPointDeleteConfirm');
    if (deleteConfirm) return confirmDelete();
    const pointAction = event.target.closest('[data-action="edit-point"], [data-action="delete-point"]');
    if (pointAction) {
      event.stopPropagation();
      const point = window.WarehouseMonitorService.get(pointAction.dataset.pointId);
      if (pointAction.dataset.action === 'edit-point') return showPointForm(point);
      return showDeleteConfirm(pointAction.dataset.pointId);
    }
    const item = event.target.closest('[data-point-id]');
    if (item) {
      state.selectedId = item.dataset.pointId;
      render();
      return;
    }
    const viewAction = event.target.closest('[data-view-action]');
    if (viewAction && state.selectedId) {
      const point = window.WarehouseMonitorService.get(state.selectedId);
      if (viewAction.dataset.viewAction === 'edit') return showPointForm(point);
      return showDeleteConfirm(state.selectedId);
    }
  });

  root.addEventListener('input', (event) => {
    if (event.target.id === 'pointSearchInput') {
      state.keyword = event.target.value.trim();
      render();
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.id === 'monitorWarehouseSelect' && event.target.value) {
      state.warehouseId = event.target.value;
      state.selectedId = '';
      render();
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.target.id === 'pointSearchInput' && event.key === 'Enter') {
      state.keyword = event.target.value.trim();
      render();
    }
    if (event.key === 'Escape' && $('#monitorPointOverlay').innerHTML) closeModal();
  });

  $('#monitorVideoSnapshot').addEventListener('load', () => {
    const snapshot = $('#monitorVideoSnapshot');
    if (!snapshot.dataset.pointId || snapshot.dataset.pointId !== state.selectedId) return;
    const elapsed = Date.now() - Number(snapshot.dataset.loadingStartedAt || Date.now());
    window.setTimeout(() => {
      if (snapshot.dataset.pointId !== state.selectedId) return;
      $('#monitorVideoLoading').classList.add('is-hidden');
      snapshot.classList.remove('is-hidden');
    }, Math.max(0, 2000 - elapsed));
  });
  $('#monitorVideoSnapshot').addEventListener('error', () => {
    const snapshot = $('#monitorVideoSnapshot');
    if (!snapshot.dataset.pointId || snapshot.dataset.pointId !== state.selectedId) return;
    showSnapshotLoadFailure(snapshot.dataset.pointId);
  });

  render();
})();
