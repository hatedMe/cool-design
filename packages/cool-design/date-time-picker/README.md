# DateTimePicker 日期时间选择器

DateTimePicker 用于选择日期和时间，支持单值和日期时间范围，底层对应 DatePicker 的 `datetime` / `datetimerange` 类型。

基础用法：`<DateTimePicker v-model="dateTime" />`。

未设置 `value-format` 时返回 `Date`，设置后返回对应格式的字符串或时间戳，并支持秒精度。

## API

属性：`model-value`、`type`（`datetime` / `datetimerange`）、`format`、`value-format`、`range`、`placeholder`、`start-placeholder`、`end-placeholder`、`range-separator`、`disabled-date`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`disabled`、`readonly`、`clearable`、`editable`、`size`、`default-time`、`default-value`、`show-confirm`、`show-now`（默认 `true`）、`show-week-number`、`show-footer`、`single-panel`、`unlink-panels`、`shortcuts`、`first-day-of-week`、`cell-class-name`、`empty-values`、`value-on-clear`、`automatic-dropdown`、`id`、`name`、`prefix-icon`、`clear-icon`、`teleported`、`placement`、`popper-class`、`popper-style`、`popper-options`、`fallback-placements`。

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`、`visible-change`、`calendar-change`、`panel-change`。

方法：`focus()`、`blur()`、`handleOpen()`、`handleClose()`。
