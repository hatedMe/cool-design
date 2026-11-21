<script setup lang="ts">
import { ref } from 'vue';
import { Steps, Step } from '../../index';
const active = ref(1);
const onChange = (index: number) => {
  active.value = index;
};
</script>
<template>
  <Steps :active="active" @change="onChange">
    <Step title="填写信息" description="完善基础资料" />
    <Step title="确认订单" description="核对订单信息" />
    <Step title="完成" status="wait" />
  </Steps>
</template>
