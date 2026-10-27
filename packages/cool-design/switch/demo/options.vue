<script setup lang="ts">
import { ref } from 'vue';
import { Space, Switch } from '../../index';
const value = ref('on');
</script>
<template>
  <Space>
    <Switch
      v-model="value"
      active-value="on"
      inactive-value="off"
      active-text="开启"
      inactive-text="关闭"
      size="large" />
    <Switch v-model="value" active-value="on" inactive-value="off" active-color="#13ce66" inactive-color="#ff4949" />
  </Space>
</template>
