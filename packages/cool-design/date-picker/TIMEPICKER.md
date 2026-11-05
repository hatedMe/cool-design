# TimePicker 时间选择器

## 介绍

TimePicker 用于选择一天中的时间，支持单时间和时间范围选择。组件 API 对齐 Element Plus TimePicker 的核心能力。

## 基础用法

```vue
<TimePicker v-model="time" placeholder="选择时间" />
```

未设置 `value-format` 时，绑定值为 `Date`；设置 `value-format` 后，绑定值为对应格式的字符串或时间戳。

## 时间范围

```vue
<TimePicker
  v-model="timeRange"
  is-range
  start-placeholder="开始时间"
  end-placeholder="结束时间"
  range-separator="-"
/>
```

范围清空后的值为 `[null, null]`。

## 格式化

```vue
<TimePicker v-model="time" format="HH:mm" value-format="HH:mm" />
```

格式支持常用的 `HH:mm` 和 `HH:mm:ss`。`format` 控制显示和面板粒度，`value-format` 控制绑定值格式。

## 禁用时间

```vue
<TimePicker
  v-model="time"
  :disabled-hours="() => [0, 1, 2]"
  :disabled-minutes="(hour) => hour === 9 ? [30] : []"
  :disabled-seconds="(hour, minute) => hour === 10 && minute === 20 ? [30] : []"
/>
```

禁用规则会同时作用于面板候选项和最终提交校验。

## 状态

- 禁用：`disabled`
- 只读：`readonly`
- 禁止手动输入但允许面板选择：`editable="false"`
- 可清空：`clearable`

## API

### 属性

- 绑定值：`model-value`
- 显示格式：`format`
- 绑定值格式：`value-format`
- 占位文本：`placeholder` / `start-placeholder` / `end-placeholder`
- 范围：`is-range`
- 范围分隔符：`range-separator`
- 状态：`disabled` / `readonly` / `editable` / `clearable`
- 尺寸：`size`
- 禁用小时：`disabled-hours`
- 禁用分钟：`disabled-minutes`
- 禁用秒：`disabled-seconds`
- 弹层：`teleported` / `placement` / `popper-class` / `popper-options`
- 草稿确认扩展：`show-confirm`（本项目扩展，默认关闭） / `save-on-blur`（默认开启）
- 图标：`prefix-icon` / `clear-icon`

### 事件

- `update:modelValue`
- `change`
- `focus`
- `blur`
- `clear`
- `visible-change`

### 方法

通过组件 ref 使用：

- `focus()`
- `blur()`
- `handleOpen()`
- `handleClose()`

## API 支持状态

已支持：`format`、`value-format`、`is-range`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`arrow-control`、`show-confirm`（项目扩展）、`save-on-blur`、`empty-values`、`prefix-icon`、`clear-icon`、`value-on-clear`、`teleported`、`placement`、`popper-class`、`popper-options`、`focus()`、`blur()`、`handleOpen()`、`handleClose()`。

部分支持：`format` 的完整 Day.js token、时间范围双面板、键盘方向键、完整 ARIA、Popper 高级配置。

本组件不实现 Element UI 遗留的 `selectableRange`，也不包含 `TimeSelect` 的 `start`、`end`、`step` 等 API。
