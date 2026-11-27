# Dialog 对话框

### 介绍

通过桌面模态窗口展示编辑表单或其他内容，提供标题、页脚操作区与焦点管理。支持 `v-model` 控制显示、全屏、无遮罩、自定义挂载与关闭拦截。

### 基础用法

```vue
<Dialog v-model="open" title="编辑用户" width="520px">
  <p>窗口内容</p>
  <template #footer>
    <Button @click="open = false">取消</Button>
    <Button type="primary" @click="save">保存</Button>
  </template>
</Dialog>
```

使用 `fullscreen` 全屏显示，`top` 设置顶部偏移，`:modal="false"` 隐藏遮罩，`before-close` 拦截关闭。隐藏遮罩时可以同时设置 `modal-penetrable`，让面板外的鼠标操作穿透到下方内容。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` / `v-model` | 是否显示 | `boolean` | `false` |
| `title` | 弹窗标题 | `string` | `''` |
| `width` | 弹窗宽度，支持数字或 CSS 尺寸 | `number` / `string` | — |
| `fullscreen` | 是否全屏 | `boolean` | `false` |
| `top` | 顶部偏移（如 `15vh`），设置后顶部对齐 | `string` | `''` |
| `modal` | 是否显示遮罩 | `boolean` | `true` |
| `modal-class` | 遮罩或无遮罩外层的自定义类 | `string \| boolean \| Record<string, unknown> \| DialogModalClass[]` | — |
| `modal-penetrable` | 允许非全屏无遮罩窗口的面板外鼠标事件穿透，点击面板可提升层级 | `boolean` | `false` |
| `append-to` | 挂载容器选择器或元素。非 `body` 的显式目标优先于 `append-to-body` | `string` / `HTMLElement` | ConfigProvider 浮层宿主或就地渲染 |
| `append-to-body` | 挂载到 `document.body`。嵌套 Dialog 可以启用此选项 | `boolean` | `false` |
| `lock-scroll` | 是否锁定 body 滚动 | `boolean` | `true` |
| `custom-class` | 弹窗面板自定义类。也可直接使用 `class` | `string` | `''` |
| `header-class` | 头部自定义 class | `string` | `''` |
| `body-class` | 内容区自定义 class | `string` | `''` |
| `footer-class` | 页脚自定义 class | `string` | `''` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `close-on-click-modal` | 点击遮罩是否请求关闭 | `boolean` | `true` |
| `close-on-press-escape` | 按 Esc 是否请求关闭 | `boolean` | `true` |
| `closable` | 是否允许关闭按钮、遮罩、Esc 请求关闭 | `boolean` | `true` |
| `center` | 头部与页脚是否居中 | `boolean` | `false` |
| `destroy-on-close` | 关闭后是否销毁内容 | `boolean` | `false` |
| `before-close` | 关闭前拦截。调用 `done()` 立即开始关闭，调用 `done(true)` 取消 | `(done: (cancel?: boolean) => void) => void` | — |
| `open-delay` | 打开延时，单位为毫秒 | `number` | `0` |
| `close-delay` | 关闭延时，单位为毫秒 | `number` | `0` |
| `align-center` | 是否垂直水平居中 | `boolean` | Provider 默认值或 `false` |
| `draggable` | 是否可通过拖拽头部移动 | `boolean` | Provider 默认值或 `false` |
| `overflow` | 拖动时是否允许超出视口 | `boolean` | Provider 默认值或 `false` |
| `header-aria-level` | 内置标题的 `aria-level` | `string` | `'2'` |
| `transition` | 过渡名称或 Vue Transition 属性。对象省略 `name` 时使用 `dialog-fade` | `string \| TransitionProps` | Provider 默认值或 `'dialog-fade'` |
| `close-icon` | 自定义关闭图标 | `string` / `Component` | `×` |
| `z-index` | 自定义层级 | `number` | — |
| `trap-focus` | 兼容属性。窗口打开时自动管理焦点 | `boolean` | `false` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 离场完成后同步模型 | `value: boolean` |
| `open` | 打开开始 | — |
| `opened` | 入场过渡完成 | — |
| `close` | 实际离场开始，父级通过 `v-model` 关闭时也触发 | — |
| `closed` | 离场过渡完成 | — |
| `open-auto-focus` | 自动聚焦到窗口内时 | — |
| `close-auto-focus` | 恢复触发元素焦点时 | — |

### 插槽

| 名称 | 说明 | 作用域参数 |
| --- | --- | --- |
| `default` | 窗口内容 | — |
| `header` | 自定义头部内容，保留关闭按钮。将 `titleId` 用于自定义标题的 `id` | `{ close: () => void, titleId: string, titleClass: string }` |
| `title` | 兼容的自定义标题插槽，同时提供时优先于 `header` | — |
| `footer` | 底部操作区 | — |

### Exposes

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `visible` | 当前可见状态，在打开及关闭延时结束时更新 | `boolean` |
| `dialogContentRef` | 内容组件实例，可访问 `$el`、`resetPosition()` 和 `updatePosition()` | `DialogContentInstance \| undefined` |
| `handleClose()` | 按 `before-close` 和 `close-delay` 处理关闭 | `() => void` |
| `resetPosition()` | 恢复拖拽前的位置和顶部偏移 | `() => void` |

### 使用说明

通过 `:closable="false"` 屏蔽关闭按钮、遮罩和 Esc 的关闭操作。父级可直接更新模型，也可调用实例 `handleClose()`。`before-close` 同意关闭后直接开始离场。需要记录关闭请求时，可在 `before-close` 中记录。依赖关闭完成时同步模型的代码可继续使用 `v-model`。

默认离场后隐藏并保留内容节点，设置 `destroy-on-close` 可在离场完成后销毁。使用 `:transition="{ css: false }"` 可以禁用 CSS 动画。过渡对象中的 `onAfterEnter`、`onBeforeLeave` 和 `onAfterLeave` 支持数组，按声明顺序执行，随后触发组件自身的生命周期事件。支持 Tab 焦点循环、Esc、多实例层级与滚动锁，关闭后焦点恢复到触发元素。依赖旧版无遮罩穿透行为的页面可同时开启 `modal-penetrable`，依赖拖动越界时可设置 `overflow`。

单独设置 `append-to="body"` 时，窗口会在组件所在位置渲染。旧版通过该写法挂载到 `document.body` 的页面可改用 `append-to-body`。
