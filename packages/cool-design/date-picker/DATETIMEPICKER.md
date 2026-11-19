# DateTimePicker 日期时间选择器

## 介绍

DateTimePicker 在一个控件中选择日期和时间，底层对应 DatePicker 的 `datetime` / `datetimerange` 类型。

## 基础用法

```vue
<DateTimePicker v-model="dateTime" value-format="YYYY-MM-DD HH:mm:ss" />
```

未设置 `value-format` 时返回 `Date`，设置后返回对应格式的字符串或时间戳。

## 日期时间范围

```vue
<DateTimePicker v-model="range" range range-separator="-" />
```

## API

### 属性

| 参数               | 说明                                                 | 类型                                   | 默认值       |
| ------------------ | ---------------------------------------------------- | -------------------------------------- | ------------ |
| modelValue         | 绑定值                                               | `string` / `number` / `Date` / `Date[]` / `null` | — |
| type               | 类型：`datetime` / `datetimerange`                   | `string`                               | `datetime`   |
| format             | 显示格式，时间粒度跟随 format                         | `string`                               | `YYYY-MM-DD HH:mm:ss` |
| value-format       | 绑定值格式                                           | `string`                               | —            |
| placeholder        | 占位文本                                             | `string`                               | —            |
| start-placeholder  | 范围开始占位                                         | `string`                               | —            |
| end-placeholder    | 范围结束占位                                         | `string`                               | —            |
| range-separator    | 范围分隔符                                           | `string`                               | `'-'`        |
| range              | 是否为范围选择                                       | `boolean`                              | `false`      |
| disabled-date      | 禁用日期                                             | `(date: Date) => boolean`              | —            |
| disabled           | 禁用                                                 | `boolean`                              | `false`      |
| readonly           | 只读                                                 | `boolean`                              | `false`      |
| editable           | 是否允许手动输入                                     | `boolean`                              | `true`       |
| clearable          | 是否可清空                                           | `boolean`                              | `false`      |
| size               | 尺寸                                                 | `string`                               | 继承全局尺寸 |
| default-value      | 初始值                                               | `Date` / `Date[]`                      | —            |
| default-time       | 选择日期时的初始时间                                 | `string` / `number` / `Date` / `Array<string \| number \| Date>` | — |
| shortcuts          | 快捷选项                                             | `Array<{ text: string; value: ... }>`  | —            |
| show-now           | 是否显示"此刻"按钮                                   | `boolean`                              | `false`      |
| show-footer        | 是否显示底部栏                                       | `boolean`                              | —            |
| show-week-number   | 是否显示周数列                                       | `boolean`                              | `false`      |
| single-panel       | 范围选择使用单面板                                   | `boolean`                              | `false`      |
| unlink-panels      | 范围双面板取消联动                                   | `boolean`                              | `false`      |
| first-day-of-week  | 周起始日，`0` 为周日                                 | `number`                               | `0`         |
| cell-class-name    | 日期单元格自定义类名                                 | `string` / `(date: Date) => string`    | —            |
| empty-values       | 视为空的输入值                                       | `Array<string \| number>`             | —            |
| value-on-clear     | 清空时的回退值                                       | `string` / `number` / `null`           | —            |
| show-confirm       | 草稿确认扩展（项目扩展）                             | `boolean`                              | `false`      |
| id                 | 原生 id                                              | `string` / `string[]`                  | —            |
| name               | 原生名称                                             | `string`                               | —            |
| prefix-icon        | 前置图标                                             | `string` / `Component`                 | —            |
| clear-icon         | 清空图标                                             | `string` / `Component`                 | —            |
| teleported         | 弹层是否传送到 body                                  | `boolean`                              | `true`       |
| placement          | 弹层位置                                             | `string`                               | `bottom-start` |
| popper-class       | 弹层自定义类名                                       | `string`                               | —            |
| popper-style       | 弹层自定义样式                                       | `string` / `CSSProperties`             | —            |
| popper-options     | 浮层参数覆盖                                         | `object`                               | —            |
| fallback-placements | 候选位置                                            | `string[]`                             | —            |

### 事件

| 事件名            | 说明               | 回调参数                                  |
| ----------------- | ------------------ | ----------------------------------------- |
| update:modelValue | 绑定值变化         | `value`                                   |
| change            | 值确认变化         | `value`                                   |
| focus             | 聚焦               | `event: FocusEvent`                       |
| blur              | 失焦               | `event: FocusEvent`                       |
| clear             | 点击清空           | —                                         |
| visible-change    | 弹层显隐变化       | `visible: boolean`                         |
| calendar-change    | 范围起止选择变化   | `values`                                  |
| panel-change      | 面板年月切换       | `date: Date, type: string`                |

### 实例方法

| 方法                    | 说明         |
| ----------------------- | ------------ |
| `focus()`               | 聚焦输入框   |
| `blur()`                | 取消聚焦     |
| `handleOpen()`           | 手动打开面板 |
| `handleClose()`         | 手动关闭面板 |

DateTimePicker 复用 DatePicker 的 `datetime` / `datetimerange` 能力，时间列粒度跟随 `format`；`show-confirm` 为本项目扩展能力。
