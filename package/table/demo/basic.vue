<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Space, Table, Tag } from "../../index";
import type { SortChange, TableColumn } from "../../index";
const records = [
  { id: 1001, name: "陈晨", department: "产品设计", status: "启用" },
  { id: 1002, name: "林沐", department: "研发中心", status: "启用" },
  { id: 1003, name: "周远", department: "运营支持", status: "停用" }
];
const columns: TableColumn[] = [
  { key: "id", title: "用户 ID", width: 140, fixed: "left", sortable: true },
  { key: "name", title: "姓名", width: 140 },
  { key: "department", title: "所属部门", width: 180 },
  { key: "status", title: "账号状态", width: 140 },
  { key: "action", title: "操作", width: 160, fixed: "right" }
];
const sort = ref<SortChange>({ key: "", order: null });
const selected = ref<object[]>([]);
const action = ref("");
const table = ref<{ clearSelection(): void }>();
const rows = computed(() =>
  sort.value.order ? [...records].sort((a, b) => (a.id - b.id) * (sort.value.order === "asc" ? 1 : -1)) : records
);
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Space>
      <span>已选择 {{ selected.length }} 条</span>
      <Button @click="table?.clearSelection()">清空选择</Button>
      <span role="status">{{ action }}</span>
    </Space>
    <Table
      ref="table"
      :data="rows"
      :columns="columns"
      selection
      :max-height="300"
      @selection-change="selected = $event"
      @sort-change="sort = $event">
      <template #status="{ row }">
        <Tag :type="row.status === '启用' ? 'success' : 'info'">
          {{ row.status }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Button size="small" @click="action = `正在查看 ${row.name}`">查看详情</Button>
      </template>
    </Table>
  </Space>
</template>
