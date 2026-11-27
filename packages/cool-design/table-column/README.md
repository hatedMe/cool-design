# TableColumn 表格列

### 介绍

在 Table 中声明列，属性、事件及插槽命名对齐 Element Plus。可声明普通列、选择列、序号列、展开列及嵌套分组。

## 基础用法

```vue
<script setup lang="ts">
import { Table, TableColumn } from 'cool-design';

const data = [{ id: 1, name: '陈晨' }];
</script>

<template>
  <Table :data="data">
    <TableColumn prop="name" label="姓名">
      <template #default="{ row }">{{ row.name }}</template>
    </TableColumn>
  </Table>
</template>
```

## API

### 属性

| 参数                 | 说明              | 类型                                         | 默认值    |
| -------------------- | ----------------- | -------------------------------------------- | --------- |
| type                 | 列类型            | `default` / `selection` / `index` / `expand` | `default` |
| prop                 | 行数据字段        | `string`                                     | —         |
| label                | 列标题            | `string`                                     | —         |
| width / min-width    | 列宽 / 最小列宽   | `string` / `number`                          | —         |
| fixed                | 固定列            | `boolean` / `left` / `right`                 | `false`   |
| sortable             | 排序方式          | `boolean` / `custom`                         | `false`   |
| render-header        | 返回 Vue VNode 的表头回调，优先于 `header` 插槽 | `(params: TableHeaderRenderParams) => VNode` | — |
| align / header-align | 单元格 / 表头对齐 | `left` / `center` / `right`                  | `left`    |

其余属性与 [Table 列配置](#/components/table) 一致，包括 `formatter`、`filters`、`filter-method`、`filtered-value`、`selectable`、`reserve-selection`、`show-overflow-tooltip` 等。配置式列对象的 `children` 对应声明式分组列的默认插槽，将子 `TableColumn` 嵌套在未设置 `prop`、`property` 和 `type` 的父 `TableColumn` 内。支持动态增删和属性更新。将列直接声明在 Table 或无字段、无类型的分组列中，可配合 `v-if`、`v-for` 和 Fragment。自定义包装组件内部的列属于该组件的渲染内容。

`render-header` 接收 `column`、当前表头行内的 `$index`、含 `states.columns` 和 `states.data` 的 `store`，以及提供表格实例方法和 `$props` 的 `_self`。状态引用会跟随表格更新，数组及其元素与表格内部状态共享。没有回调时依次使用 `header` 插槽和 `label`。

无字段操作列显式设置 `type="default"` 后，默认插槽仅在正文中获取行作用域。未指定类型的模板插槽可能在分组检查时被无参调用。

### 事件

列的排序、筛选、选择等事件统一由 Table 发出，参见 Table 事件。

### 插槽

| 名称    | 说明                                     | 参数                      |
| ------- | ---------------------------------------- | ------------------------- |
| default | 单元格内容；分组列中用于嵌套 TableColumn | `{ row, column, $index }` |
| header  | 自定义表头                               | `{ column, $index }`      |
| expand | 自定义展开列按钮的图标 | `{ expanded, expandable }` |
