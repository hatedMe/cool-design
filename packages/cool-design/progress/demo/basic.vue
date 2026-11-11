<script setup lang="ts">
import { ref } from 'vue';
import { Progress } from '../../index';

const percentage = ref(40);
const customColor = (p: number) => (p < 50 ? '#f56c6c' : p < 80 ? '#e6a23c' : '#67c23a');
const stops = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#67c23a', percentage: 80 }
];
</script>

<template>
  <div class="progress-demo">
    <Progress :percentage="percentage" />
    <Progress :percentage="100" status="success" />
    <Progress :percentage="70" status="warning" striped />
    <Progress :percentage="60" :stroke-width="18" text-inside />
    <Progress :percentage="50" indeterminate striped striped-flow />
    <Progress :percentage="percentage" :color="customColor" />
    <Progress :percentage="30" :color="stops" />
    <Progress type="circle" :percentage="70" />
    <Progress type="dashboard" :percentage="50" />
    <Progress type="circle" :percentage="100" status="success" />
  </div>
</template>

<style scoped>
.progress-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}
</style>
