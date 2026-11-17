# Scrollbar 滚动条

### 介绍

替代原生滚动条的统一样式滚动容器，支持自定义高度、滚动事件与编程式滚动。

## 基础用法

通过 `height` 或 `max-height` 限定滚动区域，内容溢出时显示自绘滚动条。

```vue
<Scrollbar height="200px">
  <p v-for="n in 20" :key="n">{{ n }}</p>
</Scrollbar>
```

## API

### 属性

| 参数         | 说明                                       | 类型                   | 默认值 |
| ------------ | ------------------------------------------ | ---------------------- | ------ |
| `height`     | 滚动区域高度                               | `string` / `number`    | —      |
| `maxHeight`  | 滚动区域最大高度                           | `string` / `number`    | —      |
| `native`     | 使用原生滚动条（不渲染自绘条）             | `boolean`              | `false` |
| `wrapStyle`  | 滚动容器样式                               | `string` / `object`    | —      |
| `wrapClass`  | 滚动容器类名                               | `string` / `object` / `array` | — |
| `viewStyle`  | 内容视图样式                               | `string` / `object`    | —      |
| `viewClass`  | 内容视图类名                               | `string` / `object` / `array` | — |
| `noresize`   | 不监听内容尺寸变化（不使用 ResizeObserver） | `boolean`             | `false` |
| `tag`        | 内容视图渲染标签                           | `string`               | `div`  |
| `always`     | 滚动条常显（默认悬停显示）                 | `boolean`              | `false` |
| `minSize`    | 滚动条最小长度，单位 px                    | `number`               | `20`   |

### 事件

| 事件名   | 说明             | 回调参数                             |
| -------- | ---------------- | ------------------------------------ |
| `scroll` | 滚动时触发       | `{ scrollTop, scrollLeft }`          |

### 插槽

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 滚动内容       |

### 实例方法

| 方法                       | 说明                       |
| -------------------------- | -------------------------- |
| `scrollTo(options \| x, y)` | 滚动到指定位置             |
| `setScrollTop(top)`        | 设置垂直滚动位置           |
| `setScrollLeft(left)`      | 设置水平滚动位置           |
| `handleScroll()`           | 手动触发滚动处理           |
| `update()`                 | 重新计算滚动条尺寸与位置   |
