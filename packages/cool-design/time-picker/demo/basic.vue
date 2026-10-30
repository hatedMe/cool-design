<script setup lang="ts">
import { ref } from 'vue';
import { TimePicker } from '../../index';
const value = ref(null);
</script>
<template>
  <TimePicker v-model="value" clearable placeholder="选择时间" />
</template>
