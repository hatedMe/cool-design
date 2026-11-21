# Tooltip 文字提示

### 介绍

为操作提供简短的补充说明，支持鼠标悬停、键盘聚焦、点击和右键触发。浮层支持自动翻转、箭头、受控显示、虚拟触发和自定义挂载容器。

### 基础用法

```vue
<Tooltip content="查看详细资料">
  <Button>悬停提示</Button>
</Tooltip>
```

### 键盘与定位

`trigger-keys` 匹配 `KeyboardEvent.code`。默认可用 `Enter` / `Space` 切换提示，旧键名 `enter` / `space` / `Spacebar` 也可用，传 `[]` 可关闭键盘触发。布尔 `visible` 单独使用时由调用方决定显隐。`v-model:visible` 会同步本地触发请求。

```vue
<Tooltip
  v-model:visible="visible"
  content="保存当前修改"
  trigger="click"
  :trigger-keys="['Enter', 'KeyS']"
  :popper-options="{ strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [4, 12] } }] }"
>
  <Button>保存</Button>
</Tooltip>
```

`popper-options` 的 `placement` 和 `strategy` 优先于组件属性。`modifiers` 按 `name` 合并，支持内置 modifier 的 `enabled`、`options`、`data` 以及自定义 `phase`、`requires`、`requiresIfExists`、`fn`、`effect`。`effect` 返回的清理函数在选项更新和实例销毁时执行。`onFirstUpdate(state)` 在每个定位实例完成首次更新后执行。[Popper v2 选项与实例](https://popper.js.org/docs/v2/constructors/) [Popper v2 Modifiers](https://popper.js.org/docs/v2/modifiers/)

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 提示内容 | `string` | `''` |
| raw-content | 是否将 content 按 HTML 渲染，使用时需自行防范 XSS | `boolean` | `false` |
| placement | 方向：`top` / `bottom` / `left` / `right` / `auto`，均支持 `-start` / `-end` | `Placement` | `bottom` |
| effect | 主题：`light` / `dark` | `string` | `dark` |
| trigger | 触发方式：`hover` / `focus` / `click` / `contextmenu`，支持数组组合 | `string` / `string[]` | `hover` |
| trigger-keys | 切换提示的键盘 `code` | `string[]` | `['Enter', 'Space']` |
| transition | 过渡名称或 Vue 过渡选项，用户钩子与组件事件组合执行 | `string` / `TransitionProps` | `el-fade-in-linear` |
| persistent | 首次渲染即挂载浮层，关闭时隐藏并保留节点 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| offset | 触发元素与浮层的距离，单位 px | `number` | `12` |
| show-after | 显示延迟，单位 ms | `number` | `0` |
| hide-after | 隐藏延迟，单位 ms | `number` | `200` |
| auto-close | 打开多少毫秒后自动关闭，`0` 表示不自动关闭 | `number` | `0` |
| enterable | 是否允许鼠标进入浮层内容 | `boolean` | `true` |
| show-arrow | 是否显示箭头 | `boolean` | `true` |
| arrow-offset | 箭头至面板边缘的最小内边距，单位 px | `number` | `5` |
| fallback-placements | 主位置放不下时的候选位置 | `Placement[]` | — |
| strategy | 定位策略 | `absolute` / `fixed` | `absolute` |
| gpu-acceleration | 是否使用 CSS transform 定位 | `boolean` | `true` |
| popper-options | Popper v2 定位选项 | `PopperOptions` | — |
| visible | 是否受控显示，可使用 `v-model:visible` | `boolean` | — |
| teleported | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| append-to | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| popper-class | 浮层自定义 class | `string` / `array` / `object` | — |
| popper-style | 浮层自定义 style | `string` / `object` / `array` | — |
| z-index | 浮层层级 | `number` | 自动生成 |
| virtual-triggering | 是否启用虚拟触发 | `boolean` | `false` |
| virtual-ref | 真实触发元素或提供 `getBoundingClientRect()` 的对象，可附带 `contextElement` 以跟随滚动祖先 | `TooltipVirtualRef` | — |

`eager`、`arrow-class`、`content-role`、`close-on-outside` 和 `can-open` 是本库扩展。原先组合使用 `persistent` 与 `eager` 的调用会继续预挂载。`arrow-class` 定制箭头，`content-role` 覆盖默认 `tooltip` 角色，`close-on-outside` 指定外部点击响应，`can-open(reference)` 可拒绝触发器和 `onOpen()` 发起的打开请求。

#### 事件

| 事件名 | 说明 |
| --- | --- |
| update:visible | 受控显示状态变化 |
| before-show | 进入过渡开始前触发，参数为 `Event \| undefined` |
| show | 进入过渡完成后触发，参数为 `Event \| undefined` |
| before-hide | 离开过渡开始前触发，参数为 `Event \| undefined` |
| hide | 离开过渡完成后触发，参数为 `Event \| undefined` |
| open | 可见状态切换为打开，参数为 `true` |
| close | 可见状态切换为关闭，参数为 `false` |
| visible-change | 可见状态变化，参数为 `boolean` |

#### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 触发元素 |
| content | 自定义提示内容，优先级高于 `content` |

#### Exposes

| 方法 | 说明 |
| --- | --- |
| `popperRef` | 定位对象，包含实时 `triggerRef`、`contentRef` 和 Popper 实例 `popperInstanceRef` |
| `contentRef` | 已挂载的内容对象，其 `popperContentRef` 指向实际面板元素 |
| `isFocusInsideContent(event?)` | 检查 `relatedTarget` 或当前焦点是否在面板内 |
| `onOpen(event?)` | 按 `show-after` 请求打开 |
| `onClose(event?)` | 按 `hide-after` 请求关闭 |
| `hide(event?)` | 立即请求关闭 |
| `updatePopper()` | 请求 Popper 更新，定位实例还提供 `forceUpdate()` 与 `setOptions()` |
| `show()` | 本库扩展，非受控时立即打开 |
| `update()` | 本库扩展，等同 `updatePopper()` |

迁移时，可用顶层 `strategy="fixed"` 延续旧默认定位方式。`popper-style` 中旧的 `position: absolute` 或 `position: fixed` 仍可指定策略，显式 `strategy` 优先。`persistent` 的内容插槽从首次渲染即挂载。依赖关闭延迟的实例调用可使用 `onClose()`。
