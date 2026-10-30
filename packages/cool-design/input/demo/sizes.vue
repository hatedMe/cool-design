<script setup lang="ts">
import { Input, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="start">
    <Input size="large" prefix-icon="icon-search" placeholder="大尺寸" />
    <Input prefix-icon="icon-search" suffix-icon="icon-close" placeholder="默认尺寸" />
    <Input size="small" suffix-icon="icon-search" placeholder="小尺寸" />
  </Space>
</template>
