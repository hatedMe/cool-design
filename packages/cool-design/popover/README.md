# Popover 弹出框

### 介绍

展示与目标元素相关的补充内容，支持富文本与交互。提供完整组件 API：`reference` 插槽为触发元素，默认插槽为浮层内容；同时兼容旧用法（默认插槽为触发器，`content` 插槽或属性为内容）。

面板和触发器使用最近一级 ConfigProvider 的命名空间、主题与尺寸。传送到外部容器时，面板继续使用该配置。 `v-popover` 同样继承指令所在位置的配置和浮层宿主。

### 基础用法

```vue
<Popover title="标题" content="补充说明" placement="top" :width="200">
  <template #reference>
    <Button>查看说明</Button>
  </template>
</Popover>
```

默认插槽可使用 `hide()` 关闭浮层。需要双向控制时使用 `v-model:visible`。

```vue
<Popover trigger="click" :persistent="false">
  <template #default="{ hide }">
    <p>关闭后释放浮层内的组件。</p>
    <button type="button" @click="hide()">关闭</button>
  </template>
  <template #reference>
    <button type="button">查看详情</button>
  </template>
</Popover>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `content` | 浮层文本内容 | `string` | `''` |
| `title` | 浮层标题 | `string` | `''` |
| `placement` | 方向：`top` / `bottom` / `left` / `right` / `auto`，可带 `-start` 或 `-end` | `Placement` | `bottom` |
| `trigger` | 触发方式：`hover` / `focus` / `click` / `contextmenu`，支持数组组合 | `string` / `string[]` | `hover` |
| `trigger-keys` | 可切换浮层的键盘按键，匹配 `KeyboardEvent.code` | `string[]` | `['Enter', 'NumpadEnter', 'Space']` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `width` | 浮层宽度，支持数字或 CSS 尺寸 | `number` / `string` | `150` |
| `effect` | 主题：`light` / `dark` | `string` | `light` |
| `offset` | 触发元素与浮层的距离，单位 px | `number` | 继承 Tooltip 的 `12` |
| `show-after` | 显示延迟，单位 ms | `number` | `0` |
| `hide-after` | 隐藏延迟，单位 ms | `number` | `200` |
| `auto-close` | 打开多少毫秒后自动关闭，`0` 表示不自动关闭 | `number` | `0` |
| `enterable` | 是否允许鼠标进入浮层内容 | `boolean` | `true` |
| `show-arrow` | 是否显示箭头 | `boolean` | `true` |
| `arrow-offset` | 箭头距离浮层边缘的最小距离，单位 px | `number` | `5` |
| `fallback-placements` | 主位置放不下时的候选位置 | `Placement[]` | — |
| `strategy` | 定位策略，支持 `absolute` / `fixed` | `PositioningStrategy` | `absolute` |
| `popper-options` | Popper 的 `placement`、`strategy`、`modifiers` 和 `onFirstUpdate` | `PopperOptions` | `computeStyles` 默认关闭 `gpuAcceleration` |
| `visible` | 是否受控显示，可使用 `v-model:visible` | `boolean` / `null` | `null` |
| `transition` | Vue 过渡名称或配置，可传入过渡钩子 | `string` / `TransitionProps` | 默认命名空间为 `el-fade-in-linear`，自定义时为 `{namespace}-fade-in-linear` |
| `persistent` | 从首次渲染起保留浮层节点，关闭时隐藏 | `boolean` | `true` |
| `teleported` | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| `append-to` | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| `popper-class` | 浮层自定义 class | `string` / `array` / `object` | — |
| `popper-style` | 浮层自定义 style | `string` / `object` / `array` | — |
| `z-index` | 浮层层级 | `number` | 自动生成 |
| `virtual-triggering` | 是否启用虚拟触发 | `boolean` | `false` |
| `virtual-ref` | 虚拟触发元素，或提供 `getBoundingClientRect()` 的定位对象。对象可用 `contextElement` 指定裁剪和滚动上下文 | `PopoverVirtualRef` | — |

### 事件

| 事件名 | 说明 |
| --- | --- |
| `update:visible` | 请求更新显示状态。离场完成时还会发送 `false` |
| `before-show` | 显示前触发 |
| `show` | 进入过渡完成时触发 |
| `before-hide` | 隐藏前触发 |
| `hide` | 离场过渡完成时触发 |
| `visible-change` | 显示状态变化 |
| `before-enter` / `after-enter` / `before-leave` / `after-leave` | 进入和离场过渡的前后事件 |

### 插槽

| 名称 | 说明 |
| --- | --- |
| `reference` | 触发元素 |
| `default` | 有 `reference` 或启用虚拟触发时为浮层内容，可使用 `{ hide: () => void }`。普通模式中省略 `reference` 时沿用旧的触发器用法 |
| `content` | 浮层内容（兼容），优先级低于默认插槽 |

### Exposes

| 方法 | 说明 |
| --- | --- |
| `show()` | 显示浮层；受控模式下应修改 `visible` |
| `hide()` | 跳过 `hide-after`，立即请求关闭 |
| `popperRef` | 当前定位引用，含 `triggerRef`、`contentRef` 和 `popperInstanceRef` |
| `update()` | 重新计算浮层位置 |
| `updatePopper()` | `update()` 的兼容别名 |

### v-popover 指令

不包裹组件时，可用 `v-popover` 为任意元素挂载浮层，值为内容字符串或配置对象，随值更新自动重建：

```vue
<button v-popover="'悬停显示的说明'">查看</button>
<button v-popover="{ content: '说明', title: '标题', placement: 'top' }">详情</button>
```

### 使用说明

只绑定布尔 `visible` 时由父组件控制显隐。使用 `v-model:visible` 或非受控模式时可以按 Esc 请求关闭。普通触发模式还支持点击外部关闭。虚拟触发配置为 `click`、`contextmenu` 或仅包含这两项的组合时，点击外部现在也会请求关闭。焦点在浮层内时，Esc 关闭会将焦点还给触发元素。浮层随滚动、缩放及元素尺寸变化更新位置。

显式使用 `el-fade-in-linear` 或当前自定义命名空间的内建过渡名时会启用 GPU 定位。也可通过 `popper-options.modifiers` 的 `computeStyles` 设置覆盖。

旧版依赖关闭后销毁节点时，设置 `:persistent="false"`。旧版的固定定位可用 `strategy="fixed"` 恢复。需要内容宽度自适应时，设置 `width="auto"`。实例和插槽的 `hide()` 立即请求关闭，`hide-after` 用于触发交互。一次关闭可能先后两次发送 `update:visible(false)`，分别对应关闭请求与离场结束。可在 `after-leave` 时清理业务状态。
