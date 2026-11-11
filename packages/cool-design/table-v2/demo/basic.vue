<script setup lang="ts">
import { ref } from 'vue';
import { Button, Space } from '../../index';
import { TableV2 } from '../index';
import type { TableV2Column } from '../index';
const columns: TableV2Column[] = [
  { key: 'id', dataKey: 'id', title: '编号', width: 120, sortable: true, fixed: 'left' },
  { key: 'name', dataKey: 'name', title: '姓名', width: 200 },
  { key: 'department', dataKey: 'department', title: '所属部门', width: 200 }
];
const data = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  department: ['产品设计', '研发中心', '运营支持'][i % 3]
}));
const table = ref<{ scrollTo(options?: { top?: number; left?: number }): void }>();
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Button @click="table?.scrollTo({ top: 8000 })">滚动到第 200 行</Button>
    <TableV2 ref="table" :columns="columns" :data="data" :width="'100%'" :height="360" />
  </Space>
</template>
