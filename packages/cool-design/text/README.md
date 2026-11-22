# Text 文本

### 介绍

统一的行内文本排版，支持语义色、尺寸、截断与多行省略。

## 基础用法

`type` 指定语义色，`size` 控制字号，`tag` 指定渲染标签。

```vue
<Text type="primary" size="large">强调文本</Text>
<Text tag="p" size="small">段落文本</Text>
```

## 省略与标题

限制文本宽度后，用 `truncated` 单行省略，或用 `line-clamp` 限制行数。同时设置时，截断状态按单行宽度判断。

```vue
<Text truncated style="max-width: 120px">这是一段超出容器宽度后单行省略的文本。</Text>
<Text :line-clamp="2" style="max-width: 120px">这是一段较长文本，内容会随宽度换行，超过两行时显示省略号。</Text>
```

发生截断时，组件默认把完整文本设为原生 `title`。通过组件引用读取响应式 `isTruncated`，可以在截断时显示自定义提示。依赖旧版悬停行为的页面可设置 `title=""` 关闭自动标题，或传入自己的 `title`。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 语义色 | `''` / `'primary'` / `'success'` / `'warning'` / `'danger'` / `'info'` | `''` |
| `size` | 字号，空字符串使用基础字号 | `''` / `'small'` / `'default'` / `'large'` | `''` |
| `truncated` | 超出单行省略 | `boolean` | `false` |
| `line-clamp` | 多行省略的最大行数 | `string \| number` | — |
| `tag` | 渲染标签 | `string` | `'span'` |

`title` 是原生属性。显式传入的标题优先，空字符串也有效。

### 事件

组件没有专用事件，根元素接收原生事件监听器。

### 插槽

| 名称      | 说明       |
| --------- | ---------- |
| `default` | 文本内容   |

### 实例

使用 `TextInstance` 声明组件引用。实例提供以下只读属性。

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `isTruncated` | 实际布局是否发生截断，初始值为 `false` | `boolean` |
