# Tooltip 文字提示

### 介绍

为操作提供简短的补充说明，支持鼠标悬停、键盘聚焦、点击和右键触发。浮层支持自动翻转、箭头、受控显示、虚拟触发和自定义挂载容器。

### 基础用法

```vue
<Tooltip content="查看详细资料">
  <Button>悬停提示</Button>
</Tooltip>
```

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 提示内容 | `string` | `''` |
| raw-content | 是否将 content 按 HTML 渲染，使用时需自行防范 XSS | `boolean` | `false` |
| placement | 方向：`top` / `top-start` / `top-end` / `bottom` / `bottom-start` / `bottom-end` / `left` / `left-start` / `left-end` / `right` / `right-start` / `right-end` | `Placement` | `bottom` |
| effect | 主题：`light` / `dark` | `string` | `dark` |
| trigger | 触发方式：`hover` / `focus` / `click` / `contextmenu` | `string` | `hover` |
| disabled | 是否禁用 | `boolean` | `false` |
| offset | 触发元素与浮层的距离，单位 px | `number` | `12` |
| show-after | 显示延迟，单位 ms | `number` | `0` |
| hide-after | 隐藏延迟，单位 ms | `number` | `200` |
| enterable | 是否允许鼠标进入浮层内容 | `boolean` | `true` |
| show-arrow | 是否显示箭头 | `boolean` | `true` |
| visible | 是否受控显示，可使用 `v-model:visible` | `boolean` | — |
| teleported | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| append-to | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| popper-class | 浮层自定义 class | `string` / `array` / `object` | — |
| popper-style | 浮层自定义 style | `string` / `object` / `array` | — |
| z-index | 浮层层级 | `number` | 自动生成 |
| virtual-triggering | 是否启用虚拟触发 | `boolean` | `false` |
| virtual-ref | 虚拟触发元素或只提供 `getBoundingClientRect()` 的虚拟引用对象 | `HTMLElement` / `{ getBoundingClientRect(): DOMRect }` | — |

#### 事件

| 事件名 | 说明 |
| --- | --- |
| update:visible | 受控显示状态变化 |
| before-show | Tooltip 显示前触发 |
| show | Tooltip 显示后触发 |
| before-hide | Tooltip 隐藏前触发 |
| hide | Tooltip 隐藏后触发 |
| open | Tooltip 打开 |
| close | Tooltip 关闭 |
| visible-change | 可见状态变化，参数为 `boolean` |

#### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 触发元素 |
| content | 自定义提示内容，优先级高于 `content` |

#### Exposes

| 方法 | 说明 |
| --- | --- |
| `show()` | 显示 Tooltip；受控模式下应修改 `visible` |
| `hide()` | 隐藏 Tooltip |
| `update()` | 重新计算浮层位置 |

悬停或聚焦时，触发元素和提示通过 `aria-describedby` 关联；按 Esc 或点击外部区域关闭。浮层会自动翻转并约束在视口，随滚动、缩放及元素尺寸变化更新位置。
