# Tour 漫游式引导

### 介绍

分步骤聚焦页面元素的引导组件。支持 Element Plus 风格的 TourStep 声明、受控步骤、目标聚光、浮层样式和按钮定制。

## 基础用法

默认插槽内声明 TourStep。`v-model` 控制开启，`v-model:current` 控制当前步；没有目标的步骤居中显示。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Tour, TourStep } from 'cool-design';
const open = ref(false);
const current = ref(0);
</script>

<template>
  <Button id="tour-start" @click="open = true">开始引导</Button>
  <Tour v-model="open" v-model:current="current" :gap="{ offset: 6, radius: 2 }">
    <TourStep target="#tour-start" title="开始" description="这里可以启动引导。" />
    <TourStep title="完成介绍">没有目标时居中展示。</TourStep>
  </Tour>
</template>
```

配置式 `steps` 是本库扩展，存在声明式 TourStep 时优先使用声明式步骤。`mask` 可关闭遮罩或传 `{ color, style }`；最后一步点击完成触发 `finish` 并关闭。

## API

### Tour 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value | 是否显示引导，支持 `v-model` | `boolean` | `false` |
| current | 当前步骤索引，支持 `v-model:current` | `number` | `0` |
| type | 样式主题 | `default` / `primary` | `default` |
| mask | 遮罩设置 | `boolean` / `{ color?: string; style?: Record<string, string> }` | `true` |
| show-arrow | 是否显示指向目标的箭头，优先于旧 arrow 参数；居中时不显示 | `boolean` | 未设置时采用 `arrow`，根级 `true` |
| placement | 弹层位置及起止变体；支持 `center` | `TourPlacement` | `bottom` |
| show-close | 显示关闭按钮 | `boolean` | `true` |
| close-icon | 关闭图标 | `string` / `Component` | — |
| content-style | 内容面板样式，步骤配置优先 | `CSSProperties` | — |
| z-index | 遮罩基础层级，内容面板在其上 | `number` | `2000` |
| gap | 聚光留白，可分别指定水平/垂直 offset 和圆角 | `number` / `{ offset?: number \| [number, number]; radius?: number }` | 本库为 `10` |
| append-to | 浮层挂载容器 | `string` / `HTMLElement` | 最近 Provider 的浮层宿主，缺省为 `body` |
| close-on-press-escape | Escape 关闭引导 | `boolean` | `true` |
| target-area-clickable | 聚光区域是否允许指针操作 | `boolean` | `true` |
| scroll-into-view-options | 切换步骤时滚动目标；`false` 关闭，`true` 使用浏览器默认 | `boolean` / `ScrollIntoViewOptions` | 使用浏览器默认 |

`gap` 的本库默认值为数字 `10`，与 Element Plus `2.14.8` 的 `{ offset: 6, radius: 2 }` 不同。需要对应留白时请显式传入对象。

### Tour 扩展属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| steps | 配置式步骤列表，字段使用 JavaScript camelCase | `TourStep[]` | `[]` |
| target | 所有步骤的备用目标，步骤 target 优先 | `TourTarget` | — |
| arrow | 旧箭头开关，推荐使用 show-arrow | `boolean` | `true` |
| next-button-text | 下一步文案，步骤按钮配置优先 | `string` | 下一步 / 末步为完成 |
| prev-button-text | 上一步文案，步骤按钮配置优先 | `string` | 上一步 |

### TourStep 配置

声明式属性使用 kebab-case，配置式 `steps` 对象使用下列 camelCase 字段；更完整的声明式 API 见 [TourStep](#/components/tour-step)。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| target | 目标选择器、元素或返回目标的函数 | `TourTarget` |
| title / description | 标题 / 内容 | `string` |
| type | 覆盖 Tour 主题 | `TourType` |
| placement | 覆盖 Tour 位置 | `TourPlacement` |
| mask | 覆盖 Tour 遮罩 | `boolean` / `{ color?: string; style?: Record<string, string> }` |
| showArrow / showClose | 覆盖箭头 / 关闭按钮开关 | `boolean` |
| closeIcon / contentStyle | 关闭图标 / 内容面板样式 | `string \| Component` / `CSSProperties` |
| nextButtonProps / prevButtonProps | 按钮属性，children 设置文案，onClick 为点击后回调 | `IButtonProps & { children?: string; onClick?: () => void }` |
| scrollIntoViewOptions | 覆盖滚动设置 | `boolean` / `ScrollIntoViewOptions` |
| arrow | 旧箭头开关，本库扩展 | `boolean` |
| nextButtonText / prevButtonText | 步骤按钮文案，本库扩展 | `string` |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 引导开关变化 | `visible: boolean` |
| update:current | 请求切换当前步骤 | `index: number` |
| change | 当前步骤变化 | `index: number` |
| close | 关闭引导 | `index: number` |
| finish | 点击最后一步的完成按钮 | — |
| prev / next | 本库扩展，请求切换到上一步 / 下一步 | `targetIndex: number` |

### 插槽

| 名称 | 说明 | 作用域 |
| --- | --- | --- |
| default | 声明 TourStep；配置式 steps 模式下也可自定义当前面板内容 | 声明式无参数；配置式为 `{ current: number }` |
| indicators | 自定义底部步骤指示 | `{ current: number; total: number }` |
| indicator | indicators 的旧别名，本库扩展 | `{ current: number; total: number }` |
| close | 自定义关闭按钮内容，本库扩展 | `{ current: number }` |
| prev-btn / next-btn | 自定义步骤按钮内容，本库扩展 | `{ current: number }` |

### 实例方法

以下方法为本库扩展。

| 方法 | 说明 |
| --- | --- |
| `go(index: number)` | 跳转至有效范围内的步骤 |
| `prev()` | 上一步 |
| `next()` | 下一步；末步触发完成 |
