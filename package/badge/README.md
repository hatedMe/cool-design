# Badge 徽标

Badge 用于在内容旁显示数量、状态或提醒圆点。

- `value`：字符串或数字，默认空字符串；空字符串隐藏徽标。
- `max`：数值上限，默认 99；超过显示 `99+`。
- `type`：`primary | success | warning | danger | info`，默认 `warning`。
- `isDot`：显示圆点，默认 false；圆点不显示数值。
- `hidden`：隐藏徽标，默认 false。
- `showZero`：是否显示数值 0，默认 false。
- `offset`：徽标位置偏移 `[x, y]`，单位为 px。
- `color`：自定义徽标背景色。
- 默认插槽为被标记内容。

## API

### 属性

| 参数     | 说明                                        | 类型             | 默认值  |
| -------- | ------------------------------------------- | ---------------- | ------- |
| value    | 徽标内容                                    | string / number  | 空      |
| max      | 数值最大值                                  | number           | 99      |
| type     | primary / success / warning / danger / info | string           | warning |
| isDot    | 显示圆点                                    | boolean          | false   |
| hidden   | 隐藏徽标                                    | boolean          | false   |
| showZero | 显示数值 0                                  | boolean          | false   |
| offset   | 位置偏移 `[x, y]`                           | [number, number] | —       |
| color    | 自定义背景色                                | string           | —       |

### 插槽

| 名称    | 说明       |
| ------- | ---------- |
| default | 被标记内容 |
