<script setup lang="ts">
import { ref } from "vue";
import { Space, Switch, Table } from "../../index";
const loading = ref(false);
const columns = [
  { key: "name", title: "用户名称" },
  { key: "email", title: "联系邮箱" }
];
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Switch v-model="loading">显示加载遮罩</Switch>
    <Table :data="[]" :columns="columns" :loading="loading" stripe border empty-text="暂无用户，请调整查询条件" />
  </Space>
</template>
