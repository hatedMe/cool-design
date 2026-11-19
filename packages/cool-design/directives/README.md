# 指令

提供常用的 Vue 3 指令，用于加载遮罩、点击外部和无限滚动。

## 用法

```vue
<div v-loading="loading" />
<div v-click-outside="close">内容</div>
<div
  v-infinite-scroll="loadMore"
  infinite-scroll-distance="20"
  infinite-scroll-delay="200"
  :infinite-scroll-disabled="loading"
  :infinite-scroll-immediate="true"
>
  列表
</div>
```

全量安装 `cool-design` 时会自动注册；按需使用时可导入 `installDirectives`，或单独导入 `LoadingDirective`、`ClickOutside`、`InfiniteScroll`。

## API

| 指令 | 值 | 说明 |
| --- | --- | --- |
| `v-loading` | `boolean` / `{ text?: string; background?: string; fullscreen?: boolean; lock?: boolean; body?: boolean; spinner?: string; svg?: string; svgViewBox?: string; svgSize?: number }` | 显示或隐藏遮罩 |
| `v-click-outside` | `(event: Event) => void` | 点击元素外部时触发 |
| `v-infinite-scroll` | `() => void` | 滚动到距离底部指定距离时触发 |

`v-loading` 支持的 modifiers 与元素属性：

| 名称 | 来源 | 说明 |
| --- | --- | --- |
| `fullscreen` | modifier / 选项 | 全屏遮罩，挂载到 `body` |
| `lock` | modifier / 选项 | 锁定页面滚动，关闭时恢复 |
| `body` | modifier / 选项 | 遮罩挂载到 `body`（避免 `overflow` 裁剪） |
| `element-loading-text` | 元素属性 | 提示文字 |
| `element-loading-background` | 元素属性 | 背景色 |
| `element-loading-spinner` | 元素属性 | 图标类名 |
| `element-loading-svg` | 元素属性 | 自定义 SVG 片段 |
| `element-loading-svg-view-box` | 元素属性 | SVG 的 `viewBox` |
| `element-loading-svg-size` | 元素属性 | SVG 尺寸，单位 px |

选项对象的优先级高于元素属性。

`v-infinite-scroll` 支持以下属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `infinite-scroll-disabled` | 是否禁用加载 | `boolean` | `false` |
| `infinite-scroll-delay` | 节流间隔（毫秒） | `number` | `200` |
| `infinite-scroll-distance` | 底部触发距离（像素） | `number` | `0` |
| `infinite-scroll-immediate` | 内容未填满时是否立即触发 | `boolean` | `true` |

指令自动解析元素或窗口滚动容器，初始内容不足时触发一次，卸载时清理监听与观察器。
