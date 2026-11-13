# DateTimePicker 日期时间选择器

## 介绍

DateTimePicker 在一个控件中选择日期和时间，底层对应 DatePicker 的 `datetime` / `datetimerange` 类型。

## 基础用法

```vue
<DateTimePicker v-model="dateTime" value-format="YYYY-MM-DD HH:mm:ss" />
```

控件支持秒精度，未设置 `value-format` 时返回 `Date`，设置后返回对应格式的字符串或时间戳。

## 日期时间范围

```vue
<DateTimePicker v-model="range" range range-separator="-" />
```

## API

属性：`model-value`、`type`（`datetime` / `datetimerange`）、`format`、`value-format`、`placeholder`、`start-placeholder`、`end-placeholder`、`range-separator`、`range`、`disabled-date`、`disabled`、`readonly`、`editable`、`clearable`、`id`、`name`、`prefix-icon`、`clear-icon`、`size`、`teleported`、`placement`、`popper-class`、`popper-style`、`popper-options`、`fallback-placements`、`show-now`、`show-week-number`、`show-footer`、`single-panel`、`unlink-panels`、`shortcuts`、`default-value`、`default-time`、`first-day-of-week`、`cell-class-name`、`empty-values`、`value-on-clear`、`show-confirm`（项目扩展）。

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`、`visible-change`、`calendar-change`、`panel-change`。

方法：`focus()`、`blur()`、`handleOpen()`、`handleClose()`。

DateTimePicker 复用 DatePicker 的 `datetime` / `datetimerange` 能力，已支持 `default-time`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`show-now`、`show-week-number`、`show-footer`、`single-panel`、`unlink-panels`、`shortcuts`、`default-value`、`first-day-of-week`、`cell-class-name`、`id`、`name`、`prefix-icon`、`clear-icon` 和基础 Popper 配置。`show-confirm` 为本项目扩展能力；完整 Day.js token、高级键盘交互和高级 ARIA 暂未完成。
