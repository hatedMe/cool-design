# Slider 滑块

### 介绍

在数值范围内选择单值或区间。

## 用法

单值：`<Slider v-model="value" :min="0" :max="100" />`。

区间：`<Slider v-model="range" range />`，其中 `range` 为 `[number, number]`。

垂直滑块：`<Slider v-model="value" vertical />`。

带刻度和输入框：`<Slider v-model="value" show-input show-stops :marks="marks" />`。

## API

属性：`modelValue`、`min`、`max`、`step`、`disabled`、`range`、`vertical`、`height`、`show-input`、`show-input-controls`、`input-size`、`show-stops`、`show-tooltip`、`persistent`、`format-tooltip`、`placement`、`tooltip-class`、`format-value-text`、`range-start-label`、`range-end-label`、`marks`、`size`、`debounce`、`validate-event`。

类型：`size`：`large` / `default` / `small`；`input-size`：`large` / `default` / `small`，未设置时继承 `size`；`placement`：`top` / `bottom` / `left` / `right`；`marks`：`Record<number, string | { style?: CSSProperties; label?: string }>`；`format-tooltip`：`(value: number) => string`；`format-value-text`：`(value: number) => string`；`height`：`string | number`。

说明：`show-input` 仅在非 `range` 且 `step` 不是 `mark` 时显示；`show-tooltip` 默认只在聚焦、拖动等交互期间显示，`persistent` 控制隐藏时是否保留 Tooltip 节点；垂直模式推荐显式设置 `height`；若未设置，当前组件保留 `min-height: 120px` 作为项目扩展的兼容默认值。推荐使用标准属性 `aria-label` 设置无障碍名称；`ariaLabel` 仅作为组件内部兼容属性保留，另支持兼容属性 `label`。Range 模式可由 `range-start-label` / `range-end-label` 覆盖起止名称。

事件：`update:modelValue`、`input`、`change`。`input` 在交互更新时触发，`change` 在交互完成时触发。

插槽：`mark`，参数为 `{ value, label }`，用于自定义刻度标签。
