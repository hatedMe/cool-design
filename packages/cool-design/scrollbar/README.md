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

## 到达滚动边缘

监听 `end-reached` 可在滚动到边缘时加载更多内容。`distance` 默认为 `0`，以像素为单位设置提前触发的距离。内容追加后，组件会重新测量尺寸。设置 `noresize` 时，可以在内容渲染后调用实例的 `update()`。

```vue
<Scrollbar :height="200" :distance="24" :tabindex="0" @end-reached="onEndReached">
  <p v-for="item in items" :key="item.id">{{ item.name }}</p>
</Scrollbar>
```

回调接收单个方向。一次滚动同时改变两个轴的位置时，按横向判断。旧版用 `tabindex` 聚焦外层时，可改用外层包装元素承接焦点。组件自身的 `tabindex` 现在用于实际滚动元素，原生和自绘模式的行为一致。

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
| `distance`   | 到边缘的触发距离，单位 px                  | `number`               | `0`    |
| `tabindex`   | 实际滚动元素的键盘焦点顺序                 | `string` / `number`    | —      |

### 事件

| 事件名   | 说明             | 回调参数                             |
| -------- | ---------------- | ------------------------------------ |
| `scroll` | 滚动时触发       | `{ scrollTop: number, scrollLeft: number }` |
| `end-reached` | 滚动进入对应边缘的触发范围时，在 `scroll` 后发出 | `'top' \| 'bottom' \| 'left' \| 'right'` |

### 插槽

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 滚动内容       |

### 实例方法

| 方法                       | 说明                       |
| -------------------------- | -------------------------- |
| `scrollTo(options: ScrollToOptions)` / `scrollTo(x: number, y: number)` | 滚动到指定位置 |
| `setScrollTop(top: number)`  | 设置垂直滚动位置           |
| `setScrollLeft(left: number)` | 设置水平滚动位置           |
| `handleScroll()`           | 手动触发滚动处理           |
| `update()`                 | 重新计算滚动条尺寸与位置   |

### 实例属性

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| `wrapRef` | 读取实际滚动元素 | `HTMLElement \| null \| undefined` |

### 边缘遮罩与无障碍属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mask | 显示所有可滚动边缘或指定方向渐变遮罩 | `boolean` / `'top'` / `'bottom'` / `'left'` / `'right'` | `false` |
| role | 内容 view 的角色 | `string` | — |
| aria-label | 内容 view 的无障碍名称 | `string` | — |
| aria-orientation | 内容 view 的方向 | `'horizontal'` / `'vertical'` | — |

遮罩不拦截点击和滚动，支持 native 模式。可通过 `--i-scrollbar-top-mask-color`、`--i-scrollbar-bottom-mask-color`、`--i-scrollbar-left-mask-color`、`--i-scrollbar-right-mask-color` 分别指定颜色；变量前缀跟随构建 namespace。
