# Alert 警告

## 组件介绍

Alert 用于页面内展示需要关注的提示信息，支持五种语义类型与浅色/深色效果，属性、事件和插槽齐全，样式使用 `i-` 前缀与语义 CSS 变量，兼容明暗主题。

## 基础用法

使用 `type` 区分语义。可选值为 `primary` / `success` / `warning` / `info` / `error`，默认为 `info`。

```vue
<Alert title="提示信息" type="info" />
<Alert title="成功提示" type="success" show-icon />
<Alert title="警告提示" type="warning" show-icon />
<Alert title="错误提示" type="error" show-icon />
```

## 描述与居中

通过 `description` 或默认插槽展示详细内容，`center` 使文本居中。

```vue
<Alert title="标题" description="详细描述内容" type="primary" show-icon center />
```

## 深色效果

设置 `effect="dark"` 使用深色背景，文本为白色。

```vue
<Alert title="深色提示" type="success" effect="dark" show-icon />
```

## 可关闭

默认可关闭，点击关闭按钮触发 `close` 并隐藏。设置 `close-text` 自定义关闭文本，`closable="false"` 隐藏关闭按钮。

```vue
<Alert title="可关闭" closable @close="onClose" />
<Alert title="自定义关闭文本" close-text="关闭" />
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 标题 | `string` | — |
| `description` | 描述内容，可被默认插槽覆盖 | `string` | — |
| `type` | 类型：`primary` / `success` / `warning` / `info` / `error` | `AlertType` | `info` |
| `effect` | 效果：`light` / `dark` | `AlertEffect` | `light` |
| `closable` | 是否可关闭 | `boolean` | `true` |
| `close-text` | 自定义关闭文本 | `string` | — |
| `show-icon` | 是否显示图标 | `boolean` | `false` |
| `center` | 文本是否居中 | `boolean` | `false` |

### 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `close` | 关闭按钮点击后触发，组件同时隐藏 | 无 |

### 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 描述内容，覆盖 `description` 属性 |
| `title` | 标题内容，覆盖 `title` 属性 |
| `icon` | 自定义图标，覆盖默认类型图标 |

内容按文本渲染，不解析 HTML。组件使用 `role="alert"` 语义。
