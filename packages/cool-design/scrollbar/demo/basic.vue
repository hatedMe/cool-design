<script setup lang="ts">
import { ref } from 'vue';
import { Scrollbar, type ScrollbarDirection } from '../../index';

const direction = ref<ScrollbarDirection>();
const labels: Record<ScrollbarDirection, string> = {
  top: '上方',
  bottom: '下方',
  left: '左侧',
  right: '右侧'
};
</script>

<template>
  <Scrollbar height="200px" :tabindex="0" :distance="24" @end-reached="direction = $event">
    <p v-for="n in 20" :key="n">内容 {{ n }}</p>
  </Scrollbar>
  <p role="status">{{ direction ? `到达${labels[direction]}边缘范围` : '滚动至边缘以查看提示' }}</p>
</template>
