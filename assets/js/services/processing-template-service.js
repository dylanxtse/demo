(function () {
  const storageKey = 'procurement-processing-templates';
  const versionKey = 'procurement-processing-templates-v3';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function formatNow() {
    return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
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

  function normalizeTemplate(template) {
    return {
      ...template,
      materials: Array.isArray(template.materials) ? template.materials.slice(0, 1) : [],
      outputs: Array.isArray(template.outputs) ? template.outputs.slice(0, 100) : []
    };
  }

  function load() {
    // 检查版本，若旧数据无仓库字段则重置为最新 mock
    const version = window.AppStorage?.read(versionKey, '0');
    if (version !== '3') {
      window.AppStorage?.write(storageKey, window.MockProcessingTemplates);
      window.AppStorage?.write(versionKey, '3');
    }
    const templates = window.AppStorage?.read(storageKey, window.MockProcessingTemplates) || window.MockProcessingTemplates;
    const normalizedTemplates = clone(templates).map(normalizeTemplate);
    if (JSON.stringify(normalizedTemplates) !== JSON.stringify(templates)) {
      window.AppStorage?.write(storageKey, normalizedTemplates);
    }
    return sortTemplates(normalizedTemplates);
  }

  function save(templates) {
    if (window.AppStorage) window.AppStorage.write(storageKey, templates);
  }

  function generateId() {
    const templates = load();
    const maxNum = templates.reduce((max, t) => {
      const num = parseInt(t.id.replace('MB', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `MB${String(maxNum + 1).padStart(3, '0')}`;
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
      const created = {
        ...data,
        id: generateId(),
        materials: Array.isArray(data.materials) ? data.materials.slice(0, 1) : [],
        outputs: Array.isArray(data.outputs) ? data.outputs.slice(0, 100) : [],
        createTime: createdAt,
        lastActionType: 'created',
        lastActionAt: createdAt
      };
      templates.push(created);
      save(templates);
      return clone(created);
    },
    update(id, data) {
      const templates = load();
      const index = templates.findIndex((t) => t.id === id);
      if (index < 0) return null;
      templates[index] = {
        ...templates[index],
        ...data,
        id: templates[index].id,
        materials: Array.isArray(data.materials) ? data.materials.slice(0, 1) : [],
        outputs: Array.isArray(data.outputs) ? data.outputs.slice(0, 100) : [],
        lastActionType: 'edited',
        lastActionAt: formatNow(),
        updatedAt: formatNow()
      };
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
