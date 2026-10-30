<script setup lang="ts">
import { Timeline } from '../../index';
const items = [
  { timestamp: '2026-01-01', type: 'success' as const },
  { timestamp: '2026-02-01', type: 'primary' as const }
];
</script>
<template><Timeline :items="items" /></template>
