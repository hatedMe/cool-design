<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabPane } from '../../index';
const active = ref('first');
const beforeLeave = async (next: string | number) => {
  console.log('beforeLeave', next);
  return true;
};
</script>
<template>
  <Tabs v-model="active" type="card" :before-leave="beforeLeave" closable>
    <TabPane name="first" label="第一项">内容一</TabPane>
    <TabPane name="second" label="第二项" :lazy="true">内容二</TabPane>
    <TabPane name="third" label="禁用项" disabled>内容三</TabPane>
  </Tabs>
</template>
