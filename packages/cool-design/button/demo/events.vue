<script setup lang="ts">
import { ref } from 'vue';
import { Button, Space } from '../../index';
const count = ref(0);
</script>

<template>
  <Space>
    <Button type="primary" @click="count++">点击操作</Button>
    <span role="status">已点击 {{ count }} 次</span>
  </Space>
</template>
