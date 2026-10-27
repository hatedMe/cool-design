# DatePicker 日期选择器

### 介绍

选择日期、月份、年份或日期范围。

## 基础用法

`<DatePicker v-model="date" />` 使用 `v-model` 双向绑定；范围选择使用 `range`。

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue / v-model | 当前日期或日期范围 | `string` / `number` / `Date` / `Array` | `null` |
| type | `date` / `month` / `year` / `dates` / `week` | `string` | `date` |
| format | 展示格式，如 `YYYY-MM-DD` | `string` | `YYYY-MM-DD` |
| value-format | 绑定值格式，`x`/`timestamp` 返回时间戳 | `string` | — |
| range | 是否为日期范围 | `boolean` | `false` |
| disabled / readonly / clearable / editable | 状态控制 | `boolean` | `false` / `false` / `false` / `true` |
| disabled-date | 禁用日期函数 | `(date: Date) => boolean` | — |

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`。
