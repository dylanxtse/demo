(function () {
  const storageKey = 'procurement-products';
  // 数据版本：mock 数据结构或内容变更时递增，自动失效旧缓存
  const dataVersion = 2;
  const versionKey = 'procurement-products-version';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    let useMock = false;
    try {
      const cachedVersion = window.localStorage.getItem(versionKey);
      if (cachedVersion !== String(dataVersion)) {
        useMock = true;
        window.localStorage.setItem(versionKey, String(dataVersion));
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      useMock = true;
    }

    const products = (useMock || !window.AppStorage)
      ? window.MockProducts
      : (window.AppStorage.read(storageKey, window.MockProducts) || window.MockProducts);
    const clonedProducts = clone(products);
    const demoPotato = window.MockProducts?.find((product) => product.code === 'SP0300040');
    if (demoPotato && !clonedProducts.some((product) => product.code === demoPotato.code)) {
      clonedProducts.push(clone(demoPotato));
    }
    return clonedProducts.map((product) => ({
      ...product,
      isNetVegetable: product.isNetVegetable ?? product.name === '土豆丝',
      purchaseType: (product.isNetVegetable ?? product.name === '土豆丝') ? '企业自加工' : product.purchaseType,
      defaultSupplier: product.defaultSupplier || '平台默认供应商',
      responsible: product.responsible || '管理员',
      shelfLife: product.shelfLife === false || product.shelfLife == null ? '' : product.shelfLife
    }));
  }

  function save(products) {
    if (window.AppStorage) {
      window.AppStorage.write(storageKey, products);
      try { window.localStorage.setItem(versionKey, String(dataVersion)); } catch {}
    }
  }

  window.ProductService = {
    getList() {
      return load();
    },
    getDetail(id) {
      return load().find((product) => product.code === id) || null;
    },
    create(data) {
      const products = load();
      const nextNumber = products.reduce((maximum, product) => {
        const number = Number(String(product.code).replace(/\D/g, '')) || 0;
        return Math.max(maximum, number);
      }, 0) + 1;
      const now = new Date();
      const created = {
        ...data,
        seq: products.length + 1,
        code: `SP${String(nextNumber).padStart(7, '0')}`,
        status: '已下架',
        source: '平台添加',
        addTime: now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      };
      products.unshift(created);
      products.forEach((product, index) => { product.seq = index + 1; });
      save(products);
      return clone(created);
    },
    update(id, data) {
      const products = load();
      const index = products.findIndex((product) => product.code === id);
      if (index < 0) return null;
      products[index] = { ...products[index], ...data, code: products[index].code };
      save(products);
      return clone(products[index]);
    }
  };
})();
