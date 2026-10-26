# Icon 图标

`type` 使用内置字体类名，例如 `icon-search`、`icon-close`。也可在默认插槽放 SVG。

-   `size`: number（px）或 CSS 长度；不指定时随配置尺寸显示 14/16/20px。
-   `color`: CSS 颜色，默认继承。
-   `label`: 可访问名称；有名称时 role=img，否则作为装饰图标 aria-hidden。

图标按钮的名称应由按钮提供。使用构建产物时统一引入 `cool-design/style.css`，字体资源已包含在构建样式内。
