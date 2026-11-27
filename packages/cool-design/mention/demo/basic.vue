<script setup lang="ts">
import { ref } from 'vue';
import { Mention } from '../../index';

const text = ref('');
const options = [
  { value: 'Fuphoenixes', label: 'Fuphoenixes' },
  { value: 'kooriookami', label: 'kooriookami' },
  { value: 'Jeremy', label: 'Jeremy' }
];
</script>

<template>
  <Mention v-model="text" :options="options" placeholder="输入 @ 提及某人" style="max-width: 360px" />
</template>
