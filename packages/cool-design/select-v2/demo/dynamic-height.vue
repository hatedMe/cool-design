<script setup lang="ts">
import { ref } from 'vue';
import { SelectV2 } from '../../index';
const value = ref();
const options = Array.from({ length: 1000 }, (_, value) => ({ value, label: `选项 ${value}` }));
</script>
<template>
  <SelectV2 v-model="value" :options="options" :estimated-option-height="40" :fit-input-width="360" scrollbar-always-on>
    <template #prefix>选择</template>
    <template #default="{ item }"><div style="padding: 8px 0">{{ item.label }}<p v-if="Number(item.value) % 3 === 0">额外一行内容</p></div></template>
  </SelectV2>
</template>
