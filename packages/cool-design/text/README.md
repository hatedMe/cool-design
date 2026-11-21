# Text 文本

### 介绍

统一的行内文本排版，支持语义色、尺寸、截断与多行省略。

## 基础用法

`type` 指定语义色，`size` 控制字号；`truncated` 单行省略，`line-clamp` 多行省略。

```vue
<Text type="primary" size="large">强调文本</Text>
<Text truncated style="max-width: 200px">过长内容单行省略</Text>
<Text :line-clamp="2">多行内容超出两行省略</Text>
```

## API

### 属性

| 参数         | 说明                                       | 类型                                   | 默认值 |
| ------------ | ------------------------------------------ | -------------------------------------- | ------ |
| `type`       | 语义色：`primary` / `success` / `warning` / `danger` / `info` | `string`                   | —      |
| `size`       | 字号：`small` / `default` / `large`        | `string`                               | —      |
| `truncated`  | 超出单行省略                               | `boolean`                              | `false` |
| `lineClamp`  | 多行省略的最大行数                         | `string` / `number`                    | —      |
| `tag`        | 渲染标签                                   | `string`                               | `span` |

### 插槽

| 名称      | 说明       |
| --------- | ---------- |
| `default` | 文本内容   |
