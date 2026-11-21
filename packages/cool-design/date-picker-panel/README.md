# DatePickerPanel 日期选择面板

## 介绍

DatePickerPanel 可嵌入页面，支持单日期、多选、范围和日期时间选择。也可以按周、月、季度或年选择。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DatePickerPanel, type DatePickerPanelModelValue } from 'cool-design';

const value = ref<DatePickerPanelModelValue>(null);
</script>

<template>
  <DatePickerPanel v-model="value" type="daterange" value-format="YYYY-MM-DD" />
</template>
```

默认模型输出 `Date` 或 `Date[]`。设置 `value-format` 后，输入和事件按指定格式处理。范围选择先发出 `calendar-change`，两个端点有效时更新模型。多选值按选择顺序排列，再次点击同一个日期、月份、季度或年份会取消该项。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` / `v-model` | 绑定值。范围使用两个端点 | `Date \| string \| number \| Array<Date \| string \| number> \| boolean \| null \| undefined` | `''` |
| `type` | 选择模式 | `date` / `dates` / `week` / `month` / `months` / `year` / `years` / `quarter` / `quarters` / `datetime` / `daterange` / `datetimerange` / `monthrange` / `yearrange` / `quarterrange` | `date` |
| `default-value` | 空模型时面板显示的初始日期 | `Date \| [Date, Date]` | — |
| `default-time` | 所选日期的默认时间。范围可指定两个端点的时间 | `Date \| [Date, Date]` | — |
| `value-format` | 模型格式，`x` 或 `timestamp` 返回毫秒时间戳 | `string` | — |
| `date-format` | 日期时间面板内的日期输入格式 | `string` | `YYYY-MM-DD` |
| `time-format` | 日期时间面板内的时间输入格式 | `string` | `HH:mm:ss` |
| `disabled` | 禁用面板 | `boolean` | `false` |
| `disabled-date` | 判断不可选择的日期 | `(date: Date) => boolean` | — |
| `disabled-hours` | 禁用的小时列表 | `(role: string, comparingDate?: Dayjs) => number[]` | — |
| `disabled-minutes` | 禁用的分钟列表 | `(hour: number, role: string, comparingDate?: Dayjs) => number[]` | — |
| `disabled-seconds` | 禁用的秒列表 | `(hour: number, minute: number, role: string, comparingDate?: Dayjs) => number[]` | — |
| `arrow-control` | 使用箭头按钮调整时间 | `boolean` | `false` |
| `cell-class-name` | 日期单元格的自定义类名 | `(date: Date) => string` | — |
| `shortcuts` | 快捷选择项，支持日期、范围和工厂函数 | `DatePickerPanelShortcut[]` | `[]` |
| `border` | 显示面板边框 | `boolean` | `true` |
| `editable` | 允许手动编辑日期时间输入框 | `boolean` | `true` |
| `clearable` | 在日期时间范围底栏显示清空按钮 | `boolean` | `true` |
| `show-footer` | 多选、日期时间及日期时间范围模式允许显示底栏 | `boolean` | `false` |
| `show-confirm` | 在支持底栏的模式中显示确认按钮。完整选择会更新模型 | `boolean` | `false` |
| `show-now` | 在单值日期时间底栏显示现在按钮 | `boolean` | `true` |
| `show-week-number` | 显示周数 | `boolean` | `false` |
| `is-range` | 启用范围选择 | `boolean` | `false` |
| `single-panel` | 范围选择使用单面板 | `boolean` | `false` |
| `unlink-panels` | 左右面板分别导航 | `boolean` | `false` |
| `empty-values` | 配置空值集合 | `unknown[]` | 继承 ConfigProvider |
| `value-on-clear` | 清空模型的值或工厂，每次清空只调用一次工厂 | `DatePickerPanelModelValue \| (() => unknown)` | 继承 ConfigProvider，后备值为 `null` |

### 事件

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 模型更新 | `(value: DatePickerPanelModelValue, locale: string)` |
| `calendar-change` | 范围日期改变，首次选择时结束端点为 `null` | `(range: [Date, Date \| null])` |
| `panel-change` | 导航到其他月份或年份 | `(value: Date \| [Date, Date], mode: 'month' \| 'year', view?: string)` |
| `clear` | 点击范围底栏的清空按钮 | `()` |
| `visible-change` | 与日期选择器共用的事件声明。独立面板持续显示 | `(visible: boolean)` |

### 插槽

| 名称 | 说明 | 作用域参数 |
| --- | --- | --- |
| `default` / `date-cell` | 自定义日、月、季、年单元格。两个插槽同时提供时优先使用 `default` | `DatePickerPanelCell`，包含 `date`、`dayjs`、`text`、`renderText`、`disabled` 等。日单元格通过 `isCurrent` 标记单选日期，通过 `isSelected` 标记多选成员 |
| `prev-month` / `next-month` | 自定义月份导航图标 | — |
| `prev-year` / `next-year` | 自定义年份导航图标 | — |

### 实例方法

独立面板通过 `v-model` 控制选择值，没有公开的实例方法。

