# Main 主内容

Container 内自动占据剩余空间的主内容区域，使用原生 main 标签，允许内容收缩和独立滚动。

## API

无专用属性；支持标准 HTML 属性及默认插槽。内边距由 `--i-main-padding` 控制，默认 20px。

为外层 Container 设置确定高度后，超出内容在 Main 内滚动。布局示例使用 main 语义标签，实际页面应避免出现多个同时可见的顶层 main。
