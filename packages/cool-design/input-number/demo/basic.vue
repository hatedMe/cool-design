<template>
  <div class="demo-input-number">
    <InputNumber v-model="value" :min="0" :max="10" />
    <InputNumber v-model="decimal" :step="0.1" :precision="2" controls-position="right" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { InputNumber } from '../../index';

const value = ref(1);
const decimal = ref(1.2);
</script>
