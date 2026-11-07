<script setup lang="ts">
import { ref } from 'vue';

const value = ref(3);
const halfValue = ref(2.5);
const disabledValue = ref(4);
</script>

<template>
  <div class="rate-demo">
    <i-rate v-model="value" />
    <i-rate v-model="halfValue" allow-half show-text :texts="['很差', '较差', '一般', '较好', '很好']" />
    <i-rate :model-value="3" size="large" show-score score-template="{value} 分" />
    <i-rate :model-value="4" :colors="['#f56c6c', '#e6a23c', '#67c23a']" />
    <i-rate v-model="disabledValue" disabled />
    <i-rate v-model="value" clearable />
  </div>
</template>
