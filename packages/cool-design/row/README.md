# Row 行布局

与 Col 组合构建 24 栅格。基于 Flex，支持换行、动态 gutter、水平排列和垂直对齐；嵌套 Row 的 gutter 独立生效。

## API

| 属性    | 类型                                                               | 默认  |
| ------- | ------------------------------------------------------------------ | ----- |
| tag     | string                                                             | div   |
| gutter  | number，列间距 px                                                  | 0     |
| justify | start / end / center / space-around / space-between / space-evenly | start |
| align   | top / middle / bottom / center（center 为项目兼容别名）             | —     |

默认插槽放 Col。未设置 align 时保持 Flex 默认的 stretch；middle/center 表示垂直居中。每列左右各使用 gutter/2 内边距，Row 使用对应负外边距；父区域应提供相应留白，避免在页面边缘直接产生横向溢出。
