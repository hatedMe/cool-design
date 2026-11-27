<script setup lang="ts">
import { ref } from 'vue';
import { Space, Switch } from '../../index';

const value = ref<'on' | 'off'>('on');
</script>

<template>
  <Space direction="vertical" :size="16">
    <Switch
      v-model="value"
      active-value="on"
      inactive-value="off"
      active-text="开启"
      inactive-text="关闭"
      size="large"
      width="64px" />
    <Switch
      v-model="value"
      active-value="on"
      inactive-value="off"
      active-color="#13ce66"
      inactive-color="#ff4949"
      border-color="#999"
      active-icon="icon-success"
      inactive-icon="icon-close"
      active-action-icon="icon-like" />
  </Space>
</template>
