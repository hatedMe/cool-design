# Timeline 时间线

### 介绍

按时间顺序展示事件记录，时间线节点支持主题色、自定义颜色、图标和空心样式。

## 用法

使用 `TimelineItem` 子组件声明时间线内容，通过 `timestamp` 展示时间。

```vue
<Timeline>
  <TimelineItem timestamp="2026-01-01" type="success">发布 1.0 版本</TimelineItem>
  <TimelineItem timestamp="2026-02-01" type="primary" placement="top">发布 1.1 版本</TimelineItem>
</Timeline>
```

通过 `reverse` 倒序展示，通过 `mode` 控制时间线位置：`start` / `end` / `alternate` / `alternate-reverse`。

兼容旧版 `items` 数据驱动用法：`<Timeline :items="items" />`，插槽接收 `item` 和 `index` 自定义内容。

## API

### Timeline 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `reverse` | 是否倒序展示 | `boolean` | `false` |
| `mode` | 时间线位置：`start` / `end` / `alternate` / `alternate-reverse` | `string` | `start` |
| `items` | 数据驱动项（兼容旧 API） | `TimelineItemData[]` | `[]` |

### Timeline 插槽

| 名称 | 说明 |
| ---- | ---- |
| `default` | 时间线内容，通常为 `TimelineItem`；`items` 模式下接收 `{ item, index }` 自定义单项内容 |

### TimelineItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `timestamp` | 时间戳文本 | `string` | `''` |
| `hide-timestamp` | 是否隐藏时间戳 | `boolean` | `false` |
| `center` | 内容是否垂直居中 | `boolean` | `false` |
| `placement` | 时间戳位置：`top` / `bottom` | `string` | `bottom` |
| `type` | 节点主题：`primary` / `success` / `warning` / `danger` / `info` | `string` | `''` |
| `color` | 自定义节点颜色 | `string` | `''` |
| `size` | 节点尺寸：`normal` / `large` | `string` | `normal` |
| `icon` | 自定义图标（类名或组件） | `string` / `Component` | — |
| `hollow` | 是否空心节点 | `boolean` | `false` |

### TimelineItem 插槽

| 名称 | 说明 |
| ---- | ---- |
| `default` | 时间线项内容 |
| `dot` | 自定义节点，替换默认圆点 |

### 事件

无自定义事件。
