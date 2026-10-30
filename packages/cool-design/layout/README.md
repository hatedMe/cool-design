# Layout 布局

通过 Row、Col 组合构建 24 栅格布局，无需注册 Layout 组件。默认使用 Flex 布局，支持换行、列间距、偏移、对齐与响应式布局。

列宽以 1/24 为单位，`span` 为 0–24；一行的列宽与偏移总和超出 24 时会换行。父容器应有可用宽度，避免使用无法撑满宽度的行内布局。Row 用负外边距抵消 Col 的左右内边距，使用 gutter 时需给外层保留相应留白，避免页面边缘横向溢出。

下面依次演示基础布局、分栏间隔、混合布局、列偏移、对齐、视觉位移、响应式布局和断点隐藏类。需要页头、侧栏、主内容和页脚结构时，使用 [Container](#/components/container)。

## API

### 基于断点的隐藏类

隐藏类可以添加到普通 DOM 元素或自定义组件上，不限于 Col。随组件库样式一起引入，无需额外安装其他样式：

```ts
import 'cool-design/style.css';
```

```vue
<div class="hidden-xs-only">小屏隐藏的辅助信息</div>
<Col :span="12" class="hidden-md-and-up">仅在 992px 以下显示</Col>
```

这里的断点基于**浏览器视口宽度**，不是组件或父容器宽度。`only` 只隐藏一个区间，`and-down` 包含该区间及更小区间，`and-up` 包含该区间及更大区间。

| 类名               | 隐藏时的视口宽度   |
| ------------------ | ------------------ |
| hidden-xs-only     | <768px             |
| hidden-sm-only     | ≥768px 且 <992px   |
| hidden-sm-and-down | <992px             |
| hidden-sm-and-up   | ≥768px             |
| hidden-md-only     | ≥992px 且 <1200px  |
| hidden-md-and-down | <1200px            |
| hidden-md-and-up   | ≥992px             |
| hidden-lg-only     | ≥1200px 且 <1920px |
| hidden-lg-and-down | <1920px            |
| hidden-lg-and-up   | ≥1200px            |
| hidden-xl-only     | ≥1920px            |

隐藏类使用 `display: none !important`，命中时元素不占布局空间，优先于 Col 的响应式 display；不命中时保留元素原本的显示方式。多个隐藏类同时使用时，任一个命中即隐藏。Col 的 `:xs="0"` 适合调整整列；隐藏类也适用于按钮、文本和其他组件。

### Row API

#### Row Attributes

| 属性名  | 说明                  | 类型 / 可选值                                                      | 默认值 |
| ------- | --------------------- | ------------------------------------------------------------------ | ------ |
| gutter  | 相邻列的间距，单位 px | number                                                             | 0      |
| justify | 水平排列方式          | start / end / center / space-around / space-between / space-evenly | start  |
| align   | 垂直对齐方式          | top / middle / bottom / center（center 为项目兼容别名）             | —      |
| tag     | 自定义根元素标签      | string                                                             | div    |

#### Row Slots

| 插槽名  | 说明     | 建议内容 |
| ------- | -------- | -------- |
| default | 默认内容 | Col      |

### Col API

#### Col Attributes

| 属性名 | 说明                     | 类型 / 可选值          | 默认值 |
| ------ | ------------------------ | ---------------------- | ------ |
| span   | 占据的栅格数，0 表示隐藏 | number，0–24           | 24     |
| offset | 左侧留白的栅格数         | number，0–24           | 0      |
| push   | 向右移动的栅格数         | number，0–24           | 0      |
| pull   | 向左移动的栅格数         | number，0–24           | 0      |
| xs     | <768px 时的栅格配置      | number / ColSizeObject | —      |
| sm     | ≥768px 时的栅格配置      | number / ColSizeObject | —      |
| md     | ≥992px 时的栅格配置      | number / ColSizeObject | —      |
| lg     | ≥1200px 时的栅格配置     | number / ColSizeObject | —      |
| xl     | ≥1920px 时的栅格配置     | number / ColSizeObject | —      |
| tag    | 自定义根元素标签         | string                 | div    |

#### Col Slots

| 插槽名  | 说明   |
| ------- | ------ |
| default | 列内容 |

#### 响应式属性对象

```ts
interface ColSizeObject {
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
}
type ColSize = number | ColSizeObject;
```

`ColSize`、`ColSizeObject` 均可从 `cool-design` 导入。对象中的四个字段均可省略。数字简写只设置 span，例如 `:sm="12"` 等价于 `:sm="{ span: 12 }"`。对象仅覆盖给出的字段，其他字段继承已生效的配置或基础属性；sm 及以上断点向更大尺寸继承，xs 仅在 <768px 时生效。

```vue
<Col :span="24" :sm="12" :md="{ span: 8, offset: 2 }">响应式内容</Col>
```

上例在小屏占24格，≥768px 占12格，≥992px 占8格并左侧留2格。更大的 lg、xl 没有配置时，继续使用 md 配置。

栅格值会取整并限制在 0–24。offset 改变布局留白；push/pull 使用相对定位改变视觉位置，不改变 DOM、键盘或屏幕阅读器的阅读顺序，同时设置时按 push-pull 的差值移动。

Row、Col 的独立文档分别见 [Row](#/components/row) 与 [Col](#/components/col)。
