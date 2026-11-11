<script setup lang="ts">
import { ref } from 'vue';
import { Button, Space, Table } from '../../index';
import type { TableColumn } from '../../index';
const columns: TableColumn[] = [
  { key: 'name', title: '姓名（双击编辑）', width: 180, editable: true },
  { key: 'department', title: '所属部门', width: 180, showOverflowTooltip: true },
  { key: 'status', title: '账号状态', width: 140 }
];
const data = ref([
  { id: 1001, name: '陈晨', department: '产品设计与用户体验研究中心', status: '启用' },
  { id: 1002, name: '林沐', department: '研发中心', status: '启用' }
]);
const table = ref<{
  setColumnVisibility(key: string, visible: boolean): void;
  moveColumn(fromKey: string, toIndex: number): void;
}>();
const showStatus = ref(true);
function toggleStatus() {
  showStatus.value = !showStatus.value;
  table.value?.setColumnVisibility('status', showStatus.value);
}
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Space>
      <Button @click="toggleStatus">{{ showStatus ? '隐藏' : '显示' }}状态列</Button>
      <Button @click="table?.moveColumn('status', 0)">状态列前移</Button>
    </Space>
    <Table ref="table" v-model:data="data" :columns="columns" allow-drag-last-column @cell-edit="() => {}" />
  </Space>
</template>
