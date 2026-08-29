(function () {
  const materialLimit = 20;
  const outputLimit = 200;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function formatNow() {
    return window.BusinessRules.now();
  }

  function getActionMeta(template) {
    const actionType = template.lastActionType || 'created';
    const actionAt = template.lastActionAt || template.updatedAt || template.createTime || '';
    const priority = { processed: 3, created: 2, edited: 1 }[actionType] || 0;
    const actionTime = Date.parse(String(actionAt).replace(/-/g, '/')) || 0;
    return { priority, actionTime };
  }

  function sortTemplates(templates) {
    return templates.slice().sort((a, b) => {
      const actionA = getActionMeta(a);
      const actionB = getActionMeta(b);
      if (actionA.priority !== actionB.priority) return actionB.priority - actionA.priority;
      return actionB.actionTime - actionA.actionTime;
    });
  }

  function normalizeWarehouseName(warehouse) {
    const source = String(warehouse || '').trim();
    if (!source) return '';
    const masterWarehouses = (window.DemoStore?.get('warehouses') || [])
      .map((item) => item.warehouseName || item.name)
      .filter(Boolean);
    if (masterWarehouses.includes(source)) return source;
    const legacyAliases = {
      主仓库: '中心仓',
      分仓库A: '北区仓',
      分仓库B: '临时仓'
    };
    const alias = legacyAliases[source];
    return alias && masterWarehouses.includes(alias) ? alias : source;
  }

  function normalizeWarehouseRows(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      ...row,
      warehouse: normalizeWarehouseName(row.warehouse)
    }));
  }

  function normalizeTemplateId(id) {
    return String(id || '').replace(/^MB(?=\d)/, 'PP');
  }

  function normalizeTemplate(template) {
    const relationType = template.relationType === 'many-to-one' ? 'many-to-one' : 'one-to-many';
    const { relations: _relations, ...templateData } = template;
    const materials = normalizeWarehouseRows(Array.isArray(template.materials)
      ? template.materials.slice(0, relationType === 'many-to-one' ? materialLimit : 1)
      : []);
    const outputs = normalizeWarehouseRows(Array.isArray(template.outputs)
      ? template.outputs.slice(0, relationType === 'many-to-one' ? 1 : outputLimit)
      : []);
    const materialWarehouse = normalizeWarehouseName(template.materialWarehouse || materials[0]?.warehouse || '');
    const outputWarehouse = normalizeWarehouseName(template.outputWarehouse || outputs.find((item) => item.warehouse)?.warehouse || materialWarehouse);
    return {
      ...templateData,
      id: normalizeTemplateId(templateData.id),
      relationType,
      materialWarehouse,
      outputWarehouse,
      materials: materials.map((item) => ({ ...item, warehouse: materialWarehouse })),
      outputs: outputs.map((item) => ({ ...item, warehouse: outputWarehouse }))
    };
  }

  function mergeDemoTemplates(templates) {
    const merged = templates.slice();
    const demoTemplateIds = new Set(['PP005']);
    const existingTemplateIds = new Set(merged.map((template) => normalizeTemplateId(template.id)));
    let changed = false;
    (window.MockProcessingTemplates || [])
      .filter((template) => demoTemplateIds.has(template.id))
      .forEach((seedTemplate) => {
        if (existingTemplateIds.has(seedTemplate.id)) return;
        merged.push(clone(seedTemplate));
        existingTemplateIds.add(seedTemplate.id);
        changed = true;
      });
    return { templates: merged, changed };
  }

  function load() {
    if (!window.DemoStore) throw new Error('统一数据仓库未加载');
    const sourceTemplates = window.DemoStore.get('processingTemplates') || [];
    const mergedResult = mergeDemoTemplates(sourceTemplates);
    const normalizedTemplates = clone(mergedResult.templates).map(normalizeTemplate);
    if (mergedResult.changed || JSON.stringify(normalizedTemplates) !== JSON.stringify(sourceTemplates)) {
      window.DemoStore.replace('processingTemplates', normalizedTemplates);
    }
    return sortTemplates(normalizedTemplates);
  }

  function save(templates) {
    window.DemoStore.replace('processingTemplates', templates);
  }

  function generateId() {
    const templates = load();
    const maxNum = templates.reduce((max, t) => {
      const num = parseInt(String(t.id || '').replace(/^(?:PP|MB)/, ''), 10);
      return num > max ? num : max;
    }, 0);
    return `PP${String(maxNum + 1).padStart(3, '0')}`;
  }

  window.ProcessingTemplateService = {
    getList() {
      return load();
    },
    getDetail(id) {
      return load().find((t) => t.id === id) || null;
    },
    create(data) {
      const templates = load();
      const createdAt = formatNow();
      const created = normalizeTemplate({
        ...data,
        id: generateId(),
        createTime: createdAt,
        lastActionType: 'created',
        lastActionAt: createdAt
      });
      templates.push(created);
      save(templates);
      return clone(created);
    },
    update(id, data) {
      const templates = load();
      const index = templates.findIndex((t) => t.id === id);
      if (index < 0) return null;
      templates[index] = normalizeTemplate({
        ...templates[index],
        ...data,
        id: templates[index].id,
        lastActionType: 'edited',
        lastActionAt: formatNow(),
        updatedAt: formatNow()
      });
      save(templates);
      return clone(templates[index]);
    },
    markProcessed(id) {
      const templates = load();
      const index = templates.findIndex((template) => template.id === id);
      if (index < 0) return null;
      const lastActionAt = formatNow();
      templates[index] = {
        ...templates[index],
        lastActionType: 'processed',
        lastActionAt,
        lastProcessedAt: lastActionAt
      };
      save(templates);
      return clone(templates[index]);
    },
    remove(id) {
      const templates = load();
      const filtered = templates.filter((t) => t.id !== id);
      save(filtered);
      return filtered.length < templates.length;
    }
  };
})();
