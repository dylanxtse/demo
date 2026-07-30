(function () {
  let instanceCount = 0;

  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function resolveElement(value) {
    return typeof value === 'string' ? document.querySelector(value) : value;
  }

  function create(options = {}) {
    const container = resolveElement(options.container);
    const displayInput = resolveElement(options.displayInput) || container?.querySelector('.date-range-display');
    const startInput = resolveElement(options.startInput) || container?.querySelector('[data-date-start]');
    const endInput = resolveElement(options.endInput) || container?.querySelector('[data-date-end]');
    if (!container || !displayInput) return null;

    const panel = document.createElement('div');
    const panelId = options.panelId || `dateRangePanel${++instanceCount}`;
    panel.id = panelId;
    panel.className = 'calendar-panel cal-dual';
    document.body.appendChild(panel);

    const state = { leftYear: 0, leftMonth: 0, rightYear: 0, rightMonth: 0, startDate: startInput?.value || '', endDate: endInput?.value || '' };

    function renderMonth(year, month, side) {
      const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const firstDay = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = formatDate(new Date());
      let cells = '';
      for (let i = 0; i < firstDay.getDay(); i += 1) cells += '<td class="cal-empty"></td>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let className = 'cal-day';
        if (date === today) className += ' cal-today';
        if (date === state.startDate) className += ' cal-start';
        if (date === state.endDate) className += ' cal-end';
        if (state.startDate && state.endDate && date > state.startDate && date < state.endDate) className += ' cal-in-range';
        cells += `<td class="${className}" data-date="${date}">${day}</td>`;
      }
      const remaining = (7 - ((firstDay.getDay() + daysInMonth) % 7)) % 7;
      for (let i = 0; i < remaining; i += 1) cells += '<td class="cal-empty"></td>';
      const cellArray = cells.split('</td>');
      const rows = [];
      for (let i = 0; i < cellArray.length - 1; i += 7) rows.push(`<tr>${cellArray.slice(i, i + 7).join('</td>')}</td></tr>`);
      return `<div class="cal-header"><button class="cal-nav" type="button" data-action="drp-prev-year" data-side="${side}">‹</button><button class="cal-nav" type="button" data-action="drp-prev" data-side="${side}">‹</button><span class="cal-title">${year}年 ${monthNames[month]}</span><button class="cal-nav" type="button" data-action="drp-next" data-side="${side}">›</button><button class="cal-nav" type="button" data-action="drp-next-year" data-side="${side}">›</button></div><table class="cal-table"><thead><tr>${weekDays.map((day) => `<th>${day}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
    }

    function updateDisplay() {
      displayInput.value = state.startDate && state.endDate ? `${state.startDate} ~ ${state.endDate}` : state.startDate ? `${state.startDate} ~` : state.endDate ? `~ ${state.endDate}` : '';
      if (startInput) startInput.value = state.startDate;
      if (endInput) endInput.value = state.endDate;
    }

    function emitChange() {
      options.onChange?.({ startDate: state.startDate, endDate: state.endDate, complete: Boolean(state.startDate && state.endDate) });
    }

    function render() {
      panel.innerHTML = `<div class="cal-dual-body"><div class="cal-panel cal-panel-left">${renderMonth(state.leftYear, state.leftMonth, 'left')}</div><div class="cal-divider"></div><div class="cal-panel cal-panel-right">${renderMonth(state.rightYear, state.rightMonth, 'right')}</div></div><div class="cal-footer"><span class="cal-hint">${options.hintText || '先选开始日期，再选结束日期'}</span><div class="cal-btns"><button class="btn btn-sm" type="button" data-action="drp-clear">清空</button></div></div>`;
      updateDisplay();
    }

    function shift(side, direction) {
      const yearKey = side === 'left' ? 'leftYear' : 'rightYear';
      const monthKey = side === 'left' ? 'leftMonth' : 'rightMonth';
      state[monthKey] += direction === 'prev' ? -1 : 1;
      if (state[monthKey] < 0) { state[monthKey] = 11; state[yearKey] -= 1; }
      if (state[monthKey] > 11) { state[monthKey] = 0; state[yearKey] += 1; }
      render();
    }

    function shiftYear(side, direction) {
      const yearKey = side === 'left' ? 'leftYear' : 'rightYear';
      state[yearKey] += direction === 'prev' ? -1 : 1;
      render();
    }

    function open() {
      const now = new Date();
      state.leftYear = now.getFullYear(); state.leftMonth = now.getMonth();
      state.rightYear = now.getFullYear(); state.rightMonth = (now.getMonth() + 1) % 12;
      if (now.getMonth() === 11) state.rightYear += 1;
      state.startDate = startInput?.value || state.startDate;
      state.endDate = endInput?.value || state.endDate;
      const rect = displayInput.getBoundingClientRect();
      panel.style.top = `${rect.bottom + 4}px`;
      panel.style.left = `${rect.left}px`;
      panel.classList.add('is-visible');
      render();
    }

    function close() { panel.classList.remove('is-visible'); }

    function onPanelClick(event) {
      event.stopPropagation();
      const actionEl = event.target.closest('[data-action]');
      const action = actionEl?.dataset.action;
      if (action === 'drp-prev' || action === 'drp-next') { shift(actionEl.dataset.side, action === 'drp-prev' ? 'prev' : 'next'); return; }
      if (action === 'drp-prev-year' || action === 'drp-next-year') { shiftYear(actionEl.dataset.side, action === 'drp-prev-year' ? 'prev' : 'next'); return; }
      if (action === 'drp-clear') { state.startDate = ''; state.endDate = ''; updateDisplay(); close(); emitChange(); return; }
      const day = event.target.closest('.cal-day');
      if (!day) return;
      const date = day.dataset.date;
      if (!state.startDate || state.endDate) { state.startDate = date; state.endDate = ''; render(); }
      else if (date < state.startDate) { state.startDate = date; render(); }
      else { state.endDate = date; updateDisplay(); close(); emitChange(); }
    }

    displayInput.addEventListener('click', (event) => { event.stopPropagation(); panel.classList.contains('is-visible') ? close() : open(); });
    panel.addEventListener('click', onPanelClick);
    const onDocumentClick = (event) => { if (panel.classList.contains('is-visible') && !panel.contains(event.target) && !container.contains(event.target)) close(); };
    document.addEventListener('click', onDocumentClick);

    updateDisplay();
    return {
      getValue: () => ({ startDate: state.startDate, endDate: state.endDate }),
      setValue(startDate = '', endDate = '', emit = true) { state.startDate = startDate; state.endDate = endDate; updateDisplay(); if (emit) emitChange(); },
      clear(emit = true) { this.setValue('', '', emit); },
      destroy() { close(); panel.remove(); document.removeEventListener('click', onDocumentClick); }
    };
  }

  function createSingle(options = {}) {
    const input = resolveElement(options.input || options.displayInput);
    if (!input) return null;

    const panel = document.createElement('div');
    const panelId = options.panelId || `datePickerPanel${++instanceCount}`;
    panel.id = panelId;
    panel.className = 'calendar-panel single-calendar-panel';
    document.body.appendChild(panel);

    const state = { year: 0, month: 0, date: input.value || '' };
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    function render() {
      const firstDay = new Date(state.year, state.month, 1);
      const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
      const today = formatDate(new Date());
      let cells = '';
      for (let i = 0; i < firstDay.getDay(); i += 1) cells += '<td class="cal-empty"></td>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = `${state.year}-${String(state.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let className = 'cal-day';
        if (date === today) className += ' cal-today';
        if (date === state.date) className += ' cal-start';
        cells += `<td class="${className}" data-date="${date}">${day}</td>`;
      }
      const remaining = (7 - ((firstDay.getDay() + daysInMonth) % 7)) % 7;
      for (let i = 0; i < remaining; i += 1) cells += '<td class="cal-empty"></td>';
      const cellArray = cells.split('</td>');
      const rows = [];
      for (let i = 0; i < cellArray.length - 1; i += 7) rows.push(`<tr>${cellArray.slice(i, i + 7).join('</td>')}</td></tr>`);
      panel.innerHTML = `<div class="cal-header"><button class="cal-nav" type="button" data-action="dp-prev-year">‹</button><button class="cal-nav" type="button" data-action="dp-prev">‹</button><span class="cal-title">${state.year}年 ${monthNames[state.month]}</span><button class="cal-nav" type="button" data-action="dp-next">›</button><button class="cal-nav" type="button" data-action="dp-next-year">›</button></div><table class="cal-table"><thead><tr>${weekDays.map((day) => `<th>${day}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table><div class="cal-footer"><span class="cal-hint">请选择日期</span><div class="cal-btns"><button class="btn btn-sm" type="button" data-action="dp-clear">清空</button></div></div>`;
    }

    function open() {
      const value = input.value || state.date;
      if (value) {
        const parts = value.split('-');
        state.year = Number(parts[0]);
        state.month = Number(parts[1]) - 1;
      } else {
        const now = new Date();
        state.year = now.getFullYear();
        state.month = now.getMonth();
      }
      state.date = value;
      const rect = input.getBoundingClientRect();
      panel.style.top = `${rect.bottom + 4}px`;
      panel.style.left = `${rect.left}px`;
      panel.classList.add('is-visible');
      render();
    }

    function close() { panel.classList.remove('is-visible'); }
    function emitChange() { options.onChange?.(state.date); }
    function shift(direction, yearOnly = false) {
      if (yearOnly) state.year += direction === 'prev' ? -1 : 1;
      else {
        state.month += direction === 'prev' ? -1 : 1;
        if (state.month < 0) { state.month = 11; state.year -= 1; }
        if (state.month > 11) { state.month = 0; state.year += 1; }
      }
      render();
    }

    input.addEventListener('click', (event) => { event.stopPropagation(); panel.classList.contains('is-visible') ? close() : open(); });
    panel.addEventListener('click', (event) => {
      event.stopPropagation();
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'dp-prev' || action === 'dp-next') { shift(action === 'dp-prev' ? 'prev' : 'next'); return; }
      if (action === 'dp-prev-year' || action === 'dp-next-year') { shift(action === 'dp-prev-year' ? 'prev' : 'next', true); return; }
      if (action === 'dp-clear') { state.date = ''; input.value = ''; close(); emitChange(); return; }
      const day = event.target.closest('.cal-day');
      if (!day) return;
      state.date = day.dataset.date;
      input.value = state.date;
      close();
      emitChange();
    });
    const onDocumentClick = (event) => { if (panel.classList.contains('is-visible') && !panel.contains(event.target) && event.target !== input) close(); };
    document.addEventListener('click', onDocumentClick);

    return {
      getValue: () => state.date,
      open,
      close,
      setValue(value = '', emit = true) { state.date = value; input.value = value; if (emit) emitChange(); },
      clear(emit = true) { this.setValue('', emit); },
      destroy() { close(); panel.remove(); document.removeEventListener('click', onDocumentClick); }
    };
  }

  window.DateRangePicker = { create, mount: create };
  window.DatePicker = { create: createSingle, mount: createSingle };
})();
