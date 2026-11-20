# DateTimePicker 日期时间选择器

DateTimePicker 用于选择日期和时间，支持单值和日期时间范围，底层对应 DatePicker 的 `datetime` / `datetimerange` 类型。

## 基础用法

```vue
<DateTimePicker v-model="dateTime" />
```

未设置 `value-format` 时返回 `Date`，设置后返回对应格式的字符串或时间戳，并支持秒精度。

## API

| 项目 | 说明 |
| --- | --- |
| 属性 | 继承 DatePicker 的日期时间属性，见下方列表及 DatePicker API |
| 事件 | 日期选择、清空、焦点和面板切换，参数与 DatePicker 一致 |
| 插槽 | `default`（日期单元格）、`range-separator`（范围分隔符） |

属性：`model-value`、`type`（`datetime` / `datetimerange`）、`format`、`value-format`、`range`、`placeholder`、`start-placeholder`、`end-placeholder`、`range-separator`、`disabled-date`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`disabled`、`readonly`、`clearable`、`editable`、`size`、`default-time`、`default-value`、`show-confirm`、`show-now`（默认 `true`）、`show-week-number`、`show-footer`、`single-panel`、`unlink-panels`、`shortcuts`、`first-day-of-week`、`cell-class-name`、`empty-values`、`value-on-clear`、`automatic-dropdown`、`id`、`name`、`prefix-icon`、`clear-icon`、`teleported`、`placement`、`popper-class`、`popper-style`、`popper-options`、`fallback-placements`。

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`、`visible-change`、`calendar-change`、`panel-change`。

方法：`focus()`、`blur()`、`handleOpen()`、`handleClose()`。

`empty-values` 和 `value-on-clear` 继承 ConfigProvider。单值和范围默认清空为 `null`。旧代码可通过 `value-on-clear` 显式保留 `[null, null]`。清空工厂每次执行清空时调用一次。
