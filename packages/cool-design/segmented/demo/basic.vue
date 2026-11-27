<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from '../../index';

const view = ref('列表');
</script>

<template>
  <Segmented v-model="view" :options="['列表', '卡片', '日历']" />
</template>
