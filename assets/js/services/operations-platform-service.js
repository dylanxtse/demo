(function () {
  const rows = [
    { id: 'EDU-001', name: '孟村教育局', province: '河北省', city: '沧州市', district: '孟村回族自治县', username: 'MC10000', contactName: '默认', phone: '13650000000', status: '启用' },
    { id: 'EDU-002', name: '河北沧州教育局石油分局', province: '河北省', city: '沧州市', district: '石油分局', username: 'CZSY10000', contactName: '默认', phone: '18600000000', status: '启用' },
    { id: 'EDU-003', name: '海兴县教育局', province: '河北省', city: '沧州市', district: '海兴县', username: 'HX10000', contactName: '默认', phone: '18600000001', status: '启用' },
    { id: 'EDU-004', name: '东光县教育局', province: '河北省', city: '沧州市', district: '东光县', username: 'DG10000', contactName: '默认', phone: '18600000002', status: '启用' },
    { id: 'EDU-005', name: '南大港教育局', province: '河北省', city: '沧州市', district: '南大港', username: 'ND10000', contactName: '默认', phone: '18600000004', status: '启用' },
    { id: 'EDU-006', name: '南皮县教育局', province: '河北省', city: '沧州市', district: '南皮县', username: 'NP10000', contactName: '默认', phone: '13610000000', status: '启用' },
    { id: 'EDU-007', name: '沧县教育局', province: '河北省', city: '沧州市', district: '沧县', username: 'CX10000', contactName: '沧县教育局', phone: '18600000003', status: '启用' },
    { id: 'EDU-008', name: '献县教育体育局', province: '河北省', city: '沧州市', district: '献县', username: 'XX10000', contactName: '默认', phone: '18600000005', status: '启用' },
    { id: 'EDU-009', name: '中捷产业园教育局', province: '河北省', city: '沧州市', district: '中捷产业园', username: 'CZZJ10000', contactName: '默认', phone: '13620000000', status: '启用' },
    { id: 'EDU-010', name: '黄骅教育局', province: '河北省', city: '沧州市', district: '黄骅市', username: 'HH10000', contactName: '默认', phone: '18600000006', status: '启用' },
    { id: 'EDU-011', name: '沧州教育局', province: '河北省', city: '沧州市', district: '市直属', username: 'CZ10000', contactName: '默认', phone: '18600000009', status: '启用' },
    { id: 'EDU-012', name: '沧州港城产业园区教育局', province: '河北省', city: '沧州市', district: '港城', username: 'CZGC10000', contactName: '默认', phone: '13900000000', status: '启用' },
    { id: 'EDU-013', name: '任丘教育局', province: '河北省', city: '沧州市', district: '任丘', username: 'RQ10000', contactName: '默认', phone: '18622363279', status: '启用' },
    { id: 'EDU-014', name: '盐山教育局', province: '河北省', city: '沧州市', district: '盐山', username: 'YS10000', contactName: '张建峰', phone: '15075790583', status: '启用' },
    { id: 'EDU-015', name: '河间市教育局', province: '河北省', city: '沧州市', district: '河间', username: 'HJ10000', contactName: '默认', phone: '15932706207', status: '启用' },
    { id: 'EDU-016', name: '肃宁县教育局', province: '河北省', city: '沧州市', district: '肃宁', username: 'SN10000', contactName: '默认', phone: '18233731111', status: '启用' },
    { id: 'EDU-017', name: '吴桥县教育局', province: '河北省', city: '沧州市', district: '吴桥', username: 'WQ10000', contactName: '默认', phone: '13393176896', status: '启用' },
    { id: 'EDU-018', name: '青县教育局', province: '河北省', city: '沧州市', district: '青县', username: 'QX10000', contactName: '默认', phone: '13292756733', status: '启用' },
    { id: 'EDU-019', name: '泊头市教育局', province: '河北省', city: '沧州市', district: '泊头市', username: 'BT10000', contactName: '默认', phone: '13680000000', status: '启用' }
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalize = (value) => String(value ?? '').trim().toLocaleLowerCase();

  window.OperationsPlatformService = {
    getRows() {
      return clone(rows);
    },

    filterRows(source, filters = {}) {
      const keyword = normalize(filters.keyword);
      return source.filter((row) => {
        const regionMatch = ['province', 'city', 'district'].every((key) => !filters[key] || row[key] === filters[key]);
        const keywordMatch = !keyword || [row.name, row.username, row.contactName, row.phone].some((value) => normalize(value).includes(keyword));
        return regionMatch && keywordMatch;
      });
    }
  };
})();
