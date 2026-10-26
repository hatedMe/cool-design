# Pagination 分页

### 介绍

控制数据列表的当前页码和每页条数，适合与 Table 组合使用。

## API

### 属性

| 参数                               | 说明                | 类型    | 默认值 |
| ---------------------------------- | ------------------- | ------- | ------ |
| currentPage / v-model:current-page | 当前页码，从 1 开始 | number  | 1      |
| pageSize / v-model:page-size       | 每页条数，正整数    | number  | 10     |
| total                              | 总记录数            | number  | 0      |
| disabled                           | 禁用页码和条数切换  | boolean | false  |

### 事件

| 事件名             | 说明                           | 回调参数     |
| ------------------ | ------------------------------ | ------------ |
| update:currentPage | 切换页码或页码越界修正         | page: number |
| update:pageSize    | 改变每页条数；页面负责重置页码 | size: number |

## 使用说明

属性 currentPage: number（默认 1）、pageSize: number（默认 10，正整数）、total: number（默认 0）、disabled。页码从 1 开始。

事件 update:currentPage(page)、update:pageSize(size)。改变大小只发出大小事件，由页面先将页码设为 1 再请求一次，避免分别监听两个参数造成重复请求。总数缩小导致越界时通知父级修正页码。大小选项为 10/20/50，并保留当前自定义大小。
