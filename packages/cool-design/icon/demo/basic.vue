<script setup lang="ts">
import { Icon, Space } from '../../index';
</script>

<template>
  <Space :size="24">
    <Icon type="icon-search" :size="22" label="搜索" />
    <Icon type="icon-close" :size="22" label="关闭" />
    <Icon :size="24" color="#2463eb" label="添加">
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Icon>
  </Space>
</template>
