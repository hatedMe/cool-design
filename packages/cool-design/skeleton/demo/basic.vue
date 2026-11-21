<script setup lang="ts">
import { ref } from 'vue';
import { Button, Skeleton, Space } from '../../index';
const loading = ref(true);
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Button @click="loading = !loading">{{ loading ? '显示内容' : '显示骨架' }}</Button>
    <Skeleton :loading="loading" animated avatar title :rows="3">
      <p>数据加载完成，这里是真实内容。</p>
    </Skeleton>
  </Space>
</template>
