(function () {
  const resource = 'warehouseMonitorPoints';
  const videoOptions = [
    {
      label: '仓储装卸口 · 公开实景视频',
      value: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_warehouse_BHX4_loading_docks_2.webm',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Amazon_warehouse_BHX4_loading_docks_2.webm/960px--Amazon_warehouse_BHX4_loading_docks_2.webm.jpg'
    },
    {
      label: '包裹分拣线 · 公开实景视频',
      value: 'https://commons.wikimedia.org/wiki/Special:FilePath/Robot_package_handling.webm',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Robot_package_handling.webm/960px--Robot_package_handling.webm.jpg'
    },
    {
      label: '出库装车口 · 加载失败示例',
      value: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plastic_Industry_%287%29_-_Loading_dock.webm',
      thumbnail: 'https://commons.wikimedia.org/wiki/Special:FilePath/warehouse-monitor-loading-failed-example.jpg',
      loadFailure: true
    }
  ];
  const legacyVideoAddressMap = {
    'mock://warehouse/center-inbound': videoOptions[0].value,
    'mock://warehouse/center-sorting': videoOptions[1].value,
    'mock://warehouse/north-outbound': videoOptions[2].value,
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4': videoOptions[0].value,
    'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4': videoOptions[1].value,
    'https://www.w3schools.com/html/mov_bbb.mp4': videoOptions[2].value,
    'https://example.com/demo-stream.mp4': videoOptions[0].value
  };

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function normalize(value) {
    return String(value ?? '').trim();
  }

  function now() {
    return window.BusinessRules?.now?.() || new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  function list() {
    const points = window.DemoStore?.get(resource) || [];
    const migrated = points.map((point) => {
      const nextAddress = legacyVideoAddressMap[point.videoAddress];
      return nextAddress ? { ...point, videoAddress: nextAddress } : point;
    });
    if (migrated.some((point, index) => point.videoAddress !== points[index]?.videoAddress)) {
      window.DemoStore?.replace?.(resource, migrated);
      return migrated;
    }
    return points;
  }

  function assertUnique(points, name, currentId = '') {
    const duplicate = points.some((point) => (
      point.id !== currentId && normalize(point.name).toLocaleLowerCase() === name.toLocaleLowerCase()
    ));
    if (duplicate) {
      const error = new Error('点位名称不能重复');
      error.code = 'DUPLICATE_MONITOR_POINT_NAME';
      throw error;
    }
  }

  function assertVideoAddress(value, allowLegacy = false) {
    if (videoOptions.some((option) => option.value === value) || allowLegacy) return;
    const error = new Error('请选择视频地址');
    error.code = 'INVALID_MONITOR_VIDEO_ADDRESS';
    throw error;
  }

  function nextId(points) {
    const max = points.reduce((highest, point) => {
      const match = String(point.id || '').match(/(\d+)$/);
      return Math.max(highest, match ? Number(match[1]) : 0);
    }, 0);
    return `WMP-${String(max + 1).padStart(3, '0')}`;
  }

  function payload(data, current = {}) {
    return {
      ...current,
      name: normalize(data.name ?? current.name),
      description: normalize(data.description ?? current.description),
      videoAddress: normalize(data.videoAddress ?? data.videoUrl ?? current.videoAddress)
    };
  }

  window.WarehouseMonitorService = {
    videoOptions: clone(videoOptions),

    list(keyword = '') {
      const query = normalize(keyword).toLocaleLowerCase();
      return list().filter((point) => !query || normalize(point.name).toLocaleLowerCase().includes(query));
    },

    get(id) {
      return list().find((point) => point.id === id) || null;
    },

    create(data) {
      const current = list();
      const values = payload(data);
      if (!values.name) throw new Error('请输入点位名称');
      if (!values.videoAddress) throw new Error('请输入视频地址');
      assertVideoAddress(values.videoAddress);
      assertUnique(current, values.name);
      const createdAt = now();
      const created = {
        id: nextId(current),
        ...values,
        createdAt,
        updatedAt: createdAt
      };
      window.DemoStore.transact((state) => {
        if (!Array.isArray(state[resource])) state[resource] = [];
        state[resource].unshift(created);
        return created;
      });
      return clone(created);
    },

    update(id, data) {
      const current = list();
      const index = current.findIndex((point) => point.id === id);
      if (index < 0) throw new Error('点位不存在或已删除');
      const values = payload(data, current[index]);
      if (!values.name) throw new Error('请输入点位名称');
      if (!values.videoAddress) throw new Error('请输入视频地址');
      assertVideoAddress(values.videoAddress, !videoOptions.some((option) => option.value === values.videoAddress));
      assertUnique(current, values.name, id);
      const updated = { ...current[index], ...values, updatedAt: now() };
      window.DemoStore.transact((state) => {
        state[resource][index] = updated;
        return updated;
      });
      return clone(updated);
    },

    remove(id) {
      const current = list();
      const index = current.findIndex((point) => point.id === id);
      if (index < 0) throw new Error('点位不存在或已删除');
      const removed = current[index];
      window.DemoStore.transact((state) => {
        state[resource].splice(index, 1);
        return removed;
      });
      return clone(removed);
    }
  };
})();
