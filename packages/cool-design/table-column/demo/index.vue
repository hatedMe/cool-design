<script setup lang="ts">
import { h } from 'vue';
import { Table, TableColumn } from '../../index';
import type { TableHeaderRenderParams } from '../../index';

const data = [
  { id: 1, name: '陈晨', department: '产品设计' },
  { id: 2, name: '林沐', department: '研发中心' }
];
const renderName = ({ column }: TableHeaderRenderParams) => h('strong', column.label);
const rowExpandable = (row: object) => 'department' in row && row.department === '产品设计';
</script>

<template>
  <Table :data="data" :row-expandable="rowExpandable" border>
    <TableColumn type="selection" width="48" />
    <TableColumn type="expand" width="50">
      <template #default="{ row }">部门详情：{{ row.department }}</template>
    </TableColumn>
    <TableColumn type="index" label="序号" width="60" />
    <TableColumn label="用户信息">
      <TableColumn prop="name" label="姓名" :render-header="renderName">
        <template #default="{ row, $index }">{{ $index + 1 }}. {{ row.name }}</template>
      </TableColumn>
      <TableColumn prop="department" label="所属部门" />
    </TableColumn>
  </Table>
</template>
