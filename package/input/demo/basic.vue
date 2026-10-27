<script setup lang="ts">
import { ref } from 'vue';
import { Input, Space } from '../../index';
const name = ref('');
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16" style="max-width: 360px">
    <Input v-model="name" clearable placeholder="请输入用户名称" aria-label="用户名称" />
    <span role="status">当前值：{{ name || '未输入' }}</span>
    <Input model-value="只读内容" readonly aria-label="只读示例" />
    <Input model-value="禁用内容" disabled aria-label="禁用示例" />
  </Space>
</template>
