<script setup lang="ts">
import { ref } from 'vue';
import { Pagination, Space } from '../../index';
const page = ref(1);
const size = ref(10);
function changeSize(value: number) {
  size.value = value;
  page.value = 1;
}
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Pagination v-model:current-page="page" :page-size="size" :total="156" @update:page-size="changeSize" />
    <span role="status">当前第 {{ page }} 页，每页 {{ size }} 条</span>
  </Space>
</template>
