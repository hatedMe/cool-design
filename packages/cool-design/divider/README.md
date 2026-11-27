# Divider 分割线

### 介绍

分隔内容区域或行内操作，支持横向标题和竖向分割线。

## 用法

```vue
<Divider content-position="left">权限设置</Divider>
<Divider border-style="dashed">高级设置</Divider>
<Divider direction="vertical" />
```

`vertical` 为兼容旧 API 的行内竖线属性，与 `direction="vertical"` 等效。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `direction` | 方向：`horizontal` / `vertical` | `string` | `horizontal` |
| `vertical` | 是否为行内竖线（兼容旧 API） | `boolean` | `false` |
| `content-position` | 文字位置：`left` / `center` / `right` | `string` | `center` |
| `border-style` | 边框样式：`solid` / `dashed` / `dotted` / `double` 等 CSS 值 | `string` | `solid` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| `default` | 横向分割线文字，竖线忽略此插槽 |

## 使用说明

- `vertical`: 默认 `false`；`true` 显示行内竖线，优先兼容旧 API。
- `direction`: `horizontal`（默认）或 `vertical`。
- `content-position`: `left` / `center` / `right`，默认 `center`。
- `border-style`: `solid`（默认）、`dashed`、`dotted`、`double` 等 CSS 边框样式。
- 默认插槽：横向分割线的文字，渲染为 `.i-divider__text`；竖线不渲染文字。

使用 `separator` 角色和对应 `aria-orientation`；颜色继承主题边框变量。

### 事件

无自定义事件。
