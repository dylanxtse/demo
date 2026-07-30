(function () {
  const service = window.OperationsService;
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'add';
  const recordId = params.get('id') || '';
  const catalog = [
    { id: 'GOOD-001', goodsName: '大白菜（斤/--/散装）', unit: '斤', agreementPrice: 2.10, lastPrice: 2.20, marketPrice: 2.35 },
    { id: 'GOOD-002', goodsName: '鸡蛋（斤/--/散装）', unit: '斤', agreementPrice: 5.60, lastPrice: 5.80, marketPrice: 6.00 },
    { id: 'GOOD-003', goodsName: '大米（KG/丰谷/25KG）', unit: 'KG', agreementPrice: 4.20, lastPrice: 4.30, marketPrice: 4.50 },
    { id: 'GOOD-004', goodsName: '鲫鱼（斤/--/鲜活）', unit: '斤', agreementPrice: 14.50, lastPrice: 14.80, marketPrice: 15.20 },
    { id: 'GOOD-005', goodsName: '西红柿（KG/--/散装）', unit: 'KG', agreementPrice: 3.60, lastPrice: 3.80, marketPrice: 4.00 }
  ];
  const canteens = {
    第一实验学校: ['第一食堂', '第二食堂'],
    阳光幼儿园: ['园区食堂'],
    育才中学: ['高中部食堂', '初中部食堂'],
    机关第二食堂: ['二号食堂']
  };
  const modeTitles = { add: '添加订单', edit: '编辑订单', audit: '审核订单', confirm: '确认供货', copy: '复制订单' };
  const readonlyMode = mode === 'audit' || mode === 'confirm';
  let currentRecord = null;
  let goodsItems = [];

  const template = document.getElementById('orderAddTemplate');
  const root = window.AppShell.mount({ title: '订单管理', content: template.innerHTML });
  const form = document.getElementById('orderAddForm');
  const status = document.getElementById('orderFormStatus');
  const overlay = document.getElementById('orderFormOverlay');
  const goodsBody = document.getElementById('goodsTableBody');
  document.getElementById('orderPageTitle').textContent = modeTitles[mode] || modeTitles.add;
  document.title = `${modeTitles[mode] || modeTitles.add} - 集采企业版企业端`;

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function money(value) {
    return Number(value || 0).toFixed(2);
  }

  function backToList(flag) {
    window.location.href = `./order-management.html${flag ? `?${flag}=1` : ''}`;
  }

  function toast(message, error) {
    status.textContent = message;
    status.className = `order-form-status is-visible${error ? ' error' : ''}`;
    window.setTimeout(() => { status.className = 'order-form-status'; }, 2400);
  }

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach((element) => { element.textContent = ''; });
    form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid'));
    document.getElementById('goodsTableError').textContent = '';
  }

  function refreshCanteens(selected) {
    const customer = form.elements.customerName.value;
    const options = canteens[customer] || [];
    form.elements.canteen.innerHTML = `<option value="">请选择食堂</option>${options.map((name) => `<option ${name === selected ? 'selected' : ''}>${name}</option>`).join('')}`;
  }

  function normalizedItem(item) {
    const source = catalog.find((entry) => entry.id === (item.goodsId || item.id)) || {};
    return {
      id: String(item.id || '').startsWith('LINE-') ? item.id : `LINE-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      goodsId: item.goodsId || source.id || '',
      goodsName: item.goodsName || source.goodsName || '',
      unit: item.unit || source.unit || '',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice ?? item.agreementPrice ?? source.agreementPrice ?? 0),
      agreementPrice: Number(item.agreementPrice ?? source.agreementPrice ?? 0),
      lastPrice: Number(item.lastPrice ?? source.lastPrice ?? 0),
      marketPrice: Number(item.marketPrice ?? source.marketPrice ?? 0),
      remark: item.remark || ''
    };
  }

  function renderGoods() {
    if (!goodsItems.length) {
      goodsBody.innerHTML = '<tr><td class="empty-goods" colspan="12">请点击“批量添加商品”添加订单商品</td></tr>';
    } else {
      goodsBody.innerHTML = goodsItems.map((item, index) => `
        <tr data-line-id="${escapeHtml(item.id)}">
          <td>${index + 1}</td>
          <td><span class="goods-thumb">暂无图片</span></td>
          <td class="goods-name-cell">${escapeHtml(item.goodsName)}</td>
          <td>${escapeHtml(item.unit)}</td>
          <td><input class="table-input" data-field="quantity" type="number" min="0.01" step="0.01" value="${item.quantity}" ${readonlyMode ? 'disabled' : ''}></td>
          <td><input class="table-input" data-field="unitPrice" type="number" min="0" step="0.01" value="${money(item.unitPrice)}" ${readonlyMode ? 'disabled' : ''}></td>
          <td class="line-subtotal">${money(item.quantity * item.unitPrice)}</td>
          <td>${money(item.agreementPrice)}</td>
          <td>${money(item.lastPrice)}</td>
          <td>${money(item.marketPrice)}</td>
          <td><input class="table-input remark-input" data-field="remark" value="${escapeHtml(item.remark)}" placeholder="请输入备注" ${readonlyMode ? 'disabled' : ''}></td>
          <td>${readonlyMode ? '--' : '<button class="btn-text danger" type="button" data-remove-line>删除</button>'}</td>
        </tr>`).join('');
    }
    document.getElementById('goodsTotal').textContent = money(goodsItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  }

  function openGoodsModal() {
    overlay.innerHTML = `<div class="operations-modal-backdrop"><section class="operations-modal goods-picker-modal" role="dialog" aria-modal="true" aria-label="批量添加商品">
      <header class="operations-modal-header"><h3>批量添加商品</h3><button data-overlay-close aria-label="关闭">×</button></header>
      <div class="operations-modal-body"><div class="goods-picker-list">
        <div class="goods-picker-row goods-picker-header"><span>选择</span><span>商品名称（计量单位/品牌/规格）</span><span>单位</span><span>下单数量</span></div>
        ${catalog.map((item) => {
          const exists = goodsItems.some((line) => line.goodsId === item.id);
          return `<div class="goods-picker-row">
            <input type="checkbox" value="${item.id}" ${exists ? 'disabled' : ''}>
            <span>${escapeHtml(item.goodsName)}</span>
            <span>${escapeHtml(item.unit)}</span>
            ${exists ? '<span class="picker-already-tag">已添加</span>' : '<input type="number" class="picker-qty-input" min="0.01" step="0.01" placeholder="请输入数量">'}
          </div>`;
        }).join('')}
      </div></div>
      <footer class="operations-modal-footer"><button class="btn" data-overlay-close>取消</button><button class="btn btn-primary" id="confirmGoods">添加</button></footer>
    </section></div>`;
  }

  function closeOverlay() {
    overlay.innerHTML = '';
  }

  function readData(statusValue) {
    return {
      customerName: form.elements.customerName.value,
      canteen: form.elements.canteen.value,
      expectedAt: form.elements.expectedAt.value.replace('T', ' '),
      orderTag: form.elements.orderTag.value,
      remark: form.elements.remark.value.trim(),
      items: goodsItems.map((item) => ({ ...item, subtotal: Number((item.quantity * item.unitPrice).toFixed(2)) })),
      orderAmount: Number(goodsItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)),
      productCount: goodsItems.length,
      status: statusValue,
      customerType: currentRecord?.customerType || '--',
      warehouse: currentRecord?.warehouse || '--',
      supplement: currentRecord?.supplement || '否',
      route: currentRecord?.route || '--',
      source: currentRecord?.source || '平台添加',
      creator: currentRecord?.creator || '当前用户',
      receiptStatus: currentRecord?.receiptStatus || '待收货',
      shippingAmount: currentRecord?.shippingAmount || 0,
      returnAmount: currentRecord?.returnAmount || 0,
      reconciliationAmount: currentRecord?.reconciliationAmount || 0,
      driver: currentRecord?.driver || ''
    };
  }

  function validate() {
    clearErrors();
    const messages = {
      customerName: '请选择客户!',
      expectedAt: '请选择期望送达时间!',
      canteen: '请选择食堂!',
      orderTag: '请选择订单标签!'
    };
    let first = null;
    Object.entries(messages).forEach(([key, message]) => {
      if (!form.elements[key].value) {
        form.querySelector(`[data-error-for="${key}"]`).textContent = message;
        form.elements[key].setAttribute('aria-invalid', 'true');
        first ||= form.elements[key];
      }
    });
    if (!goodsItems.length) {
      document.getElementById('goodsTableError').textContent = '请至少添加一个商品';
      first ||= document.getElementById('batchAddGoods');
    }
    const invalidLine = goodsItems.find((item) => !(item.quantity > 0) || !(item.unitPrice >= 0));
    if (invalidLine) {
      document.getElementById('goodsTableError').textContent = '请完整填写商品下单数量和下单单价';
      first ||= goodsBody.querySelector(`[data-line-id="${invalidLine.id}"] input`);
    }
    first?.focus();
    return !first;
  }

  async function persist(statusValue) {
    if (!validate()) return;
    const data = readData(statusValue);
    const overLimit = goodsItems.find((item) => item.marketPrice > 0 && item.unitPrice > item.marketPrice);
    if (overLimit && statusValue !== 'DRAFT') {
      overlay.innerHTML = `<div class="operations-modal-backdrop"><section class="operations-modal compact-modal" role="dialog" aria-label="限价提示">
        <header class="operations-modal-header"><h3>限价提示</h3><button data-overlay-close>×</button></header>
        <div class="operations-modal-body"><p>当前“${escapeHtml(overLimit.goodsName)}”价格超出教育局设置的限价范围，是否继续保存？</p></div>
        <footer class="operations-modal-footer"><button class="btn" data-overlay-close>取消</button><button class="btn btn-primary" id="continueSave">继续提交</button></footer>
      </section></div>`;
      document.getElementById('continueSave').onclick = () => { closeOverlay(); doPersist(data); };
      return;
    }
    await doPersist(data);
  }

  async function doPersist(data) {
    try {
      if (recordId && mode !== 'copy') await service.update('orders', recordId, data);
      else await service.create('orders', data);
      backToList(mode === 'edit' ? 'updated' : 'created');
    } catch (error) {
      toast(error.message || '订单保存失败', true);
    }
  }

  function rejectOrder() {
    overlay.innerHTML = `<div class="operations-modal-backdrop"><section class="operations-modal compact-modal" role="dialog" aria-label="驳回订单">
      <header class="operations-modal-header"><h3>审核</h3><button data-overlay-close>×</button></header>
      <div class="operations-modal-body"><label class="dialog-field required">驳回原因<textarea id="rejectReason" class="form-control" rows="4" placeholder="请输入驳回原因"></textarea><span id="rejectError" class="field-error"></span></label></div>
      <footer class="operations-modal-footer"><button class="btn" data-overlay-close>取消</button><button class="btn btn-primary" id="confirmReject">确定</button></footer>
    </section></div>`;
    document.getElementById('confirmReject').onclick = async () => {
      const reason = document.getElementById('rejectReason').value.trim();
      if (!reason) return (document.getElementById('rejectError').textContent = '请输入驳回原因!');
      await service.update('orders', recordId, { status: 'REJECTED', rejectReason: reason, auditAt: new Date().toISOString().slice(0, 16).replace('T', ' '), auditor: '当前用户' });
      backToList('reviewed');
    };
  }

  function configureMode() {
    document.getElementById('draftButton').hidden = readonlyMode;
    document.getElementById('rejectButton').hidden = mode !== 'audit';
    document.getElementById('batchAddGoods').hidden = readonlyMode;
    const primary = document.getElementById('primaryButton');
    if (mode === 'audit') {
      primary.textContent = '通过';
      primary.dataset.action = 'approve';
    } else if (mode === 'confirm') {
      primary.textContent = '确认';
      primary.dataset.action = 'confirm';
    } else {
      primary.textContent = '保存订单';
    }
    if (readonlyMode) form.querySelectorAll('input, select, textarea').forEach((control) => { control.disabled = true; });
  }

  async function loadRecord() {
    if (!recordId) {
      goodsItems = [normalizedItem(catalog[0])];
      renderGoods();
      configureMode();
      return;
    }
    currentRecord = await service.get('orders', recordId);
    if (!currentRecord) {
      toast('订单不存在或已删除', true);
      configureMode();
      return;
    }
    form.elements.customerName.value = currentRecord.customerName || '';
    refreshCanteens(currentRecord.canteen);
    form.elements.expectedAt.value = String(currentRecord.expectedAt || '').replace(' ', 'T');
    form.elements.orderTag.value = currentRecord.orderTag || '';
    form.elements.remark.value = currentRecord.remark || '';
    const fallbackQuantity = Number(currentRecord.productCount || 1);
    const fallback = [{ goodsId: 'GOOD-001', goodsName: '大白菜（斤/--/散装）', unit: '斤', quantity: fallbackQuantity, unitPrice: Number(currentRecord.orderAmount || 0) / fallbackQuantity }];
    const storedLines = currentRecord.items?.length ? currentRecord.items : null;
    const storedTotal = storedLines?.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0) || 0;
    const needsLegacyFallback = !storedLines || (storedLines.length === 1 && Math.abs(storedTotal - Number(currentRecord.orderAmount || 0)) > 0.01);
    goodsItems = (needsLegacyFallback ? fallback : storedLines).map(normalizedItem);
    if (mode === 'copy') currentRecord = { ...currentRecord, creator: '当前用户' };
    renderGoods();
    configureMode();
  }

  root.addEventListener('change', (event) => {
    if (event.target === form.elements.customerName) refreshCanteens();
    const row = event.target.closest('[data-line-id]');
    if (row && event.target.dataset.field) {
      const item = goodsItems.find((entry) => entry.id === row.dataset.lineId);
      item[event.target.dataset.field] = event.target.dataset.field === 'remark' ? event.target.value : Number(event.target.value);
      renderGoods();
    }
  });

  root.addEventListener('input', (event) => {
    const row = event.target.closest('[data-line-id]');
    if (row && event.target.dataset.field) {
      const item = goodsItems.find((entry) => entry.id === row.dataset.lineId);
      item[event.target.dataset.field] = event.target.dataset.field === 'remark' ? event.target.value : Number(event.target.value);
      row.querySelector('.line-subtotal').textContent = money(item.quantity * item.unitPrice);
      document.getElementById('goodsTotal').textContent = money(goodsItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
    }
  });

  root.addEventListener('click', async (event) => {
    if (event.target.closest('[data-overlay-close]')) return closeOverlay();
    if (event.target.closest('#batchAddGoods')) return openGoodsModal();
    if (event.target.closest('#confirmGoods')) {
      const rows = overlay.querySelectorAll('.goods-picker-row:not(.goods-picker-header)');
      const newItems = [];
      rows.forEach((row) => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const qtyInput = row.querySelector('.picker-qty-input');
        if (checkbox && checkbox.checked && qtyInput && qtyInput.value) {
          const id = checkbox.value;
          const exists = goodsItems.some((item) => item.goodsId === id);
          if (!exists) {
            const item = normalizedItem(catalog.find((entry) => entry.id === id));
            item.quantity = Number(qtyInput.value);
            newItems.push(item);
          }
        }
      });
      if (!newItems.length) return toast('请勾选商品并填写下单数量', true);
      goodsItems = [...goodsItems, ...newItems];
      closeOverlay();
      return renderGoods();
    }
    const remove = event.target.closest('[data-remove-line]');
    if (remove) {
      const id = remove.closest('[data-line-id]').dataset.lineId;
      if (goodsItems.length === 1) return toast('至少保留一个商品', true);
      goodsItems = goodsItems.filter((item) => item.id !== id);
      return renderGoods();
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back') return backToList();
    if (action === 'draft') return persist('DRAFT');
    if (action === 'save') return persist('PENDING');
    if (action === 'reject') return rejectOrder();
    if (action === 'approve') {
      if (!window.confirm('确定通过审核吗？')) return;
      await service.transition('orders', recordId, 'approve');
      return backToList('reviewed');
    }
    if (action === 'confirm') {
      if (!window.confirm('确定供货吗？')) return;
      await service.transition('orders', recordId, 'confirm');
      return backToList('confirmed');
    }
  });

  loadRecord();
})();
