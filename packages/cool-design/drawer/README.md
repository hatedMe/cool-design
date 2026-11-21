# Drawer 抽屉

### 介绍

从屏幕边缘滑出的内容容器，支持四个方向、遮罩、焦点陷阱、关闭拦截和拖拽调整尺寸。

## 用法

```vue
<Drawer v-model="open" title="编辑内容" direction="rtl">
  <p>抽屉正文</p>
  <template #footer>
    <button @click="open = false">关闭</button>
  </template>
</Drawer>
```

通过 `before-close` 拦截关闭，通过 `size` 控制宽度或高度（水平方向为宽度，垂直方向为高度）。

在关闭按钮、遮罩、`Escape` 或 `handleClose()` 请求关闭时，`before-close` 可以调用 `done()` 直接开始离场，或调用 `done(true)` 取消本次请求。直接将 `v-model` 设为 `false` 走 `close-delay`。打开后保持遮罩和滚动锁，离场结束时释放并恢复焦点。

```vue
<Drawer v-model="open" :resizable="{ minSize: '200px', maxSize: '80%' }" :modal="false" modal-penetrable />
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `model-value` / `v-model` | 是否显示 | `boolean` | `false` |
| `title` | 标题 | `string` | `''` |
| `direction` | 打开方向 | `'rtl' \| 'ltr' \| 'ttb' \| 'btt'` | `rtl` |
| `size` | 宽度（水平）或高度（垂直），数字为像素 | `string \| number` | `30%` |
| `with-header` | 是否显示头部 | `boolean` | `true` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `close-icon` | 关闭按钮内容，支持文本、组件对象和函数组件 | `string \| Component` | `×` |
| `close-on-click-modal` | 点击遮罩是否关闭 | `boolean` | `true` |
| `close-on-press-escape` | `ESC` 是否关闭 | `boolean` | `true` |
| `append-to` | 选择器或元素。显式非 `body` 选择器和元素优先。省略时优先使用 ConfigProvider 浮层容器，否则就地渲染 | `string \| HTMLElement` | — |
| `append-to-body` | 挂载到 `document.body`。旧版依赖默认挂到 `body` 或单独使用 `append-to="body"` 时可改用此属性 | `boolean` | `false` |
| `lock-scroll` | 是否锁定背景滚动 | `boolean` | `true` |
| `before-close` | 关闭拦截，原 `done()` 用法仍有效 | `(done: (cancel?: boolean) => void) => void` | — |
| `modal` | 是否显示遮罩 | `boolean` | `true` |
| `modal-penetrable` | 无遮罩时点击是否穿透，需 `modal="false"` | `boolean` | `false` |
| `modal-class` | 遮罩额外类名 | `string` | `''` |
| `destroy-on-close` | 是否在离场动画结束后销毁内容 | `boolean` | `false` |
| `open-delay` | 打开延迟（毫秒） | `number` | `0` |
| `close-delay` | 关闭延迟（毫秒） | `number` | `0` |
| `custom-class` | 抽屉额外类名（兼容） | `string` | `''` |
| `header-class` | 头部额外类名 | `string` | `''` |
| `body-class` | 内容额外类名 | `string` | `''` |
| `footer-class` | 底部额外类名 | `string` | `''` |
| `z-index` | 层级 | `number` | — |
| `header-aria-level` | 标题 ARIA 层级 | `string` | `2` |
| `resizable` | 是否可拖拽调整，或配置 `{ minSize, maxSize }`（像素或百分比，默认 `4px` / 视口尺寸） | `boolean \| DrawerResizableOptions` | `false` |

### 事件

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `open` | 入场动画开始前，初始值为 `true` 时同样等待 `open-delay` | — |
| `opened` | 入场动画结束 | — |
| `close` | 离场动画开始前 | — |
| `closed` | 离场动画结束 | — |
| `open-auto-focus` | 打开自动聚焦后 | — |
| `close-auto-focus` | 关闭恢复焦点后 | — |
| `update:modelValue` | 离场动画结束后发出 `false`。若重新打开仍在等待 `open-delay`，则保留新的 `true` 并跳过此事件 | `boolean` |
| `resize-start` | 开始调整尺寸 | `{ size: string }` |
| `resize` | 调整尺寸中 | `{ size: string }` |
| `resize-end` | 结束调整尺寸 | `{ size: string }` |

### 插槽

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `default` | 抽屉内容 | — |
| `header` | 自定义头部 | `{ close, titleId, titleClass }` |
| `title` | 自定义标题（兼容） | — |
| `footer` | 底部内容 | — |

### Expose

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `handleClose` | 触发关闭（含 `before-close`） | `() => void` |

## 调整尺寸说明

- 拖拽边缘手柄调整宽度或高度，键盘聚焦手柄后可用方向键（每次 `10px`）、`Home`（最小）、`End`（最大）调整。
- 手柄具有 `separator` 角色与 `aria-orientation`、`aria-valuenow`、`aria-valuemin`、`aria-valuemax`。
- `size` 属性变化会重置拖拽结果。
