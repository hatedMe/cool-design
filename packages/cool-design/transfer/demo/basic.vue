<script setup lang="ts">
import { ref } from 'vue';
import { Transfer } from '../../index';
const value = ref<(string | number)[]>([]);
const data = [
  { key: 1, label: '选项一' },
  { key: 2, label: '选项二' }
];
</script>
<template>
  <Transfer v-model="value" :data="data" filterable />
</template>
