# Footer 页脚

Container 内的页脚，使用原生 footer 标签，不收缩；Container 自动方向判定会识别 Footer。

## API

| 属性   | 类型                         | 默认 |
| ------ | ---------------------------- | ---- |
| height | number（px）/ CSS 长度字符串 | 60px |

默认插槽放页脚内容。内边距由 `--i-footer-padding` 控制，默认 20px。需要始终可见时，为 Container 设置确定高度并让 Main 滚动，不需要 fixed 定位。
