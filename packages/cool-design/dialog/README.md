# Dialog 对话框

### 介绍

通过桌面模态窗口展示编辑表单或其他内容，提供标题、页脚操作区与焦点管理。API 对标 Element Plus，支持 `v-model` 控制显示、全屏、无遮罩、自定义挂载与关闭拦截。

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

使用 `fullscreen` 全屏显示，`top` 设置顶部偏移，`modal="false"` 隐藏遮罩，`before-close` 拦截关闭。

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` / `v-model` | 是否显示 | `boolean` | `false` |
| `title` | 弹窗标题 | `string` | `''` |
| `width` | 弹窗宽度，支持数字或 CSS 尺寸 | `number` / `string` | — |
| `fullscreen` | 是否全屏 | `boolean` | `false` |
| `top` | 顶部偏移（如 `15vh`），设置后顶部对齐 | `string` | `''` |
| `modal` | 是否显示遮罩 | `boolean` | `true` |
| `append-to` | 挂载容器选择器或元素，默认使用 ConfigProvider 浮层宿主 | `string` / `HTMLElement` | — |
| `lock-scroll` | 是否锁定 body 滚动 | `boolean` | `true` |
| `custom-class` | 弹窗自定义 class | `string` | `''` |
| `header-class` | 头部自定义 class | `string` | `''` |
| `body-class` | 内容区自定义 class | `string` | `''` |
| `footer-class` | 页脚自定义 class | `string` | `''` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `close-on-click-modal` | 点击遮罩是否请求关闭 | `boolean` | `true` |
| `close-on-press-escape` | 按 Esc 是否请求关闭 | `boolean` | `true` |
| `closable` | 是否允许关闭按钮、遮罩、Esc 请求关闭 | `boolean` | `true` |
| `center` | 头部与页脚是否居中 | `boolean` | `false` |
| `destroy-on-close` | 关闭后是否销毁内容 | `boolean` | `false` |
| `before-close` | 关闭前拦截，调用 `done()` 继续关闭 | `(done: () => void) => void` | — |

#### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 请求关闭，父级更新模型 | `value: false` |
| `open` | 打开开始 | — |
| `opened` | 打开完成（已聚焦） | — |
| `close` | 关闭请求（含 `before-close` 拦截前） | — |
| `closed` | 关闭完成 | — |
| `open-auto-focus` | 自动聚焦到窗口内时 | — |
| `close-auto-focus` | 恢复触发元素焦点时 | — |

#### 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 窗口内容 |
| `header` | 自定义整个头部 |
| `title` | 自定义标题文本 |
| `footer` | 底部操作区 |

#### Exposes

| 方法 | 说明 |
| --- | --- |
| `handleClose()` | 触发关闭流程（触发 `close`，尊重 `before-close`） |
| `resetPosition()` | 重置弹窗顶部偏移为 `top` 属性值 |

### 使用说明

`closable="false"` 阻止关闭按钮、遮罩、Esc 发出关闭请求，父级仍可主动改模型。直接改模型关闭时只触发 `closed`，不触发 `close`。

默认关闭后保留内容节点并隐藏；设置 `:destroy-on-close="true"` 后关闭时销毁内容。支持模态焦点循环、Esc、多实例层级与滚动锁，关闭后焦点恢复到触发元素。
