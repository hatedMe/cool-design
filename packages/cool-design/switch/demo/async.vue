<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '../../index';

const value = ref(false);
const saving = ref(false);

const beforeChange = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  saving.value = false;
  return window.confirm('确认切换吗？');
};
</script>

<template>
  <Switch
    v-model="value"
    :loading="saving"
    :before-change="beforeChange"
    active-text="已开启"
    inactive-text="已关闭"
    aria-label="异步切换" />
</template>
