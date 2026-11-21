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
| wrap        | 是否允许换行                                             | `boolean`                          | `false`      |
| fill        | 子项是否撑满容器（自动换行）                             | `boolean`                          | `false`      |
| fillRatio   | `fill` 时每个子项的最小宽度百分比                        | `number`                           | `100`        |
| spacer      | 子项之间的分隔内容，文本或 VNode                         | `string` / `number` / `VNode`      | —            |

内置尺寸 `small` / `default` / `large` 对应 8px / 12px / 16px。

### 插槽

| 名称    | 说明                                     |
| ------- | ---------------------------------------- |
| default | 排列的元素，每一项包装在 `i-space__item` 中 |

## 使用说明

- `size`：`small` / `default` / `large` 对应 8px / 12px / 16px；也支持数字 px 或 `[列间距, 行间距]` 数组。
- `direction`：`horizontal`（默认）或 `vertical`。
- `alignment`（兼容别名 `align`）：`normal` / `start` / `end` / `center` / `baseline` / `stretch`，默认 `center`。
- `wrap`：默认 `false`，需要换行的布局请显式传 `wrap`。
- `fill`：开启后子项按 `fillRatio` 撑满容器并自动换行。

未指定 `size` 时依次回退 ConfigProvider 的全局尺寸，最终回退 `small`。默认插槽中的每个子项都会包装在 `.i-space__item` 元素中；自定义子项选择器请改用该类名。
