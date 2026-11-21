# Affix 固钉

### 介绍

将元素固定在页面（或指定滚动容器）的顶部或底部，常用于操作栏、返回顶部入口等场景。

## 基础用法

滚动页面时，距离顶部不足 `offset` 的元素会被固定在视口顶部。

```vue
<Affix :offset="20">
  <Button type="primary">固定在顶部</Button>
</Affix>
```

设置 `position="bottom"` 可固定在视口底部；`target` 传 CSS 选择器可将元素固定在指定容器内，`target-container` 指定监听滚动的容器。

## API

### 属性

| 参数              | 说明                                              | 类型                          | 默认值  |
| ----------------- | ------------------------------------------------- | ----------------------------- | ------- |
| `offset`          | 偏移距离，适用于 `top` / `bottom` 两种 `position` | `number`                      | —       |
| `offset-top`      | 兼容别名：`position` 为 `top` 时的偏移，`offset` 优先 | `number`                  | `0`     |
| `offset-bottom`   | 兼容别名：`position` 为 `bottom` 时的偏移，`offset` 优先 | `number`               | —       |
| `position`        | 固定方向：`top` / `bottom`                        | `string`                      | `top`   |
| `target`          | 固定判定边界容器的 CSS 选择器，默认为视口         | `string`                      | —       |
| `target-container` | 监听滚动的容器，选择器或元素，默认为窗口         | `string` / `HTMLElement`      | —       |
| `z-index`         | 固定时的层级                                      | `number`                      | `100`   |

### 事件

| 事件名   | 说明                       | 回调参数                          |
| -------- | -------------------------- | --------------------------------- |
| `change` | 固定状态变化时触发         | `fixed: boolean`                  |
| `scroll` | 滚动时触发                 | `{ scrollTop: number, fixed: boolean }` |

### 插槽

| 名称      | 说明         |
| --------- | ------------ |
| `default` | 被固定的内容 |

### 实例方法

| 方法       | 说明                         |
| ---------- | ---------------------------- |
| `update()` | 手动重新计算固定状态与位置   |
