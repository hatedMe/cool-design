# DatePicker 日期选择器

## 介绍

DatePicker 用于选择日期、月份、年份、周、多个日期和日期范围，支持格式化、禁用日期、弹层和键盘关闭。

## 基础用法

```vue
<DatePicker v-model="date" />
```

## 范围与多选

```vue
<DatePicker v-model="range" type="daterange" range-separator="-" />
<DatePicker v-model="dates" type="dates" />
```

## 格式化与禁用

```vue
<DatePicker v-model="date" value-format="YYYY-MM-DD" format="YYYY/MM/DD" :disabled-date="disabledDate" />
```

未设置 `value-format` 时返回 `Date` 或 `Date[]`；设置 `value-format="x"` / `timestamp` 时返回毫秒时间戳。

## API

### 属性

| 参数                | 说明                                                           | 类型                                   | 默认值         |
| ------------------- | -------------------------------------------------------------- | -------------------------------------- | -------------- |
| model-value         | 绑定值                                                         | `string` / `number` / `Date` / `Array<string \| number \| Date> \| null` | — |
| type                | `date` / `dates` / `week` / `month` / `months` / `year` / `years` / `quarter` / `quarters` / `quarterrange` / `datetime` / `daterange` / `datetimerange` / `monthrange` / `yearrange` | `string` | `date` |
| format              | 显示格式：季度默认 `YYYY-[Q]Q`，周类型默认 `YYYY-[第]ww[周]`；`datetime` 面板时间列粒度跟随 format | `string` | 按 type |
| value-format        | 绑定值格式，`x` / `timestamp` 返回毫秒时间戳                   | `string`                               | —              |
| placeholder         | 占位文本                                                       | `string`                               | —              |
| start-placeholder   | 范围开始占位                                                   | `string`                               | —              |
| end-placeholder     | 范围结束占位                                                   | `string`                               | —              |
| range-separator     | 范围分隔符                                                     | `string`                               | —              |
| range               | 是否为范围选择                                                 | `boolean`                              | `false`        |
| disabled-date       | 禁用日期（季度按季度内日期整体判断）                           | `(date: Date) => boolean`             | —              |
| disabled            | 禁用                                                           | `boolean`                              | `false`        |
| readonly            | 只读                                                           | `boolean`                              | `false`        |
| editable            | 是否允许手动输入                                               | `boolean`                              | `true`         |
| clearable           | 是否可清空                                                     | `boolean`                              | `false`        |
| size                | 尺寸                                                           | `string`                               | 继承全局尺寸   |
| shortcuts           | 快捷选项                                                       | `Array<{ text: string; value: ... }>`  | —              |
| default-value       | 初始值                                                         | `Date` / `Date[]`                      | —              |
| default-time         | 选择日期时的初始时间                                           | `string` / `number` / `Date` / `Array<string \| number \| Date>` | — |
| show-confirm        | 确认流程扩展，开启后需点击确认提交                             | `boolean`                              | `false`        |
| show-now             | 是否显示"此刻"按钮                                             | `boolean`                              | `false`        |
| show-footer          | 是否显示底部栏                                                 | `boolean`                              | —              |
| show-week-number     | 是否显示周数列                                                 | `boolean`                              | `false`        |
| single-panel        | 范围选择使用单面板                                             | `boolean`                              | `false`        |
| unlink-panels       | 范围双面板取消联动                                             | `boolean`                              | `false`        |
| first-day-of-week   | 周起始日，`0` 为周日                                           | `number`                               | `0`            |
| cell-class-name     | 日期单元格自定义类名                                           | `string` / `(date: Date) => string`    | —              |
| empty-values        | 视为空的输入值                                                 | `unknown[]`             | —              |
| value-on-clear      | 清空时的回退值                                                 | `DateModelValue` / `boolean` / `() => unknown` | 继承 ConfigProvider              |
| validate-event      | 值变化时触发表单校验                                           | `boolean`                              | `true`         |
| automatic-dropdown  | 聚焦即展开                                                     | `boolean`                              | `false`        |
| prefix-icon         | 前置图标                                                       | `string` / `Component`                 | —              |
| clear-icon          | 清空图标                                                       | `string` / `Component`                 | —              |
| id                  | 原生 id                                                        | `string` / `string[]`                  | —              |
| name                | 原生名称                                                       | `string`                               | —              |
| teleported          | 弹层是否传送到 body                                            | `boolean`                              | `true`         |
| placement           | 弹层位置                                                       | `string`                               | `bottom-start` |
| popper-class        | 弹层自定义类名                                                 | `string`                               | —              |
| popper-style        | 弹层自定义样式                                                 | `string` / `CSSProperties`             | —              |
| popper-options      | 浮层参数覆盖                                                   | `object`                               | —              |
| fallback-placements | 候选位置                                                       | `string[]`                             | —              |

范围选择已定起点、未定终点时，鼠标悬停的日期区间会实时预览高亮。

### 事件

| 事件名            | 说明               | 回调参数                                   |
| ----------------- | ------------------ | ------------------------------------------ |
| update:modelValue | 绑定值变化         | `value`                                    |
| change            | 值确认变化         | `value`                                    |
| focus             | 聚焦               | `event: FocusEvent`                        |
| blur              | 失焦               | `event: FocusEvent`                        |
| clear             | 点击清空           | —                                          |
| visible-change    | 弹层显隐变化       | `visible: boolean`                         |
| calendar-change    | 范围起止选择变化   | `values`                                   |
| panel-change      | 面板年月切换       | `date: Date, type: string`                 |

### 插槽

| 名称     | 说明               | 作用域              |
| -------- | ------------------ | ------------------- |
| default  | 自定义日期单元格   | `{ date }`          |

### 实例方法

| 方法                    | 说明         |
| ----------------------- | ------------ |
| `focus()`               | 聚焦输入框   |
| `blur()`                | 取消聚焦     |
| `handleOpen()`           | 手动打开面板 |
| `handleClose()`          | 手动关闭面板 |

## API 支持状态

已支持全部列出的类型、`format`、`value-format`、`disabled-date`、`shortcuts`、`default-time`、`show-confirm`（项目扩展）、`empty-values`、`value-on-clear`、`validate-event` 与基础浮层配置。部分支持完整 Day.js token、高级键盘导航与 ARIA。

`TimeSelect` 和 `selectableRange` 不属于本组件范围。

清空值默认是 `null`，适用于单值、范围和多选。旧代码若依赖 `[]` 或 `[null, null]`，可用 `value-on-clear` 显式配置。清空工厂只在执行清空时调用一次，可以返回 `undefined`。
依赖数组模型自动识别范围的页面，可显式设置 `range` 或范围 `type`，使清空后继续显示两个输入框。
