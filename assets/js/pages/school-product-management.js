(function () {
  const service = window.SchoolProductService;
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const categoryTree = [
    { name: '全部' },
    { name: '主食（米面粉点心类）', expanded: true, children: [
      { name: '米（二级）', expanded: true, children: [{ name: '米面（三级）' }] },
      { name: '点心（二级）', expanded: true, children: [{ name: '点心（三级）' }] },
      { name: '主食其他（二级）', expanded: true, children: [{ name: '主食其他（三级）' }, { name: '主食冻品（三级）' }] }
    ] },
    { name: '食油', expanded: true, children: [{ name: '食油（二级）', children: [{ name: '食油（三级）' }] }] },
    { name: '果蔬', expanded: true, children: [
      { name: '蔬菜（二级）', children: [{ name: '蔬菜（三级）' }] },
      { name: '水果（二级）', children: [{ name: '水果（三级）' }] }
    ] },
    { name: '肉（豆）制品', expanded: true, children: [
      { name: '鲜肉（二级）', children: [{ name: '鲜肉（三级）' }] },
      { name: '豆制品（二级）', children: [{ name: '豆制品（三级）' }] },
      { name: '冻肉（二级）', children: [{ name: '冻肉（三级）' }] }
    ] },
    { name: '水产品', expanded: true, children: [
      { name: '冻品（二级）', children: [{ name: '冻品（三级）' }] },
      { name: '水产品（二级）', children: [{ name: '水产品（三级）' }] }
    ] },
    { name: '蛋奶类', expanded: true, children: [
      { name: '鲜鸡蛋（二级）', children: [{ name: '鲜鸡蛋（三级）' }] },
      { name: '奶制品（二级）', children: [{ name: '奶制品（三级）' }] }
    ] },
    { name: '调料', expanded: true, children: [
      { name: '调料（二级）', children: [{ name: '调料（三级）' }] },
      { name: '干货（二级）', children: [{ name: '干货（三级）' }] }
    ] },
    { name: '其他材料', expanded: true, children: [{ name: '其他材料（二级）', children: [{ name: '其他材料（三级）' }] }] }
  ];

  function showToast(message) {
    document.querySelector('.operations-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'operations-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  function renderTree(page, state) {
    const query = state.treeKeyword.trim().toLocaleLowerCase();
    const tree = page.querySelector('#schoolCategoryTree');
    const renderNodes = (nodes, parent = '') => nodes.map((node, index) => {
      const path = `${parent}${index}`;
      const childHtml = node.children ? renderNodes(node.children, `${path}-`) : '';
      const matches = !query || node.name.toLocaleLowerCase().includes(query) || childHtml;
      if (!matches) return '';
      const selected = (node.name === '全部' && !state.category) || node.name === state.category || state.category.endsWith(`-${node.name}`);
      return `<div class="school-tree-node ${node.expanded || query ? 'is-expanded' : ''}">
        <button type="button" class="school-tree-label ${selected ? 'is-selected' : ''}" data-tree-category="${escapeHtml(node.name === '全部' ? '' : node.name)}" data-tree-path="${path}">
          ${node.children ? '<span class="school-tree-arrow">⌄</span>' : '<span class="school-tree-arrow school-tree-arrow-empty"></span>'}<span>${escapeHtml(node.name)}</span>
        </button>
        ${node.children ? `<div class="school-tree-children">${childHtml}</div>` : ''}
      </div>`;
    }).join('');
    tree.innerHTML = renderNodes(categoryTree);
  }

  function renderRows(page, state) {
    const body = page.querySelector('#schoolProductBody');
    const pager = state.pager?.getState() || { page: 1, pageSize: 20 };
    const start = (pager.page - 1) * pager.pageSize;
    const rows = state.filtered.slice(start, start + pager.pageSize);
    body.innerHTML = rows.length
      ? rows.map((row, index) => {
        const productDisplay = window.DomUtils.formatProductDisplay(row);
        return `<tr>
          <td>${start + index + 1}</td>
          <td><span class="school-product-image" aria-label="商品图片"></span></td>
          <td><button type="button" class="school-product-code" data-action="detail" data-code="${escapeHtml(row.code)}">${escapeHtml(row.code)}</button></td>
          <td class="school-product-name" title="${escapeHtml(productDisplay)}"><span class="school-product-name-main">${row.isNetVegetable ? '<span class="net-vegetable-tag">净菜</span>' : ''}${escapeHtml(productDisplay)}</span></td>
          <td class="school-product-category" title="${escapeHtml(row.category)}">${escapeHtml(row.category)}</td>
          <td>${escapeHtml(row.unit)}</td>
          <td>${escapeHtml(row.supplier)}</td>
          <td>${escapeHtml(row.alias || '')}</td>
          <td>${escapeHtml(row.origin || '')}</td>
          <td>${escapeHtml(row.shelfLife || '')}</td>
          <td>${escapeHtml(row.addTime)}</td>
        </tr>`;
      }).join('')
      : '<tr><td class="school-product-empty" colspan="11">暂无符合条件的数据</td></tr>';
  }

  function render() {
    const content = `<section class="page-card school-product-page" id="schoolProductPage" aria-label="商品管理">
      <div class="school-product-workspace">
        <aside class="school-category-panel">
          <div class="school-category-heading">商品分类</div>
          <label class="school-category-search"><span class="sr-only">商品分类</span><input id="schoolCategoryKeyword" type="text" aria-label="商品分类" placeholder=""></label>
          <div class="school-category-tree" id="schoolCategoryTree"></div>
        </aside>
        <section class="school-product-table-panel">
          <form class="school-product-filters filter-section" id="schoolProductFilters">
            <div class="filter-panel">
              <div class="filter-fields">
                <div class="filter-group"><label class="filter-label" for="schoolProductKeyword">商品名称</label><input class="filter-input" id="schoolProductKeyword" data-filter="keyword" type="text" placeholder="请输入名称/编号"></div>
                <div class="filter-group"><label class="filter-label" for="schoolProductNetVegetable">是否净菜</label><select class="filter-select" id="schoolProductNetVegetable" data-filter="netVegetable"><option value="">全部</option><option value="net">净菜</option><option value="non-net">非净菜</option></select></div>
              </div>
              <div class="action-controls"><button type="submit" class="btn btn-primary btn-sm btn-fixed">查询</button><button type="button" class="btn btn-sm btn-fixed" data-action="reset">重置</button></div>
            </div>
          </form>
          <div class="school-product-table-wrap"><table class="school-product-table"><colgroup><col class="col-seq"><col class="col-image"><col class="col-code"><col class="col-name"><col class="col-category"><col class="col-unit"><col class="col-supplier"><col class="col-alias"><col class="col-origin"><col class="col-shelf"><col class="col-time"></colgroup><thead><tr><th>序号</th><th>图片</th><th>商品编号</th><th>商品名称（计量单位/品牌/规格）</th><th>分类</th><th>计量单位</th><th>供货企业</th><th>别名</th><th>产地</th><th>保质期</th><th>添加时间</th></tr></thead><tbody id="schoolProductBody"></tbody></table></div>
          <div class="pagination school-product-pagination" id="schoolProductPagination"></div>
        </section>
      </div>
    </section>`;
    const root = window.AppShell.mount({ title: '商品管理', content, variant: 'school', companyName: '静安第一中学', emptyText: '商品管理' });
    const page = root.querySelector('#schoolProductPage');
    const state = { rows: service.getRows(), filtered: [], category: '', treeKeyword: '', pager: null };
    const applyFilters = (resetPage = true) => {
      const keyword = page.querySelector('[data-filter="keyword"]').value;
      const netVegetable = page.querySelector('[data-filter="netVegetable"]').value;
      state.filtered = service.filterRows(state.rows, { keyword, category: state.category, netVegetable });
      state.pager?.update({ total: state.filtered.length, ...(resetPage ? { page: 1 } : {}) });
      renderRows(page, state);
    };

    state.filtered = service.filterRows(state.rows, { category: state.category });
    state.pager = window.Pagination.create({
      container: '#schoolProductPagination',
      total: state.filtered.length,
      page: 1,
      pageSize: 20,
      pageSizeOptions: [20, 50, 100],
      onChange: () => renderRows(page, state)
    });
    renderTree(page, state);
    renderRows(page, state);

    page.querySelector('#schoolProductFilters').addEventListener('submit', (event) => {
      event.preventDefault();
      applyFilters(true);
    });
    page.querySelector('#schoolCategoryKeyword').addEventListener('input', (event) => {
      state.treeKeyword = event.target.value;
      renderTree(page, state);
    });
    page.addEventListener('click', (event) => {
      const treeButton = event.target.closest('[data-tree-category]');
      if (treeButton) {
        state.category = treeButton.dataset.treeCategory || '';
        renderTree(page, state);
        applyFilters(true);
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'reset') {
        page.querySelector('[data-filter="keyword"]').value = '';
        page.querySelector('[data-filter="netVegetable"]').value = '';
        page.querySelector('#schoolCategoryKeyword').value = '';
        state.category = '';
        state.treeKeyword = '';
        renderTree(page, state);
        applyFilters(true);
      } else if (action === 'detail') {
        showToast(`商品详情演示：${event.target.closest('[data-code]')?.dataset.code || ''}`);
      }
    });
  }

  render();
})();
