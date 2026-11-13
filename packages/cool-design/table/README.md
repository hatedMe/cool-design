# Table 表格

### 介绍

展示结构化数据，对标 Element Plus Table 的核心 API：固定表头与固定列、行选择、单选高亮行、客户端排序与远程排序、列筛选、展开行、合计行、单元格合并、行列点击事件和自定义单元格。

列通过 `columns` 配置（等价于 Element Plus 的 `el-table-column` 属性），插槽名等于列字段名。

## 基础用法

```vue
<script setup lang="ts">
import { Table } from 'cool-design';
import type { TableColumn } from 'cool-design';

const columns: TableColumn[] = [
  { type: 'index', title: '序号', width: 60 },
  { key: 'name', title: '姓名', width: 140, fixed: 'left' },
  { key: 'department', title: '所属部门', width: 180 },
  { key: 'status', title: '账号状态', width: 140 }
];
const data = [
  { id: 1001, name: '陈晨', department: '产品设计', status: '启用' },
  { id: 1002, name: '林沐', department: '研发中心', status: '启用' }
];
</script>

<template>
  <Table :data="data" :columns="columns" />
</template>
```

列定义支持 Element Plus 风格的 `prop` / `property` / `label` 别名，分别等价于 `key` / `title`。

## 选择与当前行

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Table } from 'cool-design';

const table = ref();
const selected = ref<object[]>([]);
</script>

<template>
  <Table
    ref="table"
    :data="data"
    :columns="columns"
    selection
    highlight-current-row
    @selection-change="selected = $event"
    @current-change="(current, old) => {}" />
</template>
```

`selection` 是首列勾选的简写，等价于首列 `{ type: 'selection' }`；行点击会设置当前行并发出 `current-change`，`highlight-current-row` 控制是否高亮。`clearSelection()`、`toggleRowSelection(row, selected?)`、`toggleAllSelection()`、`getSelectionRows()`、`setCurrentRow(row)` 通过实例调用；编程式方法只触发 `selection-change` / `current-change`，不触发 `select` / `select-all`。

## 排序

`sortable: true` 为客户端自动排序（可用 `sortMethod` / `sortBy` / `sortOrders` 自定义），`sortable: 'custom'` 只发出 `sort-change` 由页面自行排序（远程排序）：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { SortChange } from 'cool-design';

const sort = ref<SortChange>({ column: null, prop: '', order: null });
function onSortChange(change: SortChange) {
  sort.value = change;
  void loadRemote(change.prop, change.order);
}
</script>

<template>
  <Table :data="rows" :columns="columns" @sort-change="onSortChange" />
</template>
```

`sortOrders` 默认按 `ascending`、`descending`、`null` 循环；回到 `null` 时恢复原始顺序。`sort(prop, order)`、`clearSort()` 可编程式控制。

## 筛选

```vue
<script setup lang="ts">
const columns = [
  {
    key: 'status',
    title: '账号状态',
    filters: [
      { text: '启用', value: 'enabled' },
      { text: '停用', value: 'disabled' }
    ],
    filterMethod: (value, row) => row.status === value
  }
];
</script>

<template>
  <Table :data="rows" :columns="columns" @filter-change="(filters) => {}" />
</template>
```

多选面板经确认生效，单选（`filterMultiple: false`）点击即生效；`filteredValue` 可受控初始值；`filter-change` 载荷以 `columnKey`（未设置时用字段名）为键。过滤后全选仅作用于可见行。

## 展开行、合计行与合并单元格

```vue
<template>
  <Table
    :data="rows"
    :columns="[{ type: 'expand', key: 'detail' }, ...columns]"
    show-summary
    :span-method="spanMethod"
    @expand-change="(row, expandedRows) => {}">
    <template #detail="{ row }">详情：{{ row.name }}</template>
  </Table>
</template>
```

展开内容来自展开列的默认插槽；`toggleRowExpansion(row, expanded?)` 可编程式控制。默认合计行为首列显示 `sumText`、数字列求和、非数字列显示 `N/A`，可用 `summaryMethod({ columns, data })` 自定义。`spanMethod({ row, column, rowIndex, columnIndex })` 返回 `[rowspan, colspan]` 或 `{ rowspan, colspan }`，返回 `0` 隐藏对应单元格。

## 树形数据与懒加载

```vue
<template>
  <Table
    :data="rows"
    :columns="columns"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    :expand-row-keys="[1]"
    @expand-change="(row, expandedRows) => {}" />
</template>
```

含子节点的行在首个普通列渲染缩进与展开开关；树形展开与行展开共用 `expandRowKeys` 并触发 `expand-change`。树形默认级联选择（`getHalfSelectionRows()` 返回半选行），`treeProps.checkStrictly` 可关闭级联。懒加载示例：

```vue
<template>
  <Table :data="rows" :columns="columns" lazy :load="loadChildren" />
</template>
```

```ts
function loadChildren(row, treeNode, resolve) {
  void fetchChildren(row.id).then((children) => resolve(children));
}
```

`load(row, { level }, resolve)` 在首次展开时调用；`updateKeyChildren(key, children)` 可更新已加载的子节点。

## 多级表头

```vue
<script setup lang="ts">
const columns = [
  {
    title: '分组',
    children: [
      { key: 'a', title: '甲', sortable: true },
      { key: 'b', title: '乙' }
    ]
  },
  { key: 'c', title: '丙' }
];
</script>

<template>
  <Table :data="rows" :columns="columns" />
</template>
```

`children` 递归分组表头，排序、筛选、插槽作用于叶子列。排序与筛选仅作用于根行；`rowKey` 在树形中必须全局唯一。

## 拖拽列宽、编辑与列显隐

```vue
<template>
  <Table
    ref="table"
    v-model:data="rows"
    :columns="[{ key: 'name', title: '姓名', editable: true }, ...columns]"
    @header-dragend="(newWidth, oldWidth, column) => {}"
    @cell-edit="({ row, value }) => {}" />
</template>
```

表头右缘可拖拽调整列宽（`resizable` 关闭，`allow-drag-last-column` 开放末列；手柄可聚焦并用左右方向键微调）；双击可编辑单元格后回车/失焦确认、`Escape` 取消，确认发出 `cell-edit` 与 `update:data`（配合 `v-model:data`），进入编辑发出 `cell-edit-start`；可用 `{字段名}-edit` 插槽或列 `editor` 自定义编辑器。`setColumnVisibility(key, visible)`、`moveColumn(fromKey, toIndex)`、`getColumnOrder()` 编程式控制列显示与顺序，不改动输入的 `columns`。

## API

### 属性

| 参数                    | 说明                                                                          | 类型                                                                   | 默认值               |
| ----------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------- |
| data                    | 表格数据                                                                      | `object[]`                                                             | `[]`                 |
| columns                 | 列定义                                                                        | `TableColumn[]`                                                        | `[]`                 |
| rowKey                  | 行唯一键字段名或取键函数，值必须稳定唯一                                      | `string \| ((row: object) => string \| number)`                        | `id`                 |
| selection               | 显示首列勾选，简写，等价于首列 `{ type: 'selection' }`                        | `boolean`                                                              | `false`              |
| loading                 | 显示加载遮罩并禁用表格交互                                                    | `boolean`                                                              | `false`              |
| height                  | 滚动区固定高度，设置后优先于 `maxHeight`                                      | `string \| number`                                                     | —                    |
| maxHeight               | 滚动区最大高度，数字按 px 解析                                                | `string \| number`                                                     | `440`                |
| emptyText               | 空态文字                                                                      | `string`                                                               | `没有符合条件的数据` |
| stripe                  | 是否显示斑马纹                                                                | `boolean`                                                              | `false`              |
| border                  | 是否显示单元格边框                                                            | `boolean`                                                              | `false`              |
| showHeader              | 是否显示表头                                                                  | `boolean`                                                              | `true`               |
| size                    | 表格尺寸                                                                      | `large` / `default` / `small`                                          | `default`            |
| fit                     | 列宽是否自适应容器                                                            | `boolean`                                                              | `true`               |
| highlightCurrentRow     | 是否高亮当前行                                                                | `boolean`                                                              | `false`              |
| currentRowKey           | 当前行键值，受控                                                              | `string \| number`                                                     | —                    |
| tableLayout             | 表格布局算法                                                                  | `fixed` / `auto`                                                       | `fixed`              |
| showOverflowTooltip     | 内容溢出时显示 Tooltip 悬浮层，对象可配 `placement/offset/popperClass/effect` | `boolean \| { placement?; offset?; popperClass?; effect? }`            | `false`              |
| showSummary             | 是否显示合计行                                                                | `boolean`                                                              | `false`              |
| sumText                 | 合计行首列文字                                                                | `string`                                                               | `合计`               |
| summaryMethod           | 自定义合计行，返回每列文本                                                    | `({ columns, data }) => (string \| number)[]`                          | —                    |
| spanMethod              | 合并单元格，返回 `[rowspan, colspan]` 或 `{ rowspan, colspan }`               | `(params) => [number, number] \| { rowspan?, colspan? } \| void`       | —                    |
| rowClassName            | 行类名，字符串或函数                                                          | `string \| (({ row, rowIndex }) => string)`                            | —                    |
| expandRowKeys           | 受控展开行键值                                                                | `(string \| number)[]`                                                 | —                    |
| reserveSelection        | 替换数据时保留选择，需稳定 `rowKey`                                           | `boolean`                                                              | `false`              |
| treeProps               | 树形字段映射与级联配置                                                        | `{ children?: string; hasChildren?: string; checkStrictly?: boolean }` | —                    |
| lazy                    | 是否懒加载子节点                                                              | `boolean`                                                              | `false`              |
| load                    | 懒加载方法，首次展开时调用                                                    | `(row, treeNode: { level: number }, resolve) => void`                  | —                    |
| resizable               | 是否可拖拽调整列宽，列 `resizable` 可覆盖                                     | `boolean`                                                              | `true`               |
| allowDragLastColumn     | 是否允许拖拽末列                                                              | `boolean`                                                              | `false`              |
| tooltipFormatter        | 溢出提示内容格式化，列 `tooltipFormatter` 优先                                | `({ row, column, cellValue, index }) => string`                        | —                    |
| rowStyle                | 行内联样式，对象或函数                                                        | `object \| (({ row, rowIndex }) => object)`                            | —                    |
| cellClassName           | 单元格类名                                                                    | `string \| (({ row, column, rowIndex, columnIndex }) => string)`       | —                    |
| cellStyle               | 单元格内联样式                                                                | `object \| (({ row, column, rowIndex, columnIndex }) => object)`       | —                    |
| headerRowClassName      | 表头行类名                                                                    | `string \| (({ rowIndex }) => string)`                                 | —                    |
| headerRowStyle          | 表头行内联样式                                                                | `object \| (({ rowIndex }) => object)`                                 | —                    |
| headerCellClassName     | 表头单元格类名                                                                | `string \| (({ rowIndex, column, columnIndex }) => string)`            | —                    |
| headerCellStyle         | 表头单元格内联样式                                                            | `object \| (({ rowIndex, column, columnIndex }) => object)`            | —                    |
| defaultExpandAll        | 是否默认展开全部可展开行                                                      | `boolean`                                                              | `false`              |
| defaultSort             | 初始排序                                                                      | `{ prop: string; order: 'ascending' \| 'descending' }`                 | —                    |
| indent                  | 树形每级缩进 px                                                               | `number`                                                               | `16`                 |
| selectOnIndeterminate   | 半选时点击全选框是否全选，否则清空                                            | `boolean`                                                              | `true`               |
| scrollbarAlwaysOn       | 滚动条占位常显                                                                | `boolean`                                                              | `false`              |
| scrollbarTabindex       | 滚动区 `tabindex`                                                             | `number`                                                               | —                    |
| flexible                | 表格宽度按内容收缩而非撑满                                                    | `boolean`                                                              | `false`              |
| nativeScrollbar         | 使用原生滚动条，关闭则用细滚动条样式                                          | `boolean`                                                              | `true`               |
| preserveExpandedContent | 收起时保留展开行内容（隐藏不断载）                                            | `boolean`                                                              | `false`              |
| tooltipEffect           | 溢出提示默认主题，列选项可覆盖                                                | `light` / `dark`                                                       | `dark`               |

### 事件

| 事件名             | 说明                              | 回调参数                                                                                    |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------- |
| select             | 用户勾选/取消行时触发             | `selection: object[]`、`row: object`                                                        |
| select-all         | 用户切换全选时触发                | `selection: object[]`                                                                       |
| selection-change   | 选中记录变化（含编程式调用）      | `rows: object[]`                                                                            |
| current-change     | 当前行变化                        | `currentRow: object \| null`、`oldCurrentRow: object \| null`                               |
| row-click          | 行点击，同时设置当前行            | `row: object`、`column: TableColumn`、`event: MouseEvent`                                   |
| row-dblclick       | 行双击                            | `row: object`、`column: TableColumn`、`event: MouseEvent`                                   |
| row-contextmenu    | 行右键                            | `row: object`、`column: TableColumn`、`event: MouseEvent`                                   |
| cell-click         | 单元格点击                        | `row: object`、`column: TableColumn`、`cell: HTMLTableCellElement`、`event: MouseEvent`     |
| cell-dblclick      | 单元格双击                        | `row: object`、`column: TableColumn`、`cell: HTMLTableCellElement`、`event: MouseEvent`     |
| cell-contextmenu   | 单元格右键，同时触发行右键        | `row: object`、`column: TableColumn`、`cell: HTMLTableCellElement`、`event: MouseEvent`     |
| cell-mouse-enter   | 鼠标进入单元格                    | `row: object`、`column: TableColumn`、`cell: HTMLTableCellElement`、`event: MouseEvent`     |
| cell-mouse-leave   | 鼠标离开单元格                    | `row: object`、`column: TableColumn`、`cell: HTMLTableCellElement`、`event: MouseEvent`     |
| header-click       | 表头点击（含排序按钮）            | `column: TableColumn`、`event: MouseEvent`                                                  |
| header-contextmenu | 表头右键                          | `column: TableColumn`、`event: MouseEvent`                                                  |
| header-dragend     | 拖拽列宽结束                      | `newWidth: number`、`oldWidth: number`、`column: TableColumn`、`event: MouseEvent`          |
| sort-change        | 排序状态变化                      | `{ column: TableColumn \| null, prop: string, order: 'ascending' \| 'descending' \| null }` |
| filter-change      | 筛选确认后触发                    | `filters: Record<string, unknown[]>`                                                        |
| expand-change      | 展开行/树节点变化                 | `row: object`、`expandedRows: object[]`                                                     |
| cell-edit-start    | 单元格进入编辑                    | `{ row, column, index }`                                                                    |
| cell-edit          | 单元格编辑确认                    | `{ row, column, index, value, oldValue }`                                                   |
| cell-edit-cancel   | 单元格编辑取消                    | `{ row, column, index }`                                                                    |
| update:data        | 编辑后新数据，支持 `v-model:data` | `data: object[]`                                                                            |
| scroll             | 滚动区滚动                        | `{ scrollLeft: number, scrollTop: number }`                                                 |

勾选框与展开按钮单元格会阻止冒泡，不触发行列点击事件。

### 插槽

| 名称              | 说明                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| 列字段名          | 自定义单元格，参数 `{ row, column, index, $index }`，优先于 `formatter`；展开列的该插槽渲染展开区内容   |
| `{字段名}-header` | 自定义表头标签，参数 `{ column, $index }`，排序与筛选控件保留                                           |
| `{字段名}-edit`   | 自定义编辑器，参数 `{ row, column, value, index, confirm, cancel, update }`，优先于 `editor` 与默认输入 |
| empty             | 替换默认空态                                                                                            |
| append            | 表格末尾附加内容                                                                                        |

### 实例方法

| 方法                               | 说明                                    | 返回值     |
| ---------------------------------- | --------------------------------------- | ---------- |
| clearSelection()                   | 清空选择并发出 `selection-change`       | `void`     |
| getSelectionRows()                 | 返回当前选中记录                        | `object[]` |
| getHalfSelectionRows()             | 返回树形半选记录                        | `object[]` |
| toggleRowSelection(row, selected?) | 切换/设置行选中，省略 `selected` 时取反 | `void`     |
| toggleAllSelection()               | 切换可见行全选                          | `void`     |
| toggleRowExpansion(row, expanded?) | 切换/设置行展开                         | `void`     |
| setCurrentRow(row?)                | 设置当前行，传空清空                    | `void`     |
| clearSort()                        | 清除排序并恢复原始顺序                  | `void`     |
| sort(prop, order)                  | 编程式设置排序                          | `void`     |
| doLayout()                         | 兼容方法，纯 CSS 布局无需调用           | `void`     |
| scrollTo({ top?, left? })          | 滚动到指定位置                          | `void`     |
| setScrollTop(top)                  | 设置纵向滚动                            | `void`     |
| setScrollLeft(left)                | 设置横向滚动                            | `void`     |
| updateKeyChildren(key, children)   | 更新懒加载节点的子节点                  | `void`     |
| setColumnVisibility(key, visible)  | 设置列显示/隐藏                         | `void`     |
| moveColumn(fromKey, toIndex)       | 移动顶层列/分组到指定位置               | `void`     |
| getColumnOrder()                   | 返回当前顶层列键顺序                    | `string[]` |
| clearFilter(keys?)                 | 清空筛选，不传参则清空全部              | `void`     |

### TableColumn 列定义

| 字段                | 说明                                                                                | 类型                                                        |
| ------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| type                | 列类型：`default` 普通列、`selection` 勾选列、`index` 序号列、`expand` 展开列       | `default` / `selection` / `index` / `expand`                |
| index               | 序号列自定义序号，数字为起点偏移，函数接收 `0` 起始下标                             | `number \| ((index: number) => number \| string)`           |
| columnKey           | 列标识，用于 `filter-change` 键名与 `sort(prop)` 查找                               | `string`                                                    |
| key                 | 字段名及单元格插槽名，与 `prop` / `property` 任选其一                               | `string`                                                    |
| prop                | Element Plus 风格，等价于 `key`                                                     | `string`                                                    |
| property            | Element Plus 旧别名，等价于 `prop`                                                  | `string`                                                    |
| title               | 表头文字，与 `label` 任选其一                                                       | `string`                                                    |
| label               | Element Plus 风格，等价于 `title`                                                   | `string`                                                    |
| width               | 列宽，固定列请显式指定，可传数字或 CSS 高度字符串                                   | `string \| number`                                          |
| minWidth            | 最小列宽，可传数字或 CSS 宽度字符串                                                 | `string \| number`                                          |
| fixed               | 固定列，`true` 等价于 `left`                                                        | `boolean` / `left` / `right`                                |
| sortable            | `true` 客户端自动排序，`custom` 只发事件由页面排序                                  | `boolean` / `custom`                                        |
| sortMethod          | 自定义排序比较，定义升序规则，降序自动取反                                          | `(a, b) => number`                                          |
| sortBy              | 自动排序依据的字段或取值函数                                                        | `string \| string[] \| ((row, index) => unknown)`           |
| sortOrders          | 点击循环的顺序                                                                      | `('ascending' \| 'descending' \| null)[]`                   |
| formatter           | 字段文本格式化                                                                      | `(row, column, cellValue, index) => string`                 |
| filters             | 筛选项                                                                              | `{ text: string; value: unknown }[]`                        |
| filterMultiple      | 是否多选筛选                                                                        | `boolean`                                                   |
| filterMethod        | 筛选判断                                                                            | `(value, row, column) => boolean`                           |
| filteredValue       | 受控筛选项，变化时同步内部状态                                                      | `unknown[]`                                                 |
| filterPlacement     | 筛选弹层位置                                                                        | `top` / `bottom` / `left` / `right`                         |
| filterClassName     | 筛选弹层类名                                                                        | `string`                                                    |
| filterIcon          | 自定义筛选图标，可用 `{字段名}-filter-icon` 插槽代替                                | `(params: { column }) => VNode`                             |
| showOverflowTooltip | 本列溢出提示，布尔或 Tooltip 选项对象，优先于表格级                                 | `boolean \| { placement?; offset?; popperClass?; effect? }` |
| className           | 单元格类名                                                                          | `string`                                                    |
| labelClassName      | 表头单元格类名                                                                      | `string`                                                    |
| selectable          | 行是否可勾选，不可选行禁用并跳过级联                                                | `(row, index) => boolean`                                   |
| reserveSelection    | 列级保留选择，任一勾选列或表格级为 `true` 即保留                                    | `boolean`                                                   |
| align               | 单元格对齐方式                                                                      | `left` / `center` / `right`                                 |
| headerAlign         | 表头对齐方式，省略时使用 `align`                                                    | `left` / `center` / `right`                                 |
| children            | 多级表头子列，递归分组，排序筛选作用于叶子列                                        | `TableColumn[]`                                             |
| resizable           | 本列是否可拖拽调整宽度，优先于表格级                                                | `boolean`                                                   |
| tooltipFormatter    | 本列溢出提示内容格式化，优先于表格级                                                | `({ row, column, cellValue, index }) => string`             |
| editable            | 双击进入单元格编辑，回车/失焦确认、`Escape` 取消                                    | `boolean`                                                   |
| editor              | 自定义编辑器渲染函数，参数 `{ row, column, value, index, confirm, cancel, update }` | `(params) => VNode`                                         |
| visible             | 列是否显示，可用 `setColumnVisibility` 运行时切换                                   | `boolean`                                                   |

`TableColumn`、`SortChange` 可从 `cool-design` 导入；`TableSize`、`TableColumnType`、`TableSortOrder`、`TableFilterItem`、`TableSummaryMethod`、`TableSpanMethod`、`TableTreeProps`、`TableLoadMethod`、`TableRowClassName`、`TableRowStyle`、`TableCellClassName`、`TableCellStyle`、`TableEditor`、`TableOverflowTooltipOptions` 等可从 `cool-design/table` 导入。

## 升级说明

第二轮实现将 `sort-change` 载荷由 `{ key, order: 'asc' \| 'desc' \| null }` 改为 Element Plus 官方形状 `{ column, prop, order: 'ascending' \| 'descending' \| null }`，`sortable: true` 改为客户端自动排序；远程排序请改用 `sortable: 'custom'` 并在事件中自行处理。

## 行为约定

- `width` / `minWidth` 支持数字或 CSS 宽度字符串；固定列请显式指定 `width`，非 px 字符串的固定偏移按 `minWidth` 数字或 `140` 估算。
- `height` 与 `maxHeight` 同时设置时 `height` 优先。
- 筛选面板为简化实现：多选经确认/重置生效，单选点击即生效；无 `filterMethod` 的列确认后仅发出事件不过滤。
- 溢出提示使用 Tooltip 组件悬浮层，自定义插槽单元格不加提示，可用 `tooltipFormatter` 自定义内容。
- `select` / `select-all` 仅用户点击触发；编程式选择方法只触发 `selection-change`。
- 排序与筛选仅作用于根行；`rowKey` 在树形中必须全局唯一；树形展开与行展开共用 `expandRowKeys`。
- 拖拽列宽最小 `40px`，手柄支持鼠标拖拽与方向键调整，拖拽中禁选文本；隐藏列不参与筛选/排序/合计；`moveColumn` 移动顶层列或分组。
- 溢出提示使用 Tooltip 组件悬浮层；编辑单元格默认文本输入，可用 `{字段名}-edit` 插槽或 `editor` 自定义，编辑值均为字符串，需监听 `update:data` 更新数据。
- 不可选行禁用勾选并跳过树形级联；`flexible` 使表格宽度按内容收缩；`preserveExpandedContent` 保留收起的展开行内容。

## 实现状态

普通 `Table` 已覆盖本组件文档列出的 Element Plus Table 常用属性、事件、插槽、树形数据、展开行、选择、排序、筛选、列宽调整、列移动、编辑、合计与虚拟滚动相关能力。
