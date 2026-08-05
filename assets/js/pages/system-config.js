(function () {
  const content = `
    <section class="page-card operations-page order-module-page" aria-label="业务配置">
      <div class="operations-tabs"><span class="operations-tab active">业务流程开关</span></div>
      <div class="operations-filter"><div class="operations-form-grid">
        <label class="dialog-field"><span>企业订单审核</span><select id="enterpriseOrderAuditEnabled" class="filter-select"><option value="true">开启：企业订单先审核</option><option value="false">关闭：企业订单直接待发货</option></select></label>
        <label class="dialog-field"><span>分拣库存不足拦截</span><select id="sortingInventoryThresholdEnabled" class="filter-select"><option value="true">开启：库存不足不可分拣</option><option value="false">关闭：库存不足仅提示</option></select></label>
        <label class="dialog-field"><span>出库审核</span><select id="outboundAuditEnabled" class="filter-select"><option value="true">开启：发货后待审核</option><option value="false">关闭：发货后直接完成</option></select></label>
      </div><div class="operations-filter-actions"><button class="btn btn-primary" data-action="save">保存配置</button><button class="btn" data-action="reset-demo">重置演示数据</button></div></div>
      <div class="operation-status info" id="configStatus" hidden></div>
    </section>`;
  const root = window.AppShell.mount({ title: '业务配置', content });
  const settings = window.DemoStore.getSettings();
  ['enterpriseOrderAuditEnabled', 'sortingInventoryThresholdEnabled', 'outboundAuditEnabled'].forEach((key) => {
    root.querySelector(`#${key}`).value = String(settings[key] !== false);
  });

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const status = root.querySelector('#configStatus');
    if (action === 'save') {
      const next = {};
      ['enterpriseOrderAuditEnabled', 'sortingInventoryThresholdEnabled', 'outboundAuditEnabled'].forEach((key) => { next[key] = root.querySelector(`#${key}`).value === 'true'; });
      window.DemoStore.updateSettings(next);
      status.hidden = false;
      status.textContent = '配置已保存';
      window.setTimeout(() => { status.hidden = true; }, 1800);
    }
    if (action === 'reset-demo' && window.confirm('重置后将清空当前演示操作数据，是否继续？')) {
      window.DemoStore.reset();
      window.location.reload();
    }
  });
})();
