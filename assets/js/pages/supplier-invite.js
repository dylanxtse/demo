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
        <section class="supplier-register-section supplier-register-section--nature">
          <div class="supplier-register-section-inner">
            <div class="register-section-label required">供应商性质</div>
            <div class="register-radio-group">
              <label class="register-radio"><input type="radio" name="supplierNature" data-field="supplierNature" value="企业" checked>企业</label>
              <label class="register-radio"><input type="radio" name="supplierNature" data-field="supplierNature" value="个体">个体</label>
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
                  <div class="register-info-grid">
                    <div class="register-info-field"><label class="register-field-label required">统一社会信用代码</label><div class="register-field-control"><input class="register-input" data-field="licenseCode" placeholder="请输入"></div></div>
                    <div class="register-info-field"><label class="register-field-label required">名称</label><div class="register-field-control"><input class="register-input" data-field="companyName" placeholder="请输入"></div></div>
                    <div class="register-info-field"><label class="register-field-label required">注册资本</label><div class="register-field-control register-money"><input class="register-input" data-field="capital" placeholder="请输入"><span class="register-money-unit">万元</span></div></div>
                    <div class="register-info-field"><label class="register-field-label required">营业期限</label><div class="register-field-control register-date-range"><input class="register-input" type="date" data-field="businessStart"><span class="register-date-separator">—</span><input class="register-input" type="date" data-field="businessEnd"><label class="register-long-term"><input type="checkbox" data-field="isLongTerm">长期</label></div></div>
                    <div class="register-info-field wide"><label class="register-field-label required">经营场所</label><div class="register-field-control"><input class="register-input" data-field="businessPlace" placeholder="请输入"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="supplier-register-section supplier-register-section--uploads">
          <div class="supplier-register-section-inner">
            <div class="register-upload-row">
              <div class="register-section-label required">法人身份证</div>
              <div class="register-upload-content">
                <div class="register-upload-tiles">
                  <button class="register-upload-tile" type="button" data-upload-trigger="idCardFront"><span class="upload-plus">+</span><span class="upload-title">上传人像</span></button>
                  <input type="file" accept=".png,.jpg,.jpeg" data-file="idCardFront" hidden>
                  <button class="register-upload-tile" type="button" data-upload-trigger="idCardBack"><span class="upload-plus">+</span><span class="upload-title">上传国徽像</span></button>
                  <input type="file" accept=".png,.jpg,.jpeg" data-file="idCardBack" hidden>
                </div>
                <div class="register-upload-file" data-file-name="idCardFront"></div>
                <div class="register-upload-file" data-file-name="idCardBack"></div>
                <p class="register-helper">请上传营业执照中法人的身份证件。图片支持png、jpg、jpeg格式，大小不超过5M。</p>
                <div class="register-info-card">
                  <div class="register-info-card-title">请仔细核对法人身份证信息，若信息不符，请手动修改。</div>
                  <div class="register-info-grid">
                    <div class="register-info-field"><label class="register-field-label required">法人姓名</label><div class="register-field-control"><input class="register-input" data-field="representativeName" placeholder="请输入"></div></div>
                    <div class="register-info-field"><label class="register-field-label required">法人身份证号</label><div class="register-field-control"><input class="register-input" data-field="representativeIdNo" placeholder="请输入"></div></div>
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

        <section class="supplier-register-section supplier-register-section--contact">
          <div class="supplier-register-section-inner">
            <div class="register-contact-fields">
              <div class="register-contact-field"><label class="register-field-label required">供应商联系人</label><div class="register-field-control"><input class="register-input" data-field="contact" placeholder="请输入"></div></div>
              <div class="register-contact-field"><label class="register-field-label required">联系电话</label><div class="register-field-control"><input class="register-input" data-field="phone" placeholder="请输入"></div></div>
            </div>
          </div>
        </section>

        <div class="register-submit-bar"><button class="register-submit-button" type="submit">提交</button></div>
      </form>
      <div class="register-toast" id="registerToast" role="status"></div>
    </main>`;

  const form = root.querySelector('#supplierRegisterForm');
  const fileState = { license: '', idCardFront: '', idCardBack: '', qualifications: [] };

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
    const fallback = key === 'license' ? '未选择文件' : key === 'idCardFront' ? '未选择人像文件' : '未选择国徽像文件';
    setFileName(key, file?.name || fallback);
  }

  function toggleLongTerm() {
    const checkbox = root.querySelector('[data-field="isLongTerm"]');
    const endDate = root.querySelector('[data-field="businessEnd"]');
    if (!checkbox || !endDate) return;
    endDate.disabled = checkbox.checked;
    if (checkbox.checked) endDate.value = '';
    checkbox.closest('.register-long-term')?.classList.toggle('is-disabled', checkbox.checked);
  }

  function submit() {
    const isLongTerm = Boolean(root.querySelector('[data-field="isLongTerm"]')?.checked);
    const requiredFields = [
      ['licenseCode', '统一社会信用代码'], ['companyName', '名称'], ['capital', '注册资本'],
      ['businessStart', '营业期限开始日期'], ['businessPlace', '经营场所'],
      ['representativeName', '法人姓名'], ['representativeIdNo', '法人身份证号'],
      ['contact', '供应商联系人'], ['phone', '联系电话']
    ];
    const missing = requiredFields.find(([key]) => !valueOf(key));
    if (missing) { showToast(`请填写${missing[1]}`, true); root.querySelector(`[data-field="${missing[0]}"]`)?.focus(); return; }
    if (!isLongTerm && !valueOf('businessEnd')) { showToast('请选择营业期限结束日期，或勾选长期', true); return; }
    if (!isLongTerm && valueOf('businessStart') > valueOf('businessEnd')) { showToast('营业期限开始日期不能晚于结束日期', true); return; }
    if (!/^1\d{10}$/.test(valueOf('phone'))) { showToast('请输入正确的联系电话', true); return; }
    if (!service) { showToast('供应商注册服务暂不可用，请刷新页面重试', true); return; }

    const companyName = valueOf('companyName');
    const businessStart = valueOf('businessStart');
    const businessEnd = isLongTerm ? '' : valueOf('businessEnd');
    const username = `invite${Date.now().toString(36).replace(/[^a-z0-9]/gi, '').slice(-12)}`;
    service.add('suppliers', {
      name: companyName,
      nameFromLicense: companyName,
      username,
      contact: valueOf('contact'),
      phone: valueOf('phone'),
      status: '待审核',
      auditStatus: '待审核',
      source: '供应商邀请',
      inviteToken,
      inviteExpiresAt: inviteExpires,
      submittedAt: dateTimeNow(),
      businessNature: root.querySelector('[data-field="supplierNature"]:checked')?.value || '企业',
      licenseCode: valueOf('licenseCode'),
      capital: valueOf('capital'),
      businessStart,
      businessEnd,
      isLongTerm,
      businessPlace: valueOf('businessPlace'),
      address: valueOf('businessPlace'),
      cooperationStart: businessStart,
      cooperationEnd: businessEnd,
      representativeName: valueOf('representativeName'),
      representativeIdNo: valueOf('representativeIdNo'),
      licenseFileName: fileState.license || '待补充营业执照.png',
      idCardFrontFileName: fileState.idCardFront || '待补充身份证人像.png',
      idCardBackFileName: fileState.idCardBack || '待补充身份证国徽.png',
      qualifications: fileState.qualifications,
      jointVenture: false,
      hideCustomerPrice: false
    }, 'SUP');
    window.location.href = './supplier-archive.html?submitted=1';
  }

  form.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-upload-trigger]');
    if (trigger) root.querySelector(`[data-file="${trigger.dataset.uploadTrigger}"]`)?.click();
  });
  form.addEventListener('change', (event) => {
    if (event.target.matches('[data-file]')) handleFile(event.target);
    if (event.target.matches('[data-field="isLongTerm"]')) toggleLongTerm();
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); submit(); });
})();
