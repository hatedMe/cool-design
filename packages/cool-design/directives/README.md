# 指令

提供常用的 Vue 3 指令，用于加载遮罩、点击外部和无限滚动。

## 用法

```vue
<div v-loading="loading" />
<div v-click-outside="close">内容</div>
<div v-infinite-scroll="loadMore" infinite-scroll-distance="20">列表</div>
```

全量安装 `cool-design` 时会自动注册；按需使用时可导入 `installDirectives`，或单独导入 `LoadingDirective`、`ClickOutside`、`InfiniteScroll`。

## API

| 指令 | 值 | 说明 |
| --- | --- | --- |
| `v-loading` | `boolean` / `{ text?: string; background?: string; fullscreen?: boolean; lock?: boolean }` | 显示或隐藏遮罩 |
| `v-click-outside` | `(event: Event) => void` | 点击元素外部时触发 |
| `v-infinite-scroll` | `() => void` | 滚动到距离底部指定距离时触发 |

`v-infinite-scroll` 支持 `infinite-scroll-distance` 和 `infinite-scroll-disabled` 属性。
