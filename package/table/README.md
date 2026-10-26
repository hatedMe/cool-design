# Table 表格

属性：data: object[]、columns: TableColumn[]、rowKey: string（默认 id，必须为稳定唯一的字符串或数字键）、selection、loading、maxHeight: number（默认 440px）、emptyText: string。

列定义：key: string、title: string、width?: number、fixed?: 'left' | 'right'、sortable?: boolean、formatter?: (row) => string。列插槽名等于 key，参数 {row, index}；优先于 formatter 和字段文本。empty 插槽自定义空态。

事件 selection-change(rows) 返回当前数据的已选记录；sort-change({key, order}) 的 order 按 asc、desc、null 循环。组件不请求接口、不自动排序，页面响应事件更新 data。实例方法 clearSelection() 供查询或翻页清空选择；替换 data 自动清除不存在的行键。

表头固定在内部滚动容器内；固定列请显式指定宽度。首版不支持虚拟滚动、跨页选择、编辑单元格和合并单元格。
