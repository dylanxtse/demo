(function () {
  const seedRows = [
    { seq: 1, code: 'SSP03958', name: '绿豆(斤/--/--)', category: '其他材料-其他材料（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-07-01 16:01:26' },
    { seq: 2, code: 'SSP03957', name: '冬瓜(斤/--/--)', category: '果蔬-蔬菜（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-27 17:49:08' },
    { seq: 3, code: 'SSP03956', name: '菠菜(斤/--/--)', category: '果蔬-蔬菜（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-27 17:47:49' },
    { seq: 4, code: 'SSP03955', name: '乌江榨菜(箱/--/--)', category: '果蔬-蔬菜（二级）', unit: '箱', supplier: '交发集团', addTime: '2026-06-27 17:45:07' },
    { seq: 5, code: 'SSP03954', name: '丝瓜(斤/--/--)', category: '果蔬-蔬菜（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-27 17:41:00' },
    { seq: 6, code: 'SSP03953', name: '粉条(斤/--/--)', category: '调料-调料（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-27 17:27:23' },
    { seq: 7, code: 'SSP03952', name: '东北大米(斤/九河泉/25kg/袋)', category: '主食（米面粉点心类）-米（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-22 09:21:20' },
    { seq: 8, code: 'SSP03951', name: '好丸棒(袋/--/1×25)', category: '调料-调料（二级）', unit: '袋', supplier: '交发集团', addTime: '2026-06-22 08:42:03' },
    { seq: 9, code: 'SSP03950', name: '豆包(袋/雪发斋/1kg/袋)', category: '主食（米面粉点心类）-点心（二级）', unit: '袋', supplier: '交发集团', addTime: '2026-06-22 08:32:21' },
    { seq: 10, code: 'SSP03949', name: '凤球唛番茄酱(桶/--/850g)', category: '调料-调料（二级）', unit: '桶', supplier: '交发集团', addTime: '2026-06-21 11:39:16' },
    { seq: 11, code: 'SSP03948', name: '孜然粉(斤/--/--)', category: '调料-调料（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-21 11:26:19' },
    { seq: 12, code: 'SSP03947', name: '油麦菜(斤/--/--)', category: '果蔬-蔬菜（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-21 08:23:03' },
    { seq: 13, code: 'SSP03946', name: '玉米淀粉(袋/--/--)', category: '调料-调料（二级）', unit: '袋', supplier: '交发集团', addTime: '2026-06-17 07:52:41' },
    { seq: 14, code: 'SSP03945', name: '绿豆(斤/--/--)', category: '主食（米面粉点心类）-米（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-15 10:10:43' },
    { seq: 15, code: 'SSP03944', name: '鸡蛋(箱/--/--)', category: '蛋奶类-鲜鸡蛋（二级）', unit: '箱', supplier: '交发集团', addTime: '2026-06-12 10:25:37' },
    { seq: 16, code: 'SSP03943', name: '鸡肉馅(斤/--/--)', category: '肉（豆）制品-冻肉（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-11 07:43:34' },
    { seq: 17, code: 'SSP03942', name: '绿豆(斤/--/斤)', category: '主食（米面粉点心类）-米（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-08 09:09:56' },
    { seq: 18, code: 'SSP03941', name: '里脊肉(斤/--/--)', category: '肉（豆）制品-鲜肉（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-04 15:44:11' },
    { seq: 19, code: 'SSP03940', name: '山楂片(斤/--/--)', category: '调料-调料（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-01 18:07:34' },
    { seq: 20, code: 'SSP03939', name: '绿豆(斤/--/1×25kg)', category: '主食（米面粉点心类）-米（二级）', unit: '斤', supplier: '交发集团', addTime: '2026-06-01 09:05:10' }
  ];

  const netVegetableSeedRows = [
    { seq: 1, code: 'SSP03960', name: '土豆丝(斤/--/散装)', category: '果蔬-净菜类', unit: '斤', supplier: '交发集团', addTime: '2026-07-02 09:12:00', isNetVegetable: true },
    { seq: 2, code: 'SSP03959', name: '白菜段(斤/--/散装)', category: '果蔬-净菜类', unit: '斤', supplier: '交发集团', addTime: '2026-07-02 09:10:00', isNetVegetable: true },
    { seq: 3, code: 'SSP03961', name: '胡萝卜片(斤/--/散装)', category: '果蔬-净菜类', unit: '斤', supplier: '交发集团', addTime: '2026-07-02 09:15:00', isNetVegetable: true }
  ];
  const allSeedRows = [...netVegetableSeedRows, ...seedRows];

  const extraCategories = ['果蔬-水果（二级）', '肉（豆）制品-豆制品（二级）', '水产品-水产品（二级）', '蛋奶类-奶制品（二级）', '其他材料-其他材料（二级）'];
  const rows = Array.from({ length: 3870 }, (_, index) => {
    if (index < allSeedRows.length) return { ...allSeedRows[index], seq: index + 1 };
    const number = 3870 - index;
    return {
      seq: index + 1,
      code: `SSP${String(number).padStart(5, '0')}`,
      name: `示例商品${String(index + 1).padStart(4, '0')}(斤/--/--)`,
      category: extraCategories[index % extraCategories.length],
      unit: index % 3 === 0 ? '斤' : index % 3 === 1 ? '袋' : '箱',
      supplier: '交发集团',
      addTime: '2026-05-31 09:00:00',
      isNetVegetable: false
    };
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalize = (value) => String(value ?? '').trim().toLocaleLowerCase();

  window.SchoolProductService = {
    getRows() {
      return clone(rows).map((row) => ({ ...row, isNetVegetable: row.isNetVegetable === true }));
    },
    filterRows(source, { keyword = '', category = '', netVegetable = '' } = {}) {
      const query = normalize(keyword);
      return source.filter((row) => {
        const textMatch = !query || `${row.code} ${row.name}`.toLocaleLowerCase().includes(query);
        const categoryMatch = !category || row.category === category || row.category.startsWith(`${category}-`) || row.category.includes(category);
        const netVegetableMatch = !netVegetable || (netVegetable === 'net' ? row.isNetVegetable === true : row.isNetVegetable !== true);
        return textMatch && categoryMatch && netVegetableMatch;
      });
    }
  };
})();
