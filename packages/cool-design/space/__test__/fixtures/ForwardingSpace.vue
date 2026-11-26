<script setup lang="ts">
import Space from '../..';

defineProps<{ prefixCls: string }>();
</script>

<template>
  <Space :prefix-cls="prefixCls">
    <slot />
    <button class="action sibling">Sibling</button>
  </Space>
</template>

<style scoped>
:slotted(.action) {
  color: rgb(35, 60, 90);
}
</style>
