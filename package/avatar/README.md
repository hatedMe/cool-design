# Avatar 头像

Avatar 组件可以用来代表人物或对象，支持使用图片、图标或者文字作为 Avatar。

## 基础用法

使用 `shape` 和 `size` 属性设置头像的形状和大小。尺寸支持 `small`、`medium`、`large` 和数字（单位为 px）。

## 展示类型

头像支持图片、图标和文字三种内容形式。图片使用 `url` 或 `src`，图标使用图标字体类名，文字放在默认插槽中。

## 回退行为

图片加载失败时触发 `error` 事件，并显示 `fallback` 插槽内容。

## 适应容器

使用 `fit` 设置图片在头像容器中的适配方式，与 CSS `object-fit` 一致，支持 `fill`、`contain`、`cover`、`none`、`scale-down`。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url / src | 图片地址 | string | — |
| srcSet | 响应式图片地址 | string | — |
| alt | 图片替代文本 | string | 空 |
| shape | circle / square | string | square |
| size | large / medium / small / 数字 | string / number | large |
| fit | 图片适配方式 | string | cover |
| icon | 图标字体类名 | string | — |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| error | 图片加载失败 | event: Event |

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 文字内容 |
| fallback | 图片失败后的回退内容 |
