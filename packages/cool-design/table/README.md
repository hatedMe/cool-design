# Table 表格

### 介绍

展示结构化数据，支持固定表头、固定列、行选择、排序事件和自定义单元格。

## API

### 属性

| 参数       | 说明                                             | 类型          | 默认值             |
| ---------- | ------------------------------------------------ | ------------- | ------------------ |
| data       | 表格数据                                         | object[]      | []                 |
| columns    | 列定义                                           | TableColumn[] | []                 |
| rowKey     | 行唯一键对应字段，值必须是稳定唯一的字符串或数字 | string        | id                 |
| selection  | 显示勾选列                                       | boolean       | false              |
| loading    | 显示加载遮罩                                     | boolean       | false              |
| maxHeight  | 内部滚动区最大高度，px                           | number        | 440                |
| emptyText  | 空态文字                                         | string        | 没有符合条件的数据 |
| stripe     | 是否显示斑马纹                                   | boolean       | false              |
| border     | 是否显示单元格边框                               | boolean       | false              |
| showHeader | 是否显示表头                                     | boolean       | true               |

### 事件

| 事件名           | 说明                           | 回调参数                                  |
| ---------------- | ------------------------------ | ----------------------------------------- |
| selection-change | 当前页选中记录变化             | rows: object[]                            |
| sort-change      | 排序状态变化，页面自行更新数据 | { key: string, order: asc / desc / null } |

### 插槽

| 名称   | 说明                                                |
| ------ | --------------------------------------------------- |
| 列 key | 自定义单元格，参数 { row, index }，优先于 formatter |
| empty  | 替换默认空态                                        |

### 实例方法

| 方法             | 说明                            | 返回值 |
| ---------------- | ------------------------------- | ------ |
| clearSelection() | 清空选择并发出 selection-change | void   |

### TableColumn 列定义

| 字段        | 说明                            | 类型                    |
| ----------- | ------------------------------- | ----------------------- |
| key         | 必填，字段名及单元格插槽名      | string                  |
| title       | 必填，表头文字                  | string                  |
| width       | 列宽，固定列请显式指定，单位 px | number                  |
| align       | 单元格对齐方式                  | left / center / right   |
| headerAlign | 表头对齐方式，省略时使用 align  | left / center / right   |
| fixed       | 固定在左侧或右侧                | left / right            |
| sortable    | 是否显示排序操作                | boolean                 |
| formatter   | 字段文本格式化                  | (row: object) => string |

`TableColumn`、`SortChange` 可从 `cool-design` 导入。首版不支持虚拟滚动、跨页选择、编辑单元格和合并单元格。

## 使用说明

属性：data: object[]、columns: TableColumn[]、rowKey: string（默认 id，必须为稳定唯一的字符串或数字键）、selection、loading、maxHeight: number（默认 440px）、emptyText: string、stripe、border、showHeader。

列定义：key: string、title: string、width?: number、fixed?: 'left' | 'right'、align?: 'left' | 'center' | 'right'、headerAlign?: 'left' | 'center' | 'right'、sortable?: boolean、formatter?: (row) => string。列插槽名等于 key，参数 {row, index}；优先于 formatter 和字段文本。empty 插槽自定义空态。

事件 selection-change(rows) 返回当前数据的已选记录；sort-change({key, order}) 的 order 按 asc、desc、null 循环。组件不请求接口、不自动排序，页面响应事件更新 data。实例方法 clearSelection() 供查询或翻页清空选择；替换 data 自动清除不存在的行键。

表头固定在内部滚动容器内；固定列请显式指定宽度。首版不支持虚拟滚动、跨页选择、编辑单元格和合并单元格。
