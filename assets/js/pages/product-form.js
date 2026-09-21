(function () {
  const parameters = new URLSearchParams(window.location.search);
  const isSupplierProductPage = document.body?.dataset.userEnd === 'supplier'
    || parameters.get('from') === 'supplier';
  if (isSupplierProductPage) {
    document.body.dataset.userEnd = 'supplier';
    document.body.dataset.supplierId ||= 'SUP-004';
    document.body.dataset.supplierName ||= '南皮供应商01';
    document.getElementById('app')?.setAttribute('data-page', 'supplier-product-management.html');
  }
  const productId = parameters.get('id');
  const pageMode = parameters.get('mode');
  const isViewMode = pageMode === 'view';
  const isEditMode = !isViewMode && (pageMode === 'edit' || Boolean(productId));
  const pageTitle = isViewMode ? '商品详情' : (isEditMode ? '编辑商品' : '添加商品');
  const editLockedFields = ['category', 'name', 'unit'];
  const template = document.getElementById('productFormTemplate');
  let currentProduct = null;

  window.AppShell.mount({
    // 添加/编辑商品是商品管理的下钻页，不作为独立导航页面显示。
    title: '商品管理',
    content: template.innerHTML,
    variant: isSupplierProductPage ? 'supplier' : 'enterprise'
  });

  const form = document.getElementById('productForm');
  const status = document.getElementById('formStatus');
  const imageInput = document.getElementById('imageFile');
  form.querySelector('label[for="marketPrice"]')?.classList.toggle('required', !isEditMode);
  const fieldNames = [
    'category',
    'name',
    'correspondingFood',
    'purchaseType',
    'defaultSupplier',
    'responsible',
    'unit',
    'marketPrice',
    'multiUnit',
    'brand',
    'spec',
    'origin',
    'indicatorDescription',
    'alias',
    'netContent',
    'netContentUnit',
    'qualificationCertificate',
    'isWeighed',
    'conversionRate',
    'shelfLife',
    'shelfLifeValue',
    'shelfLifeUnit',
    'shelfLifeWarning',
    'expiryCalculationMethod',
    'multiUnitName1', 'multiUnitRate1', 'multiUnitPrice1',
    'multiUnitName2', 'multiUnitRate2', 'multiUnitPrice2'
  ];

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `form-status visible ${type}`;
  }

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach((element) => { element.textContent = ''; });
    form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid'));
  }

  function readForm() {
    const data = {};
    fieldNames.forEach((name) => {
      if (name === 'purchaseType') {
        data[name] = form.querySelector('[name="purchaseType"]:checked')?.value || '';
      } else if (name === 'multiUnit' || name === 'isWeighed' || name === 'shelfLife') {
        data[name] = Boolean(form.elements[name]?.checked);
      } else {
        data[name] = form.elements[name]?.value.trim() || '';
      }
    });
    data.shelfLifeEnabled = data.shelfLife;
    data.shelfLife = data.shelfLife && data.shelfLifeValue && data.shelfLifeUnit
      ? `${data.shelfLifeValue}${data.shelfLifeUnit}`
      : '';
    data.imageName = imageInput.files[0]?.name || form.dataset.imageName || '';
    return data;
  }

  function showErrors(errors) {
    clearErrors();
    Object.entries(errors).forEach(([field, message]) => {
      const messageElement = form.querySelector(`[data-error-for="${field}"]`);
      if (messageElement) messageElement.textContent = message;
      const control = form.elements[field];
      if (control && !('length' in control && !control.tagName)) control.setAttribute('aria-invalid', 'true');
    });
    const firstField = Object.keys(errors)[0];
    const firstControl = form.elements[firstField];
    if (firstControl?.focus) firstControl.focus();
  }

  function fillForm(product) {
    fieldNames.forEach((name) => {
      if (name === 'purchaseType') {
        const expectedValue = ['供应商送货', '市场自采'].includes(product[name]) ? product[name] : '供应商送货';
        const radio = Array.from(form.elements.purchaseType).find((item) => item.value === expectedValue);
        if (radio) radio.checked = true;
        return;
      }
      if (name === 'multiUnit' || name === 'isWeighed' || name === 'shelfLife') {
        form.elements[name].checked = Boolean(product[name]);
        return;
      }
      if (form.elements[name]) form.elements[name].value = product[name] || '';
    });

    const shelfLifeMatch = String(product.shelfLife || '').match(/^(\d+)(天|月|年)$/);
    if (shelfLifeMatch) {
      form.elements.shelfLife.checked = true;
      form.elements.shelfLifeValue.value = shelfLifeMatch[1];
      form.elements.shelfLifeUnit.value = shelfLifeMatch[2];
    }
    if (form.elements.shelfLifeWarning) {
      form.elements.shelfLifeWarning.value = product.shelfLifeWarning || '';
    }

    if (product.imageName) {
      form.dataset.imageName = product.imageName;
      document.getElementById('imageButtonText').textContent = '重新选择';
      document.getElementById('imageTip').textContent = `当前图片：${product.imageName}`;
    }
  }

  function returnToList() {
    const target = isSupplierProductPage ? './supplier-product-management.html' : './index.html';
    if (window.AppNavigationGuard?.navigate) window.AppNavigationGuard.navigate(target);
    else window.location.href = target;
  }

  function updateConversionRateLabel() {
    document.getElementById('conversionRateUnit').textContent = form.elements.unit?.value || '--';
  }

  function updateConversionRateVisibility() {
    const weighingSwitch = document.getElementById('isWeighed');
    const conversionRateField = document.querySelector('.conversion-rate-field');
    if (!weighingSwitch || !conversionRateField) return;
    conversionRateField.classList.toggle('is-hidden', !weighingSwitch.checked);
  }

  function updateShelfLifeVisibility() {
    const shelfLifeSwitch = document.getElementById('shelfLife');
    const shelfLifeField = document.querySelector('.shelf-life-field');
    const warningField = document.querySelector('.shelf-life-warning-field');
    const methodField = document.querySelector('.shelf-life-method-field');
    if (!shelfLifeSwitch || !shelfLifeField || !warningField || !methodField) return;
    const isVisible = shelfLifeSwitch.checked;
    shelfLifeField.classList.toggle('is-hidden', !isVisible);
    warningField.classList.toggle('is-hidden', !isVisible);
    methodField.classList.toggle('is-hidden', !isVisible);
  }

  function updateMultiUnitVisibility() {
    const multiUnitSwitch = document.getElementById('multiUnit');
    const settings = document.querySelector('.multi-unit-settings');
    const heading = document.querySelector('.multi-unit-heading');
    const area = document.querySelector('.multi-unit-area');
    if (!multiUnitSwitch || !settings || !heading || !area) return;
    const isVisible = multiUnitSwitch.checked;
    area.classList.toggle('is-active', isVisible);
    settings.classList.toggle('is-hidden', !isVisible);
    settings.setAttribute('aria-hidden', String(!isVisible));
    heading.classList.toggle('is-hidden', !isVisible);
    heading.setAttribute('aria-hidden', String(!isVisible));
  }

  function updateMultiUnitBaseLabels() {
    const unit = form.elements.unit?.value || '--';
    document.querySelectorAll('.multi-unit-base').forEach((element) => { element.textContent = unit; });
  }

  function updateEditLockedFields() {
    editLockedFields.forEach((fieldName) => {
      const field = document.getElementById(fieldName);
      if (field) field.disabled = isEditMode || isViewMode;
    });
    if (!isViewMode) return;
    form.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = true; });
    form.querySelectorAll('.number-stepper-button, [data-action="choose-image"]').forEach((button) => { button.disabled = true; });
    document.getElementById('submitButton').hidden = true;
    document.querySelector('[data-action="cancel"]').textContent = '返回';
    form.classList.add('is-readonly');
  }

  function readonlyValue(value) {
    const element = document.createElement('span');
    element.className = 'readonly-value';
    element.textContent = String(value || '--');
    return element;
  }

  function selectedText(select) {
    return select?.value ? select.options[select.selectedIndex]?.textContent : '';
  }

  function replaceReadonlyControl(control, value) {
    if (!control) return;
    let target = control.closest('.searchable-select, .number-stepper');
    if (control.type === 'checkbox') target = control.closest('.switch-control');
    (target || control).replaceWith(readonlyValue(value));
  }

  function renderReadonlyView() {
    if (!isViewMode) return;

    const combinedFields = [
      ['netContent', 'netContentUnit'],
      ['shelfLifeValue', 'shelfLifeUnit'],
      ['conversionRate']
    ];
    combinedFields.forEach(([valueName, unitName]) => {
      const valueControl = form.elements[valueName];
      if (!valueControl) return;
      const value = valueControl.value;
      const unit = unitName ? selectedText(form.elements[unitName]) : 'kg';
      const target = valueControl.closest('.net-content-control, .conversion-rate-control');
      if (target) target.replaceWith(readonlyValue(value ? `${value}${unit || ''}` : ''));
    });

    fieldNames.forEach((name) => {
      const control = form.elements[name];
      if (!control || ['netContentUnit', 'shelfLifeUnit', 'conversionRate'].includes(name)) return;
      if (name === 'purchaseType') {
        replaceReadonlyControl(form.querySelector('.radio-group'), form.querySelector('[name="purchaseType"]:checked')?.value);
        return;
      }
      if (control.type === 'checkbox') {
        replaceReadonlyControl(control, control.checked ? '是' : '否');
      } else if (control.tagName === 'SELECT') {
        replaceReadonlyControl(control, selectedText(control));
      } else {
        replaceReadonlyControl(control, control.value);
      }
    });

    const imageUpload = form.querySelector('.image-upload');
    if (imageUpload) imageUpload.replaceWith(readonlyValue(form.dataset.imageName));
    form.querySelectorAll('.field-error').forEach((element) => { element.remove(); });
  }

  function formatFileSize(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  function serializeAttachment(file) {
    const parts = String(file.name || '').split('.');
    const metadata = {
      name: file.name,
      format: parts.length > 1 ? parts.pop().toLowerCase() : '',
      size: formatFileSize(file.size),
      mimeType: file.type || 'application/octet-stream'
    };
    const previewLimit = 2 * 1024 * 1024;
    if (!file.size || file.size > previewLimit || typeof FileReader === 'undefined') return Promise.resolve(metadata);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ ...metadata, dataUrl: typeof reader.result === 'string' ? reader.result : '' });
      reader.onerror = () => resolve(metadata);
      reader.readAsDataURL(file);
    });
  }

  function renderModificationRecords(records) {
    const section = document.getElementById('productChangeRecords');
    const timeline = document.getElementById('productChangeTimeline');
    if (!section || !timeline) return;
    section.hidden = !isViewMode;
    if (!isViewMode) return;

    const list = Array.isArray(records) ? records : [];
    if (!list.length) {
      timeline.innerHTML = '<span class="detail-empty">暂无修改记录</span>';
      return;
    }

    timeline.innerHTML = list.map((record, recordIndex) => {
      const attachments = Array.isArray(record.attachments) ? record.attachments : [];
      const description = record.desc || `${record.operator || '管理员'} 修改商品 ${record.createdAt || ''}`;
      const hasRecordDetails = Boolean(String(record.explanation || '').trim()) || attachments.length > 0;
      const detailLink = hasRecordDetails
        ? `<button type="button" class="product-change-attachment-link" data-record-index="${recordIndex}">查看附件</button>`
        : '';
      return `
        <div class="detail-timeline-item">
          <div class="detail-timeline-node"></div>
          <div class="detail-timeline-content">
            <span class="detail-timeline-action">${window.DomUtils.escapeHtml(record.action || '修改')}</span>
            <span class="detail-timeline-desc">${window.DomUtils.escapeHtml(description)}</span>
            ${detailLink}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAttachmentPreview(file, container) {
    container.replaceChildren();
    container.hidden = !file;
    if (!file) {
      return;
    }

    const mimeType = String(file.mimeType || '');
    if (file.dataUrl && mimeType.startsWith('image/')) {
      const image = document.createElement('img');
      image.className = 'product-attachment-preview-image';
      image.src = file.dataUrl;
      image.alt = file.name || '附件预览';
      container.appendChild(image);
    } else if (file.dataUrl && (mimeType === 'application/pdf' || mimeType.startsWith('text/'))) {
      const frame = document.createElement('iframe');
      frame.className = 'product-attachment-preview-frame';
      frame.src = file.dataUrl;
      frame.title = file.name || '附件预览';
      container.appendChild(frame);
    } else if (file.dataUrl) {
      const openLink = document.createElement('a');
      openLink.className = 'product-attachment-preview-open';
      openLink.href = file.dataUrl;
      openLink.target = '_blank';
      openLink.rel = 'noopener';
      openLink.textContent = '在新窗口查看附件';
      container.appendChild(openLink);
    } else {
      container.hidden = true;
    }
  }

  function getAttachmentFormat(file) {
    const savedFormat = String(file?.format || '').trim();
    if (savedFormat) return savedFormat.toUpperCase();
    const fileName = String(file?.name || '');
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.slice(dotIndex + 1).toUpperCase() : '文件';
  }

  function isImageAttachment(file) {
    const mimeType = String(file?.mimeType || '').toLowerCase();
    if (mimeType.startsWith('image/')) return true;
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(String(file?.format || '').toLowerCase());
  }

  function openLargeImagePreview(file) {
    if (!file?.dataUrl || !isImageAttachment(file)) return;
    const lightbox = document.createElement('div');
    lightbox.className = 'product-attachment-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '大图查看');
    lightbox.innerHTML = `
      <div class="product-attachment-lightbox-dialog">
        <button type="button" class="product-attachment-lightbox-close" data-lightbox-close aria-label="关闭">×</button>
        <img class="product-attachment-lightbox-image" data-lightbox-image alt="">
        <div class="product-attachment-lightbox-caption" data-lightbox-caption></div>
      </div>
    `;
    document.body.appendChild(lightbox);
    const image = lightbox.querySelector('[data-lightbox-image]');
    image.src = file.dataUrl;
    image.alt = file.name || '附件大图';
    lightbox.querySelector('[data-lightbox-caption]').textContent = file.name || '附件大图';

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', handleKeydown);
      lightbox.remove();
    };
    const handleKeydown = (event) => {
      if (event.key === 'Escape') close();
    };
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('[data-lightbox-close]')) close();
    });
    document.addEventListener('keydown', handleKeydown);
  }

  function downloadAttachment(file) {
    if (!file?.dataUrl) return;
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name || '附件';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openModificationRecordPreview(record) {
    if (!record) return;
    const attachments = Array.isArray(record.attachments) ? record.attachments : [];
    const modal = document.createElement('div');
    modal.className = 'product-change-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'productAttachmentPreviewTitle');
    modal.innerHTML = `
      <section class="product-change-modal product-attachment-preview-modal">
        <header class="product-change-modal-header">
          <h2 id="productAttachmentPreviewTitle">查看附件</h2>
          <button type="button" class="product-change-modal-close" data-preview-close aria-label="关闭">×</button>
        </header>
        <div class="product-change-modal-body">
          <div class="product-attachment-preview-meta">
            <div><span>修改时间：</span><strong data-preview-created-at></strong></div>
          </div>
          <div class="product-attachment-preview-section">
            <h3>修改说明</h3>
            <div class="product-attachment-preview-explanation" data-preview-explanation></div>
          </div>
          <div class="product-attachment-preview-section">
            <h3>附件</h3>
            <div class="product-attachment-preview-list" data-preview-attachments></div>
          </div>
        </div>
        <footer class="product-change-modal-footer">
          <button type="button" class="btn btn-primary" data-preview-close>关闭</button>
        </footer>
      </section>
    `;
    document.body.appendChild(modal);
    modal.querySelector('[data-preview-created-at]').textContent = record.createdAt || record.updatedAt || '--';
    modal.querySelector('[data-preview-explanation]').textContent = record.explanation || '--';
    const attachmentList = modal.querySelector('[data-preview-attachments]');
    const modalBody = modal.querySelector('.product-change-modal-body');
    let previewContent = null;
    const getPreviewContent = () => {
      if (previewContent) return previewContent;
      previewContent = document.createElement('div');
      previewContent.className = 'product-attachment-preview-content';
      modalBody.appendChild(previewContent);
      return previewContent;
    };
    if (!attachments.length) {
      const empty = document.createElement('div');
      empty.className = 'product-attachment-preview-list-empty';
      empty.textContent = '--';
      attachmentList.appendChild(empty);
    } else {
      attachments.forEach((file, attachmentIndex) => {
        const item = document.createElement('div');
        item.className = 'product-attachment-preview-item';

        const imageAttachment = isImageAttachment(file);
        const thumbnail = document.createElement('div');
        thumbnail.className = `product-attachment-preview-thumbnail${imageAttachment ? ' product-attachment-preview-thumbnail-image' : ' product-attachment-preview-thumbnail-file'}`;
        if (imageAttachment && file.dataUrl) {
          const thumbnailImage = document.createElement('img');
          thumbnailImage.src = file.dataUrl;
          thumbnailImage.alt = file.name || '附件缩略图';
          thumbnail.appendChild(thumbnailImage);
        } else {
          thumbnail.textContent = getAttachmentFormat(file);
        }

        const actions = document.createElement('div');
        actions.className = 'product-attachment-preview-actions';
        const previewButton = document.createElement('button');
        previewButton.type = 'button';
        previewButton.className = 'product-attachment-preview-action';
        previewButton.setAttribute('aria-label', imageAttachment ? '查看大图' : '查看附件');
        previewButton.title = imageAttachment ? '查看大图' : '查看附件';
        previewButton.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>';
        previewButton.disabled = !file.dataUrl;
        previewButton.addEventListener('click', () => {
          if (imageAttachment) openLargeImagePreview(file);
          else if (file.dataUrl) renderAttachmentPreview(file, getPreviewContent());
        });

        const downloadButton = document.createElement('button');
        downloadButton.type = 'button';
        downloadButton.className = 'product-attachment-preview-action';
        downloadButton.setAttribute('aria-label', '下载附件');
        downloadButton.title = '下载附件';
        downloadButton.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><polyline points="7 11 12 16 17 11"></polyline><path d="M5 21h14"></path></svg>';
        downloadButton.disabled = !file.dataUrl;
        downloadButton.addEventListener('click', () => downloadAttachment(file));
        actions.append(previewButton, downloadButton);
        thumbnail.appendChild(actions);

        const info = document.createElement('div');
        info.className = 'product-attachment-preview-info';
        const fileName = document.createElement(file.dataUrl && !imageAttachment ? 'button' : 'div');
        fileName.className = `product-attachment-preview-name${file.dataUrl && !imageAttachment ? ' product-attachment-preview-name-button' : ''}`;
        fileName.textContent = file.name || '未命名附件';
        if (file.dataUrl && !imageAttachment) {
          fileName.type = 'button';
          fileName.title = '点击查看附件';
          fileName.addEventListener('click', () => renderAttachmentPreview(file, getPreviewContent()));
        }
        info.appendChild(fileName);

        item.append(thumbnail, info);
        attachmentList.appendChild(item);
      });
    }

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', handleKeydown);
      modal.remove();
    };
    const handleKeydown = (event) => {
      if (event.key === 'Escape') close();
    };
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('[data-preview-close]')) close();
    });
    document.addEventListener('keydown', handleKeydown);
  }

  function persistProduct(data, modificationRecord = null) {
    const payload = modificationRecord
      ? {
        ...data,
        modificationRecords: [
          ...(Array.isArray(currentProduct?.modificationRecords) ? currentProduct.modificationRecords : []),
          modificationRecord
        ]
      }
      : data;
    const savedProduct = isEditMode
      ? window.ProductService.update(productId, payload)
      : window.ProductService.create(payload);

    if (!savedProduct) {
      showStatus('保存失败，请返回商品管理页面后重试。', 'error');
      return false;
    }

    currentProduct = savedProduct;
    showStatus(isEditMode ? '商品修改成功，正在返回商品管理页面。' : '商品添加成功，正在返回商品管理页面。', 'success');
    window.setTimeout(returnToList, 500);
    return true;
  }

  function openModificationModal(data) {
    const modal = document.createElement('div');
    modal.className = 'product-change-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'productChangeModalTitle');
    modal.innerHTML = `
      <section class="product-change-modal">
        <header class="product-change-modal-header">
          <h2 id="productChangeModalTitle">提交修改</h2>
          <button type="button" class="product-change-modal-close" data-modal-close aria-label="关闭">×</button>
        </header>
        <div class="product-change-modal-body">
          <p class="product-change-modal-tip">请上传附件或填写修改说明，附件和说明至少填写一项。</p>
          <div class="product-change-dialog-field">
            <label for="productChangeAttachment">附件</label>
            <div class="product-change-file-control">
              <label class="product-change-file-button" for="productChangeAttachment">选择附件</label>
              <span class="product-change-file-name" id="productChangeAttachmentName">未选择附件</span>
              <input id="productChangeAttachment" type="file" hidden>
            </div>
          </div>
          <div class="product-change-dialog-field product-change-dialog-field-full">
            <label for="productChangeExplanation">说明</label>
            <textarea id="productChangeExplanation" rows="4" placeholder="请输入本次修改说明"></textarea>
          </div>
          <div class="product-change-modal-error" id="productChangeModalError" role="alert"></div>
        </div>
        <footer class="product-change-modal-footer">
          <button type="button" class="btn" data-modal-cancel>取消</button>
          <button type="button" class="btn btn-primary" data-modal-confirm>确认</button>
        </footer>
      </section>
    `;
    document.body.appendChild(modal);

    const fileInput = modal.querySelector('#productChangeAttachment');
    const fileName = modal.querySelector('#productChangeAttachmentName');
    const explanationInput = modal.querySelector('#productChangeExplanation');
    const error = modal.querySelector('#productChangeModalError');
    const confirmButton = modal.querySelector('[data-modal-confirm]');
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', handleKeydown);
      modal.remove();
    };
    const handleKeydown = (event) => {
      if (event.key === 'Escape') close();
    };

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      fileName.textContent = file ? `${file.name}（${formatFileSize(file.size)}）` : '未选择附件';
      error.textContent = '';
    });
    explanationInput.addEventListener('input', () => { error.textContent = ''; });
    modal.addEventListener('click', async (event) => {
      if (event.target === modal || event.target.closest('[data-modal-close], [data-modal-cancel]')) {
        close();
        return;
      }
      if (!event.target.closest('[data-modal-confirm]')) return;

      const explanation = explanationInput.value.trim();
      const file = fileInput.files[0];
      if (!file && !explanation) {
        error.textContent = '附件和说明至少填写一项';
        return;
      }

      const createdAt = window.BusinessRules.now();
      const record = {
        action: '修改',
        operator: '管理员',
        desc: `管理员 修改商品 ${createdAt}`,
        createdAt,
        explanation,
        attachments: []
      };
      confirmButton.disabled = true;
      if (file) record.attachments = [await serializeAttachment(file)];
      if (closed) return;
      if (persistProduct(data, record)) close();
      else {
        error.textContent = '保存失败，请稍后重试';
        confirmButton.disabled = false;
      }
    });
    document.addEventListener('keydown', handleKeydown);
    explanationInput.focus();
  }

  function initSearchableSelects() {
    const selects = Array.from(form.querySelectorAll('select.form-control'));
    const plainSelects = new Set(['netContentUnit', 'shelfLifeUnit', 'expiryCalculationMethod', 'multiUnitName1', 'multiUnitName2']);
    const closeAll = (except) => {
      form.querySelectorAll('.searchable-select.is-open').forEach((element) => {
        if (element !== except) element.classList.remove('is-open');
      });
    };

    selects.forEach((select) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'searchable-select';
      const searchable = !plainSelects.has(select.id);
      if (!searchable) wrapper.classList.add('is-plain');
      if (select.disabled) wrapper.classList.add('is-disabled');
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.classList.add('searchable-select-native');

      const input = document.createElement('input');
      input.className = 'form-control searchable-select-input';
      input.type = 'text';
      input.autocomplete = 'off';
      input.placeholder = '请选择';
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', `${select.id}-options`);
      input.readOnly = select.disabled || !searchable;

      const options = document.createElement('div');
      options.className = 'searchable-select-options';
      options.id = `${select.id}-options`;
      options.setAttribute('role', 'listbox');

      const getOptions = () => Array.from(select.options)
        .filter((option) => !option.hidden && !option.disabled);
      const syncInput = () => {
        input.value = select.value || '';
        input.title = input.value;
      };
      const renderOptions = (keyword = '') => {
        const normalizedKeyword = searchable ? keyword.trim().toLowerCase() : '';
        options.innerHTML = '';
        getOptions()
          .filter((option) => option.textContent.toLowerCase().includes(normalizedKeyword))
          .forEach((option) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'searchable-select-option';
            item.textContent = option.textContent;
            item.dataset.value = option.value;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(option.value === select.value));
            item.addEventListener('mousedown', (event) => event.preventDefault());
            item.addEventListener('click', () => {
              select.value = option.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              syncInput();
              wrapper.classList.remove('is-open');
              input.setAttribute('aria-expanded', 'false');
            });
            options.appendChild(item);
          });
        if (!options.children.length) {
          const empty = document.createElement('div');
          empty.className = 'searchable-select-empty';
          empty.textContent = '暂无匹配项';
          options.appendChild(empty);
        }
      };

      input.addEventListener('focus', () => {
        if (select.disabled) return;
        closeAll(wrapper);
        wrapper.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
        input.select();
        renderOptions(input.value);
      });
      input.addEventListener('input', () => {
        if (!searchable) return;
        if (!wrapper.classList.contains('is-open')) wrapper.classList.add('is-open');
        renderOptions(input.value);
      });
      input.addEventListener('blur', () => {
        syncInput();
        wrapper.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          syncInput();
          wrapper.classList.remove('is-open');
          input.setAttribute('aria-expanded', 'false');
        }
      });
      select.addEventListener('change', syncInput);

      wrapper.append(input, options);
      syncInput();
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.searchable-select')) closeAll();
    });
  }

  document.getElementById('formPageTitle').textContent = pageTitle;
  document.getElementById('submitButton').textContent = '提交';

  if (isEditMode || isViewMode) {
    currentProduct = window.ProductService.getDetail(productId);
    if (currentProduct) {
      fillForm(currentProduct);
    } else {
      showStatus(`未找到需要${isViewMode ? '查看' : '编辑'}的商品，请返回商品管理页面重新选择。`, 'error');
      document.getElementById('submitButton').disabled = true;
    }
  }

  updateEditLockedFields();
  initSearchableSelects();
  document.getElementById('unit').addEventListener('change', updateConversionRateLabel);
  document.getElementById('unit').addEventListener('change', updateMultiUnitBaseLabels);
  document.getElementById('isWeighed').addEventListener('change', updateConversionRateVisibility);
  document.getElementById('shelfLife').addEventListener('change', updateShelfLifeVisibility);
  document.getElementById('multiUnit').addEventListener('change', updateMultiUnitVisibility);
  document.getElementById('shelfLifeValue').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '');
  });
  document.getElementById('shelfLifeWarning').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '');
  });
  updateConversionRateLabel();
  updateMultiUnitBaseLabels();
  updateConversionRateVisibility();
  updateShelfLifeVisibility();
  updateMultiUnitVisibility();
  window.NumberStepper.bind(document.querySelector('.product-form-page'));
  renderReadonlyView();
  renderModificationRecords(currentProduct?.modificationRecords);
  document.getElementById('productChangeRecords')?.addEventListener('click', (event) => {
    const attachmentLink = event.target.closest('.product-change-attachment-link');
    if (!attachmentLink) return;
    const record = currentProduct?.modificationRecords?.[Number(attachmentLink.dataset.recordIndex)];
    openModificationRecordPreview(record);
  });

  document.querySelector('.product-form-page').addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back' || action === 'cancel') returnToList();
    if (action === 'choose-image') imageInput.click();
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    const maximumSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg'];
    const errorElement = form.querySelector('[data-error-for="imageFile"]');
    if (!allowedTypes.includes(file.type) || file.size > maximumSize) {
      imageInput.value = '';
      errorElement.textContent = file.size > maximumSize ? '图片大小不能超过 5M' : '仅支持 png、jpg、jpeg 格式';
      return;
    }
    errorElement.textContent = '';
    document.getElementById('imageButtonText').textContent = '重新选择';
    document.getElementById('imageTip').textContent = `已选择：${file.name}`;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (isViewMode) return;
    const data = readForm();
    const errors = window.ProductValidator.validate(data, { marketPriceRequired: !isEditMode });
    if (Object.keys(errors).length) {
      showErrors(errors);
      showStatus('请检查并补充表单中的必填信息。', 'error');
      return;
    }

    clearErrors();
    if (isEditMode) {
      openModificationModal(data);
      return;
    }
    persistProduct(data);
  });
})();
