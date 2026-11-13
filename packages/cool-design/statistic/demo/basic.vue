<script setup lang="ts">
import { Space, Statistic } from '../../index';
</script>

<template>
  <Space :size="32">
    <Statistic title="访问量" :value="12345" suffix=" 次" />
    <Statistic :value="98">
      <template #title>自定义标题</template>
      <template #prefix>约</template>
      <template #suffix>人在线</template>
    </Statistic>
  </Space>
</template>
