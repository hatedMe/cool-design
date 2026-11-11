# TableV2 虚拟化表格

### 介绍

大数据量虚拟滚动表格，只渲染可视窗口内的行。对标 Element Plus TableV2 的核心用法：固定行高、虚拟窗口、排序、树形展开、行事件与滚动控制。

## 基础用法

```vue
<script setup lang="ts">
import { TableV2 } from 'cool-design/table-v2';
import type { TableV2Column } from 'cool-design/table-v2';

const columns: TableV2Column[] = [
  { key: 'id', dataKey: 'id', title: '编号', width: 100, sortable: true },
  { key: 'name', dataKey: 'name', title: '姓名', width: 200 }
];
const data = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: `行${i + 1}` }));
</script>

<template>
  <TableV2 :columns="columns" :data="data" :width="600" :height="400" :row-height="40" />
</template>
```

## 树形与行事件

```vue
<template>
  <TableV2
    :columns="columns"
    :data="treeData"
    :width="600"
    :height="400"
    :row-event-handlers="{ onClick: ({ rowData }) => {} }"
    @expanded-rows-change="(rows, keys) => {}" />
</template>
```

含子节点的行在首列（或 `expandColumnKey` 指定列）渲染展开开关。

## API

### 属性

| 参数             | 说明                                    | 类型                                                                      | 默认值     |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| columns          | 列定义                                  | `TableV2Column[]`                                                         | `[]`       |
| data             | 表格数据                                | `object[]`                                                                | `[]`       |
| width            | 表格宽度                                | `string \| number`                                                        | `100%`     |
| height           | 表格固定高度                            | `number`                                                                  | `400`      |
| headerHeight     | 表头高度                                | `number`                                                                  | `40`       |
| footerHeight     | 底部栏高度，大于 `0` 时渲染             | `number`                                                                  | `0`        |
| rowHeight        | 行高，数字或按行计算，虚拟计算依据      | `number \| (({ rowData, rowIndex }) => number)`                           | `40`       |
| rowKey           | 行唯一键字段名或取键函数                | `string \| ((row: object) => string \| number)`                           | `id`       |
| expandedRowKeys  | 受控展开行键值                          | `(string \| number)[]`                                                    | —          |
| expandColumnKey  | 树形开关所在列，默认首列                | `string`                                                                  | —          |
| childrenKey      | 子节点字段名                            | `string`                                                                  | `children` |
| sortBy           | 初始排序                                | `{ key: string; order: 'asc' \| 'desc' }`                                 | —          |
| filter           | 根行过滤函数                            | `(rowData: object) => boolean`                                            | —          |
| rowEventHandlers | 行事件处理器                            | `{ onClick?; onDblclick?; onContextmenu?; onMouseenter?; onMouseleave? }` | —          |
| overscan         | 可视窗口上下预渲染行数，`cache` 优先    | `number`                                                                  | `3`        |
| cache            | 预渲染行数，官方别名，优先于 `overscan` | `number`                                                                  | —          |
| sortState        | 受控排序                                | `{ key: string; order: 'asc' \| 'desc' }`                                 | —          |
| rowClass         | 行类名，字符串或函数                    | `string \| (({ rowData, rowIndex }) => string)`                           | —          |
| cellProps        | 单元格类名与样式                        | `({ rowData, column, rowIndex }) => { class?; style? }`                   | —          |
| emptyText        | 空态文字                                | `string`                                                                  | `暂无数据` |

行事件参数为 `{ rowData: object; rowIndex: number; event: Event }`。

### 事件

| 事件名               | 说明                                        | 回调参数                                          |
| -------------------- | ------------------------------------------- | ------------------------------------------------- |
| column-sort          | 表头排序变化，按 `asc`、`desc`、`null` 循环 | `{ key: string; order: 'asc' \| 'desc' \| null }` |
| expanded-rows-change | 树节点展开变化                              | `rows: object[]`、`keys: (string \| number)[]`    |
| scroll               | 滚动                                        | `{ scrollLeft: number; scrollTop: number }`       |
| end-reached          | 滚动到底部                                  | —                                                 |

### 插槽

| 名称        | 说明                                               |
| ----------- | -------------------------------------------------- |
| cell        | 自定义单元格，参数 `{ rowData, column, rowIndex }` |
| header-cell | 自定义表头，参数 `{ column }`                      |
| empty       | 替换默认空态                                       |
| footer      | 底部栏内容，需配合 `footerHeight`                  |

### 实例方法

| 方法                       | 说明                                             | 返回值 |
| -------------------------- | ------------------------------------------------ | ------ |
| scrollTo({ top?, left? })  | 滚动到指定坐标                                   | `void` |
| scrollToRow(index, align?) | 滚动到指定行，`align` 为 `auto/start/center/end` | `void` |

### TableV2Column 列定义

| 字段     | 说明                         | 类型                         |
| -------- | ---------------------------- | ---------------------------- |
| key      | 必填，列标识                 | `string`                     |
| dataKey  | 必填，字段名                 | `string`                     |
| title    | 表头文字                     | `string`                     |
| width    | 必填，列宽 px                | `number`                     |
| align    | 对齐方式                     | `left` / `center` / `right`  |
| sortable | 是否可排序                   | `boolean`                    |
| fixed    | 固定列，`true` 等价于 `left` | `boolean` / `left` / `right` |

`TableV2`、`TableV2Column`、`TableV2SortBy`、`TableV2RowEventHandlers`、`TableV2RowHeight` 可从 `cool-design/table-v2` 子路径导入；主包公共入口只保留普通 `Table`。

## 行为约定

- 排序与过滤作用于根行；固定列通过粘性定位实现；暂不支持懒加载与列宽拖拽。
