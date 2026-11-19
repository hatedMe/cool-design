# SelectV2 虚拟化选择器

### 介绍

基于 `options` 数据驱动的下拉选择器，列表窗口化渲染，适合大数据量选项。

## 基础用法

`options` 传扁平数组或分组数组（分组对象含 `options` 子集，`props` 可映射字段名）。列表按 `item-height` 虚拟滚动，仅渲染可视窗口。

```vue
<SelectV2 v-model="value" :options="options" placeholder="请选择" />
```

`multiple` 多选（标签、`collapse-tags` 折叠、`multiple-limit` 限数、`remove-tag` 删除），`filterable` 本地过滤（分组数据过滤时保留仍有命中子项的分组头，`filter-method` 自定义），`value-key` 支持对象值，`clearable` 清空，`loading`/`automatic-dropdown`/`height`/`item-height` 控制面板与性能。

## API

### 属性

| 参数            | 说明                                       | 类型                                   | 默认值   |
| --------------- | ------------------------------------------ | -------------------------------------- | -------- |
| `modelValue`    | 选中值（`v-model`），多选时为数组          | `SelectV2Value`                        | —        |
| `options`       | 选项列表（支持嵌套 `options` 分组）        | `SelectV2Option[]`                     | `[]`     |
| `props`         | 字段映射（`label` / `value` / `disabled` / `options`） | `SelectV2PropsMapping`           | —        |
| `valueKey`      | 对象值的唯一标识字段                       | `string`                               | `value`  |
| `filterable`    | 本地过滤                                   | `boolean`                              | `false`  |
| `filterMethod`  | 自定义过滤                                 | `(query, option) => boolean`           | —        |
| `multiple`      | 多选                                       | `boolean`                              | `false`  |
| `multipleLimit` | 多选数量上限，`0` 不限                     | `number`                               | `0`      |
| `collapseTags` / `collapseTagsTooltip` / `maxCollapseTags` | 标签折叠     | `boolean` / `boolean` / `number`       | `false` / `false` / `1` |
| `tagType`       | 标签类型：`primary` / `success` / `warning` / `danger` / `info` | `string`                    | —        |
| `clearable`     | 可清空                                     | `boolean`                              | `false`  |
| `disabled`      | 禁用                                       | `boolean`                              | `false`  |
| `loading`       | 加载态                                     | `boolean`                              | `false`  |
| `placeholder`   | 占位文本                                   | `string`                               | `请选择` |
| `noDataText` / `noMatchText` | 空/无匹配文案                     | `string`                               | `暂无数据` / `无匹配数据` |
| `size`          | 尺寸：`small` / `default` / `large`        | `string`                               | 继承全局尺寸 |
| `height`        | 面板高度（px）                             | `number`                               | `240`    |
| `itemHeight`    | 选项行高（px，虚拟滚动依据）               | `number`                               | `34`     |
| `automaticDropdown` | 聚焦即展开                               | `boolean`                              | `false`  |
| `validateEvent` | 值变化时触发表单校验                       | `boolean`                              | `true`   |
| `name`           | 原生表单提交用的隐藏输入名称，多选时值为 JSON 数组 | `string`                      | —        |
| `teleported`     | 下拉面板是否传送到 body                   | `boolean`                              | `true`   |
| `persistent`     | 关闭后是否保留面板节点                    | `boolean`                              | `false`  |
| `placement`      | 面板位置及 `-start` / `-end` 变体        | `string`                               | `bottom-start` |
| `fallbackPlacements` | 主位置放不下时的候选位置              | `Placement[]`                          | `['top-start', 'bottom', 'top']` |
| `popperOptions`  | 浮层参数覆盖（`offset` / `placement`）     | `{ offset?: number; placement?: Placement }` | — |
| `popperClass`    | 面板自定义 class                          | `string` / `string[]` / `object`       | —        |
| `popperStyle`    | 面板自定义样式                            | `string` / `CSSProperties`             | —        |
| `effect`         | 面板主题：`light` / `dark`                | `string`                               | `light`  |

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

### 插槽

| 名称      | 说明                                  |
| --------- | ------------------------------------- |
| `label`   | 自定义选项内容，作用域 `{ option }`   |
| `tag`     | 自定义标签内容，作用域 `{ data }`     |
| `header`  | 面板顶部                              |
| `footer`  | 面板底部                              |
| `empty`   | 自定义空/加载文案                     |

### 实例方法

| 方法      | 说明         |
| --------- | ------------ |
| `focus()` | 聚焦输入框   |
| `blur()`  | 取消聚焦     |
