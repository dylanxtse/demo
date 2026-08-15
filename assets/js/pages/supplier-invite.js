(function () {
  const root = document.getElementById('supplierInviteApp');
  const service = window.BiddingService;
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get('invite') || 'demo';
  const inviteExpires = params.get('expires') || '';

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const localDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const dateTimeNow = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
  const valueOf = (key) => root.querySelector(`[data-field="${key}"]`)?.value?.trim() || '';

  function showMessage(title, description) {
    root.innerHTML = `
      <main class="supplier-register-page register-message-page">
        <section class="register-message">
          <h2>${esc(title)}</h2>
          <p>${esc(description)}</p>
          <a href="./supplier-invite.html?mode=invite&invite=demo">查看供应商注册页面</a>
        </section>
      </main>`;
  }

  function showToast(message, error = false) {
    const toast = root.querySelector('#registerToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-error', error);
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  if (!root) return;
  if (inviteExpires && inviteExpires < localDate()) {
    showMessage('邀请链接已失效', '请联系教育局重新获取邀请链接。');
    return;
  }

  root.innerHTML = `
    <main class="supplier-register-page">
      <header class="supplier-register-header"><h1>供应商注册</h1></header>
      <form id="supplierRegisterForm" novalidate>
        <section class="supplier-register-section supplier-register-section--basic">
          <div class="supplier-register-section-inner">
            <div class="register-basic-fields">
              <div class="register-basic-field"><label class="register-field-label required">供应商名称</label><div class="register-field-control"><input class="register-input" data-field="name" placeholder="请输入供应商名称"></div></div>
              <div class="register-basic-field"><label class="register-field-label required">联系人</label><div class="register-field-control"><input class="register-input" data-field="contact" placeholder="请输入供应商联系人"></div></div>
              <div class="register-basic-field"><label class="register-field-label required">联系电话</label><div class="register-field-control"><input class="register-input" data-field="phone" placeholder="请输入联系电话"></div></div>
            </div>
          </div>
        </section>

        <section class="supplier-register-section supplier-register-section--uploads">
          <div class="supplier-register-section-inner">
            <div class="register-upload-row">
              <div class="register-section-label required">营业执照</div>
              <div class="register-upload-content">
                <div class="register-upload-tiles">
                  <button class="register-upload-tile" type="button" data-upload-trigger="license"><span class="upload-plus">+</span><span class="upload-title">选择文件</span></button>
                  <input type="file" accept=".png,.jpg,.jpeg" data-file="license" hidden>
                </div>
                <p class="register-upload-file" data-file-name="license"></p>
                <p class="register-helper">图片支持png、jpg、jpeg格式，大小不超过5M。</p>
                <div class="register-info-card">
                  <div class="register-info-card-title">请仔细核对营业执照信息，若信息不符，请手动修改。</div>
                  <div class="register-info-grid register-license-info-grid">
                    <div class="register-info-field"><label class="register-field-label">统一社会信用代码</label><div class="register-field-control"><input class="register-input" data-field="licenseCode" placeholder="请输入统一社会信用代码"></div></div>
                    <div class="register-info-field"><label class="register-field-label">住所</label><div class="register-field-control"><input class="register-input" data-field="address" placeholder="请输入住所"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="supplier-register-section supplier-register-section--qualifications">
          <div class="supplier-register-section-inner">
            <div class="register-qualification-row">
              <div class="register-section-label">其他资质</div>
              <div class="register-upload-content">
                <button class="register-plus-button" type="button" data-upload-trigger="qualification">+</button>
                <input type="file" accept=".png,.jpg,.jpeg" data-file="qualification" multiple hidden>
                <div class="register-qualification-list" data-qualification-list></div>
                <p class="register-helper">请上传食品经营许可证、质量管理体系认证证书等。图片支持png、jpg、jpeg格式，大小不超过5M。</p>
              </div>
            </div>
          </div>
        </section>

        <div class="register-submit-bar"><button class="register-submit-button" type="submit">提交</button><button class="register-demo-button" type="button" data-action="demo-return">返回教育局页面</button></div>
      </form>
      <div class="register-toast" id="registerToast" role="status"></div>
    </main>`;

  const form = root.querySelector('#supplierRegisterForm');
  const fileState = { license: '', qualifications: [] };

  function validImage(file) {
    return file && file.size <= 5 * 1024 * 1024 && /\.(png|jpe?g)$/i.test(file.name);
  }

  function setFileName(key, name) {
    const node = root.querySelector(`[data-file-name="${key}"]`);
    if (node) node.textContent = name;
  }

  function handleFile(input) {
    const key = input.dataset.file;
    if (key === 'qualification') {
      const files = [...(input.files || [])];
      if (files.some((file) => !validImage(file))) {
        showToast('资质图片需为不超过5M的png、jpg或jpeg图片', true);
        input.value = '';
        return;
      }
      fileState.qualifications.push(...files.map((file) => file.name));
      root.querySelector('[data-qualification-list]').innerHTML = fileState.qualifications.map((name) => `<span class="register-qualification-chip">${esc(name)}</span>`).join('');
      input.value = '';
      return;
    }
    const file = input.files?.[0];
    if (file && !validImage(file)) {
      showToast('图片需为不超过5M的png、jpg或jpeg图片', true);
      input.value = '';
      return;
    }
    fileState[key] = file?.name || '';
    setFileName(key, file?.name || '未选择文件');
  }

  function submit() {
    const requiredFields = [
      ['name', '供应商名称'],
      ['contact', '供应商联系人'], ['phone', '联系电话']
    ];
    const missing = requiredFields.find(([key]) => !valueOf(key));
    if (missing) { showToast(`请填写${missing[1]}`, true); root.querySelector(`[data-field="${missing[0]}"]`)?.focus(); return; }
    if (!/^1\d{10}$/.test(valueOf('phone'))) { showToast('请输入正确的联系电话', true); return; }
    if (!service) { showToast('供应商注册服务暂不可用，请刷新页面重试', true); return; }

    service.add('suppliers', {
      name: valueOf('name'),
      nameFromLicense: valueOf('name'),
      username: '',
      contact: valueOf('contact'),
      phone: valueOf('phone'),
      status: '待审核',
      auditStatus: '待审核',
      source: '供应商邀请',
      inviteToken,
      inviteExpiresAt: inviteExpires,
      submittedAt: dateTimeNow(),
      licenseCode: valueOf('licenseCode'),
      address: valueOf('address'),
      licenseFileName: fileState.license || '待补充营业执照.png',
      qualifications: fileState.qualifications,
      cooperationStart: '',
      cooperationEnd: '',
      jointVenture: false,
      hideCustomerPrice: false
    }, 'SUP');
    showToast('提交成功，请点击“演示”返回教育局审核');
  }

  form.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="demo-return"]')) {
      window.location.replace('./supplier-archive.html');
      return;
    }
    const trigger = event.target.closest('[data-upload-trigger]');
    if (trigger) root.querySelector(`[data-file="${trigger.dataset.uploadTrigger}"]`)?.click();
  });
  form.addEventListener('change', (event) => {
    if (event.target.matches('[data-file]')) handleFile(event.target);
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); submit(); });
})();
