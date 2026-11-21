<script setup lang="ts">
import { ref } from 'vue';
import { Button, Skeleton, Space } from '../../index';
const loading = ref(true);
let timer: ReturnType<typeof setTimeout> | undefined;
function reload() {
  loading.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    loading.value = false;
  }, 1200);
}
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Button type="primary" @click="reload">重新加载（节流 500ms）</Button>
    <Skeleton :loading="loading" :throttle="500" :count="2" animated :rows="2">
      <p>两块骨架共用一份内容，短于 500ms 的加载不会闪烁骨架屏。</p>
    </Skeleton>
  </Space>
</template>
