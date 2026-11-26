# Image 图片

### 介绍

展示图片，支持懒加载、加载占位、失败回退和多图预览。

## 用法

设置 `src`，使用 `preview-src-list` 开启预览，点击图片或调用 `showPreview` 打开预览。

```vue
<Image src="https://dummyimage.com/160x100" :preview-src-list="urls" />
```

懒加载时可指定滚动容器：

```vue
<Image src="..." lazy scroll-container=".scroll-wrap">
  <template #placeholder>加载中…</template>
  <template #error>加载失败</template>
</Image>
```

预览时可使用 `viewer` 自定义整体预览，或使用 `default`、`progress`、`toolbar`、`viewer-placeholder`、`viewer-error` 自定义预览内部。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `src` | 图片地址 | `string` | `''` |
| `fit` | 适应方式：`fill` / `contain` / `cover` / `none` / `scale-down` | `string` | `''` |
| `alt` | 原生 `alt` | `string` | — |
| `referrerpolicy` | 原生 `referrerpolicy` | `string` | — |
| `crossorigin` | 原生 `crossorigin`：`anonymous` / `use-credentials` | `string` | — |
| `loading` | 原生加载模式：`eager` / `lazy` | `string` | `lazy` 为 `true` 时 `lazy`，否则 `eager` |
| `lazy` | 是否懒加载 | `boolean` | `false` |
| `scroll-container` | 懒加载滚动容器（选择器或元素） | `string` / `HTMLElement` | — |
| `fallback` | 加载失败回退地址（兼容） | `string` | — |
| `preview-src-list` | 预览地址列表 | `string[]` | `[]` |
| `initial-index` | 预览起始索引 | `number` | `0` |
| `infinite` | 预览是否循环切换 | `boolean` | `true` |
| `zoom-rate` | 预览缩放步长 | `number` | `1.2` |
| `scale` | 预览初始缩放 | `number` | `1` |
| `min-scale` | 最小缩放 | `number` | `0.2` |
| `max-scale` | 最大缩放 | `number` | `7` |
| `show-progress` | 是否显示预览进度 | `boolean` | `false` |
| `preview-teleported` | 预览是否挂载到 `body` | `boolean` | `false` |
| `hide-on-click-modal` | 点击遮罩是否关闭预览 | `boolean` | `false` |
| `close-on-press-escape` | `ESC` 是否关闭预览 | `boolean` | `true` |
| `z-index` | 预览层级 | `number` | — |

### 事件

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `load` | 图片加载成功 | `Event` |
| `error` | 图片加载失败 | `Event` |
| `show` | 打开预览 | — |
| `switch` | 切换预览图片 | `number`（索引） |
| `close` | 关闭预览 | — |

### 插槽

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `placeholder` | 加载占位 | — |
| `error` | 加载失败内容 | — |
| `viewer` | 自定义整体预览内容 | `{ urlList, close }` |
| `default` | 自定义预览图片（转发到预览） | `{ url, src, index, activeIndex }` |
| `progress` | 自定义预览进度 | `{ activeIndex, index, total }` |
| `toolbar` | 自定义预览工具栏 | `ImageViewerToolbarActions` |
| `viewer-placeholder` | 预览图片加载占位 | `{ activeIndex, src, url, index }` |
| `viewer-error` | 预览图片加载失败 | `{ activeIndex, src, url, index }` |

### Expose

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `showPreview` | 打开预览 | `() => void` |

## ImageViewer

独立预览组件，`Image` 内部复用该组件实现预览，多实例共享滚动锁计数。

预览打开后支持滚轮缩放（向上放大、向下缩小，跟随 `zoom-rate` 步进）与按住图片拖拽平移，`reset` 会同时复位缩放、旋转与位移。

属性：`url-list`、`initial-index`、`infinite`、`zoom-rate`、`scale`、`min-scale`、`max-scale`、`show-progress`、`teleported`、`hide-on-click-modal`、`close-on-press-escape`、`z-index`。

事件：`switch`（索引）、`close`。

### ImageViewer 插槽

| 名称 | 说明 | 作用域 |
| --- | --- | --- |
| `default` | 自定义图片内容 | `{ url, src, index, activeIndex }` |
| `progress` | 启用 `show-progress` 时自定义进度 | `{ activeIndex, index, total }` |
| `toolbar` | 自定义工具栏 | `ImageViewerToolbarActions` |
| `placeholder` / `viewer-placeholder` | 加载占位 | `{ activeIndex, src, url, index }` |
| `error` / `viewer-error` | 加载失败内容 | `{ activeIndex, src, url, index }` |

`ImageViewerToolbarActions` 可从 `cool-design` 或 `cool-design/image` 导入。它包含数值状态 `index`、`activeIndex`、`total`、`scale` 和 `rotation`。`zoomIn()`、`zoomOut()`、`reset()`、`rotate(clockwise?: boolean)`、`prev()`、`next()`、`close()` 和 `setActiveItem(index: number)` 可直接调用，也可从 `actions` 获取。

### ImageViewer 实例

实例提供 `prev()`、`next()`、`setActiveItem(index: number)`、`zoomIn()`、`zoomOut()`、`reset()`、`rotate(clockwise?: boolean)` 和 `close()`。`index` 和 `activeIndex` 是只读索引，从 `0` 开始。
