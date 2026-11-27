# Row 行布局

### 介绍

与 Col 组合构建 24 栅格。基于 Flex，支持换行、动态 gutter、水平排列和垂直对齐；嵌套 Row 的 gutter 独立生效。

## 用法

```vue
<Row :gutter="16">
  <Col :span="12">左栏</Col>
  <Col :span="12">右栏</Col>
</Row>
```

## API

| 属性    | 类型                                                               | 默认    |
| ------- | ------------------------------------------------------------------ | ------- |
| tag     | `string`                                                           | `div`   |
| gutter  | `number`（列间距，单位 `px`；不支持对象形式）                                | `0`     |
| justify | `start` / `end` / `center` / `space-around` / `space-between` / `space-evenly` | `start` |
| align   | `top` / `middle` / `bottom` / `center`（`center` 为项目兼容别名）   | —       |

未设置 align 时保持 Flex 默认的 stretch；middle/center 表示垂直居中。每列左右各使用 gutter/2 内边距，Row 使用对应负外边距；父区域应提供相应留白，避免在页面边缘直接产生横向溢出。

### 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 放置 Col 组件 |

### 事件

无自定义事件。
