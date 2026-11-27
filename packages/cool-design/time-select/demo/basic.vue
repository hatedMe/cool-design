<script setup lang="ts">
import { ref } from 'vue';
import { TimeSelect } from '../../index';

const time = ref('');
</script>

<template>
  <TimeSelect v-model="time" start="09:00" step="00:30" end="18:00" placeholder="选择时间" />
</template>
