<script setup lang="ts">
import { Space, Statistic } from '../../index';
function money(value: string | number) {
  return `¥ ${Number(value).toFixed(2)}`;
}
</script>

<template>
  <Space :size="32">
    <Statistic title="访问量" :value="1234567" />
    <Statistic title="金额" :value="1280" :precision="2" prefix="¥" />
    <Statistic title="占比" :value="0.856" :precision="1" suffix="%" :group-separator="''" />
    <Statistic title="自定义格式" :value="1280" :formatter="money" :value-style="{ color: '#16815d' }" />
  </Space>
</template>
