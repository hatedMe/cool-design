# DateTimePicker 日期时间选择器

## 介绍

DateTimePicker 用于选择日期和时间，支持单值和日期时间范围，底层对应 DatePicker 的 `datetime` / `datetimerange` 类型。

## 基础用法

```vue
<DateTimePicker v-model="dateTime" />
```

未设置 `value-format` 时，单值返回 `Date`，范围返回 `Date[]`。设置后返回指定格式的字符串或时间戳，支持秒精度。启用 `show-confirm` 时，确认后提交草稿。

也可以使用 `<DateTimePicker v-model="range" type="datetimerange" range-separator="至" />` 选择范围。此扩展组件的导入名为 `DateTimePicker`。

## API

### 属性

`value-format`、`range`、占位文本、日期限制、`default-value`、`show-confirm`、`single-panel`、`unlink-panels`、`first-day-of-week`、`cell-class-name`、`size`、`id`、`name`、图标及浮层配置见 [DatePicker 属性](#/components/date-picker)。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` | 绑定值，布尔值按空值处理 | `DateModelValue \| boolean` | `null` |
| `type` | 单值或范围 | `'datetime' \| 'datetimerange'` | `'datetime'` |
| `format` | 显示格式 | `string` | `'YYYY-MM-DD HH:mm:ss'` |
| `range-separator` | 范围分隔符 | `string` | `'-'` |
| `clearable` | 是否可清空 | `boolean` | `true` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读 | `boolean` | `false` |
| `editable` | 是否允许手动输入 | `boolean` | `true` |
| `default-time` | 日期选中时的初始时间，范围可分别指定两端 | `DateModelValue` | `null` |
| `shortcuts` | 快捷选项，`DateValue` 为 `string` / `number` / `Date` | `{ text: string; value: DateValue \| DateValue[] \| (() => DateValue \| DateValue[]) }[]` | — |
| `disabled-hours` / `disabled-minutes` / `disabled-seconds` | 返回不可选的小时、分钟或秒 | `(...args: number[]) => number[]` | — |
| `show-now` | 单值模式下启用 `show-footer` 时，是否显示“现在”按钮 | `boolean` | `true` |
| `show-footer` | 是否显示底部栏 | `boolean` | `true` |
| `show-week-number` | 是否显示周数列 | `boolean` | `false` |
| `automatic-dropdown` | 点击输入框或按回车时自动展开 | `boolean` | `true` |
| `validate-event` | 值变化时触发表单校验 | `boolean` | `true` |
| `empty-values` | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| `value-on-clear` | 清空时的回退值或工厂 | `DateModelValue \| boolean \| (() => unknown)` | 继承 ConfigProvider，根级 `null` |

`default-time` 可传入 `Date`、`null` 或 `Array<DateValue | null>`。范围数组按顺序设置起止时间，端点可用 `Date`、可解析的日期时间字符串（如 `2026-04-10T09:14:12`）或毫秒时间戳。`null` 可留空一端。公开声明 `DateModelValue` 还包含标量字符串和数字。组件在运行时以对象或数组校验该属性，传入标量字符串或数字会触发 Vue 开发环境的类型警告。可将其转换为 `Date`，或作为范围数组中的端点值。

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `calendar-change` | 范围草稿更新。未选的一端为 `null`，已选值为 `Date` 或按 `value-format` 输出的字符串或时间戳 | `values: Array<DateValue \| null>` |
| `panel-change` | 面板年月切换。两种日期时间模式的面板类型均为 `'date'` | `date: Date, type: 'date'` |

`update:modelValue`、`change`、`focus`、`blur`、`clear` 和 `visible-change` 的参数见 [DatePicker 事件](#/components/date-picker)。

### 插槽

| 名称 | 说明 | 作用域 |
| --- | --- | --- |
| `default` | 自定义日期单元格 | `{ date }` |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `focus()` | 聚焦输入框 |
| `blur()` | 取消聚焦 |
| `handleOpen()` | 手动打开面板 |
| `handleClose()` | 手动关闭面板 |

单值和范围默认清空为 `null`。旧代码可通过 `value-on-clear` 显式保留 `[null, null]`。清空工厂每次执行清空时调用一次。
