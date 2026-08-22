(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPlaceholder(annotation, instance = '', isEntry = false) {
    const baseId = annotation.id || `annotation-${annotation.number || 1}`;
    const id = instance ? `${baseId}-${instance}` : baseId;
    const placementClass = annotation.placement === 'right'
      ? ' is-right'
      : annotation.placement === 'left'
        ? ' is-left'
        : '';
    const entryClass = isEntry ? ' is-entry' : '';
    return `<span class="record-annotation-placeholder${placementClass}${entryClass}" data-annotation-placeholder="${escapeHtml(id)}" data-annotation-base="${escapeHtml(baseId)}" data-annotation-target="${escapeHtml(annotation.target || '')}" aria-hidden="true"></span>`;
  }

  function definitionMap(definitions) {
    const entries = definitions instanceof Map
      ? [...definitions.entries()]
      : (definitions || []).filter(Boolean).map((definition) => [
        definition.id || `annotation-${definition.number || 1}`,
        definition
      ]);
    return new Map(entries.map(([key, definition], index) => {
      const id = definition.id || key || `annotation-${index + 1}`;
      return [id, { ...definition, number: String(index + 1) }];
    }));
  }

  function mount(root, definitions) {
    if (!root) return { sync() {}, destroy() {} };
    if (root.__annotationOverlayController) return root.__annotationOverlayController;

    const definitionById = definitionMap(definitions);
    const overlay = document.createElement('div');
    overlay.className = 'record-annotation-overlay';
    overlay.setAttribute('aria-label', '页面标注');
    document.body.appendChild(overlay);
    const anchors = new Map();

    const findPlaceholder = (id) => [...root.querySelectorAll('[data-annotation-placeholder]')]
      .find((placeholder) => placeholder.dataset.annotationPlaceholder === id);

    const close = (anchor) => {
      anchor.classList.remove('is-open');
      anchor.style.zIndex = '1';
      anchor.querySelector('[data-annotation-toggle]')?.setAttribute('aria-expanded', 'false');
      anchor._recordAnnotationPopover?.setAttribute('aria-hidden', 'true');
    };

    const closeAll = (except = null) => anchors.forEach((anchor) => {
      if (anchor !== except && anchor.classList.contains('is-open')) close(anchor);
    });

    const position = (anchor) => {
      const placeholder = findPlaceholder(anchor.dataset.annotationOverlayId);
      const marker = anchor.querySelector('[data-annotation-toggle]');
      const popover = anchor._recordAnnotationPopover;
      if (!placeholder || !marker || !popover || !placeholder.getClientRects().length) {
        anchor.hidden = true;
        return;
      }

      anchor.hidden = false;
      const markerSize = 22;
      const placeholderRect = placeholder.getBoundingClientRect();
      const entryHost = placeholder.closest('.record-annotation-entry');
      const cornerHost = placeholder.closest('.record-annotation-corner');
      const entryTarget = placeholder.previousElementSibling || entryHost;
      const hostElement = entryTarget || cornerHost || placeholder.parentElement;
      const hostRect = hostElement?.getBoundingClientRect() || placeholderRect;
      const isEntry = anchor.classList.contains('is-entry');
      const isRight = anchor.dataset.annotationPlacement === 'right';
      const isExportEntry = isEntry && anchor.dataset.annotationAction === 'export';
      const entryMarkerPosition = anchor.dataset.annotationEntryPosition || '';
      const queryButton = placeholder.dataset.annotationTarget === 'filter'
        ? root.querySelector('#recordQuery')
        : null;
      const queryRect = queryButton?.getBoundingClientRect();
      let markerLeft = placeholderRect.left;
      let markerTop = hostRect.top + ((hostRect.height - markerSize) / 2);

      if (queryRect && queryRect.width && queryRect.height) {
        markerLeft = queryRect.left + ((queryRect.width - markerSize) / 2);
        markerTop = queryRect.bottom + 6;
      } else if (isExportEntry && entryMarkerPosition === 'left') {
        markerLeft = hostRect.left - markerSize - 4;
        markerTop = hostRect.top + ((hostRect.height - markerSize) / 2);
      } else if (isExportEntry) {
        markerLeft = hostRect.left + ((hostRect.width - markerSize) / 2);
        markerTop = hostRect.top - markerSize - 6;
      } else if (isEntry) {
        markerLeft = isRight
          ? hostRect.right + 4
          : hostRect.left - markerSize - 4;
      } else if (cornerHost && isRight) {
        markerLeft = placeholderRect.right - markerSize;
      }
      if (!queryRect && !hostRect.height) markerTop = placeholderRect.top;

      const viewportPadding = 8;
      markerLeft = Math.max(viewportPadding, Math.min(markerLeft, window.innerWidth - markerSize - viewportPadding));
      markerTop = Math.max(viewportPadding, Math.min(markerTop, window.innerHeight - markerSize - viewportPadding));
      anchor.style.left = `${Math.round(markerLeft)}px`;
      anchor.style.top = `${Math.round(markerTop)}px`;
      anchor.style.zIndex = anchor.classList.contains('is-open') ? '3' : '1';

      const markerRect = marker.getBoundingClientRect();
      const gap = 8;
      const popoverWidth = Math.min(popover.offsetWidth || 340, window.innerWidth - 32);
      const popoverHeight = popover.offsetHeight || 0;
      const preferredLeft = isRight && !isEntry ? markerRect.right - popoverWidth : markerRect.left;
      const popoverLeft = Math.max(16, Math.min(preferredLeft, window.innerWidth - popoverWidth - 16));
      let popoverTop = markerRect.top - gap - popoverHeight;
      if (popoverTop < 16) popoverTop = markerRect.bottom + gap;
      popoverTop = Math.max(16, Math.min(popoverTop, window.innerHeight - popoverHeight - 16));
      popover.style.left = `${Math.round(popoverLeft)}px`;
      popover.style.top = `${Math.round(popoverTop)}px`;
      popover.style.right = 'auto';
    };

    const reposition = () => anchors.forEach(position);

    const createAnnotation = (definition, placeholder) => {
      const id = placeholder.dataset.annotationPlaceholder;
      const number = escapeHtml(definition.number || '1');
      const title = escapeHtml(definition.title || `标注${number}`);
      const content = escapeHtml(definition.content || '');
      const popoverActions = Array.isArray(definition.popoverActions)
        ? definition.popoverActions.filter((action) => action && action.key && action.label)
        : [];
      const popoverActionsHtml = popoverActions.length
        ? `<div class="record-annotation-popover-actions">${popoverActions.map((action) => {
          const className = action.className || 'btn btn-sm record-annotation-action';
          const tooltip = action.tooltip ? ` data-tooltip="${escapeHtml(action.tooltip)}"` : '';
          const ariaLabel = action.ariaLabel ? ` aria-label="${escapeHtml(action.ariaLabel)}"` : '';
          return `<button class="${escapeHtml(className)}" type="button" data-annotation-popover-action="${escapeHtml(action.key)}"${tooltip}${ariaLabel}>${escapeHtml(action.label)}</button>`;
        }).join('')}</div>`
        : '';
      const placementClass = definition.placement === 'right'
        ? ' is-right'
        : definition.placement === 'left'
          ? ' is-left'
          : '';
      const entryClass = placeholder.classList.contains('is-entry') ? ' is-entry' : '';
      const anchor = document.createElement('span');
      anchor.className = `record-annotation-anchor${placementClass}${entryClass}`;
      anchor.dataset.annotationOverlayId = id;
      anchor.dataset.annotationPlacement = definition.placement || '';
      anchor.dataset.annotationAction = definition.actionKey || '';
      anchor.dataset.annotationEntryPosition = definition.entryMarkerPosition || '';
      anchor.innerHTML = `<button class="record-annotation-marker" type="button" data-annotation-toggle="${escapeHtml(id)}" aria-expanded="false" aria-label="查看标注${number}">${number}</button>`;

      const popover = document.createElement('div');
      popover.className = 'record-annotation-popover';
      popover.dataset.annotationPopover = id;
      popover.setAttribute('role', 'note');
      popover.setAttribute('aria-hidden', 'true');
      popover.innerHTML = `<strong>${title}</strong><span>${content}</span>${popoverActionsHtml}`;
      popover._recordAnnotationDefinition = definition;
      anchor._recordAnnotationPopover = popover;
      return { anchor, popover };
    };

    const sync = () => {
      const activeIds = new Set();
      [...root.querySelectorAll('[data-annotation-placeholder]')].forEach((placeholder) => {
        const id = placeholder.dataset.annotationPlaceholder;
        const definition = definitionById.get(placeholder.dataset.annotationBase);
        if (!id || !definition) return;
        activeIds.add(id);
        if (anchors.has(id)) return;
        const annotation = createAnnotation(definition, placeholder);
        anchors.set(id, annotation.anchor);
        overlay.appendChild(annotation.anchor);
        overlay.appendChild(annotation.popover);
      });

      [...anchors.entries()].forEach(([id, anchor]) => {
        if (activeIds.has(id)) return;
        close(anchor);
        anchor._recordAnnotationPopover?.remove();
        anchor.remove();
        anchors.delete(id);
      });
      reposition();
    };

    const handleClick = (event) => {
      const popoverAction = event.target.closest?.('[data-annotation-popover-action]');
      if (popoverAction) {
        const popover = popoverAction.closest('.record-annotation-popover');
        const handler = popover?._recordAnnotationDefinition?.onAction;
        if (typeof handler === 'function') {
          handler({ key: popoverAction.dataset.annotationPopoverAction, event, popover });
        }
        event.stopPropagation();
        return;
      }
      const toggle = event.target.closest?.('[data-annotation-toggle]');
      if (!toggle) return;
      const anchor = toggle.closest('.record-annotation-anchor');
      if (!anchor) return;
      const expanded = !anchor.classList.contains('is-open');
      closeAll(anchor);
      anchor.classList.toggle('is-open', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      anchor._recordAnnotationPopover?.setAttribute('aria-hidden', String(!expanded));
      if (expanded) position(anchor);
    };
    const handlePointerOver = (event) => {
      const anchor = event.target.closest?.('.record-annotation-anchor');
      if (anchor) position(anchor);
    };
    const handleFocusIn = (event) => {
      const anchor = event.target.closest?.('.record-annotation-anchor');
      if (anchor) position(anchor);
    };
    const handleKeydown = (event) => {
      if (event.key === 'Escape') closeAll();
    };
    const handleDocumentClick = (event) => {
      if (!event.target.closest?.('.record-annotation-anchor, .record-annotation-popover')) closeAll();
    };

    overlay.addEventListener('click', handleClick);
    overlay.addEventListener('pointerover', handlePointerOver);
    overlay.addEventListener('focusin', handleFocusIn);
    overlay.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    const controller = {
      sync,
      destroy() {
        overlay.removeEventListener('click', handleClick);
        overlay.removeEventListener('pointerover', handlePointerOver);
        overlay.removeEventListener('focusin', handleFocusIn);
        overlay.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
        anchors.forEach((anchor) => anchor._recordAnnotationPopover?.remove());
        overlay.remove();
        delete root.__annotationOverlayController;
      }
    };
    root.__annotationOverlayController = controller;
    controller.sync();
    return controller;
  }

  window.AnnotationOverlay = { renderPlaceholder, mount };
})();
