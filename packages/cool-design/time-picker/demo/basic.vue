<script setup lang="ts">
import { ref } from 'vue';
import { TimePicker } from '../../index';

const value = ref(null);
const range = ref([null, null]);
const disabledHours = () => [0, 1, 2, 3, 4, 5];
</script>
<template>
  <div>
    <TimePicker v-model="value" clearable placeholder="选择时间" />
    <TimePicker v-model="range" is-range range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
    <TimePicker v-model="value" format="HH:mm" value-format="HH:mm" :disabled-hours="disabledHours" />
  </div>
</template>
