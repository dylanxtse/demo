# 线上—本地页面差异台账

> 线上系统负责提供业务字段和交互基准；本地现有视觉规范及后期迭代内容优先保留。

| 模块 | 页面 | 线上路由 | 本地页面 | 状态 | 已核对内容 |
| --- | --- | --- | --- | --- | --- |
| 商品档案 | 商品管理 | `/goodsManagement` | `index.html` | 已有保留 | 本地已有完整列表及后期迭代字段，不改动 |
| 商品档案 | 商品审核 | `/goodsReview` | `goods-review.html` | 已补全 | 分类树、查询、分页、商品详情、审核通过、驳回、上架 |
| 商品档案 | 计量单位 | `/unitMeasurement` | `unit-measurement.html` | 已补全 | 查询、分页、添加、批量导入、启用/禁用、编辑、删除、关联限制 |
| 订单管理 | 订单管理 | `/orderManagement` | `order-management.html`、`order-goods.html`、`order-add.html`、`order-detail.html` | 已复核补全 | 订单/商品双视图、查询、分页、独立详情、新增、编辑、复制、审核、确认供货、商品明细、限价提示、关闭、删除、批量确认、导出 |
| 订单管理 | 订单退货 | `/orderReject` | `order-return.html`、`order-return-form.html`、`order-return-detail.html` | 已复核补全 | 查询、分页、选择订单、整单退/部分退、商品明细、报损、附件、独立详情、新增、编辑、审核驳回、关闭、删除、导出 |
| 订单管理 | 订单标签 | `/orderTag` | `order-tag.html` | 已复核补全 | 查询、新增/编辑弹窗仅保留标签名称与备注、启用/禁用、删除 |
| 订单管理 | 实收变更 | `/actualReceiptsChange` | `receipt-change.html`、`receipt-change-form.html`、`receipt-change-detail.html` | 已复核补全 | 查询、分页、选择订单、行级数量变更、金额差异自动计算、汇总、附件、审核意见、独立详情、新增、编辑、审核驳回、关闭、导出 |
| 分拣管理 | 分拣管理 | `/sortingManagementList` | `sorting-management.html` | 已补全 | 商品/客户双视图、状态切换、实际数量、分拣、重置、缺货、批量操作、打印、导出、客户分拣下钻 |
| 分拣管理 | 客户分拣下钻 | `CustomerSortingTable` | `sorting-customer-detail.html` | 已补全 | 客户/食堂/送达日期上下文、商品明细、状态切换、数量、单条及批量分拣/重置/缺货、打印 |
| 分拣管理 | 分拣进度 | `/sortingProgress` | `sorting-progress.html` | 已补全 | 商品/客户进度双视图、筛选、商品/客户业务明细弹窗 |
| 分拣管理 | 缺货商品 | `/outOfStockItems` | `shortage-goods.html` | 已补全 | 查询、同供应商生成采购单约束、取消缺货、批量操作、导出、分拣状态联动 |
| 分拣管理 | 分拣员 | `/sortingPerson` | `sorter-management.html` | 已补全 | 查询、新增、编辑、专用详情、重置密码、启用/禁用、删除 |
| 仓库管理 | 入库管理 | `/inboundMg` | `inbound.html` | 已有保留 | 本地已有列表与详情 |
| 仓库管理 | 发货管理 | `/shippingManagement` | `shipping-management.html` | 已补全 | 订单发货/差异表双视图、筛选、发货、报溢、打印、导出 |
| 仓库管理 | 出库管理 | `/outboundManagement` | `outbound.html` | 已有保留 | 本地已有列表与详情 |
| 仓库管理 | 上传质检报告 | `/qualificationManagement` | `quality-report.html` | 已补全 | 查询、单条/批量上传、报告状态与文件展示 |
| 仓库管理 | 库存盘点 | `/inventoryCounting` | `inventory-counting.html` | 已补全 | 盘点/损溢双视图、新增、审核、编辑、复制、关闭、导出 |
| 仓库管理 | 库存余额 | `/inventoryBalance` | `inventory-balance.html` | 已补全 | 查询、上下限单条/批量设置、单位转换、导入、导出 |
| 仓库管理 | 库存明细 | `/inventoryDetails` | `inventory-details.html` | 已补全 | 查询、入出库流水、详情、导出 |
| 仓库管理 | 净菜加工 | 线上当前版本无对应迭代 | `processing.html` | 本地新增 | 保留，不改动 |
| 仓库管理 | 加工记录 | 线上当前版本无对应迭代 | `processing-record.html` | 本地新增 | 保留，不改动 |
| 仓库管理 | 仓库档案 | `/warehouseArchive` | `warehouse-archive.html` | 已补全 | 查询、新增、编辑、详情、启用/禁用、引用删除保护 |
| 仓库管理 | 期初库存 | `/openingInventory` | `opening-inventory.html` | 已补全 | 查询、期初数量/单价编辑、金额重算、导入、导出 |

## 计量单位页面核对记录

- 查询条件：计量单位，最多20个字符，支持回车查询。
- 表格字段：序号、计量单位、与“KG”换算率、状态、操作。
- 状态操作：启用、禁用。
- 表单字段：计量单位（必填、最多20字符）、与“KG”的换算率（0.0001—99999，最多4位小数）。
- 业务限制：已关联商品的计量单位不能编辑、不能删除。
- 其他操作：添加计量单位、批量导入、分页、重置。
- 数据边界：页面通过 `UnitMeasurementService` 访问数据；mock 数据由 localStorage 持久化，可替换为真实接口适配器。

## 商品审核页面核对记录

- 分类导航：左侧商品分类树，默认“全部”，支持分类名称过滤。
- 查询条件：商品名称/编码、品牌、审核状态。
- 表格字段：序号、图片、商品编号、商品名称（计量单位/品牌/规格）、分类、计量单位、审核状态、别名、产地、保质期、添加时间、操作。
- 审核状态：待审核、已通过、已驳回。
- 状态操作：待审核记录可进入审核详情并执行通过/驳回；非待审核记录可进入上架确认流程。
- 驳回校验：驳回原因必填，最多100个字符。
- 数据边界：页面通过 `GoodsReviewService` 访问审核数据，通过现有 `ProductService` 完成商品上架；页面不直接读写 localStorage。

## 订单、分拣与仓库页面核对记录

- 线上字段与操作基准来自企业端当前账号可见路由及对应线上页面脚本。
- 新增页面统一通过 `OperationsService` 调用 `list/get/create/update/remove/transition/options/export`，页面不直接读写 localStorage。
- 订单新增、编辑、审核、确认供货共用独立页面，只编辑客户、期望送达时间、食堂、订单标签及商品明细；下单金额和商品种类数由明细自动汇总。
- 订单详情采用独立页面，覆盖订单基本信息、发货/退货/对账/验货数量及金额、质检报告、溯源码和验货媒体。
- 退货单覆盖关联/不关联订单、整单退/部分退、申请数量/单价/金额、报损数量、关联采购单、附件及审核驳回。
- 实收变更覆盖关联订单选择、发货/验收/变更后数量、数量及金额差异、四项合计、附件及审核意见。
- 订单标签新增/编辑弹窗按线上字段仅保留标签名称和备注，“是否是营养餐”保留为列表展示信息。
- 分拣模块覆盖商品/客户双视图、分拣数量、缺货、采购单生成、进度和分拣员启停。
- 仓库模块覆盖发货、质检、盘点/损溢、库存余额/明细、仓库档案和期初库存；现有入库、出库、净菜加工及加工记录保持不变。
- 所有新增页面均使用稳定业务 ID 关联订单号、入库单号、采购单号和仓库数据，Mock 数据刷新后可继续演示。
