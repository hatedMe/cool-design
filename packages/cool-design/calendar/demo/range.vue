<script setup lang="ts">
import { ref } from 'vue';
import { Calendar } from '../../index';
const value = ref(new Date(2026, 10, 5));
const range = [new Date(2026, 10, 2), new Date(2026, 10, 8)];
</script>
<template>
  <div style="display: grid; gap: 16px">
    <Calendar v-model="value" controller-type="select" />
    <Calendar :range="range" />
  </div>
</template>
