<script setup lang="ts">
import { ref } from 'vue';
import { SelectV2 } from '../../index';

const value = ref<(string | number)[]>([]);
const options = [
  {
    label: '热门城市',
    options: [
      { value: 'shanghai', label: '上海' },
      { value: 'beijing', label: '北京' }
    ]
  },
  {
    label: '其他城市',
    options: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'chengdu', label: '成都' }
    ]
  }
];
</script>

<template>
  <SelectV2 v-model="value" :options="options" multiple filterable placeholder="选择城市" style="max-width: 360px" />
</template>
