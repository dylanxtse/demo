(function () {
  window.PrototypeAnnotationData = {
  "pages": {
    "warehouse-archive.html::仓库档案": [
      {
        "id": "warehouse-detail-modal",
        "target": "detail-modal",
        "placement": "right",
        "title": "查看仓库",
        "headerColumn": "warehouseCode",
        "items": [
          "新增显示仓库编码、负责人、联系电话、运营分公司和添加时间。",
          "字段在弹窗中按单列方式展示。"
        ],
        "number": "4",
        "popoverPosition": {
          "x": 27,
          "y": 19
        },
        "markerPosition": {
          "x": 68,
          "y": -48
        },
        "deleted": true
      },
      {
        "id": "warehouse-filter-fields",
        "target": "filter",
        "placement": "left",
        "title": "查询项",
        "items": [
          "新增运营分公司查询项，选项取值来源行政区域数据字典，下拉单选框，支持搜索，模糊匹配，默认选中“全部”；",
          "新增负责人/联系电话查询项，搜索框，模糊匹配，支持查询仓库负责人姓名或联系电话；"
        ],
        "number": "3",
        "markerPosition": {
          "x": -14,
          "y": 16
        },
        "popoverPosition": {
          "x": -384,
          "y": 21
        }
      },
      {
        "id": "warehouse-export-button",
        "target": "toolbar-action",
        "actionKey": "export",
        "placement": "left",
        "entryMarkerPosition": "left",
        "title": "导出按钮",
        "items": [
          "新增导出按钮，支持导出选中的仓库档案列表项；",
          "点击导出时校验是否已勾选列表项， 未勾选时提示“请先勾选要导出的仓库”；"
        ],
        "popoverActions": [
          {
            "key": "view-warehouse-export-template",
            "label": "查看导出模版",
            "className": "btn btn-sm record-annotation-demo-action record-annotation-action"
          }
        ],
        "number": "4",
        "markerPosition": {
          "x": -13,
          "y": 21
        },
        "popoverPosition": {
          "x": -377,
          "y": 20
        }
      },
      {
        "id": "warehouse-list-header",
        "target": "table-header",
        "title": "仓库列表",
        "items": [
          "新增固定显示勾选框；",
          "新增显示负责人、联系电话、运营分公司；",
          "一个仓库由多个分公司运营时，运营分公司省略显示为“等*家单位”；",
          "列表操作项固定显示；"
        ],
        "number": "1",
        "popoverPosition": {
          "x": -382,
          "y": 23
        },
        "markerPosition": {
          "x": -751,
          "y": -18
        },
        "positionByScope": {
          "page": {
            "markerPosition": {
              "x": -751,
              "y": -18
            },
            "popoverPosition": {
              "x": -382,
              "y": 23
            }
          }
        }
      },
      {
        "id": "warehouse-add-modal",
        "target": "add-modal",
        "placement": "right",
        "scope": "modal",
        "entryScope": "page",
        "modalKey": "warehouse-add",
        "anchorPosition": "modal-header-right",
        "title": "添加仓库",
        "items": [
          "新增负责人、联系电话、运营分公司字段。",
          "负责人、联系电话为非必填。",
          "运营分公司为非必填，支持多选。",
          "运营分公司选项默认最多显示5行，超出支持滑动查看。"
        ],
        "number": "2",
        "popoverPosition": {
          "x": 32,
          "y": -153
        },
        "markerPosition": {
          "x": 95,
          "y": 16
        },
        "positionByScope": {
          "modal": {
            "markerPosition": {
              "x": 125,
              "y": 15
            },
            "popoverPosition": {
              "x": 32,
              "y": -153
            }
          },
          "page": {
            "markerPosition": {
              "x": 96,
              "y": 14
            }
          }
        }
      },
      {
        "id": "custom-1787393732657-1",
        "target": "custom",
        "targetSelector": "div.app-layout > section.main-section > main.content-area > section.page-card > div.record-table-annotation-surface:nth-of-type(4) > div.operations-table-container:nth-of-type(2) > div.operations-table-wrap:nth-of-type(1) > table.operations-table > thead > tr > th:nth-of-type(3)",
        "placement": "right",
        "title": "仓库编码",
        "items": [
          "点击仓库编码显示标题为“查看仓库”的弹窗；",
          "弹窗新增显示仓库编码、负责人、联系电话和运营分公司。"
        ],
        "number": "5",
        "markerPosition": {
          "x": 119,
          "y": 5
        }
      },
      {
        "id": "custom-1787480651906-2",
        "target": "custom",
        "targetSelector": "div > div.operations-modal-backdrop > section.operations-modal > header.operations-modal-header > h3",
        "placement": "right",
        "scope": "modal",
        "title": "添加仓库档案",
        "items": [
          "非34放"
        ],
        "number": "6",
        "deleted": true
      },
      {
        "id": "custom-1787540809914-2",
        "target": "custom",
        "targetSelector": "div > div.operations-modal-backdrop > section.operations-modal > div.operations-modal-body > form > div.operations-form-grid > div.operations-form-item:nth-of-type(5) > div.operations-form-control > div.operations-multi-select:nth-of-type(1) > label.operations-multi-option:nth-of-type(2)",
        "placement": "right",
        "scope": "modal",
        "title": "添加仓库弹窗标注",
        "items": [
          "仅支持选中未关联仓库的分公司选项，已关联其他仓库的分公司显示为选中置灰状态"
        ],
        "number": "6",
        "positionByScope": {
          "modal": {
            "markerPosition": {
              "x": -123,
              "y": -36
            },
            "popoverPosition": {
              "x": -358,
              "y": 30
            }
          }
        }
      },
      {
        "id": "custom-1787544037046-1",
        "target": "custom",
        "targetSelector": "section.page-card > div.record-table-annotation-surface:nth-of-type(4) > div.operations-table-container:nth-of-type(2) > div.operations-table-wrap:nth-of-type(1) > table.operations-table > thead > tr > th:nth-of-type(8)",
        "placement": "right",
        "scope": "page",
        "title": "运营分公司",
        "items": [
          "已经关联过仓库的运营分公司可不再次被其他仓库关联；"
        ],
        "number": "7",
        "positionByScope": {
          "page": {
            "markerPosition": {
              "x": 65,
              "y": -12
            },
            "popoverPosition": {
              "x": -370,
              "y": 28
            }
          }
        }
      }
    ],
    "supplier-archive.html::supplierManagementPage": [
      {
        "id": "supplier-list-header",
        "placement": "right",
        "title": "供应商列表",
        "items": [
          "勾选框固定显示；",
          "新增用户名字段；",
          "列表操作项固定显示；"
        ],
        "number": "1",
        "markerPosition": {
          "x": -255,
          "y": -11
        },
        "popoverPosition": {
          "x": -386,
          "y": 18
        }
      },
      {
        "id": "supplier-export-button",
        "placement": "left",
        "actionKey": "export",
        "entryMarkerPosition": "left",
        "title": "导出按钮",
        "items": [
          "点击导出时校验是否已勾选列表项目，未勾选时提示“请先勾选要导出的供应商”。"
        ],
        "popoverActions": [
          {
            "key": "view-supplier-export-template",
            "label": "查看导出模版",
            "className": "btn btn-sm record-annotation-demo-action record-annotation-action"
          }
        ],
        "number": "2",
        "markerPosition": {
          "x": -12,
          "y": 18
        },
        "popoverPosition": {
          "x": -385,
          "y": 16
        }
      }
    ],
    "warehouse-monitor.html::仓库监控": [
      {
        "id": "custom-1787479690617-1",
        "target": "custom",
        "targetSelector": "#addMonitorPointButton",
        "placement": "right",
        "title": "视频查看",
        "items": [
          "交发集团需要查看全部仓库的监控视频，下属单位支持查看关联仓库的监控视频；",
          "同一仓库内的点位名称不可重复；"
        ],
        "number": "1",
        "markerPosition": {
          "x": 67,
          "y": 14
        },
        "popoverPosition": {
          "x": 35,
          "y": 2
        },
        "positionByScope": {
          "page": {
            "markerPosition": {
              "x": 67,
              "y": 14
            },
            "popoverPosition": {
              "x": 35,
              "y": 2
            }
          }
        }
      }
    ],
    "lower-units.html::下属单位管理": [
      {
        "id": "custom-1787541052513-1",
        "target": "custom",
        "targetSelector": "div.lower-units-modal:nth-of-type(1) > div.lower-units-dialog > div.lower-units-dialog-body:nth-of-type(2) > div.lower-units-form-grid > div.lower-units-form-field:nth-of-type(7) > label",
        "placement": "right",
        "scope": "modal",
        "title": "绑定负责区域",
        "items": [
          "只能选中未被分公司关联的区域，已被分公司关联的区域不可被其他分公司关联；",
          "已经被其他分公司关联的区域显示为选中置灰禁用状态；"
        ],
        "number": "1",
        "positionByScope": {
          "modal": {
            "markerPosition": {
              "x": 85,
              "y": -8
            }
          }
        }
      },
      {
        "id": "custom-1787541142830-3",
        "target": "custom",
        "targetSelector": "section.page-card > div.lower-units-table-wrap:nth-of-type(3) > table.lower-units-table > thead > tr > th:nth-of-type(3)",
        "placement": "right",
        "scope": "page",
        "title": "负责区域",
        "items": [
          "只能选中未被分公司关联的区域，已被分公司关联的区域不可被其他分公司关联；"
        ],
        "number": "2",
        "positionByScope": {
          "page": {
            "markerPosition": {
              "x": 88,
              "y": -18
            }
          }
        }
      }
    ]
  }
};
})();
