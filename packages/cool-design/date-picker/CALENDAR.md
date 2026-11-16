# Calendar 日历

### 介绍

以月视图展示日期并支持选择、切换月份和日期禁用。

## 用法

`<Calendar v-model="date" />`；可通过 `#date-cell` 插槽自定义日期单元格，`#header` 自定义头部。

## API

属性：`modelValue`、`range`、`controller-type`、`formatter`、`first-day-of-week`、`disabled-date`、`highlight-current`。

事件：`update:modelValue`、`select`、`change`、`panel-change`。

插槽：`date-cell`（`{ data }`）、`date`（兼容别名）、`header`（`{ date }`）。

Expose：`selectedDay`、`pickDay`、`selectDate`、`calculateValidatedDateRange`。
