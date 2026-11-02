# Select 选择器

### 介绍

桌面端自定义下拉选择器，支持单选、多选、标签、筛选、远程搜索、创建选项和键盘导航。

## 基础用法

```vue
<Select v-model="status" clearable placeholder="请选择状态">
  <SelectOption value="enabled" label="启用" />
  <SelectOption value="disabled" label="停用" />
</Select>
```

点击触发器打开面板；单选后面板关闭，多选后面板保持打开。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue / v-model | 当前选中值 | `string` / `number` / `Array<string \| number>` | `undefined` |
| placeholder | 未选择时的提示 | `string` | `请选择` |
| clearable | 显示清空按钮 | `boolean` | `false` |
| disabled | 禁用选择器 | `boolean` | `false` |
| size | 尺寸：`small` / `default` / `large` | `string` | 继承 ConfigProvider |
| multiple | 是否多选 | `boolean` | `false` |
| multiple-limit | 多选最大数量，`0` 表示不限制 | `number` | `0` |
| collapse-tags | 多选时折叠标签 | `boolean` | `false` |
| collapse-tags-tooltip | 是否显示折叠标签的原生悬浮提示 | `boolean` | `false` |
| max-collapse-tags | 最多显示的标签数量 | `number` | `1` |
| name | 原生隐藏 input 的名称 | `string` | — |
| filterable | 是否启用筛选输入 | `boolean` | `false` |
| filter-method | 自定义筛选方法（项目扩展签名） | `(query, option: { value, label, disabled }) => boolean` | — |
| allow-create | 允许 Enter 创建新选项 | `boolean` | `false` |
| default-first-option | Enter 时选择第一个匹配项 | `boolean` | `false` |
| reserve-keyword | 多选筛选选择后保留筛选词；单选选择后始终清空 | `boolean` | `true` |
| no-data-text | 没有选项时的提示 | `string` | `暂无数据` |
| no-match-text | 没有匹配项时的提示 | `string` | `无匹配数据` |
| remote | 是否启用远程搜索 | `boolean` | `false` |
| remote-method | 根据查询词加载选项 | `(query) => SelectRemoteOption[] / Promise<SelectRemoteOption[]>` | — |
| loading | 是否显示加载状态 | `boolean` | `false` |
| remote-loading | `loading` 的兼容别名 | `boolean` | `false` |
| virtualized | 是否启用基础可视范围截取 | `boolean` | `false` |
| item-height / height | 虚拟选项行高和面板高度 | `number` | `34` / `240` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中或清空 | `value` |
| change | 选中或清空 | `value` |
| focus | 获得焦点 | `FocusEvent` |
| blur | 失去焦点 | `FocusEvent` |
| clear | 点击清空 | — |
| visible-change | 面板打开或关闭 | `visible: boolean` |
| remove-tag | 多选移除标签 | `value: string \| number` |

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | SelectOption 列表 |
| prefix | 触发器前缀 |
| suffix | 触发器后缀 |
| tag | 自定义多选标签，参数 `{ data }` |
| header | 下拉面板头部 |
| footer | 下拉面板尾部 |
| empty | 空状态或 loading 状态内容 |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| focus() | 聚焦选择器 |
| blur() | 使选择器失焦 |

## 键盘操作

- `ArrowDown` / `ArrowUp`：打开面板并移动高亮项
- `Enter`：选择高亮项或创建新选项
- `Escape`：关闭面板
- 多选空查询时 `Backspace`：移除最后一个标签

当前实现优先支持桌面端交互；原生隐藏 select 仅用于表单兼容和数字值回显，不作为可见 UI。当前值类型兼容范围为 `string` / `number`，暂不支持 Element Plus 的 boolean、object 等复杂值类型。
