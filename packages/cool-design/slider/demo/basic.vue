<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '../../index';

const value = ref(30);
const range = ref([20, 70]);
const marks = { 0: '0', 50: '中点', 100: '100' };
</script>

<template>
  <Slider v-model="value" show-input :marks="marks" show-stops />
  <Slider v-model="range" range show-tooltip />
  <Slider v-model="value" vertical height="200px" />
</template>
