# Layout 布局

Layout 由 Row、Col 组成，不需要注册名为 Layout 的组件。通过 24 栅格组织内容，支持列间距、对齐、换行、偏移与响应式断点。

## API

使用 `Row` 管理 gutter、justify、align，使用 `Col` 管理 span、offset、push/pull 和 xs/sm/md/lg/xl。详细属性与响应式示例见 [Row](#/components/row) 和 [Col](#/components/col)。

断点按窗口宽度判断：xs<768px、sm≥768px、md≥992px、lg≥1200px、xl≥1920px。需要整页页头、侧栏和滚动内容结构时，使用 [Container](#/components/container)。
