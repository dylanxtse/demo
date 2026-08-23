/*
 * 多端导航底层约束：
 * 1. 先按页面所属端识别目标文件；
 * 2. 同一端内的菜单、页签和业务按钮正常跳转；
 * 3. 跨端跳转只有带有明确切换标识的按钮可以放行。
 * 新增用户端页面时，需要把页面文件名补充到对应 routes 中。
 */
(function () {
  const routes = {
    enterprise: new Set(['index.html', 'warehouse-monitor.html', 'warehouse-export-template.html']),
    education: new Set([
      'education.html',
      'auction-limit-price.html',
      'auction-limit-price-form.html',
      'bid-management.html',
      'bid-management-detail.html',
      'bid-management-form.html',
      'bid-rules-management.html',
      'bid-rules-form.html',
      'segment-management.html',
      'supplier-archive.html',
      'supplier-editor.html',
      'supplier-relationship-management.html',
      'wasted-bid-management.html'
    ]),
    supplier: new Set(['supplier-bidding-quotation.html', 'supplier-invite.html', 'supplier-export-template.html']),
    operations: new Set([
      'operations.html',
      'operations-education-management.html',
      'operations-enterprise-management.html',
      'operations-school-management.html'
    ]),
    school: new Set(['school-product-management.html'])
  };
  const switchRoutes = {
    enterprise: './index.html',
    education: './education.html',
    supplier: './supplier-bidding-quotation.html',
    operations: './operations.html',
    school: './school-product-management.html'
  };
  const switchSelectors = '[data-shell-switch], [data-user-end-switch], [data-platform-switch], [data-school-platform-switch]';
  let mountedVariant = '';

  function fileNameFromPath(pathname) {
    return String(pathname || '').split('/').pop() || 'index.html';
  }

  function variantFromFile(fileName) {
    for (const [variant, files] of Object.entries(routes)) {
      if (files.has(fileName)) return variant;
    }
    // 未特别登记的项目页面按企业端处理，避免教育局/供应商/学校端误跳入企业页面。
    return fileName.endsWith('.html') ? 'enterprise' : '';
  }

  function currentVariant() {
    return mountedVariant
      || document.querySelector('.app-layout[data-user-end]')?.dataset.userEnd
      || variantFromFile(fileNameFromPath(window.location.pathname));
  }

  function resolveTarget(url) {
    if (!url || /^(#|mailto:|tel:|javascript:)/i.test(String(url).trim())) return null;
    try {
      const resolved = new URL(url, document.baseURI || window.location.href);
      if (resolved.origin !== window.location.origin && resolved.protocol !== 'file:') return null;
      return resolved;
    } catch (error) {
      return null;
    }
  }

  function isCrossEnd(url) {
    const target = resolveTarget(url);
    if (!target) return false;
    const targetVariant = variantFromFile(fileNameFromPath(target.pathname));
    const sourceVariant = currentVariant();
    return Boolean(targetVariant && sourceVariant && targetVariant !== sourceVariant);
  }

  function allowedSwitchTrigger(element) {
    return Boolean(element?.closest(switchSelectors));
  }

  function navigationTarget(element) {
    if (!element) return '';
    return element.getAttribute('href')
      || element.dataset.menuLink
      || element.dataset.dashboardLink
      || element.dataset.cellHref
      || element.dataset.navigationTarget
      || '';
  }

  function block(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function navigate(url, { allowCrossEnd = false } = {}) {
    if (!allowCrossEnd && isCrossEnd(url)) {
      return false;
    }
    window.location.href = url;
    return true;
  }

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('a, button, [role="button"], [data-menu-link], [data-dashboard-link], [data-cell-href], [data-navigation-target]')
      : null;
    if (!target || allowedSwitchTrigger(target)) return;
    const href = navigationTarget(target);
    if (href && isCrossEnd(href)) block(event);
  }, true);

  document.addEventListener('submit', (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const action = form?.getAttribute('action');
    if (form && !allowedSwitchTrigger(form) && action && isCrossEnd(action)) block(event);
  }, true);

  window.AppNavigationGuard = {
    setCurrentVariant(variant) {
      mountedVariant = variant || '';
    },
    isCrossEnd,
    navigate,
    switchTo(variant) {
      const target = switchRoutes[variant];
      return target ? navigate(target, { allowCrossEnd: true }) : false;
    }
  };
})();

(function () {
  let annotationEnginePromise = null;
  const toolkitAssets = Object.freeze({
    theme: './assets/js/prototype-tools/src/prototype-tools-theme.js?v=20260823-6',
    annotation: './assets/js/prototype-tools/src/annotation-overlay.js?v=20260823-25',
    iteration: './assets/js/prototype-tools/src/project-iteration-panel.js?v=20260823-56',
    iterationStyles: './assets/js/prototype-tools/src/project-iteration-panel.css?v=20260823-60',
    annotationData: './assets/js/config/annotation-data.js?v=20260822-2',
    iterationData: './assets/js/data/project-iteration-records.js?v=20260822-4'
  });

  function ensureAnnotationEngine() {
    if (annotationEnginePromise) return annotationEnginePromise;

    annotationEnginePromise = Promise.resolve()
      .then(() => loadToolkitScript(toolkitAssets.theme, 'theme'))
      .then(() => {
        if (window.PrototypeAnnotationData) return undefined;
        return loadToolkitScript(toolkitAssets.annotationData, 'annotation-data');
      })
      .then(() => {
        if (window.AnnotationOverlay) return undefined;
        return loadToolkitScript(toolkitAssets.annotation, 'annotation-overlay');
      });

    return annotationEnginePromise;
  }

  function scheduleAnnotationOverlayMount(pageRoot) {
    if (!pageRoot) return;

    // 让页面自己的业务脚本先完成专用标注挂载；没有专用挂载的页面再由公共壳层兜底。
    window.setTimeout(() => {
      ensureAnnotationEngine()
        .then(() => {
          if (!pageRoot.isConnected || pageRoot.__annotationOverlayController) return;
          window.AnnotationOverlay?.mount(pageRoot, []);
        })
        .catch(() => {
          // 标注工具加载失败不应阻塞业务页面。
        });
    }, 0);
  }

  window.AppShell = {
    mount({ title, content, emptyText = '当前没有打开的页面', variant = 'enterprise' }) {
      const root = document.getElementById('app');
      if (!root) throw new Error('缺少 #app 页面挂载节点');
      const shellOptions = { variant };
      window.AppNavigationGuard?.setCurrentVariant(variant);

      const shellClass = variant === 'education'
        ? 'education-shell'
        : variant === 'supplier'
          ? 'supplier-shell'
          : variant === 'operations'
            ? 'operations-shell'
            : variant === 'school'
              ? 'school-shell'
              : '';
      root.innerHTML = `
        <div class="app-layout ${shellClass}" data-user-end="${variant}">
          ${window.AppSidebar.render(shellOptions)}
          <section class="main-section">
            ${window.AppHeader.render(shellOptions)}
            ${window.AppPageTabs.render(title, { variant })}
            <div class="page-empty-state">${emptyText}</div>
            <main class="content-area" id="pageContent">${content}</main>
          </section>
        </div>
      `;
      window.AppSidebar.bind(root, shellOptions);
      window.AppPageTabs.bind(root, { variant });
      window.AppHeader.bind?.(root, shellOptions);
      scheduleAnnotationOverlayMount(root.querySelector('#pageContent'));
      return root;
    }
  };

  function appendProjectIterationStyles() {
    if (document.querySelector('link[data-project-iteration-panel-style], link[href*="project-iteration-panel.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = toolkitAssets.iterationStyles;
    link.dataset.projectIterationPanelStyle = 'true';
    document.head.appendChild(link);
  }

  function loadToolkitScript(src, marker) {
    return new Promise((resolve, reject) => {
      if (marker === 'theme' && window.PrototypeToolsTheme) {
        resolve();
        return;
      }
      const existing = document.querySelector(`script[data-project-iteration-script="${marker}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.dataset.projectIterationScript = marker;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.body.appendChild(script);
    });
  }

  function mountProjectIterationPanel() {
    appendProjectIterationStyles();
    if (window.ProjectIterationPanel) {
      window.ProjectIterationPanel.mount({
        records: window.ProjectIterationData?.records || [],
        persistToProjectCode: true
      });
      return;
    }
    loadToolkitScript(toolkitAssets.theme, 'theme')
      .then(() => loadToolkitScript(toolkitAssets.iterationData, 'data'))
      .then(() => loadToolkitScript(toolkitAssets.iteration, 'component'))
      .then(() => window.ProjectIterationPanel?.mount({
        records: window.ProjectIterationData?.records || [],
        persistToProjectCode: true
      }))
      .catch(() => {
        // 面板资源加载失败时不影响当前业务页面继续使用。
      });
  }

  mountProjectIterationPanel();
})();
