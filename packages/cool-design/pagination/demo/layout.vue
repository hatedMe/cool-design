<script setup lang="ts">
import { ref } from 'vue';
import { Pagination, Space } from '../../index';
const page = ref(5);
const pageCount = ref(20);
const smallPage = ref(2);
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Pagination v-model:current-page="page" :total="400" background />
    <Pagination
      v-model:current-page="page"
      :page-count="pageCount"
      layout="prev, pager, next, jumper"
      prev-text="上一页"
      next-text="下一页" />
    <Pagination v-model:current-page="smallPage" :total="120" small layout="prev, pager, next" />
  </Space>
</template>
