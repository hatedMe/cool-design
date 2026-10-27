<script setup lang="ts">
import { ref } from 'vue';
import { Select, SelectOption, Space } from '../../index';
const status = ref<number>();
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16" style="max-width: 360px">
    <Select v-model="status" clearable placeholder="请选择账号状态" aria-label="账号状态">
      <SelectOption :value="1" label="启用" />
      <SelectOption :value="0" label="停用" />
    </Select>
    <span role="status">当前值：{{ status ?? '未选择' }}；类型：{{ typeof status }}</span>
    <Select disabled placeholder="禁用选择器" aria-label="禁用示例" />
  </Space>
</template>
