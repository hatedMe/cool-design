<script setup lang="ts">
import { ref } from 'vue';
import { Space, Switch } from '../../index';

const enabled = ref(true);
const promptEnabled = ref(true);
</script>

<template>
  <Space direction="vertical" :size="16">
    <Switch v-model="enabled" aria-label="账号状态">
      {{ enabled ? '账号已启用' : '账号已停用' }}
    </Switch>
    <Space>
      <Switch v-model="promptEnabled" inline-prompt active-text="开启" inactive-text="关闭" />
      <Switch disabled aria-label="禁用状态" />
      <Switch loading aria-label="加载状态" />
    </Space>
  </Space>
</template>
