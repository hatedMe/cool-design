<script setup lang="ts">
import ForwardingSpace from './ForwardingSpace.vue';

defineProps<{ prefixCls: string }>();
</script>

<template>
  <ForwardingSpace :prefix-cls="prefixCls">
    <slot />
  </ForwardingSpace>
</template>

<style scoped>
:slotted(.action) {
  border-color: rgb(55, 85, 115);
}
</style>
