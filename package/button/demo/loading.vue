<script setup lang="ts">
import { Button, Space } from "../../index";
</script>

<template>
  <Space>
    <Button type="primary" loading>加载中</Button>
    <Button type="primary" loading>
      <template #loading>
        <span class="custom-loading" aria-hidden="true">◌</span>
      </template>
      自定义加载内容
    </Button>
  </Space>
</template>

<style scoped>
.custom-loading {
  display: inline-block;
  margin-right: 6px;
  animation: button-spin 1s linear infinite;
}
@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
