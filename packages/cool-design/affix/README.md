# Affix 固钉

### 介绍

滚动时将操作栏等内容固定在视口顶部或底部，并在原位置保留占位。

## 基础用法

默认固定在顶部，`offset` 设置内容与视口边缘的距离。文档中的交互演示在按钮文字变化后调用 `updateRoot()`，让占位宽度按新内容更新。

```vue
<Affix :offset="20">
  <Button type="primary">固定在顶部</Button>
</Affix>
```

设置 `position="bottom"` 可固定在视口底部。通过 `target` 指定边界后，固定内容会随边界移出视口。组件默认监听最近可纵向滚动的祖先和窗口。使用 `target-container` 可以覆盖滚动祖先，`scroll` 事件的 `scrollTop` 取自所选宿主。

启用 `teleported` 后，固定期间会将内容移到 `append-to` 指定的元素中，退出固定后会移回原位。默认挂载目标为 `body`。

原来通过 `target` 设置容器边缘固定阈值的页面，可以将对应的视口偏移传给 `offset`。未传 `offset` 时，组件仍读取当前方向的旧偏移属性，最终回退到 `0`。显式传入 `0` 时会覆盖旧属性。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `offset` | 固定内容与视口边缘的距离 | `number` | `0` |
| `position` | 固定方向 | `'top' \| 'bottom'` | `'top'` |
| `target` | 限制固定内容的边界元素的 CSS 选择器，空字符串或未匹配时使用视口 | `string` | `''` |
| `z-index` | 固定内容的层级 | `number \| string` | `100` |
| `teleported` | 是否在固定时移动内容 | `boolean` | `false` |
| `append-to` | `teleported` 启用时使用的 CSS 选择器或元素 | `string \| HTMLElement` | `'body'` |
| `offset-top` | 兼容属性，`position="top"` 且未传 `offset` 时生效 | `number` | `0` |
| `offset-bottom` | 兼容属性，`position="bottom"` 且未传 `offset` 时生效 | `number` | — |
| `target-container` | 兼容属性，覆盖监听的滚动宿主，可传入选择器或元素 | `string \| HTMLElement` | 最近的纵向滚动祖先或窗口 |

### 事件

| 事件名 | 说明 | 回调类型 |
| --- | --- | --- |
| `change` | 固定状态变化时触发 | `(fixed: boolean) => void` |
| `scroll` | 监听到滚动时触发 | `(value: { scrollTop: number; fixed: boolean }) => void` |

### 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 被固定的内容 |

### 实例方法

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| `update` | 重新计算固定状态和位置 | `() => void` |
| `updateRoot` | 异步按自然布局重新测量根元素，更新固定状态与占位 | `() => Promise<void>` |
