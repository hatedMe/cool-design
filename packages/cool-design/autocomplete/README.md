# Autocomplete 自动补全

### 介绍

根据输入内容展示建议项，支持静态 `suggestions` 和 `fetch-suggestions` 远程建议、键盘导航与表单校验联动。

## 用法

`<Autocomplete v-model="value" :suggestions="items" clearable />`。聚焦或输入时展示匹配的建议项，点击或回车选中；`highlight-first-item` 可默认高亮首项，`select-when-unmatched` 允许回车选中未匹配的输入值。

## API

### 属性

| 参数                 | 说明                                        | 类型                                                         | 默认值 |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ | ------ |
| `modelValue`         | 输入值                                      | `string`                                                     | `''`   |
| `suggestions`        | 静态建议列表                                | `(string \| AutocompleteSuggestion)[]`                       | `[]`   |
| `fetchSuggestions`   | 远程获取建议，回调返回结果                  | `(query, cb: (items) => void) => void`                       | —      |
| `placeholder`        | 占位文本                                    | `string`                                                     | —      |
| `disabled`           | 是否禁用                                    | `boolean`                                                    | `false` |
| `clearable`          | 是否可清空                                  | `boolean`                                                    | `false` |
| `triggerOnFocus`     | 聚焦时是否立即触发建议                      | `boolean`                                                    | `true`  |
| `highlightFirstItem` | 是否默认高亮第一个建议项                    | `boolean`                                                    | `false` |
| `selectWhenUnmatched` | 无匹配时回车是否选中当前输入值             | `boolean`                                                    | `false` |
| `hideLoading`        | 隐藏远程加载状态                            | `boolean`                                                    | `false` |
| `size`               | 尺寸：`small` / `default` / `large`         | `string`                                                     | 继承全局尺寸 |
| `name`               | 原生 input 名称                             | `string`                                                     | —      |
| `maxlength` / `minlength` | 原生长度限制                           | `string \| number`                                           | —      |
| `prefixIcon`         | 输入框前置图标                              | `string \| Component`                                        | —      |
| `suffixIcon`         | 输入框后置图标                              | `string \| Component`                                        | —      |
| `validateEvent`      | 值变化时触发表单校验                        | `boolean`                                                    | `true`  |

`AutocompleteSuggestion`：`{ value: string; [key: string]: unknown }`。

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

### 实例方法

| 方法                     | 说明                     |
| ------------------------ | ------------------------ |
| `focus()`                | 聚焦输入框               |
| `blur()`                 | 取消聚焦                 |
| `select()`               | 选中输入框文本           |
| `handleSelect(item)`     | 以编程方式选中建议项     |
