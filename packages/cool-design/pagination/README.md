# Pagination 分页

### 介绍

控制数据列表的当前页码和每页条数，适合与 Table 组合使用。

## API

### 属性

| 参数                               | 说明                | 类型     | 默认值          |
| ---------------------------------- | ------------------- | -------- | --------------- |
| currentPage / v-model:current-page | 当前页码，从 1 开始 | number   | 1               |
| pageSize / v-model:page-size       | 每页条数，正整数    | number   | 10              |
| total                              | 总记录数            | number   | 0               |
| disabled                           | 禁用页码和条数切换  | boolean  | false           |
| pageSizes                          | 每页条数选项        | number[] | [10, 20, 50]    |
| pagerCount                         | 显示页码数量        | number   | 7               |
| hideOnSinglePage                   | 只有一页时隐藏      | boolean  | false           |
| background                         | 使用页码背景样式    | boolean  | false           |
| prevText / nextText                | 前后页按钮文字      | string   | 上一页 / 下一页 |

### 事件

| 事件名             | 说明                           | 回调参数     |
| ------------------ | ------------------------------ | ------------ |
| update:currentPage | 切换页码或页码越界修正         | page: number |
| update:pageSize    | 改变每页条数；页面负责重置页码 | size: number |
| current-change     | 页码改变后触发                 | page: number |
| page-size-change   | 每页条数改变后触发             | size: number |

## 使用说明

属性 currentPage: number（默认 1）、pageSize: number（默认 10，正整数）、total: number（默认 0）、disabled。页码从 1 开始。

事件 update:currentPage(page)、current-change(page)、update:pageSize(size)、page-size-change(size)。改变大小由页面先将页码设为 1 再请求一次。总数缩小导致越界时通知父级修正页码。页码过多时使用省略号。
