<script setup lang="ts">
import { ref } from 'vue';
import { SelectV2 } from '../../index';

const value = ref<unknown>();
const options = Array.from({ length: 200 }, (_, index) => ({ value: index, label: `选项 ${index + 1}` }));
</script>

<template>
  <SelectV2 v-model="value" :options="options" filterable placeholder="请选择（200 项）" />
</template>
