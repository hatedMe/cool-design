# Space 间距

### 介绍

为操作按钮、筛选控件或纵向内容设置统一间距，支持自动换行。

## API

### 属性

| 参数        | 说明                                                     | 类型                               | 默认值       |
| ----------- | -------------------------------------------------------- | ---------------------------------- | ------------ |
| size        | 间距档位、px 数值或 `[列间距, 行间距]`                     | `string` / `number` / `[number, number]` | 继承全局尺寸，最终回退 `small` |
| direction   | 排列方向：`horizontal` / `vertical`                      | `string`                           | `horizontal` |
| alignment   | 对齐：`normal` / `start` / `end` / `center` / `baseline` / `stretch` | `string`                   | `center`     |
| align       | 兼容别名，`alignment` 优先                               | `string`                           | —            |
| prefix-cls  | 子项包装类名前缀                                         | `string`                           | —            |
| wrap        | 是否允许换行                                             | `boolean`                          | `false`      |
| fill        | 子项是否撑满容器（自动换行）                             | `boolean`                          | `false`      |
| fill-ratio   | `fill` 时每个子项的最小宽度百分比                        | `number`                           | `100`        |
| spacer      | 子项之间的分隔内容，文本或 VNode                         | `string` / `number` / `VNode`      | —            |

内置尺寸 `small` / `default` / `large` 对应 8px / 12px / 16px。

### 插槽

| 名称    | 说明                                     |
| ------- | ---------------------------------------- |
| default | 要排列的内容。Fragment（包括 `v-for` 生成的 Fragment）中的子项分别参与布局，普通元素或组件整体占一项。 |

### 事件与实例方法

Space 无专用事件或公开实例方法。

## 使用说明

- `size`：`small` / `default` / `large` 对应 8px / 12px / 16px；也支持数字 px 或 `[列间距, 行间距]` 数组。
- `direction`：`horizontal`（默认）或 `vertical`。
- `alignment`（兼容别名 `align`）：`normal` / `start` / `end` / `center` / `baseline` / `stretch`，默认 `center`。
- `wrap`：默认 `false`，需要换行的布局请显式传 `wrap`。
- `fill`：开启后子项按 `fillRatio` 撑满容器并自动换行。

Fragment 内的子项分别应用间距、方向、换行和分隔符。需要把多段内容作为一个整体排列时，可以在外面套一层显式容器，例如 `div`。

未指定 `size` 时继承 ConfigProvider 的全局尺寸，组件在全局尺寸也为空时回退 `small`。

通过 `prefix-cls="toolbar"` 将子项包装类名设为 `toolbar__item`，便于编写子项样式。省略前缀或传空字符串时使用 `i-space__item`。根容器使用 `i-space` 和相应方向类，文本分隔符使用 `i-space__spacer`。
