<script setup lang="ts">
import { Badge, Space } from '../../index';
</script>

<template>
  <Space>
    <Badge :value="12" type="primary">
      <template #content>新品</template>
      <button type="button">商品</button>
    </Badge>
    <Badge :value="200" :max="99" type="danger">
      <button type="button">消息</button>
    </Badge>
    <Badge :value="0" type="info">
      <button type="button">零值</button>
    </Badge>
  </Space>
</template>
