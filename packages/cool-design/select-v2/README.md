# SelectV2 虚拟化选择器

### 介绍

基于 `options` 数据驱动的下拉选择器，列表窗口化渲染，适合大数据量选项。

## 基础用法

`options` 传扁平数组或分组数组（分组对象含 `options` 子集，`props` 可映射字段名）。未设置 `estimated-option-height` 时按 `item-height` 固定高度虚拟滚动；设置估计高度后测量实际行高，均仅渲染可视窗口。

```vue
<SelectV2 v-model="value" :options="options" placeholder="请选择" />
```

`multiple` 多选（标签、`collapse-tags` 折叠、`multiple-limit` 限数、`remove-tag` 删除），`filterable` 本地过滤（分组数据过滤时保留仍有命中子项的分组头，`filter-method` 自定义），`value-key` 支持对象值，`clearable` 清空，`loading`/`automatic-dropdown`/`height`/`item-height` 控制面板与性能。

## API

### 属性

| 参数            | 说明                                       | 类型                                   | 默认值   |
| --------------- | ------------------------------------------ | -------------------------------------- | -------- |
| `model-value`    | 选中值（`v-model`），多选时为数组          | `SelectV2Value`                        | —        |
| `empty-values` | 单选中视作未选中的值 | `unknown[]` | 继承 ConfigProvider |
| `value-on-clear` | 单选清空值或工厂，多选清空为 `[]` | `string \| number \| boolean \| null \| (() => unknown)` | 继承 ConfigProvider |
| `options`       | 选项列表（支持嵌套 `options` 分组）        | `SelectV2Option[]`                     | `[]`     |
| `props`         | 字段映射（`label` / `value` / `disabled` / `options`） | `SelectV2PropsMapping`           | —        |
| `value-key`      | 对象值的唯一标识字段                       | `string`                               | `value`  |
| `filterable`    | 本地过滤                                   | `boolean`                              | `false`  |
| `filter-method`  | 查询变化回调 | `(query: string) => void`           | —        |
| `option-filter-method` | 本地逐项过滤 | `(query, option) => boolean` | — |
| `remote` | 使用远程选项 | `boolean` | `false` |
| `remote-method` | 远程查询回调 | `SelectV2RemoteMethod` | — |
| `debounce` | 远程查询防抖毫秒数 | `number` | `300` |
| `allow-create` | 允许创建不存在的选项，需开启 `filterable` | `boolean` | `false` |
| `default-first-option` | 查询后高亮首个可用选项 | `boolean` | `false` |
| `reserve-keyword` | 多选选中后保留搜索词 | `boolean` | `true` |
| `multiple`      | 多选                                       | `boolean`                              | `false`  |
| `multiple-limit` | 多选数量上限，`0` 不限                     | `number`                               | `0`      |
| `collapse-tags` / `collapse-tags-tooltip` / `max-collapse-tags` | 标签折叠     | `boolean` / `boolean` / `number`       | `false` / `false` / `1` |
| `tag-type`       | 标签类型：`primary` / `success` / `warning` / `danger` / `info` | `string`                    | `info` |
| `clearable`     | 可清空                                     | `boolean`                              | `false`  |
| `disabled`      | 禁用                                       | `boolean`                              | `false`  |
| `loading`       | 加载态                                     | `boolean`                              | `false`  |
| `placeholder` | 占位文本 | `string` | 继承 locale，中文为 `请选择` |
| `no-data-text` / `no-match-text` | 空数据 / 无匹配文案 | `string` | 继承 locale，中文为 `暂无数据` / `无匹配数据` |
| `size`          | 尺寸：`small` / `default` / `large`        | `string`                               | 继承 FormItem、Form 或 ConfigProvider |
| `height`        | 面板高度（px）                             | `number`                               | `240`    |
| `item-height`    | 选项行高（px，虚拟滚动依据）               | `number`                               | `34`     |
| `automatic-dropdown` | 聚焦即展开                               | `boolean`                              | `false`  |
| `validate-event` | 值变化时触发表单校验                       | `boolean`                              | `true`   |
| `name`           | 原生表单提交用的隐藏输入名称，多选时值为 JSON 数组 | `string`                      | —        |
| `teleported`     | 下拉面板是否传送到 body                   | `boolean`                              | `true`   |
| `persistent`     | 关闭后是否保留面板节点                    | `boolean`                              | `true`  |
| `append-to` | 浮层目标容器 | `string \| HTMLElement` | `body` |
| `loading-text` | 加载文案 | `string` | 继承 locale，中文为 `加载中…` |
| `show-arrow` / `offset` | 显示箭头和浮层距离 | `boolean` / `number` | `true` / `12` |
| `suffix-icon` / `clear-icon` | 后缀和清空图标 | `string \| Component` | — |
| `remote-show-suffix` | 远程筛选时显示后缀 | `boolean` | `false` |
| `tag-effect` | 标签主题 | `light` / `dark` / `plain` | `light` |
| `tag-tooltip` | 折叠标签提示配置 | `SelectV2TagTooltipOptions` | — |
| `placement`      | 面板位置及 `-start` / `-end` 变体        | `string`                               | `bottom-start` |
| `fallback-placements` | 主位置放不下时的候选位置              | `Placement[]`                          | `['bottom-start', 'top-start', 'right', 'left']` |
| `popper-options`  | 浮层参数覆盖（`offset` / `placement`）     | `{ offset?: number; placement?: Placement }` | — |
| `popper-class`    | 面板自定义 class                          | `string` / `string[]` / `object`       | —        |
| `popper-style`    | 面板自定义样式                            | `string` / `CSSProperties`             | —        |
| `effect`         | 面板主题：`light` / `dark`                | `string`                               | `light`  |
| estimated-option-height | 启用动态高度，以该值估算未测量选项；内容尺寸变化后重新测量 | `number` | — |
| fit-input-width | 跟随输入宽度、根据标签内容计算宽度或指定像素宽度 | `boolean` / `number` | `true` |
| scrollbar-always-on | 始终显示下拉滚动条 | `boolean` | `false` |

`SelectV2Option`：`{ label?, value?, disabled?, options?, ... }`。

### 事件

| 事件名              | 说明               | 回调参数           |
| ------------------- | ------------------ | ------------------ |
| `update:modelValue` | 选中值变化         | `value`            |
| `change`            | 选中值变化         | `value`            |
| `focus` / `blur`    | 聚焦 / 失焦        | `event: FocusEvent` |
| `clear`             | 清空               | —                  |
| `visible-change`    | 面板展开/收起      | `visible: boolean` |
| `remove-tag`        | 多选删除标签       | `value`            |
| `end-reached` | 滚动到边界 | `top` / `bottom` |

### 插槽

| 名称      | 说明                                  |
| --------- | ------------------------------------- |
| `default` | 自定义下拉选项，作用域 `{ item, index }` |
| `label` | 自定义选中标签，作用域 `{ index, label, value }` |
| `tag`     | 自定义全部多选标签，作用域 `{ data, deleteTag, selectDisabled }`     |
| `prefix` | 输入框前缀，不替换已选标签 |
| `header`  | 面板顶部                              |
| `footer`  | 面板底部                              |
| `loading` | 自定义加载内容 |
| `empty`   | 自定义空/加载文案                     |

### 实例方法

| 方法      | 说明         |
| --------- | ------------ |
| `focus()` | 聚焦输入框   |
| `blur()`  | 取消聚焦     |
| `scrollTo(index)` | 滚动到筛选后平铺列表的索引，包含分组行 |

配置 `filterable`、`remote` 和 `remote-method` 后，回调可更新外部 `options`。外部写入由调用方管理，异步请求宜用序号避免过时结果覆盖。`remoteMethod` 也可直接返回选项数组或相应的 Promise，组件只采纳当前查询的结果。旧的双参数 `filterMethod` 保留逐项过滤语义，新代码可显式使用 `optionFilterMethod`。

原先使用 `label` 插槽渲染下拉选项的代码可迁移到默认插槽。多选 `tag` 插槽一次接收整个选项数组。

原生输入框承担 `combobox` 角色，支持 `aria-label` 和 `aria-labelledby`。对象值的 `valueKey` 支持直接字段和嵌套路径（如 `meta.id`、`meta[0]["record.id"]`）。

### 实例属性

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `selectedLabel` | 当前单选标签或全部多选标签 | `string \| string[]` |

默认文案继承最近 ConfigProvider 的 locale；显式文案属性优先，语言切换实时更新。`option-filter-method` 是逐项过滤扩展，`remote-method` 返回数组/Promise 的用法也是本库扩展；官方式回调更新外部 `options` 仍可使用。
