# TableV2 虚拟化表格

### 介绍

TableV2 按可见范围和缓存渲染正文，适合大数据量。支持固定行列、自定义渲染、树形展开、排序和滚动控制。

## 基础用法

```vue
<script setup lang="ts">
import { h, ref } from 'vue';
import { TableV2, type TableV2Column, type TableV2Instance } from 'cool-design/table-v2';

const table = ref<TableV2Instance>();
const selected = ref('');
const columns: TableV2Column[] = [
  { key: 'id', dataKey: 'id', title: '编号', width: 100, fixed: 'left' },
  {
    key: 'name',
    dataKey: 'profile.name',
    width: 200,
    headerCellRenderer: ({ headerIndex }) => h('span', headerIndex === 0 ? '姓名' : '选择用户'),
    cellRenderer: ({ cellData, rowIndex }) => rowIndex < 0
      ? h('strong', String(cellData))
      : h('button', { onClick: () => { selected.value = String(cellData); } }, String(cellData))
  }
];
const data = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, profile: { name: `行${i + 1}` } }));
const fixedData = [{ id: '汇总', profile: { name: '共 10000 行' } }];
</script>

<template>
  <button @click="table?.scrollToRow(199, 'smart')">滚动到第 200 行</button>
  <span v-if="selected">已选择 {{ selected }}</span>
  <TableV2 ref="table" :columns="columns" :data="data" :fixed-data="fixedData"
    :width="300" :height="400" :header-height="[32, 28]" />
</template>
```

内容渲染优先级为列渲染器、对应 `cell` 或 `header-cell` 插槽、默认内容。表头排序标记和正文树形开关由表格渲染。正文值优先由 `dataGetter` 提供，省略时从 `dataKey` 读取，支持 `profile.name`、`items[0].name`、`profile["a.b"]` 和 `.name` 等路径。与 `dataKey` 完全同名的属性优先。

## 动态行高

传入正数 `estimated-row-height` 后，正文单元格可以换行。未测量的行先使用估值，挂载后按当行最高单元格的内容测量，异步内容变化会更新尺寸。实际行高可以小于估值。固定数据行始终按 `row-height` 布局。建议用接近常见行高的值作为估值。

```vue
<TableV2 :columns="columns" :data="data" :estimated-row-height="64" />
```

表头与正文行默认高度由 `40` 调整为 `50`。原布局可显式设置 `:header-height="40" :row-height="40"`，函数形式的 `row-height` 也继续支持。

## 树形展开

含子节点的正文行在首列或 `expandColumnKey` 指定列渲染展开开关。非受控模式可用 `defaultExpandedRowKeys` 设置初始展开。传入 `expandedRowKeys` 后以该值为准，并可用 `v-model:expanded-row-keys` 接收更新。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TableV2Key } from 'cool-design/table-v2';

const expandedKeys = ref<TableV2Key[]>([]);
function handleExpandedRows(rows: object[], keys: TableV2Key[]) {
  console.log(rows, keys);
}
</script>

<template>
  <TableV2 v-model:expanded-row-keys="expandedKeys" :columns="columns" :data="treeData"
    @expanded-row-data-change="handleExpandedRows" />
</template>
```

原 `@expanded-rows-change="handleExpandedRows"` 的 `(rows, keys)` 回调请迁移至 `@expanded-row-data-change`。现在 `expanded-rows-change` 接收 `(keys)`，扩展事件中的 `rows` 仍为已展开的根行。

### 排序

`sortState` 接受 `{ key, order }` 或列键到排序方向的映射，并优先于 `sortBy`。当对象仅有 `key`、`order` 两个自有属性且 `order` 为 `asc` 或 `desc` 时，优先使用单列排序语义，并匹配列键的原始类型。映射使用 JavaScript 对象属性键规则，因此 `1` 和 `'1'` 共用一个属性。映射可显示多个表头的排序方向，根行按映射中首个可用列稳定排序。替换排序对象或原地修改会同步排序。异步加载目标列后会应用已传入的排序，移除已生效的排序列会清除此列状态。启用 `sortable` 的列通过点击表头按 `asc`、`desc`、`null` 循环，随后触发 `column-sort`。外部排序可作用于所有列。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列定义 | `TableV2Column[]` | `[]` |
| data | 正文数据 | `object[]` | `[]` |
| fixed-data | 跨滚动位置保留在表头下方的固定数据，使用 `rowHeight`，索引依次为 `-1`、`-2` | `object[]` | — |
| width | 表格宽度 | `string \| number` | `100%` |
| height | 表格固定高度 | `number` | `400` |
| header-height | 表头行高，数组每项定义一行 | `number \| number[]` | `50` |
| footer-height | 底部栏高度，大于 `0` 时渲染 | `number` | `0` |
| row-height | 固定数据行和固定高度模式正文的行高 | `number \| (({ rowData, rowIndex }) => number)` | `50` |
| estimated-row-height | 正文估计行高，传入有限正数启用内容测量 | `number` | — |
| row-key | 行唯一键字段名或取键函数 | `string \| ((row: object) => TableV2Key)` | `id` |
| expanded-row-keys | 受控展开行键 | `TableV2Key[]` | — |
| default-expanded-row-keys | 非受控的初始展开行键 | `TableV2Key[]` | `[]` |
| expand-column-key | 树形开关所在列 | `TableV2Key` | 首列 |
| children-key | 子节点字段名 | `string` | `children` |
| sort-by | 排序列与方向 | `TableV2SortBy` | — |
| sort-state | 列键映射或单列排序，优先于 `sortBy` | `TableV2SortState \| TableV2SortBy` | — |
| filter | 根行过滤函数 | `(rowData: object) => boolean` | — |
| row-event-handlers | 行事件处理器 | `TableV2RowEventHandlers` | — |
| overscan | 可视窗口上下预渲染行数 | `number` | `3` |
| cache | 预渲染行数，优先于 `overscan` | `number` | — |
| header-class | 表头行类名 | `string \| ((params: TableV2HeaderParams) => string)` | — |
| row-class | 正文及固定行类名 | `string \| ((params: TableV2RowParams) => string)` | — |
| header-props | 表头行附加属性 | `TableV2ElementProps<TableV2HeaderParams>` | — |
| header-cell-props | 表头单元格附加属性 | `TableV2ElementProps<TableV2HeaderCellParams>` | — |
| row-props | 正文及固定行附加属性 | `TableV2ElementProps<TableV2RowParams>` | — |
| cell-props | 正文及固定行单元格附加属性 | `TableV2ElementProps<TableV2CellParams>` | — |
| use-is-scrolling | 向单元格渲染器和插槽提供滚动状态 | `boolean` | `false` |
| empty-text | 空态文字 | `string` | `暂无数据` |
| fixed-columns | 自动固定的列数，列级 `fixed` 声明优先 | `number` | `0` |
| fixed-columns-mode | 自动固定方向 | `'left' \| 'right'` | `left` |

`TableV2Key` 为 `string`、`number` 或 `symbol`。附加属性接受对象或返回对象的函数，可传 `class`、`style`、DOM 属性及监听器，表格维护布局样式和 ARIA 角色。行事件处理器支持 `onClick`、`onDblclick`、`onContextmenu`、`onMouseenter` 和 `onMouseleave`，参数为 `{ event, rowData, rowIndex, rowKey }`。

### 回调作用域

| 类型 | 字段 |
| --- | --- |
| `TableV2HeaderParams` | `{ columns, headerIndex }` |
| `TableV2HeaderCellParams` | `{ columns, column, columnIndex, headerIndex }` |
| `TableV2RowParams` | `{ columns, rowData, rowIndex }` |
| `TableV2DataGetterParams` | `{ columns, column, columnIndex, rowData, rowIndex }` |
| `TableV2CellParams` | 取值器参数及 `cellData` |
| `TableV2HeaderCellRendererParams` | 表头单元格参数及 `class`、`style`、`sortBy`、`sortState` |
| `TableV2CellRendererParams` | 单元格参数及 `class`、`isScrolling` |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| column-sort | 表头交互排序变化 | `{ key, order }`，方向为 `'asc' \| 'desc' \| null` |
| update:expandedRowKeys | 请求更新展开行键 | `keys: TableV2Key[]` |
| row-expand | 单个树节点的展开操作 | `{ expanded, rowData, rowIndex, rowKey }` |
| expanded-rows-change | 展开行键变化 | `keys: TableV2Key[]` |
| expanded-row-data-change | 展开的根行与行键 | `rows: object[]`、`keys: TableV2Key[]` |
| scroll | 滚动 | `{ scrollLeft, scrollTop }` |
| rows-rendered | 正文渲染区间变化，可见及缓存区间均包含起止索引 | `{ rowCacheStart, rowCacheEnd, rowVisibleStart, rowVisibleEnd }` |
| end-reached | 向下滚至底部 | `remainDistance: number`，距底部的像素 |

### 插槽

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| header | 自定义每一行表头，可重新组合表头单元格 | `{ cells, columns, headerIndex }` |
| header-cell | 自定义表头单元格 | `TableV2HeaderCellRendererParams` |
| cell | 自定义正文与固定数据单元格 | `TableV2CellRendererParams` |
| empty | 正文与固定数据均为空时显示 | — |
| footer | 底部栏内容，配合 `footerHeight` | — |
| overlay | 覆盖表格，可与数据和空态同时显示 | — |

### 实例方法

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| scrollTo(options) | `{ scrollLeft?, scrollTop? }`，兼容 `{ left?, top? }`，正式坐标优先 | `void` |
| scrollToLeft(scrollLeft) | 设置横向坐标 | `void` |
| scrollToTop(scrollTop) | 设置纵向坐标 | `void` |
| scrollToRow(index, strategy?) | 按正文的从零开始索引滚动，策略为 `auto`、`smart`、`start`、`center` 或 `end`，默认 `auto` | `void` |

`smart` 对邻近的目标行采用最小滚动距离，对远处的目标行采用 `center`。居中基于正文可用视口，靠近首尾时停在最近的可滚动位置。固定行使用负索引，正文区间和滚动定位都从正文的第 `0` 行计算。

### TableV2Column 列定义

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| key | 列标识，默认使用 `dataKey` 或列索引 | `TableV2Key` |
| dataKey | 字段键或路径 | `TableV2Key` |
| title | 表头文字 | `string` |
| width | 必填，列宽 px | `number` |
| align | 对齐方式 | `left` / `center` / `right` |
| sortable | 是否可排序 | `boolean` |
| fixed | 固定列，`true` 等价于 `left` | `boolean` / `left` / `right` |
| dataGetter | 自定义取值 | `(params: TableV2DataGetterParams) => unknown` |
| cellRenderer | 自定义单元格 | `(params: TableV2CellRendererParams) => VNode` |
| headerCellRenderer | 自定义表头单元格 | `(params: TableV2HeaderCellRendererParams) => VNode` |

`TableV2` 和表格公共类型均可从 `cool-design/table-v2` 或 `cool-design` 导入。

### 尺寸和滚动条

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| max-height | 最大高度，设置后按内容收缩并受此上限限制 | `number` | — |
| indent-size | 树形数据每层缩进像素 | `number` | `12` |
| h-scrollbar-size | 横向滚动条厚度 | `number` | `6` |
| v-scrollbar-size | 纵向滚动条厚度 | `number` | `6` |
| scrollbar-always-on | 始终显示滚动条 | `boolean` | `false` |
