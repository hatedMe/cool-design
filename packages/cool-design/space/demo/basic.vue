<script setup lang="ts">
import { Button, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" :size="24" align="stretch">
    <Space :size="12">
      <Button type="primary">新增用户</Button>
      <Button>导出数据</Button>
      <Button>刷新</Button>
    </Space>
    <Space direction="vertical" align="start">
      <span>垂直排列的内容</span>
      <span>默认间距为 8px</span>
    </Space>
  </Space>
</template>
