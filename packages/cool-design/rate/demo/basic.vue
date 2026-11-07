<script setup lang="ts">
import { ref } from 'vue';
import { Rate } from '../../index';

const value = ref(3);
const halfValue = ref(2.5);
const disabledValue = ref(4);
const customIcon = 'icon-collection_fill';
</script>

<template>
  <div class="rate-demo">
    <Rate :model-value="3" :icons="[customIcon, 'icon-browse_fill', 'icon-coupons_fill']" />
    <Rate v-model="value" />
    <Rate v-model="halfValue" allow-half show-text :texts="['很差', '较差', '一般', '较好', '很好']" />
    <Rate :model-value="3" size="large" show-score score-template="{value} 分" />
    <Rate :model-value="4" :colors="['#f56c6c', '#e6a23c', '#67c23a']" />
    <Rate v-model="disabledValue" disabled />
    <Rate v-model="value" clearable />
  </div>
</template>
