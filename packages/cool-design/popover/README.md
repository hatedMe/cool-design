# Popover 弹出框

### 介绍

展示与目标元素相关的补充内容，支持富文本与交互。API 对标 Element Plus：`reference` 插槽为触发元素，默认插槽为浮层内容；同时兼容旧用法（默认插槽为触发器，`content` 插槽或属性为内容）。

### 基础用法

```vue
<Popover title="标题" content="补充说明" placement="top" :width="200">
  <template #reference>
    <Button>查看说明</Button>
  </template>
</Popover>
```

使用默认插槽自定义浮层内容，或 `v-model:visible` 受控显示。

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `content` | 浮层文本内容 | `string` | `''` |
| `title` | 浮层标题 | `string` | `''` |
| `placement` | 方向：`top` / `top-start` / `top-end` / `bottom` / `bottom-start` / `bottom-end` / `left` / `left-start` / `left-end` / `right` / `right-start` / `right-end` | `Placement` | `bottom` |
| `trigger` | 触发方式：`hover` / `focus` / `click` / `contextmenu`，支持数组组合 | `string` / `string[]` | `hover` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `width` | 浮层宽度，支持数字或 CSS 尺寸 | `number` / `string` | — |
| `effect` | 主题：`light` / `dark` | `string` | `light` |
| `offset` | 触发元素与浮层的距离，单位 px | `number` | `12` |
| `show-after` | 显示延迟，单位 ms | `number` | `0` |
| `hide-after` | 隐藏延迟，单位 ms | `number` | `200` |
| `auto-close` | 打开多少毫秒后自动关闭，`0` 表示不自动关闭 | `number` | `0` |
| `enterable` | 是否允许鼠标进入浮层内容 | `boolean` | `true` |
| `show-arrow` | 是否显示箭头 | `boolean` | `true` |
| `fallback-placements` | 主位置放不下时的候选位置 | `Placement[]` | — |
| `visible` | 是否受控显示，可使用 `v-model:visible` | `boolean` | — |
| `persistent` | 关闭后是否保留浮层节点 | `boolean` | `false` |
| `teleported` | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| `append-to` | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| `popper-class` | 浮层自定义 class | `string` / `array` / `object` | — |
| `popper-style` | 浮层自定义 style | `string` / `object` / `array` | — |
| `z-index` | 浮层层级 | `number` | 自动生成 |
| `virtual-triggering` | 是否启用虚拟触发 | `boolean` | `false` |
| `virtual-ref` | 虚拟触发元素或只提供 `getBoundingClientRect()` 的虚拟引用对象 | `HTMLElement` / `{ getBoundingClientRect(): DOMRect }` | — |

#### 事件

| 事件名 | 说明 |
| --- | --- |
| `update:visible` | 受控显示状态变化 |
| `before-show` | 显示前触发 |
| `show` | 显示时触发 |
| `before-hide` | 隐藏前触发 |
| `hide` | 隐藏时触发 |
| `visible-change` | 显示状态变化 |
| `before-enter` / `after-enter` / `before-leave` / `after-leave` | 兼容旧事件名（与 `before-show` / `show` / `before-hide` / `hide` 同时触发） |

#### 插槽

| 名称 | 说明 |
| --- | --- |
| `reference` | 触发元素 |
| `default` | 有 `reference` 时为浮层内容，否则为触发元素（兼容） |
| `content` | 浮层内容（兼容），优先级低于默认插槽 |

#### Exposes

| 方法 | 说明 |
| --- | --- |
| `show()` | 显示浮层；受控模式下应修改 `visible` |
| `hide()` | 隐藏浮层 |
| `update()` | 重新计算浮层位置 |
| `updatePopper()` | `update()` 的兼容别名 |

### v-popover 指令

不包裹组件时，可用 `v-popover` 为任意元素挂载浮层，值为内容字符串或配置对象，随值更新自动重建：

```vue
<button v-popover="'悬停显示的说明'">查看</button>
<button v-popover="{ content: '说明', title: '标题', placement: 'top' }">详情</button>
```

### 使用说明

按 Esc 或点击外部区域关闭（虚拟触发的受控浮层除外）。浮层会自动翻转并约束在视口，随滚动、缩放及元素尺寸变化更新位置。
