# Tag 标签

### 介绍

用简洁的标签展示状态、分类和筛选条件，支持不同样式及关闭操作。

## API

### 属性

| 参数     | 说明                                              | 类型    | 默认值       |
| -------- | ------------------------------------------------- | ------- | ------------ |
| type     | 类型：primary / success / warning / danger / info | string  | primary      |
| effect   | 样式：light / plain / dark                        | string  | light        |
| size     | 尺寸：small / default / large                     | string  | 继承全局尺寸 |
| color    | 自定义状态颜色                                    | string  | —            |
| closable | 显示关闭按钮                                      | boolean | false        |
| disabled | 禁止点击与关闭                                    | boolean | false        |
| round    | 使用圆角胶囊样式                                  | boolean | false        |
| hit      | 使用透明背景强调边框                              | boolean | false        |

### 事件

| 事件名 | 说明                                   | 回调参数          |
| ------ | -------------------------------------- | ----------------- |
| click  | 点击可用标签                           | event: MouseEvent |
| close  | 点击关闭按钮，不冒泡 click，不自动移除 | event: MouseEvent |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 标签内容 |

## 使用说明

- `type`: primary（默认）/success/warning/danger/info。
- `effect`: light（默认）/plain/dark。
- `size`: small/default/large，未设置时继承 ConfigProvider。
- `color`: 可选自定义状态颜色，覆盖默认主题状态色。
- `closable`: 默认 false。
- `disabled`: 默认 false，禁用点击与关闭。
- 默认插槽：支持文本与复杂内容。
- `click(event)`、`close(event)`：关闭按钮不冒泡 click，仅发出 close，不自行删除标签。
