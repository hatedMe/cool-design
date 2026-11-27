# Autocomplete 自动补全

### 介绍

根据输入内容展示建议项，支持静态 `suggestions` 和 `fetch-suggestions` 远程建议、键盘导航与表单校验联动。

## 用法

`<Autocomplete v-model="value" :suggestions="items" clearable />`。聚焦或输入时展示匹配的建议项，点击或回车选中；`highlight-first-item` 可默认高亮首项，`select-when-unmatched` 允许回车选中未匹配的输入值。

## API

### 属性

| 参数                 | 说明                                        | 类型                                                         | 默认值 |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ | ------ |
| `model-value`         | 输入值                                      | `string \| number`                                                     | `''`   |
| `suggestions`        | 静态建议列表                                | `(string \| AutocompleteSuggestion)[]`                       | `[]`   |
| `fetch-suggestions`   | 建议数组，或通过回调、返回值提供建议                  | `AutocompleteFetchSuggestions`                       | —      |
| `debounce`           | 远程建议防抖延迟，单位 ms，`0` 表示不防抖   | `number`                                                     | `300`  |
| `placeholder`        | 占位文本                                    | `string`                                                     | —      |
| `disabled`           | 是否禁用                                    | `boolean`                                                    | `false` |
| `clearable`          | 是否可清空                                  | `boolean`                                                    | `false` |
| `trigger-on-focus`     | 聚焦时是否立即触发建议                      | `boolean`                                                    | `true`  |
| `highlight-first-item` | 是否默认高亮第一个建议项                    | `boolean`                                                    | `false` |
| `select-when-unmatched` | 无匹配时回车是否选中当前输入值             | `boolean`                                                    | `false` |
| `hide-loading`        | 隐藏远程加载状态                            | `boolean`                                                    | `false` |
| `size`               | 尺寸：`small` / `default` / `large`         | `string`                                                     | 继承 FormItem、Form 或 ConfigProvider |
| `name`               | 原生 input 名称                             | `string`                                                     | —      |
| `maxlength` / `minlength` | 原生长度限制                           | `string \| number`                                           | —      |
| `prefix-icon`         | 输入框前置图标                              | `string \| Component`                                        | —      |
| `suffix-icon`         | 输入框后置图标                              | `string \| Component`                                        | —      |
| `validate-event`      | 值变化时触发表单校验                        | `boolean`                                                    | `true`  |
| `value-key` | 用于显示和选择建议的字段 | `string` | `'value'` |
| `aria-label` | 原生输入框的无障碍标签 | `string` | — |
| `teleported` | 是否将面板挂载到外部容器 | `boolean` | `true` |
| `append-to` | 面板挂载容器 | `string \| HTMLElement` | `document.body` |
| `placement` | 面板位置 | `Placement` | `'bottom-start'` |
| `fit-input-width` | 将面板宽度匹配输入控制区域 | `boolean` | `false` |
| `show-arrow` | 显示面板箭头 | `boolean` | `true` |
| `popper-class` | 面板自定义类 | `string \| string[] \| Record<string, boolean>` | — |
| `popper-style` | 面板自定义样式 | `string \| CSSProperties \| CSSProperties[]` | — |
| `popper-options` | 共享浮层的定位配置，支持 `placement` 和 `offset` | `FloatingOptions` | — |
| `loop-navigation` | 键盘高亮跨首尾循环 | `boolean` | `true` |

建议对象允许自定义字段。例如设置 `value-key="label"`，可直接用 `{ label: '北京' }` 作为建议项。本地 `suggestions` 会按该字段过滤，`fetchSuggestions` 提供的结果直接用于展示。

### 事件

| 事件名              | 说明                     | 回调参数                    |
| ------------------- | ------------------------ | --------------------------- |
| `update:modelValue` | 输入或选中后值变化       | `value: string`             |
| `input`             | 输入内容变化             | `value: string`             |
| `change`            | 原生 change              | `value: string`             |
| `select`            | 选中建议项               | `item: AutocompleteSuggestion` |
| `clear`             | 点击清空                 | —                           |
| `focus`             | 聚焦                     | `event: FocusEvent`         |
| `blur`              | 失焦                     | `event: FocusEvent`         |

### 插槽

| 名称      | 说明                             |
| --------- | -------------------------------- |
| `default` | 自定义建议项内容，作用域 `{ item }` |
| `prepend` | 输入框外部前置内容               |
| `append`  | 输入框外部后置内容               |
| `prefix`  | 输入框内前置内容                 |
| `suffix`  | 输入框内后置内容                 |
| `header` | 建议面板顶部内容 |
| `footer` | 建议面板底部内容 |
| `loading` | 远程查询加载内容 |

### 实例方法

| 方法                     | 说明                     |
| ------------------------ | ------------------------ |
| `focus()`                | 聚焦输入框               |
| `blur()`                 | 取消聚焦                 |
| `select()`               | 选中输入框文本           |
| `handleSelect(item)`     | 以编程方式选中建议项，返回 `Promise<void>` |
| `handleKeyEnter()` | 确认当前高亮项，返回 `Promise<void>` |
| `getData(query)` | 立即请求建议，返回 `Promise<void>` |
| `highlight(index)` | 更新键盘高亮 |
| `close()` | 关闭面板并取消待处理的建议请求 |
| `inputRef` | 内部 `InputInstance` |
| `popperRef` | 内部 `TooltipInstance` |
| `activated` / `loading` / `highlightedIndex` / `suggestions` | 激活状态、加载状态、高亮索引和当前建议 |
