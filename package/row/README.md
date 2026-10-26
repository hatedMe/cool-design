# Row 行布局

### 介绍

基于 Flex 的行容器，与 Col 配合构建桌面应用的 24 栅格布局。

## API

### 属性

| 参数    | 说明                                                          | 类型   | 默认值 |
| ------- | ------------------------------------------------------------- | ------ | ------ |
| tag     | 根节点标签                                                    | string | div    |
| gutter  | 列间距，单位 px                                               | number | 0      |
| justify | 水平排列：start / end / center / space-around / space-between | string | start  |
| align   | 垂直排列：top / bottom / center                               | string | top    |

### 插槽

| 名称    | 说明       |
| ------- | ---------- |
| default | Col 子组件 |

## 使用说明

默认插槽放 Col。属性 tag（默认 div）、gutter（默认 0px）、justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between'、align: 'top' | 'bottom' | 'center'。基于 flex，支持动态属性和左右对称 gutter。
