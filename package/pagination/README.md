# Pagination 分页

属性 currentPage: number（默认 1）、pageSize: number（默认 10，正整数）、total: number（默认 0）、disabled。页码从 1 开始。

事件 update:currentPage(page)、update:pageSize(size)。改变大小只发出大小事件，由页面先将页码设为 1 再请求一次，避免分别监听两个参数造成重复请求。总数缩小导致越界时通知父级修正页码。大小选项为 10/20/50，并保留当前自定义大小。
