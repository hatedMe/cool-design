# Divider 分割线

### 介绍

分隔内容区域或行内操作，支持横向标题和竖向分割线。

## API

### 属性

| 参数            | 说明                            | 类型    | 默认值 |
| --------------- | ------------------------------- | ------- | ------ |
| vertical        | 是否为行内竖线                  | boolean | false  |
| contentPosition | 文字位置：left / center / right | string  | center |

### 插槽

| 名称    | 说明                           |
| ------- | ------------------------------ |
| default | 横向分割线文字，竖线忽略此插槽 |

## 使用说明

-   `vertical`: 默认 false；true 显示行内竖线。
-   `contentPosition`: left/center/right，默认 center。
-   默认插槽：横向分割线的文字；竖线不渲染文字。

使用 separator 角色和对应 aria-orientation；颜色继承主题边框变量。
