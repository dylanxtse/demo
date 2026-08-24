(function () {
  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const calendarIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>';
  const chevronIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
  const quoteIcon = '<svg class="icon-svg notice-editor-quote-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11.5c0-3.6 2-5.8 5.1-6.7v2.1c-1.4.5-2.2 1.5-2.4 2.9h2.4v5.5H5v-3.8Zm8.4 0c0-3.6 2-5.8 5.1-6.7v2.1c-1.4.5-2.2 1.5-2.4 2.9h2.4v5.5h-5.1v-3.8Z"/></svg>';
  const backIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="21" y2="12"/></svg>';
  const alignLeftIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
  const alignCenterIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
  const alignRightIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
  const alignJustifyIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
  const linkIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15"/></svg>';
  const tableIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/></svg>';
  const undoIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-1"/></svg>';
  const redoIcon = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h1"/></svg>';

  const seedRows = [
    { title: '1', recipients: [{ name: '学校', read: 1, total: 1 }, { name: '供应商', read: 1, total: 1 }], force: '是', expire: '2026-06-30', time: '2026-06-25 09:47:34', publisher: '--', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 3, total: 5 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:56:32', publisher: '李老师', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 2, total: 5 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:55:08', publisher: '李老师', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 3, total: 4 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:53:22', publisher: '李老师', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 3, total: 5 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:52:07', publisher: '李老师', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 3, total: 5 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:48:15', publisher: '李老师', status: '已发布' },
    { title: '中标供应商公示', recipients: [{ name: '学校', read: 6, total: 7 }, { name: '供应商', read: 3, total: 4 }], force: '是', expire: '2026-05-31', time: '2026-05-26 10:46:24', publisher: '李老师', status: '已发布' },
    { title: '4月下旬竞标已开始', recipients: [{ name: '学校', read: 1, total: 1 }, { name: '供应商', read: 1, total: 1 }], force: '是', expire: '2026-04-19', time: '2026-04-18 19:01:31', publisher: '默认', status: '已发布' },
    { title: '4月第四周竞标', recipients: [{ name: '学校', read: 1, total: 1 }, { name: '供应商', read: 1, total: 1 }], force: '是', expire: '2026-04-19', time: '2026-04-17 20:27:48', publisher: '默认', status: '已发布' },
    { title: '临汾丸子竞价公告', recipients: [{ name: '学校', read: 0, total: 1 }, { name: '供应商', read: 1, total: 3 }], force: '否', expire: '', time: '2026-03-31 22:32:02', publisher: '默认', status: '已发布' }
  ];

  function cloneRow(row, index) {
    return {
      ...row,
      id: `NOTICE-${String(index + 1).padStart(3, '0')}`,
      recipients: row.recipients.map((item) => ({ ...item }))
    };
  }

  const initialRows = Array.from({ length: 37 }, (_, index) => {
    if (index < seedRows.length) return cloneRow(seedRows[index], index);
    const source = seedRows[index % seedRows.length];
    const month = String(Math.max(1, 3 - Math.floor(index / 10))).padStart(2, '0');
    const day = String(Math.max(1, 30 - (index % 20))).padStart(2, '0');
    return cloneRow({
      ...source,
      title: index % 3 === 0 ? '校园食材采购公告' : `竞价公告${index + 1}`,
      time: `2026-${month}-${day} 09:${String(index % 60).padStart(2, '0')}:00`,
      publisher: index % 2 ? '默认' : '李老师'
    }, index);
  });

  const shell = window.AppShell.mount({
    title: '公告管理',
    variant: 'education',
    content: '<div id="noticePageRoot" class="notice-page-root"></div>'
  });
  const root = shell.querySelector('#noticePageRoot');
  const state = {
    rows: initialRows,
    filters: { title: '', startDate: '', endDate: '', status: '' },
    statusDraft: '',
    selected: new Set(),
    page: 1,
    pageSize: 10,
    view: 'list',
    datePickers: [],
    recipientDetail: {
      rowId: '',
      kind: '学校',
      filters: { name: '', status: '' },
      records: [],
      page: 1,
      pageSize: 10,
      pagination: null
    },
    form: { title: '', recipients: [], force: '否', expire: '', content: '', attachments: [] }
  };

  function todayPlus(days) {
    const date = new Date();
    date.setDate(date.getDate() + Number(days || 0));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function destroyPickers(owner) {
    state.datePickers = state.datePickers.filter((item) => {
      if (item.owner !== owner) return true;
      item.picker?.destroy?.();
      return false;
    });
  }

  function destroyRecipientPagination() {
    state.recipientDetail.pagination?.destroy?.();
    state.recipientDetail.pagination = null;
  }

  function createDatePicker(input, owner) {
    if (!input || !window.DatePicker?.create) return;
    const picker = window.DatePicker.create({ input });
    if (picker) state.datePickers.push({ owner, picker });
  }

  function createDateRangePicker(container, owner) {
    if (!container || !window.DateRangePicker?.create) return;
    const picker = window.DateRangePicker.create({
      container,
      displayInput: container.querySelector('.date-range-display'),
      startInput: container.querySelector('[data-date-start]'),
      endInput: container.querySelector('[data-date-end]'),
      panelId: 'noticeDateRangePanel',
      onChange: ({ startDate, endDate }) => {
        if (owner !== 'list') return;
        state.filters.startDate = startDate;
        state.filters.endDate = endDate;
      }
    });
    if (picker) state.datePickers.push({ owner, picker });
  }

  function showToast(message, error = false) {
    let toast = root.querySelector('.notice-toast');
    if (!toast) {
      root.insertAdjacentHTML('beforeend', '<div class="notice-toast" role="status"></div>');
      toast = root.querySelector('.notice-toast');
    }
    toast.textContent = message;
    toast.classList.toggle('is-error', error);
    toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function statusLabel(status) {
    return `<span class="notice-status notice-status-${status === '已发布' ? 'published' : status === '已撤回' ? 'withdrawn' : 'draft'}">${esc(status)}</span>`;
  }

  function renderRecipientLinks(row) {
    return row.recipients.map((item) => `<button class="notice-recipient-link" type="button" data-action="show-recipient" data-id="${esc(row.id)}" data-recipient="${esc(item.name)}">${esc(item.name)}(${item.read}/${item.total})</button>`).join('<span class="notice-recipient-gap" aria-hidden="true"></span>');
  }

  const recipientDirectory = {
    学校: [
      { name: '康璐高中', contact: '--(19203551949)' },
      { name: '东城职业学校', contact: '李老师(13800000001)' },
      { name: '实验幼儿园', contact: '王老师(13800000002)' },
      { name: '第三小学', contact: '张老师(13800000003)' },
      { name: '机关第一食堂', contact: '赵老师(13800000004)' },
      { name: '阳光幼儿园', contact: '刘老师(13800000005)' },
      { name: '第七中学', contact: '陈老师(13800000006)' }
    ],
    供应商: [
      { name: '长治66超市', code: '91360721731977085M', contact: '康老板(19203551949)' },
      { name: '山西农品供应链', code: '91140100MA0K000001', contact: '王经理(13800000011)' },
      { name: '鲜选食品有限公司', code: '91140100MA0K000002', contact: '李经理(13800000012)' },
      { name: '晋味粮油商行', code: '91140100MA0K000003', contact: '赵经理(13800000013)' },
      { name: '校园优选配送中心', code: '91140100MA0K000004', contact: '刘经理(13800000014)' }
    ]
  };

  function buildRecipientRecords(row, kind) {
    const summary = row.recipients.find((item) => item.name === kind) || { read: 0, total: 0 };
    const total = Math.max(0, Number(summary.total) || 0);
    const read = Math.min(total, Math.max(0, Number(summary.read) || 0));
    const directory = recipientDirectory[kind] || [];
    return Array.from({ length: total }, (_, index) => {
      const source = directory[index] || (kind === '学校'
        ? { name: `接收学校${index + 1}`, contact: '--' }
        : { name: `接收供应商${index + 1}`, code: '--', contact: '--' });
      return { ...source, status: index < read ? '已读' : '未读' };
    });
  }

  function getRecipientDetailRows() {
    const { records, filters } = state.recipientDetail;
    return records.filter((record) => (!filters.name || record.name === filters.name)
      && (!filters.status || record.status === filters.status));
  }

  function renderRecipientDetailRows() {
    const { kind, pagination } = state.recipientDetail;
    const filtered = getRecipientDetailRows();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.recipientDetail.pageSize));
    state.recipientDetail.page = Math.min(state.recipientDetail.page, totalPages);
    const start = (state.recipientDetail.page - 1) * state.recipientDetail.pageSize;
    const visible = filtered.slice(start, start + state.recipientDetail.pageSize);
    const body = root.querySelector('#noticeRecipientRows');
    if (body) {
      body.innerHTML = visible.length ? visible.map((record) => kind === '学校'
        ? `<tr><td>${esc(record.name)}</td><td>${esc(record.contact)}</td><td><span class="notice-read-status ${record.status === '已读' ? 'is-read' : 'is-unread'}">${esc(record.status)}</span></td></tr>`
        : `<tr><td>${esc(record.name)}</td><td>${esc(record.code)}</td><td>${esc(record.contact)}</td><td><span class="notice-read-status ${record.status === '已读' ? 'is-read' : 'is-unread'}">${esc(record.status)}</span></td></tr>`
      ).join('') : `<tr><td class="notice-recipient-empty" colspan="${kind === '学校' ? 3 : 4}">暂无符合条件的数据</td></tr>`;
    }
    pagination?.update({ page: state.recipientDetail.page, total: filtered.length });
  }

  function renderRecipientDetailView(row, kind = '学校') {
    destroyPickers('list');
    destroyPickers('form');
    destroyPickers('modal');
    destroyRecipientPagination();
    state.view = 'recipient-detail';
    state.recipientDetail = {
      rowId: row.id,
      kind,
      filters: { name: '', status: '' },
      records: buildRecipientRecords(row, kind),
      page: 1,
      pageSize: 10,
      pagination: null
    };
    const names = [...new Set(state.recipientDetail.records.map((record) => record.name))];
    const nameLabel = kind === '学校' ? '学校名称' : '供应商名称';
    const namePlaceholder = kind === '学校' ? '请选择学校' : '请选择供应商';
    const nameOptions = names.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
    const tableHead = kind === '学校'
      ? '<th>学校名称</th><th>负责人</th><th>已读状态</th>'
      : '<th>供应商名称</th><th>统一社会信用代码</th><th>联系人</th><th>已读状态</th>';
    const tableCols = kind === '学校' ? '<col class="recipient-col-name"><col class="recipient-col-contact"><col class="recipient-col-status">' : '<col class="recipient-col-name"><col class="recipient-col-code"><col class="recipient-col-contact"><col class="recipient-col-status">';
    root.innerHTML = `<section class="page-card notice-page notice-recipient-detail-page" id="noticeRecipientDetailPage">
      <div class="notice-recipient-detail-heading"><button class="notice-back-button" type="button" data-action="back">${backIcon}<span>返回</span></button><h2>接收对象详情</h2></div>
      <div class="notice-recipient-detail-content">
        <div class="notice-recipient-tabs" role="tablist" aria-label="接收对象类型"><button class="notice-recipient-tab ${kind === '学校' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${kind === '学校'}" data-action="recipient-tab" data-recipient="学校">学校</button><button class="notice-recipient-tab ${kind === '供应商' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${kind === '供应商'}" data-action="recipient-tab" data-recipient="供应商">供应商</button></div>
        <div class="notice-recipient-filter"><div class="notice-recipient-filter-item"><label for="noticeRecipientName">${nameLabel}</label><select id="noticeRecipientName" data-recipient-filter="name"><option value="">${namePlaceholder}</option>${nameOptions}</select></div><div class="notice-recipient-filter-item"><label for="noticeRecipientStatus">已读状态</label><select id="noticeRecipientStatus" data-recipient-filter="status"><option value="">全部</option><option value="已读">已读</option><option value="未读">未读</option></select></div><div class="notice-recipient-filter-actions"><button class="btn btn-primary btn-sm" type="button" data-action="recipient-query">查询</button><button class="btn btn-sm" type="button" data-action="recipient-reset">重置</button></div></div>
        <div class="notice-recipient-table-container"><div class="notice-recipient-table-wrapper"><table class="notice-recipient-table"><colgroup>${tableCols}</colgroup><thead><tr>${tableHead}</tr></thead><tbody id="noticeRecipientRows"></tbody></table></div><div class="pagination notice-recipient-pagination" id="noticeRecipientPagination"></div></div>
      </div>
    </section>`;
    state.recipientDetail.pagination = window.Pagination?.create({
      container: root.querySelector('#noticeRecipientPagination'),
      page: 1,
      pageSize: state.recipientDetail.pageSize,
      total: state.recipientDetail.records.length,
      pageSizeOptions: [10, 20, 50],
      onChange: ({ page, pageSize }) => {
        state.recipientDetail.page = page;
        state.recipientDetail.pageSize = pageSize;
        renderRecipientDetailRows();
      }
    }) || null;
    renderRecipientDetailRows();
  }

  function renderNoticePreviewContent(row) {
    const content = String(row.content || '').trim();
    if (content) return content;
    const recipients = row.recipients?.map((item) => item.name).join('、') || '相关接收对象';
    return `<p>${esc(row.title)}公告。</p><p>本公告面向${esc(recipients)}发布，请相关接收对象及时查看公告内容，并按要求执行。</p>`;
  }

  function renderNoticePreviewView(row) {
    destroyPickers('list');
    destroyPickers('form');
    destroyPickers('modal');
    destroyRecipientPagination();
    state.view = 'preview';
    const attachments = Array.isArray(row.attachments) ? row.attachments : [];
    const attachmentMarkup = attachments.length
      ? `<div class="notice-preview-attachments"><strong>公告附件</strong><div>${attachments.map((file) => `<span>${esc(file.name)}</span>`).join('')}</div></div>`
      : '';
    root.innerHTML = `<section class="page-card notice-page notice-preview-page" id="noticePreviewPage">
      <div class="notice-preview-heading"><button class="notice-back-button" type="button" data-action="back">${backIcon}<span>返回</span></button><h2>公告预览</h2></div>
      <div class="notice-preview-page-body"><article class="notice-preview-article">
        <h1>${esc(row.title)}</h1>
        <div class="notice-preview-meta"><span>发布时间：${esc(row.time || '--')}</span></div>
        <div class="notice-preview-rich-content">${renderNoticePreviewContent(row)}</div>
        ${attachmentMarkup}
      </article></div>
    </section>`;
  }

  function renderForceCell(row) {
    if (row.force !== '是') return '<span>否</span>';
    return `<div class="notice-force-value"><span>是</span><span>失效时间:(${esc(row.expire || '--')})</span></div>`;
  }

  function renderRow(row, index) {
    const published = row.status === '已发布';
    const selected = state.selected.has(row.id);
    return `<tr>
      <td class="notice-check-cell"><input type="checkbox" aria-label="选择公告${index + 1}" data-action="toggle-row" data-id="${esc(row.id)}" ${selected ? 'checked' : ''}></td>
      <td class="notice-title-cell"><button class="notice-title-link" type="button" data-action="preview-row" data-id="${esc(row.id)}" aria-label="预览公告：${esc(row.title)}">${esc(row.title)}</button></td>
      <td>${renderRecipientLinks(row)}</td>
      <td>${renderForceCell(row)}</td>
      <td>${esc(row.time)}</td>
      <td>${esc(row.publisher || '--')}</td>
      <td>${statusLabel(row.status)}</td>
      <td class="notice-actions-cell"><div class="operation-actions">
        <button class="notice-text-button" type="button" data-action="force-row" data-id="${esc(row.id)}">强制弹窗</button>
        <button class="notice-text-button" type="button" data-action="retract-row" data-id="${esc(row.id)}" ${published ? '' : 'disabled'}>撤回</button>
        <button class="notice-text-button" type="button" data-action="edit-row" data-id="${esc(row.id)}" ${published ? 'disabled' : ''}>编辑</button>
        <button class="notice-text-button is-danger" type="button" data-action="delete-row" data-id="${esc(row.id)}" ${published ? 'disabled' : ''}>删除</button>
      </div></td>
    </tr>`;
  }

  function getFilteredRows() {
    const { title, startDate, endDate, status } = state.filters;
    return state.rows.filter((row) => {
      const date = String(row.time || '').slice(0, 10);
      return (!title || row.title.toLowerCase().includes(title.toLowerCase()))
        && (!startDate || date >= startDate)
        && (!endDate || date <= endDate)
        && (!status || row.status === status);
    });
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const pageItems = Array.from({ length: totalPages }, (_, index) => `<button class="notice-page-number ${state.page === index + 1 ? 'is-current' : ''}" type="button" data-action="page" data-page="${index + 1}">${index + 1}</button>`).join('');
    const jump = root.querySelector('[data-jump-page]');
    if (jump && document.activeElement !== jump) jump.value = state.page;
    const pageCount = root.querySelector('[data-page-count]');
    if (pageCount) pageCount.textContent = `/ ${totalPages} 页`;
    const pager = root.querySelector('[data-notice-pagination]');
    if (pager) pager.innerHTML = pageItems;
  }

  function renderListRows() {
    const filtered = getFilteredRows();
    const start = (state.page - 1) * state.pageSize;
    const visible = filtered.slice(start, start + state.pageSize);
    const body = root.querySelector('#noticeRows');
    if (body) body.innerHTML = visible.length ? visible.map(renderRow).join('') : '<tr><td class="notice-empty" colspan="8">暂无公告数据</td></tr>';
    const total = root.querySelector('[data-notice-total]');
    if (total) total.textContent = `共 ${filtered.length} 条数据`;
    const selectAll = root.querySelector('[data-action="toggle-page"]');
    if (selectAll) {
      const allSelected = visible.length > 0 && visible.every((row) => state.selected.has(row.id));
      selectAll.checked = allSelected;
      selectAll.indeterminate = !allSelected && visible.some((row) => state.selected.has(row.id));
    }
    renderPagination(filtered.length);
  }

  function renderListView() {
    destroyPickers('form');
    destroyPickers('modal');
    destroyRecipientPagination();
    state.view = 'list';
    root.innerHTML = `<section class="page-card bidding-page notice-page" id="noticeManagementPage">
      <section class="bidding-filter-panel notice-filter-panel">
        <div class="bidding-filter-grid notice-filter-grid">
          <div class="bidding-filter-item notice-filter-item"><label for="noticeTitleFilter">公告标题</label><input id="noticeTitleFilter" data-filter="title" placeholder="请输入" value="${esc(state.filters.title)}"></div>
          <div class="bidding-filter-item notice-filter-item notice-date-filter"><label for="noticeDateDisplay">发布日期</label><div class="notice-date-range date-range-picker" id="noticeDateRange"><input class="filter-input date-range-display" id="noticeDateDisplay" type="text" placeholder="请选择日期" readonly><span class="date-range-icon" aria-hidden="true">${calendarIcon}</span><input type="hidden" data-date-start value="${esc(state.filters.startDate)}"><input type="hidden" data-date-end value="${esc(state.filters.endDate)}"></div></div>
          <div class="bidding-filter-item notice-filter-item"><label>状态</label><div class="notice-select" data-status-select><button class="notice-select-trigger" type="button" data-action="toggle-status" aria-haspopup="listbox" aria-expanded="false"><span data-status-label>${esc(state.statusDraft || state.filters.status || '全部')}</span>${chevronIcon}</button><div class="notice-select-menu" role="listbox" hidden><button type="button" role="option" data-action="select-status" data-status="">全部</button><button type="button" role="option" data-action="select-status" data-status="已发布">已发布</button><button type="button" role="option" data-action="select-status" data-status="未发布">未发布</button><button type="button" role="option" data-action="select-status" data-status="已撤回">已撤回</button></div></div></div>
        </div>
        <div class="bidding-filter-actions notice-filter-actions"><button class="btn btn-primary btn-sm" type="button" data-action="query">查询</button><button class="btn btn-sm" type="button" data-action="reset">重置</button></div>
      </section>
      <div class="bidding-toolbar notice-toolbar"><div class="bidding-toolbar-left"><button class="btn btn-primary btn-sm" type="button" data-action="add-notice">添加公告</button><button class="btn btn-blue btn-sm" type="button" data-action="batch-delete">批量删除</button></div></div>
      <div class="bidding-table-container notice-table-container">
        <div class="bidding-table-wrapper notice-table-wrapper"><table class="bidding-table notice-table"><colgroup><col class="notice-col-check"><col class="notice-col-title"><col class="notice-col-recipient"><col class="notice-col-force"><col class="notice-col-time"><col class="notice-col-publisher"><col class="notice-col-status"><col class="notice-col-action"></colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前页公告" data-action="toggle-page"></th><th>公告标题</th><th>接收对象(已读/总数)</th><th>强制弹框</th><th>发布时间</th><th>发布人</th><th>状态</th><th>操作</th></tr></thead><tbody id="noticeRows"></tbody></table></div>
        <div class="notice-pagination"><span data-notice-total>共 37 条数据</span><div class="notice-pagination-controls"><select class="notice-page-size" aria-label="每页条数" data-action="page-size"><option value="10">10 条/页</option><option value="20">20 条/页</option><option value="50">50 条/页</option></select><div class="notice-page-numbers" data-notice-pagination></div><label class="notice-jump-label">跳至<input type="number" min="1" data-jump-page value="1" aria-label="跳转页码"><span data-page-count>/ 4 页</span></label></div></div>
      </div>
    </section>`;
    createDateRangePicker(root.querySelector('#noticeDateRange'), 'list');
    const pageSizeSelect = root.querySelector('[data-action="page-size"]');
    if (pageSizeSelect) pageSizeSelect.value = String(state.pageSize);
    renderListRows();
  }

  function renderToolbarButton(command, label, content) {
    return `<button class="notice-editor-tool" type="button" data-editor-command="${command}" aria-label="${esc(label)}" title="${esc(label)}">${content}</button>`;
  }

  function renderToolbarDropdown(command, label, content, className = '') {
    return `<button class="notice-editor-tool notice-editor-dropdown ${className}" type="button" data-editor-command="${command}" aria-label="${esc(label)}" title="${esc(label)}">${content}${chevronIcon}</button>`;
  }

  function renderAttachmentList() {
    const list = root.querySelector('[data-attachment-list]');
    if (!list) return;
    list.innerHTML = state.form.attachments.map((file, index) => `<li><span>${esc(file.name)}</span><button type="button" data-action="remove-attachment" data-attachment-index="${index}" aria-label="删除附件">×</button></li>`).join('');
  }

  function renderFormView() {
    destroyPickers('list');
    destroyPickers('modal');
    destroyRecipientPagination();
    state.view = 'form';
    const checkedSchools = state.form.recipients.includes('学校');
    const checkedSuppliers = state.form.recipients.includes('供应商');
    root.innerHTML = `<section class="page-card notice-page notice-form-page" id="noticeFormPage">
      <div class="notice-form-heading"><button class="notice-back-button" type="button" data-action="back">${backIcon}<span>返回</span></button><h2>添加公告</h2></div>
      <div class="notice-form-body">
        <div class="notice-form-field required"><label for="noticeFormTitle">公告标题</label><input id="noticeFormTitle" data-form="title" placeholder="请输入" value="${esc(state.form.title)}"></div>
        <div class="notice-form-field required"><label>接收对象</label><div class="notice-check-group"><label><input type="checkbox" data-recipient="学校" ${checkedSchools ? 'checked' : ''}>学校</label><label><input type="checkbox" data-recipient="供应商" ${checkedSuppliers ? 'checked' : ''}>供应商</label></div></div>
        <div class="notice-form-field required"><label>强制弹框</label><div class="notice-radio-group"><label><input type="radio" name="notice-force" value="是" data-force-radio ${state.form.force === '是' ? 'checked' : ''}>是</label><label><input type="radio" name="notice-force" value="否" data-force-radio ${state.form.force !== '是' ? 'checked' : ''}>否</label></div></div>
        <p class="notice-help">若开启强制弹框，接收对象在每次登录系统时，会强制以弹框形式将公告展示给接收对象，直至失效时间。</p>
        <div class="notice-form-field notice-date-field notice-expire-field ${state.form.force === '是' ? '' : 'is-hidden'}" data-expiry-field><label for="noticeExpiry">失效时间</label><div class="notice-date-input-wrap notice-form-date"><input id="noticeExpiry" type="text" data-form="expire" placeholder="请选择日期" readonly value="${esc(state.form.expire)}">${calendarIcon}</div></div>
        <div class="notice-form-field required notice-content-field"><label>公告内容</label><div class="notice-editor"><div class="notice-editor-toolbar" role="toolbar" aria-label="公告内容编辑工具栏">
          ${renderToolbarButton('formatBlock:BLOCKQUOTE', '引用', quoteIcon)}${renderToolbarButton('formatBlock:H1', '一级标题', 'H1')}${renderToolbarButton('formatBlock:H2', '二级标题', 'H2')}${renderToolbarButton('formatBlock:H3', '三级标题', 'H3')}
          <span class="notice-editor-separator" aria-hidden="true"></span>${renderToolbarButton('bold', '加粗', '<strong>B</strong>')}${renderToolbarButton('underline', '下划线', '<u>U</u>')}${renderToolbarButton('italic', '斜体', '<em>I</em>')}${renderToolbarButton('strikeThrough', '删除线', '<s>S</s>')}
          ${renderToolbarDropdown('foreColor:#5f6672', '文字颜色', '<span class="notice-editor-color-mark">A</span>', 'notice-editor-color-dropdown')}${renderToolbarDropdown('formatBlock:P', '默认字体', '默认字体', 'notice-font-family')}${renderToolbarDropdown('hiliteColor:#fff2cc', '背景颜色', '<span class="notice-editor-highlight-mark">A</span>', 'notice-editor-highlight-dropdown')}
          <span class="notice-editor-separator" aria-hidden="true"></span>${renderToolbarButton('justifyLeft', '左对齐', alignLeftIcon)}${renderToolbarButton('justifyCenter', '居中', alignCenterIcon)}${renderToolbarButton('justifyRight', '右对齐', alignRightIcon)}${renderToolbarButton('justifyFull', '两端对齐', alignJustifyIcon)}${renderToolbarButton('insertUnorderedList', '无序列表', '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>')}${renderToolbarButton('insertOrderedList', '有序列表', '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h1v5"/><path d="M3 10h3"/><path d="M3 14h2a1 1 0 0 1 0 2H3l2 2H3"/><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/></svg>')}
          ${renderToolbarButton('createLink', '插入链接', linkIcon)}${renderToolbarButton('insertTable', '插入表格', tableIcon)}${renderToolbarButton('undo', '撤销', undoIcon)}${renderToolbarButton('redo', '重做', redoIcon)}
        </div><div class="notice-editor-area" contenteditable="true" data-editor="content" data-placeholder="请输入内容...">${state.form.content}</div></div></div>
        <div class="notice-form-field notice-attachment-field"><label>公告附件</label><div class="notice-attachment-content"><div class="notice-attachment-toolbar"><button class="btn btn-primary btn-sm" type="button" data-action="upload-attachment">上传附件</button><input type="file" hidden multiple data-attachment-input accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"></div><ul class="notice-attachment-list" data-attachment-list></ul><p>在公告内容浏览时会显示上传的附件。</p><p>支持pdf、doc、docx、xls、xlsx、ppt、pptx格式文件；文件大小不超过200M。</p></div></div>
      </div>
      <div class="notice-form-actions"><button class="btn btn-sm" type="button" data-action="back">返回</button><button class="btn btn-sm" type="button" data-action="preview-form">预览</button><button class="btn btn-sm" type="button" data-action="save-form">保存</button><button class="btn btn-primary btn-sm" type="button" data-action="save-publish-form">保存并发布</button></div>
    </section>`;
    const expiry = root.querySelector('[data-form="expire"]');
    if (state.form.force === '是') createDatePicker(expiry, 'form');
    renderAttachmentList();
  }

  function openModal(markup) {
    root.insertAdjacentHTML('beforeend', markup);
  }

  function closeModal(mask) {
    destroyPickers('modal');
    mask?.remove();
  }

  function openForceModal(row) {
    closeModal(root.querySelector('[data-modal]'));
    openModal(`<div class="notice-modal-mask" data-modal="force" role="dialog" aria-modal="true"><section class="notice-modal notice-operation-modal"><header><h3>强制弹窗</h3><button type="button" data-action="close-modal" aria-label="关闭">×</button></header><div class="notice-modal-body"><div class="notice-modal-field required"><label>强制弹框</label><div class="notice-radio-group"><label><input type="radio" checked>是</label><label><input type="radio">否</label></div></div><p class="notice-help">若开启强制弹框，接收对象在每次登录系统时，会强制以弹框形式将公告展示给接收对象，直至失效时间。</p><div class="notice-modal-field notice-date-field required"><label for="forceExpire">失效时间</label><div class="notice-date-input-wrap notice-form-date"><input id="forceExpire" type="text" readonly value="${esc(row.expire || todayPlus(7))}">${calendarIcon}</div></div></div><footer><button class="btn btn-sm" type="button" data-action="close-modal">取消</button><button class="btn btn-primary btn-sm" type="button" data-action="confirm-force">确定</button></footer></section></div>`);
    createDatePicker(root.querySelector('#forceExpire'), 'modal');
  }

  function openRetractModal(row) {
    openModal(`<div class="notice-modal-mask" data-modal="retract" role="dialog" aria-modal="true"><section class="notice-modal notice-confirm-modal"><header><h3>撤回公告</h3><button type="button" data-action="close-modal" aria-label="关闭">×</button></header><div class="notice-modal-body"><p>确定撤回“${esc(row.title)}”吗？撤回后接收对象将不再看到此公告。</p></div><footer><button class="btn btn-sm" type="button" data-action="close-modal">取消</button><button class="btn btn-primary btn-sm" type="button" data-action="confirm-retract" data-id="${esc(row.id)}">确定</button></footer></section></div>`);
  }

  function openPreviewModal() {
    syncFormState();
    const body = state.form.content || '<p class="notice-preview-empty">暂无公告内容</p>';
    const recipients = state.form.recipients.length ? state.form.recipients.join('、') : '未选择';
    openModal(`<div class="notice-modal-mask" data-modal="preview" role="dialog" aria-modal="true"><section class="notice-modal notice-preview-modal"><header><h3>预览</h3><button type="button" data-action="close-modal" aria-label="关闭">×</button></header><div class="notice-preview-body"><h2>${esc(state.form.title || '未填写标题')}</h2><div class="notice-preview-meta">接收对象：${esc(recipients)}${state.form.force === '是' ? `　失效时间：${esc(state.form.expire || '--')}` : ''}</div><article>${body}</article>${state.form.attachments.length ? `<div class="notice-preview-attachments"><strong>附件：</strong>${state.form.attachments.map((file) => `<span>${esc(file.name)}</span>`).join('')}</div>` : ''}</div><footer><button class="btn btn-primary btn-sm" type="button" data-action="close-modal">关闭</button></footer></section></div>`);
  }

  function syncFormState() {
    if (state.view !== 'form') return;
    state.form.title = root.querySelector('[data-form="title"]')?.value?.trim() || '';
    state.form.recipients = [...root.querySelectorAll('[data-recipient]:checked')].map((input) => input.dataset.recipient);
    state.form.force = root.querySelector('[data-force-radio]:checked')?.value || '否';
    state.form.expire = root.querySelector('[data-form="expire"]')?.value || '';
    state.form.content = root.querySelector('[data-editor="content"]')?.innerHTML || '';
  }

  function saveForm(publish) {
    syncFormState();
    const contentText = root.querySelector('[data-editor="content"]')?.innerText?.trim() || '';
    if (!state.form.title) { showToast('请填写公告标题', true); return; }
    if (!state.form.recipients.length) { showToast('请选择至少一个接收对象', true); return; }
    if (!contentText) { showToast('请填写公告内容', true); return; }
    if (state.form.force === '是' && !state.form.expire) { showToast('请选择失效时间', true); return; }
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const row = {
      id: `NOTICE-${Date.now()}`,
      title: state.form.title,
      recipients: state.form.recipients.map((name) => ({ name, read: 0, total: 1 })),
      force: state.form.force,
      expire: state.form.force === '是' ? state.form.expire : '',
      time,
      publisher: '管理员',
      status: publish ? '已发布' : '未发布',
      content: state.form.content,
      attachments: state.form.attachments.map((file) => ({ ...file }))
    };
    state.rows.unshift(row);
    state.selected.clear();
    state.filters = { title: '', startDate: '', endDate: '', status: '' };
    state.statusDraft = '';
    state.page = 1;
    renderListView();
    showToast(publish ? '公告已保存并发布' : '公告已保存');
  }

  function selectedRow(id) {
    return state.rows.find((row) => row.id === id);
  }

  function handleEditorCommand(command) {
    const editor = root.querySelector('[data-editor="content"]');
    if (!editor) return;
    editor.focus();
    if (command.startsWith('formatBlock:')) document.execCommand('formatBlock', false, command.split(':')[1]);
    else if (command.startsWith('foreColor:')) document.execCommand('foreColor', false, command.split(':')[1]);
    else if (command.startsWith('hiliteColor:')) document.execCommand('hiliteColor', false, command.split(':')[1]);
    else if (command === 'createLink') {
      const url = window.prompt('请输入链接地址', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else if (command === 'insertTable') {
      document.execCommand('insertHTML', false, '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><br></p>');
    } else document.execCommand(command, false, null);
    state.form.content = editor.innerHTML;
  }

  root.addEventListener('input', (event) => {
    if (event.target.matches('[data-editor="content"]')) state.form.content = event.target.innerHTML;
    if (event.target.matches('[data-form="title"]')) state.form.title = event.target.value;
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-action="page-size"]')) {
      state.pageSize = Number(event.target.value) || 10;
      state.page = 1;
      renderListRows();
    }
    if (event.target.matches('[data-recipient]')) {
      state.form.recipients = [...root.querySelectorAll('[data-recipient]:checked')].map((input) => input.dataset.recipient);
    }
    if (event.target.matches('[data-force-radio]')) {
      state.form.force = event.target.value;
      const field = root.querySelector('[data-expiry-field]');
      field?.classList.toggle('is-hidden', state.form.force !== '是');
      if (state.form.force === '是' && !root.querySelector('[data-form="expire"]')?.value) {
        state.form.expire = todayPlus(7);
        renderFormView();
      } else if (state.form.force !== '是') {
        state.form.expire = '';
        destroyPickers('form');
      }
    }
    if (event.target.matches('[data-attachment-input]')) {
      state.form.attachments = [...event.target.files].map((file) => ({ name: file.name, size: file.size }));
      renderAttachmentList();
    }
  });

  root.addEventListener('click', (event) => {
    const editorCommand = event.target.closest('[data-editor-command]')?.dataset.editorCommand;
    if (editorCommand) { handleEditorCommand(editorCommand); return; }
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'add-notice') { state.form = { title: '', recipients: [], force: '否', expire: '', content: '', attachments: [] }; renderFormView(); return; }
    if (action === 'back') { renderListView(); return; }
    if (action === 'recipient-tab') { const row = selectedRow(state.recipientDetail.rowId); if (row) renderRecipientDetailView(row, actionEl.dataset.recipient || '学校'); return; }
    if (action === 'recipient-query') {
      state.recipientDetail.filters.name = root.querySelector('[data-recipient-filter="name"]')?.value || '';
      state.recipientDetail.filters.status = root.querySelector('[data-recipient-filter="status"]')?.value || '';
      state.recipientDetail.page = 1;
      renderRecipientDetailRows();
      return;
    }
    if (action === 'recipient-reset') {
      state.recipientDetail.filters = { name: '', status: '' };
      state.recipientDetail.page = 1;
      const recipientNameFilter = root.querySelector('[data-recipient-filter="name"]');
      const recipientStatusFilter = root.querySelector('[data-recipient-filter="status"]');
      if (recipientNameFilter) recipientNameFilter.value = '';
      if (recipientStatusFilter) recipientStatusFilter.value = '';
      renderRecipientDetailRows();
      return;
    }
    if (action === 'query') {
      state.filters.title = root.querySelector('[data-filter="title"]')?.value?.trim() || '';
      state.filters.startDate = root.querySelector('[data-date-start]')?.value || '';
      state.filters.endDate = root.querySelector('[data-date-end]')?.value || '';
      state.filters.status = state.statusDraft || '';
      state.page = 1;
      renderListRows();
      return;
    }
    if (action === 'reset') { state.filters = { title: '', startDate: '', endDate: '', status: '' }; state.statusDraft = ''; state.page = 1; state.selected.clear(); renderListView(); return; }
    if (action === 'toggle-status') {
      const menu = root.querySelector('.notice-select-menu');
      const trigger = actionEl;
      const open = menu?.hidden;
      if (menu) menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(Boolean(open)));
      return;
    }
    if (action === 'select-status') {
      state.statusDraft = actionEl.dataset.status || '';
      root.querySelector('[data-status-label]').textContent = state.statusDraft || '全部';
      root.querySelector('.notice-select-menu').hidden = true;
      root.querySelector('[data-action="toggle-status"]')?.setAttribute('aria-expanded', 'false');
      return;
    }
    if (action === 'toggle-page') {
      const rows = getFilteredRows().slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
      const shouldSelect = rows.some((row) => !state.selected.has(row.id));
      rows.forEach((row) => shouldSelect ? state.selected.add(row.id) : state.selected.delete(row.id));
      renderListRows();
      return;
    }
    if (action === 'toggle-row') {
      const id = actionEl.dataset.id;
      if (actionEl.checked) state.selected.add(id); else state.selected.delete(id);
      renderListRows();
      return;
    }
    if (action === 'page') { state.page = Number(actionEl.dataset.page) || 1; renderListRows(); return; }
    if (action === 'jump-page') { state.page = Number(actionEl.value) || 1; renderListRows(); return; }
    if (action === 'preview-row') { const row = selectedRow(actionEl.dataset.id); if (row) renderNoticePreviewView(row); return; }
    if (action === 'show-recipient') { const row = selectedRow(actionEl.dataset.id); if (row) renderRecipientDetailView(row, actionEl.dataset.recipient || '学校'); return; }
    if (action === 'force-row') { const row = selectedRow(actionEl.dataset.id); if (row) openForceModal(row); return; }
    if (action === 'retract-row') { const row = selectedRow(actionEl.dataset.id); if (row?.status === '已发布') openRetractModal(row); return; }
    if (action === 'confirm-retract') { const row = selectedRow(actionEl.dataset.id); if (row) row.status = '已撤回'; closeModal(actionEl.closest('[data-modal]')); renderListRows(); showToast('公告已撤回'); return; }
    if (action === 'edit-row') { const row = selectedRow(actionEl.dataset.id); if (row) { showToast('已进入公告编辑'); state.form.title = row.title; state.form.recipients = row.recipients.map((item) => item.name); state.form.force = row.force; state.form.expire = row.expire; state.form.content = row.content || ''; state.form.attachments = Array.isArray(row.attachments) ? row.attachments.map((file) => ({ ...file })) : []; renderFormView(); } return; }
    if (action === 'delete-row') { const row = selectedRow(actionEl.dataset.id); if (row?.status !== '已发布') { state.rows = state.rows.filter((item) => item.id !== row.id); renderListRows(); showToast('公告已删除'); } return; }
    if (action === 'batch-delete') { if (!state.selected.size) { showToast('请先选择公告', true); return; } state.rows = state.rows.filter((row) => !state.selected.has(row.id)); state.selected.clear(); renderListRows(); showToast('已删除选中的公告'); return; }
    if (action === 'upload-attachment') { root.querySelector('[data-attachment-input]')?.click(); return; }
    if (action === 'remove-attachment') { state.form.attachments.splice(Number(actionEl.dataset.attachmentIndex), 1); renderAttachmentList(); return; }
    if (action === 'preview-form') { openPreviewModal(); return; }
    if (action === 'save-form') { saveForm(false); return; }
    if (action === 'save-publish-form') { saveForm(true); return; }
    if (action === 'close-modal') { closeModal(actionEl.closest('[data-modal]')); return; }
    if (action === 'confirm-force') { closeModal(actionEl.closest('[data-modal]')); showToast('已发送强制弹窗'); return; }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('[data-jump-page]')) { event.preventDefault(); state.page = Number(event.target.value) || 1; renderListRows(); }
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) return;
    if (!event.target.closest('[data-status-select]')) {
      const menu = root.querySelector('.notice-select-menu');
      if (menu) menu.hidden = true;
      root.querySelector('[data-action="toggle-status"]')?.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal(root.querySelector('[data-modal]'));
  });

  renderListView();
})();
