# Cascader 级联选择

### 介绍

从层级数据中逐级选择选项，支持单选、多选、字段映射、路径值、过滤搜索等能力。

## 基础用法

`<Cascader v-model="value" :options="options" />`。点击父节点展开下一级，点击叶子节点即选中并收起面板。默认值为从根到叶的路径数组（`emitPath`），输入框按 `showAllLevels` + `separator` 拼接完整路径回显。多选时每列节点前显示勾选框，勾选父节点级联勾选子孙叶子，`checkStrictly` 后父子勾选解耦，面板不自动收起。设置 `filterable` 后输入关键字过滤叶子路径并展示匹配的完整路径列表。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 选中值，多选时为数组 | `string \| number \| (string \| number)[] \| null` | `null` |
| options | 级联数据 | `CascaderOption[]` | `[]` |
| props | 字段映射 | `CascaderPropsMapping` | `{ label: 'label', value: 'value', children: 'children', disabled: 'disabled', leaf: 'leaf' }` |
| emit-path | 值是否为从根到叶的路径数组，`false` 时只取选中节点值 | `boolean` | `true` |
| multiple | 是否多选 | `boolean` | `false` |
| check-strictly | 父子勾选是否解耦（单选时可选任意层级节点） | `boolean` | `false` |
| show-all-levels | 输入框是否显示完整路径，`false` 只显示最后一级 | `boolean` | `true` |
| separator | 路径文本分隔符 | `string` | `' / '` |
| collapse-tags | 多选是否折叠标签 | `boolean` | `false` |
| collapse-tags-tooltip | 折叠标签是否显示折叠项悬浮提示 | `boolean` | `false` |
| max-collapse-tags | 折叠标签时最多显示的标签数量 | `number` | `1` |
| empty-values | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| value-on-clear | 单选清空值或工厂，多选清空为 `[]` | `unknown` | 继承 ConfigProvider |
| clearable | 是否可清空 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | `请选择` |
| size | 尺寸：`small` / `default` / `large` | `string` | 继承 FormItem、Form 或 ConfigProvider |
| filterable | 是否可搜索过滤 | `boolean` | `false` |
| filter-method | 自定义过滤方法 | `(query: string, option: CascaderOption, path: CascaderOption[]) => boolean` | — |
| before-filter | 过滤前置钩子，返回 `false` 或被拒绝的 Promise 时停止过滤 | `(query: string) => boolean \| Promise<boolean>` | — |
| debounce | 过滤输入防抖延迟，单位 ms，`0` 表示不防抖 | `number` | `300` |
| lazy | 是否懒加载子级（无子级且未声明 `leaf` 的节点展开时调用 `lazyLoad`） | `boolean` | `false` |
| lazy-load | 懒加载回调，`resolve(children)` 注入子级；子级可用 `leaf: true` 标记为叶子 | `(node: { level, value, data }, resolve) => void` | — |
| expand-trigger | 展开触发方式：`click` / `hover` | `string` | `click` |
| popper-class | 下拉面板自定义类名 | `string` | — |
| teleported | 下拉面板是否传送到 body | `boolean` | `true` |
| validate-event | 值变化/失焦时是否触发表单校验 | `boolean` | `true` |
| `persistent` | 首次展开后保留关闭的下拉面板 | `boolean` | `true` |
| `append-to` | 下拉面板挂载容器 | `string \| HTMLElement` | `document.body` |
| `placement` | 面板位置 | `Placement` | `'bottom-start'` |
| `fallback-placements` | 定位备选位置 | `Placement[]` | `['bottom-start', 'bottom', 'top-start', 'top', 'right', 'left']` |
| `popper-style` | 面板自定义样式 | `string \| CSSProperties \| CSSProperties[]` | — |
| `popper-options` | 面板的 `placement` 和 `offset` 覆盖 | `FloatingOptions` | — |
| `effect` | 面板主题 | `'light' \| 'dark'` | `'light'` |
| `fit-input-width` | 搜索建议匹配输入区域宽度，或使用指定像素值 | `boolean \| number` | `false` |
| `max-collapse-tags-tooltip-height` | 折叠标签提示最大高度，数字按像素处理 | `string \| number` | — |
| `tag-type` | 多选标签颜色 | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'info'` |
| `tag-effect` | 多选标签主题 | `'light' \| 'dark' \| 'plain'` | `'light'` |

`CascaderOption`：`{ value: string \| number; label?: string; children?: CascaderOption[]; disabled?: boolean; leaf?: boolean }`，字段名可通过 `props` 映射。

`virtual-scroll`（`boolean`，默认 `false`）按窗口渲染选项。`item-size`（`number`，默认 `34`）指定行高，`height`（`number`，默认 `204`）指定滚动区域高度。两者均使用像素。

`props` 支持 `multiple`、`checkStrictly`、`emitPath`、`checkOnClickNode`（默认 `false`）、`checkOnClickLeaf`（默认 `true`）、`showPrefix`（默认 `true`）和 `hoverThreshold`（默认 `500` 毫秒）。单选非严格模式可直接点击叶节点。顶层 `multiple`、`checkStrictly` 和 `emitPath` 继续可用，显式设置时优先。懒加载回调第三个参数 `reject()` 结束本次加载并允许再次展开重试。


### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中值变化 | `value` |
| change | 选中值变化 | `value` |
| expand-change | 展开节点变化 | `path: (string \| number)[]`，当前展开面板的路径值数组 |
| visible-change | 下拉展开/收起 | `visible: boolean` |
| remove-tag | 多选删除标签 | `value`，被删项的值 |
| clear | 清空 | — |
| `focus` | 聚焦输入框 | `event: FocusEvent` |
| `blur` | 输入框失焦 | `event: FocusEvent` |

### 插槽

| 插槽名 | 说明 | 作用域 |
| --- | --- | --- |
| default | 自定义选中项文本与下拉节点 | `{ data, node }` |
| empty | 无匹配数据 | — |

单选默认清空为 `undefined`，依赖原清空值 `null` 的代码可设置 `:value-on-clear="null"`。

多选可通过 `tag({ data, deleteTag })` 替换默认标签列表，`data` 为 `CascaderTag[]`，调用 `deleteTag(tag)` 删除单个标签。建议项可通过 `suggestion-item({ item })` 自定义，其中 `item` 包含级联节点字段及 `text`、`checked`。`prefix`、`header` 和 `footer` 分别渲染在输入区域起始处和下拉内容两端。

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `focus()` / `blur()` | 聚焦输入框或取消聚焦 |
| `getCheckedNodes(leafOnly?: boolean)` | 返回已选节点 `CascaderNode[]` |
| `togglePopperVisible(visible?: boolean)` | 设置下拉面板的显隐，省略参数时切换 |
| `togglePopperVisibility(visible?: boolean)` | 兼容方法，作用同 `togglePopperVisible()` |

`CascaderInstance` 的 `cascaderPanelRef`、`contentRef` 和 `presentText` 均为只读，分别提供内嵌 CascaderPanel 实例、下拉面板元素与当前单选显示文本。

`show-checked-strategy` 为 `child` 或 `parent`，默认 `child`。切换策略只改变多选标签，模型仍保留实际选中值。

### 自定义清空图标

`clear-icon`：`string` / `Component`，未设置时使用默认清空符号，不影响 clear 事件。
