# Slider 滑块

### 介绍

在数值范围内选择单值或区间。

## 用法

```vue
<Slider v-model="value" :min="0" :max="100" />
<Slider v-model="range" range />
<Slider v-model="value" vertical />
<Slider v-model="value" show-input show-stops :marks="marks" />
```

`range` 模式的 `v-model` 为 `[number, number]`；`step` 为 `mark` 时不显示步进点。

使用数字步长时，聚焦滑块后，方向键移动一步，`PageUp` 和 `PageDown` 移动四步，`Home` 和 `End` 移到最小值和最大值。按键使当前值停留在边界时，仅触发 `change`。区间模式下，键盘移动越过另一端时保留另一端的值，并按升序返回区间。

## API

### 属性

| 参数                 | 说明                                                         | 类型                                   | 默认值       |
| -------------------- | ------------------------------------------------------------ | -------------------------------------- | ------------ |
| model-value           | 绑定值，`range` 模式为数组                                   | `number` / `[number, number]`          | `0`          |
| min                  | 最小值                                                       | `number`                               | `0`          |
| max                  | 最大值                                                       | `number`                               | `100`        |
| step                 | 步长，设为 `mark` 时按刻度取值                               | `number` / `mark`                      | `1`          |
| disabled             | 禁用                                                         | `boolean`                              | `false`      |
| range                | 是否为区间选择                                               | `boolean`                              | `false`      |
| vertical             | 是否垂直                                                     | `boolean`                              | `false`      |
| height               | 垂直模式高度                                                 | `string` / `number`                    | —            |
| show-input            | 是否显示数字输入框，`range` 模式渲染起止双输入框             | `boolean`                              | `false`      |
| show-input-controls   | 输入框是否显示步进按钮                                       | `boolean`                              | `true`       |
| input-size           | 输入框尺寸，未设置时继承 `size`                              | `large` / `default` / `small`          | —            |
| show-stops           | 是否显示步进点                                               | `boolean`                              | `false`      |
| show-tooltip         | 交互期间显示 Tooltip                                         | `boolean`                              | `true`       |
| persistent           | Tooltip 隐藏时是否保留节点                                   | `boolean`                              | `true` |
| format-tooltip       | Tooltip 文本格式化                                           | `(value: number) => string`           | —            |
| format-value-text    | 数值无障碍文本格式化                                         | `(value: number) => string`           | —            |
| placement            | Tooltip 位置：`top` / `bottom` / `left` / `right`            | `string`                               | `top`        |
| tooltip-class        | Tooltip 自定义类名                                           | `string`                               | —            |
| range-start-label     | 区间起点无障碍名称                                           | `string`                               | —            |
| range-end-label      | 区间终点无障碍名称                                           | `string`                               | —            |
| marks                | 刻度标记                                                     | `Record<number, string \| { style?: CSSProperties; label?: string }>` | — |
| size                 | 尺寸：`large` / `default` / `small`                          | `string`                               | 继承 FormItem、Form 或 ConfigProvider |
| debounce | 数字输入更新的防抖延迟，单位毫秒，`0` 为即时更新 | `number` | `0` |
| validate-event       | 值变化时触发表单校验                                         | `boolean`                              | `true`       |
| aria-label           | 无障碍名称（兼容属性，推荐标准 `aria-label`）               | `string`                               | —            |

### 事件

| 事件名            | 说明                       | 回调参数    |
| ----------------- | -------------------------- | ----------- |
| update:modelValue | 绑定值变化                 | `value`    |
| input             | 交互过程中更新             | `value`    |
| change            | 交互完成或输入提交时触发   | `value`    |

### 插槽

| 名称  | 说明               | 作用域               |
| ----- | ------------------ | -------------------- |
| mark  | 自定义刻度标签     | `{ value, label }`   |

置于 `FormItem` 内时继承禁用状态与尺寸（依次回退自身 → FormItem → 全局配置）。垂直模式推荐显式设置 `height`；若未设置，保留 `min-height: 120px` 作为项目扩展的兼容默认值。
