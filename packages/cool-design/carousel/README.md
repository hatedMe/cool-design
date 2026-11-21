# Carousel 走马灯

### 介绍

在有限空间内循环展示图片或内容，支持自动播放、箭头、指示器、卡片模式与垂直方向。使用 `CarouselItem` 子组件组织幻灯片。

### 基础用法

```vue
<Carousel height="200px">
  <CarouselItem v-for="n in 4" :key="n" :label="`幻灯片 ${n}`">
    第 {{ n }} 张
  </CarouselItem>
</Carousel>
```

指示器触发方式：`hover` / `click`。箭头显示策略：`always` / `hover` / `never`。指示器位置：默认内侧 / `outside` / `none`。类型：默认 / `card`。方向：`horizontal` / `vertical`。

### API

#### Carousel 属性

| 参数                 | 说明                                       | 类型      | 默认值       |
| -------------------- | ------------------------------------------ | --------- | ------------ |
| `height`             | 轮播高度，CSS 尺寸                         | `string`  | `''`         |
| `initial-index`      | 初始激活索引（仅初始生效）                 | `number`  | `0`          |
| `trigger`            | 指示器触发方式：`hover` / `click`          | `string`  | `hover`      |
| `autoplay`           | 是否自动播放                               | `boolean` | `true`       |
| `interval`           | 自动播放间隔，单位 ms                      | `number`  | `3000`       |
| `indicator-position` | 指示器位置：默认内侧 / `outside` / `none`  | `string`  | `''`         |
| `arrow`              | 箭头显示策略：`always` / `hover` / `never` | `string`  | `hover`      |
| `type`               | 类型：默认 / `card`（卡片模式居中显示）    | `string`  | `''`         |
| `card-scale`         | 卡片模式非激活项缩放比例                   | `number`  | `0.83`       |
| `loop`               | 是否循环                                   | `boolean` | `true`       |
| `direction`          | 方向：`horizontal` / `vertical`            | `string`  | `horizontal` |
| `pause-on-hover`     | 悬停时是否暂停自动播放                     | `boolean` | `true`       |
| `motion-blur`        | 是否启用动感过渡                           | `boolean` | `false`      |

#### Carousel 事件

| 事件名   | 说明       | 回调参数                        |
| -------- | ---------- | ------------------------------- |
| `change` | 激活项变化 | `current: number, prev: number` |

#### Carousel 插槽

| 名称      | 说明                  |
| --------- | --------------------- |
| `default` | `CarouselItem` 子组件 |

#### Carousel Exposes

| 方法                           | 说明                 |
| ------------------------------ | -------------------- |
| `activeIndex`                  | 当前激活索引（只读） |
| `setActiveItem(index \| name)` | 按索引或名称切换     |
| `prev()`                       | 上一张               |
| `next()`                       | 下一张               |

#### CarouselItem 属性

| 参数    | 说明                             | 类型                | 默认值    |
| ------- | -------------------------------- | ------------------- | --------- |
| `name`  | 幻灯片名称，用于 `setActiveItem` | `string` / `number` | 索引      |
| `label` | 幻灯片无障碍标签                 | `string` / `number` | `第 n 张` |

#### CarouselItem 插槽

| 名称      | 说明       |
| --------- | ---------- |
| `default` | 幻灯片内容 |

### 使用说明

默认自动播放并在悬停时暂停；关闭 `loop` 后到达边界时对应箭头隐藏。容器可聚焦，水平方向用左右方向键、垂直方向用上下方向键切换。非激活幻灯片标记 `aria-hidden`。
