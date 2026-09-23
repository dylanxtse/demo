(function () {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  window.DomUtils = {
    escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (character) => htmlEntities[character]);
    },

    formatProductDisplay(item = {}, catalog) {
      const text = (value) => String(value ?? '').trim();
      const meaningful = (value) => {
        const normalized = text(value);
        return normalized && normalized !== '--' && normalized !== '—' ? normalized : '';
      };
      const parseDisplay = (value) => {
        const source = text(value);
        const match = source.match(/\s*[（(]\s*([^（）()]*)\s*[）)]\s*$/);
        if (!match) return { name: source, unit: '', brand: '', spec: '' };
        const values = match[1].split('/').map((part) => text(part));
        return {
          name: source.slice(0, match.index).trim(),
          unit: values[0] || '',
          brand: values[1] || '',
          spec: values.slice(2).join('/') || ''
        };
      };
      const sources = Array.isArray(catalog)
        ? [catalog]
        : [
          typeof window.ProductService?.getList === 'function' ? window.ProductService.getList() : [],
          typeof window.DemoStore?.get === 'function' ? window.DemoStore.get('products') : [],
          Array.isArray(window.MockProducts) ? window.MockProducts : []
        ];
      const code = text(item.productCode || item.goodsCode || item.productId || item.goodsId || item.code);
      const rawDisplay = text(item.displayName || item.goodsName || item.name || item.productName);
      const parsed = parseDisplay(rawDisplay);
      const product = sources.flat().find((candidate) => {
        const candidateCode = text(candidate?.code || candidate?.productCode || candidate?.id);
        return code && candidateCode === code;
      }) || sources.flat().find((candidate) => {
        const candidateName = parseDisplay(candidate?.name || candidate?.productName || candidate?.goodsName).name;
        return candidateName && candidateName === parsed.name;
      }) || null;
      const name = text(product?.name || product?.productName) || parsed.name || text(item.productName || item.name || item.goodsName);
      const unit = meaningful(product?.unit) || meaningful(item.unit) || meaningful(parsed.unit);
      const brand = meaningful(product?.brand) || meaningful(item.brand) || meaningful(parsed.brand);
      const spec = meaningful(product?.spec) || meaningful(item.spec) || meaningful(parsed.spec);
      return `${name || '--'}（${unit || '--'}/${brand || '--'}/${spec || '--'}）`;
    }
  };

  let activeTooltip = null;
  let activeTrigger = null;
  let tooltipSequence = 0;

  function hideTooltip() {
    if (activeTrigger && activeTooltip && activeTrigger.getAttribute('aria-describedby') === activeTooltip.id) {
      activeTrigger.removeAttribute('aria-describedby');
    }
    activeTooltip?.remove();
    activeTooltip = null;
    activeTrigger = null;
  }

  function showTooltip(trigger) {
    const text = trigger?.dataset?.uiTooltip;
    if (!text) return;
    if (activeTrigger === trigger && activeTooltip) return;
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'ui-tooltip-bubble';
    tooltip.id = `ui-tooltip-${++tooltipSequence}`;
    tooltip.textContent = text;
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);

    const targetRect = trigger.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const preferredTop = targetRect.top - tooltipHeight - 8;
    const top = preferredTop >= 8
      ? preferredTop
      : Math.min(window.innerHeight - tooltipHeight - 8, targetRect.bottom + 8);
    const tooltipWidth = tooltip.getBoundingClientRect().width;
    const center = targetRect.left + targetRect.width / 2;
    const left = Math.min(
      window.innerWidth - tooltipWidth / 2 - 8,
      Math.max(tooltipWidth / 2 + 8, center)
    );
    tooltip.style.top = `${Math.max(8, top)}px`;
    tooltip.style.left = `${left}px`;
    trigger.setAttribute('aria-describedby', tooltip.id);
    activeTooltip = tooltip;
    activeTrigger = trigger;
    window.requestAnimationFrame(() => tooltip.classList.add('is-visible'));
  }

  document.addEventListener('mouseover', (event) => {
    const trigger = event.target?.closest?.('[data-ui-tooltip]');
    if (!trigger || (event.relatedTarget && trigger.contains(event.relatedTarget))) return;
    showTooltip(trigger);
  });

  document.addEventListener('mouseout', (event) => {
    const trigger = event.target?.closest?.('[data-ui-tooltip]');
    if (!trigger || trigger !== activeTrigger) return;
    if (!event.relatedTarget || !trigger.contains(event.relatedTarget)) hideTooltip();
  });

  document.addEventListener('focusin', (event) => {
    const trigger = event.target?.closest?.('[data-ui-tooltip]');
    if (trigger) showTooltip(trigger);
  });

  document.addEventListener('focusout', (event) => {
    const trigger = event.target?.closest?.('[data-ui-tooltip]');
    if (trigger && trigger === activeTrigger && (!event.relatedTarget || !trigger.contains(event.relatedTarget))) hideTooltip();
  });

  window.addEventListener('scroll', hideTooltip, true);
  window.addEventListener('resize', hideTooltip);

  window.TooltipService = {
    show: showTooltip,
    hide: hideTooltip
  };
})();
