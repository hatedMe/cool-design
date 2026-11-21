<script setup lang="ts">
import { ref } from 'vue';
import { CascaderPanel } from '../../index';

const value = ref(null);
const options = [
  {
    value: 'guide',
    label: '指南',
    children: [
      { value: 'install', label: '安装' },
      { value: 'usage', label: '使用' }
    ]
  },
  { value: 'about', label: '关于' }
];
</script>

<template>
  <CascaderPanel v-model="value" :options="options" />
</template>
