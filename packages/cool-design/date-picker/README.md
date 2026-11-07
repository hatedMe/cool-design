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

属性：`model-value`、`type`（`date` / `dates` / `week` / `month` / `months` / `year` / `years` / `quarter` / `quarters` / `quarterrange` / `datetime` / `daterange` / `datetimerange` / `monthrange` / `yearrange`）、`format`（季度默认 `YYYY-[Q]Q`）、`value-format`、`placeholder`、`start-placeholder`、`end-placeholder`、`range-separator`、`range`、`disabled-date`（季度按季度内日期整体判断）、`disabled`、`readonly`、`editable`、`clearable`、`size`、`teleported`、`placement`、`popper-class`。

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`、`visible-change`、`calendar-change`、`panel-change`。

方法：`focus()`、`blur()`、`handleOpen()`、`handleClose()`。

## API 支持状态

已支持：`date`、`dates`、`week`、`month`、`months`、`year`、`years`、`quarter`、`quarters`、`quarterrange`、`datetime`、`daterange`、`datetimerange`、`monthrange`、`yearrange`、`format`、`value-format`、`disabled-date`、`shortcuts`、`default-value`、`default-time`、`show-confirm`、`show-footer`、`show-week-number`、`empty-values`、`value-on-clear`、`prefix-icon`、`clear-icon`、`automatic-dropdown`、`first-day-of-week`、`cell-class-name`、`teleported`、`placement`、`popper-class`、`popper-style`、`popper-options`、`fallback-placements`。

部分支持：完整 Day.js token、完整键盘导航和高级 ARIA。

扩展说明：`show-confirm` 是本项目提供的确认流程扩展；`quarter`、`quarters`、`quarterrange` 已支持。暂不支持：完整 `single-panel`、`validate-event`、完整 Popper.js options、IANA 时区选择。

`TimeSelect` 和 Element UI 遗留的 `selectableRange` 不属于本组件范围。
