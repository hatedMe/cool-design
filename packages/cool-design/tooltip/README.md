# Tooltip 文字提示

### 介绍

为操作提供简短的补充说明，支持鼠标悬停与键盘聚焦。

## API

### 属性

| 参数      | 说明                              | 类型    | 默认值   |
| --------- | --------------------------------- | ------- | -------- |
| content   | 纯文本提示                        | string  | 空字符串 |
| placement | 方向：top / bottom / left / right | string  | top      |
| disabled  | 禁用提示                          | boolean | false    |
| trigger   | 触发方式：hover / focus / click   | string  | hover    |
| showAfter | 显示延迟，单位 ms                 | number  | 0        |
| hideAfter | 隐藏延迟，单位 ms                 | number  | 80       |
| effect    | 主题：light / dark                | string  | dark     |

### 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 一个可聚焦触发元素 |
| content | 替换文字提示       |

## 使用说明

- `content`: 纯文本说明；`content` 插槽可覆盖。
- `placement`: top（默认）/bottom/left/right。
- `disabled`: 默认 false。
- `trigger`: 默认 hover，也支持 focus 和 click。
- `showAfter`、`hideAfter`: 控制显示和隐藏延迟，单位为毫秒。
- `effect`: light 或 dark。
- 默认插槽：放一个可聚焦的触发元素，例如 Button；交互内容应使用其他浮层组件。

悬停或聚焦显示，Esc 关闭；触发元素与提示通过 aria-describedby 关联。指针可以移入提示阅读；离开后短暂延迟隐藏。浮层自动翻转并约束在视口，随滚动、缩放及元素尺寸变化更新位置；继承 ConfigProvider 浮层宿主主题。卸载清理定时器、观察器与事件。

本期支持四个居中方向，不支持箭头、虚拟触发器或交互表单内容。
