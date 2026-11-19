# Header 页头

Container 内的顶栏，使用原生 header 标签，不收缩。通常与 Main 或嵌套 Container 组合。

## 基础用法

```vue
<Container>
  <Header height="60px">标题与导航</Header>
  <Main>主要内容</Main>
</Container>
```

## API

| 属性   | 类型                         | 默认    |
| ------ | ---------------------------- | ------- |
| height | `number` / `string`（CSS 长度，数字按 px） | `60px` |

默认插槽放标题、导航、工具栏。内边距由 `--i-header-padding` 控制，默认 20px；背景和边框由业务布局指定。

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 标题、导航与工具栏 |
