(function () {
  const storageKey = 'procurement-notice-management-v1';

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function getRecipientTargetNames(recipient) {
    const targets = Array.isArray(recipient?.targetNames)
      ? recipient.targetNames
      : Array.isArray(recipient?.targets) ? recipient.targets : [];
    return targets.map((item) => typeof item === 'string' ? item : item?.name).filter(Boolean);
  }

  function getRecipientTargetIds(recipient) {
    const targets = Array.isArray(recipient?.targetIds)
      ? recipient.targetIds
      : Array.isArray(recipient?.targets) ? recipient.targets : [];
    return targets.map((item) => typeof item === 'string' ? item : item?.id).filter(Boolean);
  }

  function normalizeRows(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      ...row,
      recipients: (Array.isArray(row.recipients) ? row.recipients : []).map((recipient) => {
        const targetNames = getRecipientTargetNames(recipient);
        const targetIds = getRecipientTargetIds(recipient);
        return targetNames.length || targetIds.length ? { ...recipient, targetNames, ...(targetIds.length ? { targetIds } : {}) } : { ...recipient };
      }),
      attachments: Array.isArray(row.attachments) ? row.attachments.map((file) => ({ ...file })) : []
    }));
  }

  function readStoredRows() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      const rows = JSON.parse(raw);
      return Array.isArray(rows) ? normalizeRows(rows) : null;
    } catch (error) {
      return null;
    }
  }

  function save(rows) {
    const normalized = normalizeRows(rows);
    try { window.localStorage.setItem(storageKey, JSON.stringify(normalized)); } catch (error) { /* file:// 页面可能禁用 localStorage */ }
    return clone(normalized);
  }

  function load(fallbackRows = [], { persistFallback = false, mergeFallback = false } = {}) {
    const stored = readStoredRows();
    const fallback = normalizeRows(fallbackRows);
    if (stored) {
      if (!mergeFallback) return clone(stored);
      const knownIds = new Set(stored.map((row) => row.id).filter(Boolean));
      const additions = fallback.filter((row) => row.id && !knownIds.has(row.id));
      if (!additions.length) return clone(stored);
      const merged = [...additions, ...stored];
      save(merged);
      return clone(merged);
    }
    if (persistFallback) save(fallback);
    return clone(fallback);
  }

  function canRecipientView(row, recipientKind, recipientId, recipientName) {
    if (row?.status !== '已发布') return false;
    const recipient = (row.recipients || []).find((item) => item.name === recipientKind);
    if (!recipient) return false;
    const targetNames = getRecipientTargetNames(recipient);
    const targetIds = getRecipientTargetIds(recipient);
    // 兼容早期未记录具体接收对象的公告：仅指定接收类型时，按该端全量可见处理。
    if (!targetNames.length && !targetIds.length) return true;
    return targetIds.includes(String(recipientId || ''))
      || targetNames.includes(String(recipientId || ''))
      || targetNames.includes(String(recipientName || ''));
  }

  window.NoticeService = {
    load,
    save,
    getRecipientTargetNames,
    getRecipientTargetIds,
    canRecipientView,
    canSupplierView(row, supplierId, supplierName) {
      return canRecipientView(row, '供应商', supplierId, supplierName);
    },
    canSchoolView(row, schoolId, schoolName) {
      return canRecipientView(row, '学校', schoolId, schoolName);
    }
  };
})();
