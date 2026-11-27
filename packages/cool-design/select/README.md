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

## 选项分组

使用 `SelectOptionGroup` 按组展示选项，`label` 为分组标题，`disabled` 可禁用整组。

```vue
<Select v-model="city">
  <SelectOptionGroup label="热门城市">
    <SelectOption value="shanghai" label="上海" />
  </SelectOptionGroup>
</Select>
```

## 对象值

设置 `value-key` 指定选项对象的唯一标识字段后，`value` 可以传对象，选中值即整个对象，回显使用 `label`。

```vue
<Select v-model="user" value-key="id">
  <SelectOption v-for="item in users" :key="item.id" :value="item" :label="item.name" />
</Select>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 当前选中值，配合 `value-key` 支持对象值 | `string` / `number` / `boolean` / `object` / `Array` | `undefined` |
| options | 通过数组提供选项及分组 | `Record<string, unknown>[]` | — |
| props | 数组选项字段映射 | `{ value?: string; label?: string; disabled?: string; options?: string }` | 对应同名字段 |
| value-key | 对象值的唯一标识字段 | `string` | `value` |
| placeholder | 未选择时的提示 | `string` | `请选择` |
| aria-label | 默认选择控件的无障碍名称，JS 属性名为 `ariaLabel`，严格类型检查的模板可写成 `<Select :ariaLabel="name" />`。命名依次使用显式 `aria-labelledby`、非空 `aria-label` 或 FormItem 标签 | `string` | — |
| clearable | 显示清空按钮 | `boolean` | `false` |
| disabled | 禁用选择器 | `boolean` | `false` |
| size | 尺寸：`small` / `default` / `large` | `string` | 继承 FormItem、Form 或 ConfigProvider |
| multiple | 是否多选 | `boolean` | `false` |
| multiple-limit | 多选最大数量，`0` 表示不限制 | `number` | `0` |
| collapse-tags | 多选时折叠标签 | `boolean` | `false` |
| collapse-tags-tooltip | 是否显示折叠标签的原生悬浮提示 | `boolean` | `false` |
| max-collapse-tags | 最多显示的标签数量 | `number` | `1` |
| tag-type | 多选标签类型：`primary` / `success` / `warning` / `danger` / `info` | `string` | — |
| name | 原生隐藏 input 的名称 | `string` | — |
| filterable | 是否启用筛选输入 | `boolean` | `false` |
| filter-method | 查询变化回调，自行更新选项。原双参数逐项过滤写法仍可用 | `(query: string) => void` | — |
| option-filter | 自定义逐项过滤 | `(query: string, option: SelectOptionRecord) => boolean` | — |
| allow-create | 允许 Enter 创建新选项 | `boolean` | `false` |
| default-first-option | Enter 时选择第一个匹配项 | `boolean` | `false` |
| reserve-keyword | 多选筛选选择后保留筛选词；单选选择后始终清空 | `boolean` | `true` |
| automatic-dropdown | 非可筛选模式下聚焦即展开面板 | `boolean` | `false` |
| fit-input-width | 面板最小宽度与触发器一致 | `boolean` | `false` |
| no-data-text | 没有选项时的提示 | `string` | `暂无数据` |
| no-match-text | 没有匹配项时的提示 | `string` | `无匹配数据` |
| loading-text | 加载状态文案 | `string` | `加载中…` |
| empty-values | 视为清空的值，命中后输出 `value-on-clear` | `Array` | — |
| value-on-clear | 清空时输出的值 | `any` | — |
| validate-event | 选中变化时触发表单校验 | `boolean` | `true` |
| debounce | 远程查询防抖，单位毫秒 | `number` | `300` |
| autocomplete | 传给原生搜索输入框 | `string` | `'off'` |
| remote-show-suffix | 远程过滤时显示后缀图标 | `boolean` | `false` |
| suffix-icon | 后缀图标 | `string \| Component` | 下箭头 |
| clear-icon | 清空图标 | `string \| Component` | `'icon-close'` |
| tag-effect | 多选标签主题 | `'light' \| 'dark' \| 'plain'` | `'light'` |
| remote | 是否启用远程搜索 | `boolean` | `false` |
| remote-method | 查询变化时调用，可更新外部选项；返回选项为扩展用法 | `(query: string) => void / SelectRemoteOption[] / Promise<void / SelectRemoteOption[]>` | — |
| loading | 是否显示加载状态 | `boolean` | `false` |
| remote-loading | `loading` 的兼容别名 | `boolean` | `false` |
| virtualized | 是否启用基础可视范围截取 | `boolean` | `false` |
| item-height / height | 虚拟选项行高和面板高度 | `number` | `34` / `240` |
| teleported | 下拉面板是否传送到 body（`overflow: hidden` 祖先不被裁剪） | `boolean` | `true` |
| persistent | 关闭后是否保留面板节点 | `boolean` | `true` |
| append-to | 下拉面板的挂载位置 | `string` / `HTMLElement` | ConfigProvider 浮层宿主或 `body` |
| placement | 面板位置：`top` / `bottom` / `left` / `right` 及 `-start` / `-end` 变体 | `string` | `bottom-start` |
| fallback-placements | 主位置放不下时的候选位置 | `Placement[]` | `['top-start', 'bottom', 'top']` |
| popper-options | 浮层参数覆盖（`offset` / `placement`） | `{ offset?: number; placement?: Placement }` | — |
| popper-class | 面板自定义 class | `string` / `string[]` / `object` | — |
| popper-style | 面板自定义样式 | `string` / `CSSProperties` | — |
| effect | 面板主题：`light` / `dark` | `string` | `light` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中或清空 | `value` |
| change | 选中或清空 | `value` |
| focus | 焦点进入选择器或其下拉面板时触发 | `FocusEvent` |
| blur | 焦点离开选择器及其下拉面板时触发，并关闭已展开的面板 | `FocusEvent` |
| popup-scroll | 选项面板滚动 | `{ scrollTop: number; scrollLeft: number }` |
| end-reached | 面板滚动到边缘 | `'top' \| 'bottom' \| 'left' \| 'right'` |
| clear | 点击清空 | — |
| visible-change | 面板打开或关闭 | `visible: boolean` |
| remove-tag | 多选移除标签 | `value` |

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | SelectOption / SelectOptionGroup 列表 |
| prefix | 触发器前缀 |
| suffix | 触发器后缀 |
| tag | 自定义多选标签，参数 `{ data }` |
| header | 下拉面板头部 |
| footer | 下拉面板尾部 |
| empty | 空状态或 loading 状态内容 |
| `control` | 组合接口，替换触发器，参数 `{ open, toggle }` |
| `dropdown` | 组合接口，替换面板内容，无参数 |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| focus() | 聚焦选择器 |
| blur() | 使选择器失焦 |
| `togglePopperVisible(visible?: boolean)` | 设置下拉面板显隐，省略参数时切换 |

## 键盘操作

- `ArrowDown` / `ArrowUp`：打开面板并移动高亮项
- `Enter`：选择高亮项或创建新选项
- `Escape`：关闭面板
- 多选空查询时 `Backspace`：移除最后一个标签

当前实现优先支持桌面端交互；原生隐藏 select 仅用于表单兼容和值回显，不作为可见 UI。值类型支持 `string` / `number` / `boolean`，以及配合 `value-key` 的对象值。

## 远程搜索

`remote-method(query)` 可以返回 `void`，在回调中更新外部响应式选项，与 Element Plus 用法一致。也保留返回选项数组或 Promise 的扩展用法；扩展用法只接受最近一次查询的返回结果，防止旧请求覆盖新结果。

```vue
<Select v-model="value" filterable remote :remote-method="search">
  <SelectOption v-for="item in options" :key="item.value" :value="item.value" :label="item.label" />
</Select>
```

`options` 属性也可直接提供数组；分组数组默认使用 `options` 字段，可通过 `props` 映射。

实例的只读属性 `selectedLabel` 返回当前单选标签（`string`）或按模型顺序排列的多选标签（`string[]`）。远程返回值扩展会忽略过期结果。回调直接更新外部选项时，由外部请求管理更新顺序。需要立即搜索时设置 `:debounce="0"`。

### 兼容参数

`show-arrow`（`boolean`，默认 `true`）控制下拉面板箭头；`suffix-transition`（`boolean`，默认 `true`）控制后缀图标过渡，该参数已弃用，推荐通过样式定制。
