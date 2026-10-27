# Icon 图标

### 介绍

图标用于辅助表达操作与状态，支持内置字体图标和自定义 SVG。

## API

### 属性

| 参数  | 说明                             | 类型               | 默认值                        |
| ----- | -------------------------------- | ------------------ | ----------------------------- |
| type  | 内置字体类名，如 icon-search     | string             | —                             |
| icon  | 图标组件或字体图标类名           | string / Component | —                             |
| size  | 字号，数字为 px，也支持 CSS 长度 | string / number    | 随全局尺寸显示 14 / 16 / 20px |
| color | 图标颜色                         | string             | 继承                          |
| label | 可访问名称，省略时视为装饰图标   | string             | —                             |

### 插槽

| 名称    | 说明                 |
| ------- | -------------------- |
| default | 自定义图标，例如 SVG |

## 使用说明

`type` 使用内置字体类名，例如 `icon-search`、`icon-close`。也可通过 `icon` 传入 SVG Component，或在默认插槽放置自定义 SVG；默认插槽优先级最高。

```vue
<Icon :icon="Search" :size="20" color="#409eff" />
```

- `size`: number（px）或 CSS 长度；不指定时随配置尺寸显示 14/16/20px。
- `color`: CSS 颜色，默认继承。
- `label`: 可访问名称；有名称时 role=img，否则作为装饰图标 aria-hidden。

图标按钮的名称应由按钮提供。使用构建产物时统一引入 `cool-design/style.css`，字体资源已包含在构建样式内。

## 图标检索

下方目录展示全部178个内置字形，可按英文名称或常见中文别名搜索，点击复制完整用法；复制失败时显示可手动选择的代码。`iconNames` 是从 cool-design/icon 或 cool-design 导出的只读名称列表。使用默认 SVG 插槽时不再叠加字体字形，SVG 自身的 fill/stroke 设置优先。
