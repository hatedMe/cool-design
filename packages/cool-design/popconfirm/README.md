# Popconfirm 气泡确认

### 介绍

在触发按钮附近确认操作，适合停用、移除等简单确认场景。支持 `reference` 触发器、自定义图标、按钮文案与类型、受控显示。

### 基础用法

```vue
<Popconfirm title="确定删除该用户吗？" @confirm="remove">
  <template #reference>
    <Button type="danger">删除</Button>
  </template>
</Popconfirm>
```

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` / `v-model` | 可选受控可见性，省略时内部管理 | `boolean` | — |
| `visible` / `v-model:visible` | Tooltip 兼容的可见性绑定，同时绑定时由 `model-value` 优先控制 | `boolean` / `null` | `null` |
| `title` | 确认问题 | `string` | `确定执行此操作吗？` |
| `trigger` | 触发方式，可组合多个值 | `'click'` / `'hover'` / `'focus'` / `'contextmenu'` / 对应值的数组 | `'click'` |
| `trigger-keys` | 触发键，使用 `KeyboardEvent.code` | `string[]` | `['Enter', 'Space']` |
| `placement` | 方向：`top` / `top-start` / `top-end` / `bottom` / `bottom-start` / `bottom-end` / `left` / `left-start` / `left-end` / `right` / `right-start` / `right-end` | `Placement` | `bottom` |
| `confirm-button-text` | 确认按钮文字 | `string` | `确定` |
| `cancel-button-text` | 取消按钮文字 | `string` | `取消` |
| `confirm-button-type` | 确认按钮类型 | `default` / `primary` / `success` / `warning` / `danger` / `info` / `text` | `primary` |
| `cancel-button-type` | 取消按钮类型 | `default` / `primary` / `success` / `warning` / `danger` / `info` / `text` | `default` |
| `disabled` | 禁止打开确认框 | `boolean` | `false` |
| `icon` | 自定义图标（图标类名或组件） | `string` / `Component` | — |
| `icon-color` | 图标颜色 | `string` | `#f90` |
| `hide-icon` | 隐藏标题前图标 | `boolean` | `false` |
| `effect` | 主题：`light` / `dark` | `string` | `light` |
| `width` | 面板宽度，支持数字或 CSS 尺寸 | `number` / `string` | — |
| `teleported` | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| `append-to` | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| `transition` | 浮层过渡名称或 Vue 过渡配置 | `string` / `TransitionProps` | `el-fade-in-linear` |
| `show-arrow` | 是否显示指向触发元素的箭头 | `boolean` | `true` |
| `popper-options` | Popper 定位选项，支持 `strategy`、`placement`、`modifiers` 和 `onFirstUpdate` | `PopperOptions` | — |
| `virtual-triggering` | 使用外部元素或虚拟定位锚点 | `boolean` | `false` |
| `virtual-ref` | 外部触发元素或提供 `getBoundingClientRect()` 的虚拟定位锚点 | `TooltipVirtualRef` | — |
| `persistent` | 从首次渲染起挂载浮层，关闭后保留节点 | `boolean` | `false` |
| `hide-after` | 确认、取消按钮和 `hide()` 请求关闭前的延迟，单位毫秒 | `number` | `200` |

#### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 可见性更新请求 | `value: boolean` |
| `update:visible` | 兼容 Tooltip 的可见性更新请求 | `value: boolean` |
| `confirm` | 确认操作，在请求关闭前触发 | `event?: MouseEvent` |
| `cancel` | 取消、点击外部、Esc 或再次激活触发器，在请求关闭前触发 | `event?: MouseEvent` |

#### 插槽

| 名称 | 说明 | 作用域参数 |
| --- | --- | --- |
| `reference` | 触发元素（推荐） | — |
| `default` | 触发元素（兼容） | — |
| `icon` | 自定义标题前图标 | — |
| `actions` | 自定义底部按钮区，将点击事件传给 `confirm(event)` 或 `cancel(event)` | `PopconfirmActions` |

#### 实例

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `popperRef` | Tooltip 的实际定位引用，包含锚点、面板 DOM 和 Popper 实例 | `TooltipInstance['popperRef']` / `undefined` |
| `show` | 请求打开确认框，受 `disabled` 和 `v-model` 管理 | `() => void` |
| `hide` | 按 `hide-after` 请求关闭确认框 | `() => void` |

### 使用说明

操作按钮将原始点击事件交给 `confirm` 或 `cancel`，每次打开只派发一次操作。点击外部、按 Esc 或再次激活触发器会立即请求关闭。透过 `actions` 手动调用时可省略事件参数。

使用 `v-model:visible` 时，组件发出更新请求，由父组件更新绑定值后应用显隐。仅传 `visible` 时，触发器、外点和 Esc 由控制模式禁用。确认、取消和实例 `hide()` 仍可按延时关闭当前面板，父级值变化后重新控制显隐。

入场后焦点落在面板，Tab 在确认框内循环，关闭后焦点恢复到触发元素。定位与主题宿主沿用 Tooltip，默认按 `bottom`、`top`、`right`、`left` 的顺序尝试可用方向。面板的 `popper-class` 和 `popper-style` 由组件设置，使用 `width` 指定宽度。

依赖旧版立即关闭的页面可设置 `:hide-after="0"`。依赖旧版 `fixed` 定位及 8px 间距的页面可传入 `:popper-options="{ strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"`。需要延续聚焦取消按钮的交互时，可通过 `transition` 的 `onAfterEnter` 在下一次渲染中聚焦自定义取消按钮。
