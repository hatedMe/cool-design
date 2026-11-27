<script setup lang="ts">
import { ref } from 'vue';
import { Cascader } from '../../index';

const value = ref<(string | number)[][]>([]);
const options = [
  {
    value: 'zhinan',
    label: '指南',
    children: [
      {
        value: 'sheji',
        label: '设计',
        children: [
          { value: 'yizhi', label: '一致' },
          { value: 'fankui', label: '反馈' }
        ]
      },
      { value: 'kaifa', label: '开发' }
    ]
  },
  {
    value: 'zujian',
    label: '组件',
    children: [
      { value: 'form', label: 'Form 表单' },
      { value: 'select', label: 'Select 选择器' }
    ]
  }
];
</script>

<template>
  <Cascader
    v-model="value"
    :options="options"
    multiple
    filterable
    clearable
    collapse-tags
    collapse-tags-tooltip
  />
</template>
