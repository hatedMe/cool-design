<script setup lang="ts">
import { ref } from 'vue';
import { Input, Space } from '../../index';
const value = ref('可清空内容');
</script>

<template>
  <Space direction="vertical" align="start">
    <Input v-model="value" clearable placeholder="可清空" />
    <Input model-value="只读内容" readonly />
    <Input model-value="禁用内容" disabled />
  </Space>
</template>
