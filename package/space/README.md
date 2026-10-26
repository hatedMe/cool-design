# Space 间距

### 介绍

为操作按钮、筛选控件或纵向内容设置统一间距，支持自动换行。

## API

### 属性

| 参数      | 说明                                            | 类型                               | 默认值       |
| --------- | ----------------------------------------------- | ---------------------------------- | ------------ |
| size      | 间距档位、px 数值或 [行间距, 列间距]            | string / number / [number, number] | 继承全局尺寸 |
| direction | 排列方向：horizontal / vertical                 | string                             | horizontal   |
| align     | 对齐：start / end / center / baseline / stretch | string                             | center       |
| wrap      | 是否允许换行                                    | boolean                            | true         |

### 插槽

| 名称    | 说明                         |
| ------- | ---------------------------- |
| default | 排列的元素，不额外包装每一项 |

## 使用说明

-   `size`: small/default/large 对应 4/8/12px；也支持数字 px 或 `[行间距, 列间距]`。
-   `direction`: horizontal（默认）或 vertical。
-   `align`: start/end/center/baseline/stretch，默认 center。
-   `wrap`: 默认 true。

未指定 size 时继承 ConfigProvider。默认插槽中的元素以 Flex 排列，不额外包装每一项。
