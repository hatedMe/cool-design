# Cascader 级联选择

### 介绍

从层级数据中逐级选择选项，支持单选、多选、字段映射、路径值、过滤搜索等能力。

## 基础用法

`<Cascader v-model="value" :options="options" />`。点击父节点展开下一级，点击叶子节点即选中并收起面板。默认值为从根到叶的路径数组（`emitPath`），输入框按 `showAllLevels` + `separator` 拼接完整路径回显。多选时每列节点前显示勾选框，勾选父节点级联勾选子孙叶子，`checkStrictly` 后父子勾选解耦，面板不自动收起。设置 `filterable` 后输入关键字过滤叶子路径并展示匹配的完整路径列表。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue / v-model | 选中值，多选时为数组 | `string \| number \| (string \| number)[] \| null` | `null` |
| options | 级联数据 | `CascaderOption[]` | `[]` |
| props | 字段映射 | `CascaderPropsMapping` | `{ label: 'label', value: 'value', children: 'children', disabled: 'disabled', leaf: 'leaf' }` |
| emitPath | 值是否为从根到叶的路径数组，`false` 时只取选中节点值 | `boolean` | `true` |
| multiple | 是否多选 | `boolean` | `false` |
| checkStrictly | 父子勾选是否解耦（单选时可选任意层级节点） | `boolean` | `false` |
| showAllLevels | 输入框是否显示完整路径，`false` 只显示最后一级 | `boolean` | `true` |
| separator | 路径文本分隔符 | `string` | `' / '` |
| collapseTags | 多选是否折叠标签 | `boolean` | `false` |
| collapseTagsTooltip | 折叠标签是否显示原生悬浮提示 | `boolean` | `false` |
| maxCollapseTags | 折叠标签时最多显示的标签数量 | `number` | `1` |
| empty-values | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| value-on-clear | 单选清空值或工厂，多选清空为 `[]` | `unknown` | 继承 ConfigProvider |
| clearable | 是否可清空 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | `请选择` |
| size | 尺寸：`small` / `default` / `large` | `string` | 继承 ConfigProvider |
| filterable | 是否可搜索过滤 | `boolean` | `false` |
| filterMethod | 自定义过滤方法 | `(query: string, option: CascaderOption, path: CascaderOption[]) => boolean` | — |
| beforeFilter | 过滤前置钩子，返回 `false` 或被拒绝的 Promise 时停止过滤 | `(query: string) => boolean \| Promise<boolean>` | — |
| debounce | 过滤输入防抖延迟，单位 ms，`0` 表示不防抖 | `number` | `300` |
| lazy | 是否懒加载子级（无子级且未声明 `leaf` 的节点展开时调用 `lazyLoad`） | `boolean` | `false` |
| lazyLoad | 懒加载回调，`resolve(children)` 注入子级；子级可用 `leaf: true` 标记为叶子 | `(node: { level, value, data }, resolve) => void` | — |
| expandTrigger | 展开触发方式：`click` / `hover` | `string` | `click` |
| popperClass | 下拉面板自定义类名 | `string` | — |
| teleported | 下拉面板是否传送到 body | `boolean` | `true` |
| validateEvent | 值变化/失焦时是否触发表单校验 | `boolean` | `true` |

`CascaderOption`：`{ value: string \| number; label?: string; children?: CascaderOption[]; disabled?: boolean; leaf?: boolean }`，字段名可通过 `props` 映射。

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中值变化 | `value` |
| change | 选中值变化 | `value` |
| expand-change | 展开节点变化 | `path: (string \| number)[]`，当前展开面板的路径值数组 |
| visible-change | 下拉展开/收起 | `visible: boolean` |
| remove-tag | 多选删除标签 | `value`，被删项的值 |
| clear | 清空 | — |

### 插槽

| 插槽名 | 说明 | 作用域 |
| --- | --- | --- |
| default | 自定义选中项文本 | `{ data, node }` |
| empty | 无匹配数据 | — |

单选默认清空为 `undefined`，依赖原清空值 `null` 的代码可设置 `:value-on-clear="null"`。
