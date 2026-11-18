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

```vue
<Drawer v-model="open" :resizable="{ minSize: '200px', maxSize: '80%' }" :modal="false" modal-penetrable />
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `model-value` / `v-model` | 是否显示 | `boolean` | `false` |
| `title` | 标题 | `string` | `''` |
| `direction` | 打开方向：`rtl` / `ltr` / `ttb` / `btt` | `string` | `rtl` |
| `size` | 宽度（水平）或高度（垂直），数字为像素 | `string` / `number` | `30%` |
| `with-header` | 是否显示头部 | `boolean` | `true` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `close-icon` | 关闭按钮内容：字符串按文本渲染，组件按节点渲染 | `string` / `Component` | `×` |
| `close-on-click-modal` | 点击遮罩是否关闭 | `boolean` | `true` |
| `close-on-press-escape` | `ESC` 是否关闭 | `boolean` | `true` |
| `append-to` | 挂载目标（选择器或元素），默认使用 ConfigProvider 浮层容器，兜底 `body` | `string` / `HTMLElement` | — |
| `append-to-body` | 是否挂载到 `body`（兼容） | `boolean` | `false` |
| `lock-scroll` | 是否锁定背景滚动 | `boolean` | `true` |
| `before-close` | 关闭拦截 `(done: () => void) => void` | `Function` | — |
| `modal` | 是否显示遮罩 | `boolean` | `true` |
| `modal-penetrable` | 无遮罩时点击是否穿透，需 `modal="false"` | `boolean` | `false` |
| `modal-class` | 遮罩额外类名 | `string` | `''` |
| `destroy-on-close` | 关闭后是否销毁内容 | `boolean` | `false` |
| `open-delay` | 打开延迟（毫秒） | `number` | `0` |
| `close-delay` | 关闭延迟（毫秒） | `number` | `0` |
| `custom-class` | 抽屉额外类名（兼容） | `string` | `''` |
| `header-class` | 头部额外类名 | `string` | `''` |
| `body-class` | 内容额外类名 | `string` | `''` |
| `footer-class` | 底部额外类名 | `string` | `''` |
| `z-index` | 层级 | `number` | — |
| `header-aria-level` | 标题 ARIA 层级 | `string` | `2` |
| `resizable` | 是否可拖拽调整，或配置 `{ minSize, maxSize }`（像素或百分比，默认 `4px` / 视口尺寸） | `boolean` / `object` | `false` |

### 事件

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `open` | 打开前 | — |
| `opened` | 打开后 | — |
| `close` | 关闭前 | — |
| `closed` | 关闭后 | — |
| `open-auto-focus` | 打开自动聚焦后 | — |
| `close-auto-focus` | 关闭恢复焦点后 | — |
| `update:modelValue` | 可见性变化 | `boolean` |
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
