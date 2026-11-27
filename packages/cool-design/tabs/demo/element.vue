<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabPane, type TabsInstance } from '../../index';
const active = ref('first');
const tabs = ref<TabsInstance>();

async function focusActiveTab() {
  await tabs.value?.tabNavRef?.scrollToActiveTab();
  await tabs.value?.tabNavRef?.focusActiveTab();
}
</script>
<template>
  <button type="button" @click="focusActiveTab">聚焦当前页签</button>
  <Tabs ref="tabs" v-model="active" closable>
    <TabPane name="first" label="第一项">内容一</TabPane>
    <TabPane name="second" label="第二项" :lazy="true">内容二</TabPane>
    <TabPane name="third" label="禁用项" disabled>内容三</TabPane>
  </Tabs>
</template>
