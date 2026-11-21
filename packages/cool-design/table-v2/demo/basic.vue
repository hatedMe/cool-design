<script setup lang="ts">
import { h, ref } from 'vue';
import { Button, Space } from '../../index';
import { TableV2 } from '../index';
import type { TableV2Column, TableV2Instance } from '../index';
const selectedName = ref('');
const columns: TableV2Column[] = [
  { key: 'id', dataKey: 'id', title: '编号', width: 120, sortable: true, fixed: 'left' },
  {
    key: 'name',
    dataKey: 'name',
    width: 200,
    headerCellRenderer: ({ headerIndex }) => h('span', headerIndex === 0 ? '姓名' : '点击姓名选中'),
    cellRenderer: ({ cellData, rowIndex }) => rowIndex < 0
      ? h('strong', String(cellData))
      : h('button', {
          type: 'button',
          onClick: () => { selectedName.value = String(cellData); }
        }, String(cellData))
  },
  { key: 'department', dataKey: 'profile.department', title: '所属部门', width: 200 }
];
const data = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  profile: { department: ['产品设计', '研发中心 · 负责跨团队需求分析、组件研发及体验问题跟进', '运营支持'][i % 3] }
}));
const fixedData = [{ id: '汇总', name: '共 2000 人', profile: { department: '全部部门' } }];
const table = ref<TableV2Instance>();
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <div>
      <Button @click="table?.scrollToRow(199, 'smart')">滚动到第 200 行</Button>
      <span v-if="selectedName" aria-live="polite"> 已选中 {{ selectedName }}</span>
    </div>
    <TableV2
      ref="table"
      :columns="columns"
      :data="data"
      :fixed-data="fixedData"
      :header-height="[32, 28]"
      :height="360"
      :estimated-row-height="50"
      :row-props="({ rowIndex }) => ({ 'data-row-index': rowIndex })" />
  </Space>
</template>
