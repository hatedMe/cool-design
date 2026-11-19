<script setup lang="ts">
import { Table, TableColumn } from '../../index';

const data = [
  { id: 1, name: '陈晨', department: '产品设计' },
  { id: 2, name: '林沐', department: '研发中心' }
];
</script>

<template>
  <Table :data="data" border>
    <TableColumn type="selection" width="48" />
    <TableColumn type="index" label="序号" width="60" />
    <TableColumn label="用户信息">
      <TableColumn prop="name" label="姓名">
        <template #header="{ column }">{{ column.label }}</template>
        <template #default="{ row, $index }">{{ $index + 1 }}. {{ row.name }}</template>
      </TableColumn>
      <TableColumn prop="department" label="所属部门" />
    </TableColumn>
  </Table>
</template>
