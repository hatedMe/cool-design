<script setup lang="ts">
import { ref } from 'vue';
import { Cascader } from '../../index';

const value = ref<(string | number)[] | null>(null);
const options = [
  {
    value: 'frontend',
    label: '前端',
    children: [
      { value: 'vue', label: 'Vue', children: [{ value: 'pinia', label: 'Pinia' }, { value: 'router', label: 'Vue Router' }] },
      { value: 'react', label: 'React' }
    ]
  },
  {
    value: 'backend',
    label: '后端',
    children: [{ value: 'node', label: 'Node.js' }, { value: 'go', label: 'Golang' }]
  }
];
</script>

<template>
  <Cascader v-model="value" :options="options" filterable placeholder="搜索并选择" style="max-width: 320px" />
</template>
