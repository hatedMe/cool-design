<script setup lang="ts">
import { ref } from 'vue';
import { Space, Switch } from '../../index';
const enabled = ref(true);
</script>

<template>
  <Space :size="24">
    <Switch v-model="enabled">
      {{ enabled ? '账号已启用' : '账号已停用' }}
    </Switch>
    <Switch disabled>禁用开关</Switch>
  </Space>
</template>
