(function () {
  const service = window.NoticeService;
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const calendarIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>';
  const backIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="21" y2="12"/></svg>';

  const isSchool = document.body?.dataset.userEnd === 'school';
  const recipientKind = isSchool ? '学校' : '供应商';
  const recipientId = isSchool ? (document.body?.dataset.schoolId || 'SCH-001') : (document.body?.dataset.supplierId || 'SUP-004');
  const recipientName = isSchool ? (document.body?.dataset.schoolName || '第一实验学校') : (document.body?.dataset.supplierName || '南皮供应商01');
  const fallbackTitles = isSchool
    ? ['2025年3月食材采购时间安排公告', '2025年2月食材采购时间安排公告', '2024年12月食材采购时间安排公告', '2024年11月食材采购时间安排公告', '2024年10月食材采购时间安排公告', '2024年9月食材采购时间安排公告', '2024年7月食材采购时间安排公告', '2024年6月食材采购时间安排公告', '2024年5月食材采购备校提报采购需求安排公告', '2024年5月食材采购时间安排公告']
    : ['中标供应商公示', '秋季供货安排通知', '供应商报价及配送安排公告', '供应商资质审核通知', '食材采购项目供货通知', '月度供货计划确认公告', '供应商商品信息维护通知', '竞价报价时间安排公告', '供应商合同签署通知', '配送服务规范公告'];
  const fallbackRows = fallbackTitles.map((title, index) => ({
    id: `RECIPIENT-NOTICE-${String(index + 1).padStart(3, '0')}`,
    title,
    recipients: [{ name: recipientKind, read: index < 2 ? 0 : 1, total: 1, targetNames: [recipientName] }],
    force: index < 4 ? '是' : '否',
    expire: index < 4 ? '2026-09-30' : '',
    time: `2026-0${Math.max(1, 8 - Math.floor(index / 3))}-${String(Math.max(1, 20 - index)).padStart(2, '0')} 10:00:00`,
    publisher: '教育局',
    status: '已发布',
    content: isSchool
      ? '<p>请各学校按照公告要求，及时完成本校相关准备工作，并按采购计划做好食材采购安排。</p>'
      : '<p>请各供应商按照公告要求，及时完成相关准备工作，并按供货计划做好配送安排。</p>',
    attachments: index === 0 ? [{ name: `${title}.pdf`, size: 128000 }] : []
  }));

  const storedRows = service?.load(fallbackRows) || fallbackRows;
  const visibleRows = storedRows
    .filter((row) => service?.canRecipientView(row, recipientKind, recipientId, recipientName) === true)
    .map((row, index) => ({ ...row, readStatus: row.readStatus || (index < 2 ? '未读' : '已读') }));
  const shell = window.AppShell.mount({
    title: '公告管理',
    content: '<div id="supplierNoticeRoot" class="supplier-notice-root"></div>',
    variant: isSchool ? 'school' : 'supplier',
    emptyText: '公告管理',
    showPageTitle: false
  });
  const root = shell.querySelector('#supplierNoticeRoot');
  const state = {
    rows: visibleRows,
    activeTab: 'all',
    filters: { title: '', startDate: '', endDate: '' },
    page: 1,
    pageSize: 10,
    view: 'list',
    rangePicker: null,
    forceDemoTimer: null,
    forceDemoModal: null
  };

  function dateOnly(value) { return String(value || '').slice(0, 10) || '--'; }

  function getReadStatus(row) {
    return row.readStatus === '未读' ? '未读' : '已读';
  }

  function getCurrentRows() {
    return state.rows.filter((row) => {
      const statusMatch = state.activeTab === 'all' || getReadStatus(row) === state.activeTab;
      const date = dateOnly(row.time);
      return statusMatch
        && (!state.filters.title || String(row.title || '').toLowerCase().includes(state.filters.title.toLowerCase()))
        && (!state.filters.startDate || date >= state.filters.startDate)
        && (!state.filters.endDate || date <= state.filters.endDate);
    });
  }

  function getStatusCounts() {
    return state.rows.reduce((counts, row) => {
      counts[getReadStatus(row)] += 1;
      return counts;
    }, { 未读: 0, 已读: 0 });
  }

  function getRow(id) { return state.rows.find((row) => row.id === id) || null; }

  function destroyRangePicker() {
    state.rangePicker?.destroy?.();
    state.rangePicker = null;
  }

  function createRangePicker() {
    const container = root.querySelector('#supplierNoticeDateRange');
    if (!container || !window.DateRangePicker?.create) return;
    state.rangePicker = window.DateRangePicker.create({
      container,
      displayInput: container.querySelector('.date-range-display'),
      startInput: container.querySelector('[data-date-start]'),
      endInput: container.querySelector('[data-date-end]'),
      panelId: 'supplierNoticeDateRangePanel',
      onChange: ({ startDate, endDate }) => {
        state.filters.startDate = startDate;
        state.filters.endDate = endDate;
      }
    });
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const pager = root.querySelector('[data-notice-pagination]');
    if (!pager) return;
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    const visiblePages = pageNumbers.length <= 5 ? pageNumbers : [...pageNumbers.slice(0, 3), 'ellipsis', pageNumbers.length];
    pager.innerHTML = `<button type="button" class="supplier-notice-page-arrow" data-action="page" data-page="${Math.max(1, state.page - 1)}" aria-label="上一页">‹</button>${visiblePages.map((page) => page === 'ellipsis' ? '<span class="supplier-notice-page-ellipsis">…</span>' : `<button type="button" class="supplier-notice-page-number ${state.page === page ? 'is-current' : ''}" data-action="page" data-page="${page}">${page}</button>`).join('')}<button type="button" class="supplier-notice-page-arrow" data-action="page" data-page="${Math.min(totalPages, state.page + 1)}" aria-label="下一页">›</button>`;
    const totalNode = root.querySelector('[data-notice-total]');
    if (totalNode) totalNode.textContent = `共 ${total} 条`;
    const jump = root.querySelector('[data-jump-page]');
    if (jump && document.activeElement !== jump) jump.value = state.page;
    const pageSize = root.querySelector('[data-page-size]');
    if (pageSize) pageSize.value = String(state.pageSize);
  }

  function renderListRows() {
    const filtered = getCurrentRows();
    const start = (state.page - 1) * state.pageSize;
    const visible = filtered.slice(start, start + state.pageSize);
    const body = root.querySelector('#supplierNoticeRows');
    if (body) {
      body.innerHTML = visible.length
        ? visible.map((row) => `<tr><td class="supplier-notice-title"><button type="button" data-action="view-notice" data-id="${escapeHtml(row.id)}">${escapeHtml(row.title)}</button></td><td>${escapeHtml(dateOnly(row.time))}</td><td><span class="supplier-notice-read-status ${getReadStatus(row) === '已读' ? 'is-read' : 'is-unread'}">${getReadStatus(row)}</span></td><td><button class="supplier-notice-view-button" type="button" data-action="view-notice" data-id="${escapeHtml(row.id)}">查看</button></td></tr>`).join('')
        : '<tr><td class="supplier-notice-empty" colspan="4">暂无公告数据</td></tr>';
    }
    renderPagination(filtered.length);
  }

  function renderList() {
    destroyRangePicker();
    closeForceDemoNotice();
    state.view = 'list';
    const counts = getStatusCounts();
    root.innerHTML = `<section class="page-card supplier-notice-page" id="supplierNoticePage">
      <div class="supplier-notice-tabs" role="tablist" aria-label="公告状态"><button type="button" class="supplier-notice-tab ${state.activeTab === 'all' ? 'is-active' : ''}" data-action="tab" data-tab="all">全部 <span>（${state.rows.length}）</span></button><button type="button" class="supplier-notice-tab ${state.activeTab === '未读' ? 'is-active' : ''}" data-action="tab" data-tab="未读">未读 <span>（${counts.未读}）</span></button><button type="button" class="supplier-notice-tab ${state.activeTab === '已读' ? 'is-active' : ''}" data-action="tab" data-tab="已读">已读 <span>（${counts.已读}）</span></button></div>
      <div class="supplier-notice-demo-bar"><button type="button" class="btn btn-sm supplier-notice-demo-button" data-action="demo-force-notice">查看强制弹窗</button></div>
      <div class="supplier-notice-filters"><div class="supplier-notice-filter-field"><label for="supplierNoticeTitleFilter">公告标题</label><input id="supplierNoticeTitleFilter" type="text" placeholder="请输入" value="${escapeHtml(state.filters.title)}"></div><div class="supplier-notice-filter-field supplier-notice-date-field"><label for="supplierNoticeDateDisplay">发布时间</label><div class="supplier-notice-date-range date-range-picker" id="supplierNoticeDateRange"><input class="date-range-display" id="supplierNoticeDateDisplay" type="text" placeholder="开始日期　　~　　结束日期" readonly><span class="supplier-notice-date-icon" aria-hidden="true">${calendarIcon}</span><input type="hidden" data-date-start value="${escapeHtml(state.filters.startDate)}"><input type="hidden" data-date-end value="${escapeHtml(state.filters.endDate)}"></div></div><div class="supplier-notice-filter-actions"><button type="button" class="btn btn-primary btn-sm" data-action="query">查询</button><button type="button" class="btn btn-sm" data-action="reset">重置</button></div></div>
      <div class="supplier-notice-table-wrap"><table class="supplier-notice-table"><colgroup><col class="col-title"><col class="col-time"><col class="col-status"><col class="col-action"></colgroup><thead><tr><th>公告标题</th><th>发布时间</th><th>状态</th><th>操作</th></tr></thead><tbody id="supplierNoticeRows"></tbody></table></div>
      <div class="supplier-notice-pagination"><span data-notice-total>共 0 条</span><div class="supplier-notice-pagination-right"><div class="supplier-notice-pagination-pages" data-notice-pagination></div><select data-page-size aria-label="每页条数"><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><label>前往 <input type="number" min="1" data-jump-page aria-label="跳转页码"> 页</label></div></div>
    </section>`;
    const pageSize = root.querySelector('[data-page-size]');
    pageSize.value = String(state.pageSize);
    createRangePicker();
    renderListRows();
  }

  function renderContent(row) {
    return String(row.content || '').trim();
  }

  function renderForceDemoContent(row) {
    const content = String(row.content || '').trim();
    if (content) return content;
    return isSchool
      ? '<p>请各学校按照公告要求，及时完成本校相关准备工作，并按采购计划做好食材采购安排。</p>'
      : '<p>请各供应商按照公告要求，及时完成相关准备工作，并按供货计划做好配送安排。</p>';
  }

  function closeForceDemoNotice() {
    if (state.forceDemoTimer) {
      window.clearInterval(state.forceDemoTimer);
      state.forceDemoTimer = null;
    }
    state.forceDemoModal?.remove();
    state.forceDemoModal = null;
  }

  function openForceDemoNotice() {
    closeForceDemoNotice();
    const row = state.rows.find((item) => String(item.content || '').trim()) || state.rows[0] || fallbackRows[0];
    const forceAnnotationId = isSchool ? 'notice-force-popup-school' : 'notice-force-popup-supplier';
    const forceAnnotationTarget = '#supplierNoticeRoot [data-modal="supplier-force-demo"] .supplier-notice-force-content';
    const forceAnnotationPlaceholder = `<span class="record-annotation-placeholder is-code is-right" data-annotation-placeholder="${forceAnnotationId}" data-annotation-base="${forceAnnotationId}" data-annotation-target="custom" data-annotation-target-selector="${escapeHtml(forceAnnotationTarget)}" data-annotation-scope="modal" aria-hidden="true"></span>`;
    const modal = document.createElement('div');
    modal.className = 'notice-modal-mask operations-modal-backdrop';
    modal.setAttribute('data-modal', 'supplier-force-demo');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<section class="notice-modal supplier-notice-force-modal" aria-labelledby="supplierForceDemoTitle"><header><h3 id="supplierForceDemoTitle">公告</h3></header><div class="notice-modal-body"><article class="supplier-notice-force-content"><h4>${escapeHtml(row.title || '系统公告')}</h4>${renderForceDemoContent(row)}</article>${forceAnnotationPlaceholder}</div><footer><button type="button" class="btn btn-primary btn-sm" data-action="ack-force-demo" disabled>我已知晓（5秒）</button></footer></section>`;
    root.appendChild(modal);
    state.forceDemoModal = modal;
    let seconds = 5;
    const acknowledge = modal.querySelector('[data-action="ack-force-demo"]');
    const updateCountdown = () => {
      if (seconds > 0) {
        acknowledge.textContent = `我已知晓（${seconds}秒）`;
        acknowledge.disabled = true;
        return;
      }
      acknowledge.textContent = '我已知晓';
      acknowledge.disabled = false;
      if (state.forceDemoTimer) {
        window.clearInterval(state.forceDemoTimer);
        state.forceDemoTimer = null;
      }
    };
    updateCountdown();
    state.forceDemoTimer = window.setInterval(() => {
      seconds -= 1;
      updateCountdown();
    }, 1000);
    modal.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action="ack-force-demo"]');
      if (action && !action.disabled && seconds <= 0) closeForceDemoNotice();
    });
  }

  function downloadAttachment(file) {
    const filename = file.name || '公告附件';
    const anchor = document.createElement('a');
    let objectUrl = '';
    if (file.url) anchor.href = file.url;
    else {
      objectUrl = URL.createObjectURL(new Blob([file.content || `公告附件：${filename}`], { type: 'application/octet-stream' }));
      anchor.href = objectUrl;
    }
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (objectUrl) window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }

  function renderDetail(row) {
    destroyRangePicker();
    closeForceDemoNotice();
    state.view = 'detail';
    row.readStatus = '已读';
    const attachments = Array.isArray(row.attachments) ? row.attachments : [];
    root.innerHTML = `<section class="page-card supplier-notice-page supplier-notice-detail-page" id="supplierNoticeDetailPage" data-id="${escapeHtml(row.id)}"><div class="supplier-notice-detail-heading"><button class="supplier-notice-back-button" type="button" data-action="back">${backIcon}<span>返回</span></button><span class="supplier-notice-detail-divider" aria-hidden="true"></span><h2>公告详情</h2></div><article class="supplier-notice-detail-content"><h1>${escapeHtml(row.title)}</h1><div class="supplier-notice-detail-meta"><span>${escapeHtml(dateOnly(row.time))}</span><span>${escapeHtml(row.publisher || '教育局')}</span></div><div class="supplier-notice-rich-content">${renderContent(row)}</div><div class="supplier-notice-attachments"><strong>附件：</strong>${attachments.length ? attachments.map((file, index) => `<button type="button" class="supplier-notice-attachment-link" data-action="download-attachment" data-index="${index}">${escapeHtml(file.name || `附件${index + 1}`)}</button>`).join('') : '<span class="supplier-notice-no-attachment">暂无附件</span>'}</div></article><div class="supplier-notice-detail-actions"><button type="button" class="btn btn-sm" data-action="back">返回</button><button type="button" class="btn btn-sm" data-action="print">打印</button></div></section>`;
  }

  root.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'tab') {
      state.activeTab = actionEl.dataset.tab || 'all';
      state.page = 1;
      renderList();
      return;
    }
    if (action === 'query') {
      state.filters.title = root.querySelector('#supplierNoticeTitleFilter')?.value?.trim() || '';
      state.page = 1;
      renderList();
      return;
    }
    if (action === 'reset') {
      state.filters = { title: '', startDate: '', endDate: '' };
      state.activeTab = 'all';
      state.page = 1;
      renderList();
      return;
    }
    if (action === 'demo-force-notice') {
      openForceDemoNotice();
      return;
    }
    if (action === 'page') {
      state.page = Number(actionEl.dataset.page) || 1;
      renderListRows();
      return;
    }
    if (action === 'view-notice') {
      const row = getRow(actionEl.dataset.id);
      if (row) renderDetail(row);
      return;
    }
    if (action === 'back') {
      renderList();
      return;
    }
    if (action === 'download-attachment') {
      const detail = root.querySelector('#supplierNoticeDetailPage');
      const row = getRow(detail?.dataset?.id || '') || state.rows.find((item) => item.readStatus === '已读');
      if (row) downloadAttachment(row.attachments?.[Number(actionEl.dataset.index)] || {});
      return;
    }
    if (action === 'print') {
      window.print();
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-page-size]')) {
      state.pageSize = Number(event.target.value) || 10;
      state.page = 1;
      renderListRows();
    }
  });

  root.addEventListener('keydown', (event) => {
    if (!event.target.matches('[data-jump-page]') || event.key !== 'Enter') return;
    const filtered = getCurrentRows();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    state.page = Math.max(1, Math.min(totalPages, Number(event.target.value) || 1));
    renderListRows();
  });

  renderList();
})();
