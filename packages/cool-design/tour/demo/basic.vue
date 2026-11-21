<script setup lang="ts">
import { ref } from 'vue';
import { Button, Tour } from '../../index';

const open = ref(false);
const steps = [
  { target: '#tour-target', title: '第一步', description: '聚焦目标元素。' },
  { title: '第二步', description: '没有目标时居中显示。', placement: 'center' as const }
];
</script>

<template>
  <Button type="primary" @click="open = true">开始引导</Button>
  <div id="tour-target" style="margin-top: 16px">引导目标</div>
  <Tour v-model="open" :steps="steps" />
</template>
